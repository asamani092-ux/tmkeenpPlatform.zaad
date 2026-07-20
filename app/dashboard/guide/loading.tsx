export default function GuideDashboardLoading() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="border-b border-surface-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="h-12 w-28 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-surface-muted" />
          ))}
        </div>
        <div className="card h-80 animate-pulse bg-surface-muted" />
      </main>
    </div>
  );
}
