import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function AdminUtilities() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const runDryRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('backfillAlumniSchoolCode', { dry_run: true });
      setResult({ mode: 'dry_run', data: res.data });
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setRunning(false);
    }
  };

  const runFull = async () => {
    if (!window.confirm('Run full backfill? This will write school_code for all alumni missing it.')) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('backfillAlumniSchoolCode', { dry_run: false });
      setResult({ mode: 'full', data: res.data });
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="border border-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Admin Utilities</span>
        <span className="text-slate-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 bg-slate-900/30">
          {/* Backfill tool */}
          <div className="border border-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-slate-300 text-sm font-semibold">Alumni school_code Backfill</p>
                <p className="text-slate-600 text-xs mt-1 max-w-lg">
                  Catches alumni missing <code className="text-slate-500">school_code</code> (e.g. signed up via an alternate path before the fix landed).
                  Run dry-run first to preview, then full to apply.
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={runDryRun}
                  disabled={running}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  {running ? 'Running…' : 'Dry Run'}
                </button>
                <button
                  onClick={runFull}
                  disabled={running}
                  className="px-3 py-1.5 bg-orange-600/80 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                >
                  Run Backfill
                </button>
              </div>
            </div>

            {result && (
              <pre className="mt-3 bg-slate-950 rounded-lg p-3 text-xs text-slate-400 overflow-auto max-h-48 whitespace-pre-wrap">
                {result.error
                  ? `Error: ${result.error}`
                  : JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}