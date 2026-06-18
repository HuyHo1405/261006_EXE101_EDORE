# Frontend Architecture — EDORE

> **Stack:** React 19 · React Router v7 · TanStack Query v5 · Tailwind CSS v4 · Vite 8

---

## Folder Structure

```
frontend/
├── index.html              # Entry HTML (mounts <div id="root">)
├── vite.config.js          # Vite + React + Tailwind plugins
├── package.json
└── src/
    ├── main.jsx            # React root: ReactDOM.createRoot + BrowserRouter
    ├── App.jsx             # Shell only — renders <AppRouter />
    ├── App.css / index.css # Global styles
    │
    ├── routers/
    │   └── index.jsx       # Centralised route table (React Router v7)
    │
    ├── pages/              # Route-level page components (thin wrappers)
    │   ├── Playground.jsx      ← Primary page (stage machine)
    │   ├── Dashboard.jsx
    │   ├── AddContent.jsx
    │   ├── FilterLogistics.jsx
    │   ├── FilterActiveView.jsx
    │   └── TeachingScript.jsx
    │
    ├── features/
    │   └── playground/     # Feature-scoped UI components (no routing knowledge)
    │       ├── FilterModal.jsx       ← Stage: "filters"
    │       ├── ContentInput.jsx      ← Stage: "input"
    │       ├── ProcessingLoader.jsx  ← Stage: "processing"
    │       └── TimelineEditor.jsx    ← Stage: "results"
    │
    ├── services/           # API clients (pure functions, no React hooks)
    │   ├── pipelineService.js    ← SSE streaming + node mapping
    │   └── templateService.js   ← REST template fetch
    │
    ├── hooks/              # (empty — reserved for custom hooks)
    ├── components/         # (empty — reserved for shared UI components)
    ├── layout/             # (empty — reserved for shared layouts)
    ├── lib/                # (empty — reserved for utility functions)
    ├── types/              # (empty — reserved for JSDoc/TS type defs)
    └── assets/             # Static images, icons
```

---

## Entry Point & Routing

```
main.jsx
  └── <BrowserRouter>
        └── <App />
              └── <AppRouter />
```

### Route Table (`routers/index.jsx`)

| Path | Component | Load |
|------|-----------|------|
| `/` | redirect `/playground` | — |
| `/playground` | `Playground` | Eager |
| `/dashboard` | `Dashboard` | Eager |
| `/add-content` | `AddContent` | Lazy |
| `/filter-logistics` | `FilterLogistics` | Lazy |
| `/filter-active-view` | `FilterActiveView` | Lazy |
| `/teaching-script` | `TeachingScript` | Lazy |
| `*` | redirect `/playground` | — |

Less-critical pages are `lazy()`-loaded and wrapped in `<Suspense>` with a spinner fallback to keep the initial bundle small.

---

## Primary Flow — `Playground.jsx`

`Playground` is the only stateful page. It owns a **4-stage state machine** and orchestrates all feature components as pure UI panels.

```
stage = "filters"
     │  FilterModal confirms classroom context (space, bloom, duration, template_id)
     ↓
stage = "input"
     │  ContentInput: file upload or manual text → triggers streamPipeline()
     ↓
stage = "processing"
     │  ProcessingLoader: renders real-time SSE progress events
     ↓
stage = "results"
     │  TimelineEditor: editable lesson plan with per-node sidebar panels
     ↓
handleRestart() → back to "filters"
```

### State Owned by Playground

| State | Type | Purpose |
|-------|------|---------|
| `stage` | `'filters' \| 'input' \| 'processing' \| 'results'` | Stage machine |
| `classroomCtx` | `object \| null` | Filters payload from FilterModal |
| `inputFile` | `File \| null` | Uploaded file |
| `inputText` | `string` | Manual text |
| `progressEvents` | `Array` | Accumulated SSE `progress` events |
| `metadata` | `object \| null` | SSE `metadata` event payload |
| `contentSummary` | `string` | Summary of document content |
| `sectionsDone` | `number` | Count of SSE `section` events received |
| `timelineSteps` | `Array` | Final mapped timeline steps |
| `hasError` / `errorMessage` | `bool / string` | Error state |
| `abortRef` | `Ref<() => void>` | Stream abort handle |

---

## Feature Components (`features/playground/`)

### `FilterModal` — Stage: `filters`

**Props:** `fileName`, `onBack`, `onConfirm(ctx)`

**Responsibilities:**
- Two modes: **Context** (auto-match template from classroom form) or **Manual** (pick a template from list)
- Context mode is a 2-step form: Step 1 (space, seating, equipment) → Step 2 (duration, student count, Bloom level)
- Calls `getTemplates()` from `templateService.js` on mount
- Auto-match logic: finds a template whose `suitable_for` range covers `duration`, `bloom_level`, and `student_count`
- On confirm, emits `classroomCtx` object including `template_id` up to `Playground`

### `ContentInput` — Stage: `input`

