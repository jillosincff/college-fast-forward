import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Loader2, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';

export default function TestGiftFastIQ() {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  if (!user?.roles?.includes('admin') && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Admin only.</p>
      </div>
    );
  }

  const runTests = async () => {
    setRunning(true);
    setOutput(null);
    const res = await base44.functions.invoke('testGiftFastIQScenarios', {});
    setOutput(res?.data || res);
    setRunning(false);
  };

  const statusIcon = (status) =>
    status === 'PASS'
      ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
      : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">GiftFastIQ — Test Suite</h1>
            <p className="text-sm text-slate-500 mt-1">Creates ephemeral test users, runs all 6 scenarios, then cleans up.</p>
          </div>
          <button
            onClick={runTests}
            disabled={running}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors"
            style={{ minHeight: 'auto' }}
          >
            {running
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Running…</>
              : <><PlayCircle className="w-4 h-4" /> Run Tests</>}
          </button>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 mb-6">
          {[
            'Student found, no FastIQ → gift activates → both get emails',
            'Student found, already has FastIQ → "already covered"',
            'Multiple same-name students → disambiguates by email',
            'No student found → pending gift stored → invite email sent',
            'Student with pending gift signs up → trial auto-activates',
            'Parent gifts same student twice → graceful, no duplicate trial',
          ].map((label, i) => {
            const result = output?.results?.find(r => r.scenario === `Scenario ${i + 1}` || r.scenario.startsWith(`Scenario ${i + 1}`));
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="text-xs font-bold text-slate-400 w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-slate-700 flex-1">{label}</span>
                {result && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {statusIcon(result.status)}
                    <span className={`text-xs font-semibold ${result.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                      {result.status}
                    </span>
                  </div>
                )}
                {!result && running && <Loader2 className="w-4 h-4 text-slate-300 animate-spin flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {output?.summary && (
          <div className={`rounded-xl p-4 text-sm font-medium mb-4 ${output.summary.failed === 0 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {output.summary.failed === 0
              ? `✅ All ${output.summary.passed} tests passed. ${output.summary.cleanedUp} test users cleaned up.`
              : `❌ ${output.summary.failed} of ${output.summary.total} tests failed. ${output.summary.cleanedUp} test users cleaned up.`}
          </div>
        )}

        {/* Detail log */}
        {output?.results && (
          <div className="bg-slate-900 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Detail log</p>
            <div className="space-y-2">
              {output.results.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  {statusIcon(r.status)}
                  <div>
                    <span className="text-xs font-semibold text-white">{r.scenario}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{r.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}