type ValidationDebugPanelProps = {
  report: {
    valid: boolean;
    summary: {
      issueCount: number;
      errorCount: number;
      warningCount: number;
      conceptCount: number;
      miniGameCount: number;
      trainingTargetCount: number;
    };
    conceptCoverage: Array<{ key: string; label: string; count: number; percentage?: number }>;
    difficultyCoverage: Array<{ key: string; label: string; count: number; percentage?: number }>;
    surfaceCoverage: Array<{ key: string; label: string; count: number; percentage?: number }>;
    noveltyCoverage: Array<{ key: string; label: string; count: number; percentage?: number }>;
    issues: Array<{ severity: string; category: string; code: string; message: string }>;
  };
  action?: string;
};

export function ValidationDebugPanel({ report, action = "/api/blundr/dev/validation-report" }: ValidationDebugPanelProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Validation</div>
      <h2 className="mt-2 text-lg font-black text-stone-950">Coverage report</h2>
      <dl className="mt-3 grid gap-2 text-sm text-stone-700">
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-stone-500">Valid</dt>
          <dd className="font-mono text-xs text-stone-900">{String(report.valid)}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-stone-500">Issues</dt>
          <dd className="font-mono text-xs text-stone-900">{report.summary.issueCount}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-stone-500">Errors</dt>
          <dd className="font-mono text-xs text-stone-900">{report.summary.errorCount}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="font-semibold text-stone-500">Warnings</dt>
          <dd className="font-mono text-xs text-stone-900">{report.summary.warningCount}</dd>
        </div>
      </dl>

      <pre className="mt-3 overflow-auto rounded-2xl bg-stone-50 p-3 text-xs leading-5 text-stone-700">{JSON.stringify(report, null, 2)}</pre>

      <form action={action} method="post" className="mt-4">
        <button type="submit" className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white">
          Save snapshot
        </button>
      </form>
    </section>
  );
}