**Props:** `onFileSelected(file)`, `onManualSubmit(text)`

**Responsibilities:**
- File drag-and-drop zone (accepts PDF, Word, TXT, MD)
- Collapsible manual textarea with character counter
- Calls prop callbacks directly; no API calls

### `ProcessingLoader` — Stage: `processing`

**Props:** `progressEvents`, `metadata`, `contentSummary`, `sectionsDone`, `totalSections`, `hasError`, `errorMessage`, `onCancel`

**Responsibilities:**
- SVG circular progress ring (derived from `step / total_steps` of the latest event)
- Metadata chip row (char count, chunk count, node count) — visible after `metadata` event
- Content summary card — visible after `content_summary` event
- Dark-mode terminal log of all progress events (auto-scrolls)
- `onCancel` calls `abortRef.current()` in Playground to terminate the stream

### `TimelineEditor` — Stage: `results`

**Props:** `steps`, `onStepsChange`, `contentSummary`, `onRestart`

**Responsibilities:**
- Top tab bar: Overview (`activeIdx = -1`) + one tab per node
- **Overview view:** Table of contents list, script summary, "Start" button
- **Node view:** Editable `<input>` for title, timing, duration; collapsible content panel; pedagogy goal badge
- **Sidebar panels** (per node):
  - *Goi y hoat dong / Chuan bi* — `pedagogNote` field (view/edit toggle)
  - *Huong dan thuc hien* — `details` field (view/edit toggle)
- Add / remove node controls
- `updateStep(patch)` merges partial updates back via `onStepsChange`

**Local helpers inside TimelineEditor:**

| Helper | Purpose |
|--------|---------|
| `formatInlineMarkdown(text)` | Renders `**bold**` inline spans |
| `formatSidebarText(text)` | Renders step/bullet lists in sidebars |
| `AutoExpandingTextarea` | Auto-resizes textarea to content height |
| `getShortNodeName(step, idx)` | Truncates node type for the tab bar |

---

## Service Layer (`services/`)

### `pipelineService.js`

Thin wrapper over `POST /api/ai/pedagogy/stream` (SSE via fetch + ReadableStream).

```js
streamPipeline(formData, handlers) → abort()
```

**SSE Event → Handler mapping:**

| SSE event | Handler |
|-----------|---------|
| `progress` | `onProgress(data)` |
| `content_summary` | `onContentSummary(data)` |
| `metadata` | `onMetadata(data)` |
| `section` | `onSection({ index, node, timestamp })` |
| `node_error` | `onNodeError(data)` |
| `done` | `onDone(data)` |
| `error` | `onError(data)` |
| stream close | `onComplete()` |

`mapNodeToTimelineStep(nodeData, index)` — normalises the raw API node shape (handles both enriched and un-enriched nodes, multiple field name variants) into the flat `timelineStep` shape consumed by `TimelineEditor`.

### `templateService.js`

```js
getTemplates(params?)      // GET /api/templates?duration=&bloom=&student_count=
getTemplateById(id)        // GET /api/templates/:id
```

---

## Data Flow Diagram

```
User fills FilterModal
        │ onConfirm(classroomCtx)
        ▼
  Playground stores classroomCtx
        │
User uploads file / submits text
        │ handleFileSelected / handleManualSubmit
        ▼
  Playground builds FormData
  (appends file + classroomCtx fields as form fields)
        │
        ▼
  pipelineService.streamPipeline(formData, handlers)
        │  SSE: progress         → setProgressEvents
        │  SSE: metadata         → setMetadata
        │  SSE: content_summary  → setContentSummary
        │  SSE: section          → setTimelineSteps[index]
        │                           via mapNodeToTimelineStep()
        │  SSE: done             → override steps with final_pedagogical_script
        │                           → setTimeout(setStage('results'), 500)
        ▼
  TimelineEditor renders editable steps
        │ onStepsChange → setTimelineSteps
        │ onRestart     → handleRestart → stage = 'filters'
```

---

## Design Conventions

| Convention | Detail |
|-----------|--------|
| **Styling** | Tailwind CSS v4 via `@tailwindcss/vite` plugin — utility classes inline in JSX |
| **Color palette** | Primary `#0058be`, accent `#6b38d4`, background `#faf8ff`, text `#151b2d`, muted `#727785` |
| **Icons** | Google Material Symbols via CDN — `<span className="material-symbols-outlined">name</span>` |
| **Animations** | Custom Tailwind classes: `animate-fade-slide-up`, `animate-slide-up`, `animate-fade-in` |
| **Responsiveness** | Mobile-first; `FilterModal` renders as a bottom sheet on `< md` screens |
| **State management** | Local `useState` in `Playground`; no global store. TanStack Query installed but not yet wired |
| **API base URL** | `VITE_API_BASE_URL` env var, defaults to `http://localhost:5000` |
| **Code splitting** | `Playground` + `Dashboard` eager; all other pages lazy |
| **Imports order** | Hooks → feature components → services (no barrel files currently) |
