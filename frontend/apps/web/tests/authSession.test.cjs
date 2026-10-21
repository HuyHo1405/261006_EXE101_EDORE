const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { create, act } = require('react-test-renderer')

global.IS_REACT_ACT_ENVIRONMENT = true
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }

function load(file, stubs = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText
  const target = { exports: {} }
  new Function('require', 'exports', 'module', compiled)(name => name in stubs ? stubs[name] : require(name), target.exports, target)
  return target.exports
}

function session() {
  const { useAuthStore: store } = load('features/auth/stores/useAuthStore.ts')
  store.getState().setAuth({ userId: 'user-1', username: 'Teacher', email: 'teacher@example.test',
    accessToken: 'access-1', refreshToken: 'refresh-1', roles: ['ROLE_USER'] })
  return store
}
const ok = result => ({ ok: true, status: 200, json: async () => ({ code: 1200, result }) })
const unauthorized = () => ({ ok: false, status: 401, json: async () => ({ code: 401, message: 'JWT expired' }) })

test('unchanged subscription plan preserves user identity and does not notify subscribers', () => {
  const store = session()
  const initial = store.getState()
  let changes = 0
  const unsubscribe = store.subscribe(() => changes++)
  store.getState().updatePlan('free')
  assert.equal(store.getState(), initial)
  assert.equal(changes, 0)
  store.getState().updatePlan('pro')
  const pro = store.getState().user
  store.getState().updatePlan('pro')
  assert.equal(store.getState().user, pro)
  assert.equal(changes, 1)
  unsubscribe()
})

test('profile settles after one load even when subscription plan or same-user details change', async () => {
  const store = session()
  const counts = {}
  const api = (name, result) => async () => { counts[name] = (counts[name] || 0) + 1; return result }
  const userService = {
    getOwnProfile: api('profile', { fullName: 'Teacher', email: 'teacher@example.test' }),
    getUserSettings: api('settings', { theme: 'light', language: 'vi', enableFactCheckVerification: true }),
  }
  const subscriptionService = {
    // Cap responses so a regressed effect loop fails assertions instead of hanging the test process.
    getMySubscriptionStatus: async () => {
      counts.subscription = (counts.subscription || 0) + 1
      return counts.subscription <= 3 ? { planName: 'PRO PLAN', status: 'ACTIVE', maxCourses: 20 } : null
    },
    getMyOrders: api('orders', { content: [] }), getMyPayments: api('payments', { content: [] }),
    getActivePlans: api('plans', []),
  }
  const Page = load('app/dashboard/profile/page.tsx', {
    'next/navigation': { useRouter: () => ({}), useSearchParams: () => new URLSearchParams() },
    'next/link': { default: () => null },
    'lucide-react': new Proxy({}, { get: () => () => null }),
    '@/components/layout/Header/UserAvatar': { UserAvatar: () => null },
    '@/features/user/api/userService': { userService },
    '@/features/subscription/api/subscriptionService': { subscriptionService },
    '@/features/auth/stores/useAuthStore': { useAuthStore: store },
  }).default
  let renderer
  try {
    await act(async () => { renderer = create(React.createElement(Page)) })
    assert.equal(store.getState().user.plan, 'pro')
    assert.ok(!JSON.stringify(renderer.toJSON()).includes('Đang tải thông tin tài khoản'))
    for (const count of Object.values(counts)) assert.equal(count, 1)
    await act(async () => { store.setState({ user: { ...store.getState().user, name: 'Updated teacher' } }) })
    for (const count of Object.values(counts)) assert.equal(count, 1)
    await act(async () => { store.setState({ user: { ...store.getState().user, userId: 'user-2' } }) })
    for (const count of Object.values(counts)) assert.equal(count, 2)
  } finally { if (renderer) await act(async () => renderer.unmount()) }
})

test('parallel expired requests share one refresh and save both rotated tokens for the next expiry', async () => {
  const store = session()
  const { apiClient } = load('lib/fetcher.ts', { '@/features/auth/stores/useAuthStore': { useAuthStore: store } })
  let refreshes = 0
  let accepted = 'access-2'
  const previousFetch = global.fetch
  global.fetch = async (url, options) => {
    if (url.endsWith('/auth/refresh')) {
      refreshes++
      assert.equal(JSON.parse(options.body).refreshToken, `refresh-${refreshes}`)
      await new Promise(resolve => setImmediate(resolve))
      return ok({ accessToken: `access-${refreshes + 1}`, refreshToken: `refresh-${refreshes + 1}` })
    }
    return options.headers.Authorization === `Bearer ${accepted}` ? ok('loaded') : unauthorized()
  }
  try {
    const results = await Promise.all(Array.from({ length: 6 }, () => apiClient('/api/v1/users/me/settings')))
    assert.ok(results.every(r => r.result === 'loaded'))
    assert.equal(refreshes, 1)
    assert.equal(store.getState().refreshToken, 'refresh-2')
    accepted = 'access-3'
    assert.equal((await apiClient('/api/v1/users/me')).result, 'loaded')
    assert.equal(refreshes, 2)
    assert.equal(store.getState().refreshToken, 'refresh-3')
  } finally { global.fetch = previousFetch }
})

