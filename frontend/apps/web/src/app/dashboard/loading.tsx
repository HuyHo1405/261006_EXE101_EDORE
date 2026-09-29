// Dashboard route loading skeleton — auto-used by Next.js App Router on navigation
export default function DashboardLoading() {
  return (
    <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-6 min-h-[580px]">

        {/* ASIDE SKELETON */}
        <div className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-white/10 rounded-2xl md:rounded-3xl p-4 animate-pulse flex flex-col gap-3">
          {/* Logo area */}
          <div className="h-8 w-28 rounded-lg bg-white/20" />
          <div className="h-px bg-white/10 my-1" />
          {/* Nav items */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-white/15" style={{ opacity: 1 - i * 0.1 }} />
          ))}
          <div className="flex-1" />
          {/* Bottom user */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <div className="h-8 w-8 rounded-full bg-white/20 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 rounded bg-white/20" />
              <div className="h-2.5 w-14 rounded bg-white/15" />
            </div>
          </div>
        </div>

        {/* MAIN PANEL SKELETON */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col gap-6 animate-pulse">

          {/* Header breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="h-6 w-32 rounded-lg bg-slate-200" />
            <div className="h-4 w-4 rounded bg-slate-100" />
            <div className="h-6 w-24 rounded-lg bg-slate-100" />
          </div>

          {/* Toolbar */}
          <div className="bg-slate-100 rounded-2xl p-5 flex flex-col gap-5 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="h-9 w-52 rounded-xl bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="h-9 w-28 rounded-xl bg-slate-200" />
                <div className="h-9 w-28 rounded-xl bg-slate-200" />
              </div>
            </div>

            {/* 4-column course card grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-h-[465px] content-start">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="min-h-[220px] rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-6 w-6 rounded-lg bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
