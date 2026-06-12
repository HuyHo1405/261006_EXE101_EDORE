import AppRouter from './routers'

/**
 * App.jsx — Shell only.
 * All routing lives in src/routers/index.jsx.
 * All page components live in src/pages/.
 * All feature components live in src/features/.
 * All API services live in src/services/.
 */
function App() {
  return (
    <div className="min-h-screen text-zinc-100 font-sans flex flex-col selection:bg-violet-500/30 selection:text-violet-200">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-start">
        <AppRouter />
      </main>
    </div>
  )
}

export default App