test('late 401 from an old access token reuses the already renewed session', async () => {
  const store = session()
  const { apiClient } = load('lib/fetcher.ts', { '@/features/auth/stores/useAuthStore': { useAuthStore: store } })
  const previousFetch = global.fetch
  let release
  let refreshes = 0
  global.fetch = async (url, options) => {
    if (url.endsWith('/auth/refresh')) { refreshes++; return ok({ accessToken: 'access-2', refreshToken: 'refresh-2' }) }
    if (options.headers.Authorization === 'Bearer access-2') return ok('loaded')
    if (url.endsWith('/slow')) return new Promise(resolve => { release = () => resolve(unauthorized()) })
    return unauthorized()
  }
  try {
    const slow = apiClient('/slow')
    await apiClient('/fast')
    release()
    assert.equal((await slow).result, 'loaded')
    assert.equal(refreshes, 1)
  } finally { global.fetch = previousFetch }
})

test('refresh failure ends the session without recursive retries', async () => {
  const store = session()
  const { apiClient } = load('lib/fetcher.ts', { '@/features/auth/stores/useAuthStore': { useAuthStore: store } })
  const previousFetch = global.fetch
  let calls = 0
  global.fetch = async () => { calls++; return unauthorized() }
  try {
    await assert.rejects(apiClient('/protected'), /JWT expired/)
    assert.equal(calls, 2)
    assert.equal(store.getState().isAuthenticated, false)
  } finally { global.fetch = previousFetch }
})

test('a refresh response arriving after logout cannot restore the session', async () => {
  const store = session()
  const { apiClient } = load('lib/fetcher.ts', { '@/features/auth/stores/useAuthStore': { useAuthStore: store } })
  const previousFetch = global.fetch
  let release
  global.fetch = async url => url.endsWith('/auth/refresh')
    ? new Promise(resolve => { release = () => resolve(ok({ accessToken: 'access-2', refreshToken: 'refresh-2' })) })
    : unauthorized()
  try {
    const request = apiClient('/protected')
    const rejected = assert.rejects(request, /JWT expired/)
    while (!release) await new Promise(resolve => setImmediate(resolve))
    store.getState().logout()
    release()
    await rejected
    assert.equal(store.getState().accessToken, null)
    assert.equal(store.getState().refreshToken, null)
  } finally { global.fetch = previousFetch }
})

test('an old request cannot retry or log out a different account after switching users', async () => {
  const store = session()
  const { apiClient } = load('lib/fetcher.ts', { '@/features/auth/stores/useAuthStore': { useAuthStore: store } })
  const previousFetch = global.fetch
  let release
  let calls = 0
  global.fetch = async () => { calls++; return new Promise(resolve => { release = () => resolve(unauthorized()) }) }
  try {
    const request = apiClient('/protected')
    const rejected = assert.rejects(request, /JWT expired/)
    store.getState().setAuth({ userId: 'user-2', email: 'other@example.test', accessToken: 'other-access', refreshToken: 'other-refresh' })
    release()
    await rejected
    assert.equal(calls, 1)
    assert.equal(store.getState().user.userId, 'user-2')
    assert.equal(store.getState().accessToken, 'other-access')
  } finally { global.fetch = previousFetch }
})

test('a rejected renewed token ends the session after one retry', async () => {
  const store = session()
  const { apiClient } = load('lib/fetcher.ts', { '@/features/auth/stores/useAuthStore': { useAuthStore: store } })
  const previousFetch = global.fetch
  let calls = 0
  global.fetch = async url => {
    calls++
    return url.endsWith('/auth/refresh') ? ok({ accessToken: 'access-2', refreshToken: 'refresh-2' }) : unauthorized()
  }
  try {
    await assert.rejects(apiClient('/protected'), /JWT expired/)
    assert.equal(calls, 3)
    assert.equal(store.getState().isAuthenticated, false)
  } finally { global.fetch = previousFetch }
})
