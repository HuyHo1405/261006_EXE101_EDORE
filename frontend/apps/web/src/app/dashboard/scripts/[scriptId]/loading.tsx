// Script editor (playground) loading skeleton — mimics TimelineEditor layout
export default function ScriptEditorLoading() {
  return (
    <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-6 min-h-[580px]">

        {/* ASIDE SKELETON — same as dashboard */}
        <div className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-white/10 rounded-2xl md:rounded-3xl p-4 animate-pulse flex flex-col gap-3">
          <div className="h-8 w-28 rounded-lg bg-white/20" />
          <div className="h-px bg-white/10 my-1" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-white/15" style={{ opacity: 1 - i * 0.1 }} />
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <div className="h-8 w-8 rounded-full bg-white/20 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-white/20" />
              <div className="h-2.5 w-14 rounded bg-white/15" />
            </div>
          </div>
        </div>

        {/* MAIN EDITOR PANEL SKELETON */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl md:rounded-3xl flex flex-col overflow-hidden animate-pulse">

          {/* Top breadcrumb + title */}
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="h-4 w-3 rounded bg-slate-100" />
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-4 w-3 rounded bg-slate-100" />
              <div className="h-5 w-28 rounded bg-slate-200" />
            </div>
            <div className="h-8 w-24 rounded-xl bg-slate-200" />
          </div>

          {/* 3-column editor body */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left panel — node list */}
            <div className="w-[220px] shrink-0 border-r border-slate-100 p-4 flex flex-col gap-3">
              <div className="h-5 w-20 rounded bg-slate-200 mb-1" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col gap-1.5">
                  <div className="h-3 w-12 rounded bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-2.5 w-10 rounded bg-slate-100" />
                </div>
              ))}
            </div>

            {/* Center panel — content editor */}
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="h-7 w-48 rounded-lg bg-slate-200" />
              <div className="space-y-2.5">
                <div className="h-3.5 rounded bg-slate-100 w-full" />
                <div className="h-3.5 rounded bg-slate-100 w-[95%]" />
                <div className="h-3.5 rounded bg-slate-100 w-[88%]" />
                <div className="h-3.5 rounded bg-slate-100 w-[70%]" />
              </div>
              <div className="h-5 w-32 rounded bg-slate-200 mt-2" />
              <div className="space-y-2">
                <div className="h-3.5 rounded bg-slate-100 w-full" />
                <div className="h-3.5 rounded bg-slate-100 w-[80%]" />
                <div className="h-3.5 rounded bg-slate-100 w-[60%]" />
              </div>
              <div className="mt-auto h-10 w-full rounded-xl bg-slate-100" />
            </div>

            {/* Right panel — activity info */}
            <div className="w-[260px] shrink-0 border-l border-slate-100 p-4 flex flex-col gap-3">
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="rounded-xl bg-slate-100 p-3 space-y-2">
                <div className="h-3 w-20 rounded bg-slate-200" />
                <div className="h-3 w-28 rounded bg-slate-200" />
              </div>
              <div className="h-5 w-20 rounded bg-slate-200 mt-2" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-slate-200 shrink-0" />
                  <div className="h-3 flex-1 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom dock/timeline bar */}
          <div className="border-t border-slate-100 px-6 py-3 flex items-center gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 flex-1 rounded-lg bg-slate-100" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
