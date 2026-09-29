// New script creation page loading skeleton
export default function NewScriptLoading() {
  return (
    <div className="w-full bg-[var(--color-primary-500)] min-h-screen py-4 md:py-6 px-2.5 sm:px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-stretch gap-4 md:gap-6 min-h-[580px]">

        {/* ASIDE SKELETON */}
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

        {/* MAIN CREATE SCRIPT PANEL SKELETON */}
        <main className="flex-1 min-w-0 bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col gap-6 animate-pulse">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-200 shrink-0" />
            <div>
              <div className="h-6 w-40 rounded-lg bg-slate-200 mb-1.5" />
              <div className="h-3.5 w-56 rounded bg-slate-100" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 flex-1">

            {/* Left: File upload area */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="border-2 border-dashed border-slate-200 rounded-2xl h-48 flex flex-col items-center justify-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-3 w-24 rounded bg-slate-100" />
              </div>

              {/* Form fields */}
              <div className="space-y-4 mt-2">
                <div>
                  <div className="h-3.5 w-28 rounded bg-slate-200 mb-2" />
                  <div className="h-10 w-full rounded-xl bg-slate-100" />
                </div>
                <div>
                  <div className="h-3.5 w-36 rounded bg-slate-200 mb-2" />
                  <div className="h-24 w-full rounded-xl bg-slate-100" />
                </div>
              </div>
            </div>

            {/* Right: Config panel */}
            <div className="w-full md:w-[280px] shrink-0 flex flex-col gap-4">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-24 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <div className="h-11 w-full rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
