export default function BeneficiaryDashboardLoading() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="border-b border-surface-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="h-5 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="h-12 w-28 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="card h-28 animate-pulse bg-surface-muted" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card h-56 animate-pulse bg-surface-muted" />
          <div className="card h-56 animate-pulse bg-surface-muted" />
        </div>
      </main>
    </div>
  );
}
