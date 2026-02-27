import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Database, RefreshCw, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { backfillStudentRequests } from '@/functions/backfillStudentRequests';
import { cleanupDraftNames } from '@/functions/cleanupDraftNames';
import { backfillPosterEmails } from '@/functions/backfillPosterEmails';

function CleanupDraftNames() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCleanup = async () => {
    if (!confirm('Fix name formatting issues and trim trailing spaces?')) return;
    setLoading(true); setResult(null);
    try {
      const response = await cleanupDraftNames({});
      if (response.data?.success) { setResult(response.data); toast({ title: "✅ Cleanup Complete!", description: `Fixed ${response.data.summary.fixed} records` }); }
      else throw new Error(response.data?.error || 'Cleanup failed');
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="border-t pt-6 mt-6">
      <h4 className="font-semibold text-slate-900 mb-2">🧹 Cleanup Draft Data</h4>
      <p className="text-sm text-slate-600 mb-4">Fix name formatting issues and trim trailing spaces.</p>
      <Button onClick={handleCleanup} disabled={loading} variant="outline" className="w-full">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</> : <><RefreshCw className="w-4 h-4 mr-2" />Run Cleanup</>}
      </Button>
      {result && (
        <div className="mt-4 bg-slate-50 border rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div><p className="text-xl font-bold text-slate-900">{result.summary.totalDrafts}</p><p className="text-xs text-slate-600">Total</p></div>
            <div><p className="text-xl font-bold text-green-600">{result.summary.fixed}</p><p className="text-xs text-slate-600">Fixed</p></div>
            <div><p className="text-xl font-bold text-red-600">{result.summary.errors}</p><p className="text-xs text-slate-600">Errors</p></div>
          </div>
          {result.fixed?.length > 0 && (
            <div className="max-h-32 overflow-y-auto bg-white rounded border p-2 space-y-1">
              {result.fixed.map((item, idx) => <div key={idx} className="text-xs text-slate-600 py-1 border-b last:border-0">✅ {item.originalName} → {item.newName}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BackfillPosterEmails() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleBackfill = async () => {
    if (!confirm('Backfill poster_email for anonymous JobRequests?')) return;
    setLoading(true); setResult(null);
    try {
      const response = await backfillPosterEmails({});
      if (response.data?.success) { setResult(response.data); toast({ title: "✅ Complete!", description: response.data.message }); }
      else throw new Error(response.data?.error || 'Failed');
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="border-t pt-6 mt-6">
      <h4 className="font-semibold text-slate-900 mb-2">📧 Backfill Poster Emails</h4>
      <p className="text-sm text-slate-600 mb-4">Fix legacy anonymous JobRequests by matching poster_name to User records.</p>
      <Button onClick={handleBackfill} disabled={loading} variant="outline" className="w-full border-blue-300 bg-blue-50 hover:bg-blue-100">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</> : <><Mail className="w-4 h-4 mr-2" />Backfill Poster Emails</>}
      </Button>
      {result && (
        <div className="mt-4 bg-slate-50 border rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-xl font-bold text-slate-900">{result.totalChecked}</p><p className="text-xs">Checked</p></div>
            <div><p className="text-xl font-bold text-green-600">{result.updated}</p><p className="text-xs">Updated</p></div>
            <div><p className="text-xl font-bold text-orange-600">{result.notFound?.length || 0}</p><p className="text-xs">Not Matched</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BackfillSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(null);

  const runBatch = async (offset = 0, accumulated = { created: [], errors: [] }) => {
    const response = await backfillStudentRequests({ offset, batchSize: 10 });
    if (!response.data?.success) throw new Error(response.data?.error || 'Backfill failed');
    const newAccumulated = { created: [...accumulated.created, ...response.data.created], errors: [...accumulated.errors, ...response.data.errors] };
    setProgress({ processed: offset + response.data.summary.processedInBatch, total: response.data.summary.studentsWithoutRequests, created: newAccumulated.created.length, errors: newAccumulated.errors.length });
    if (response.data.pagination.hasMore) return runBatch(response.data.pagination.nextOffset, newAccumulated);
    return { ...response.data, created: newAccumulated.created, errors: newAccumulated.errors, summary: { ...response.data.summary, created: newAccumulated.created.length, errors: newAccumulated.errors.length } };
  };

  const handleBackfill = async () => {
    if (!confirm('Create draft JobRequest entries for all students without one?')) return;
    setLoading(true); setResult(null); setProgress(null);
    try {
      const finalResult = await runBatch(0);
      setResult(finalResult);
      toast({ title: "✅ Backfill Complete!", description: `Created ${finalResult.summary.created} draft requests` });
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); setProgress(null); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Database className="w-5 h-5 text-purple-600" />Backfill Student Requests</CardTitle>
        <p className="text-sm text-slate-600 mt-2">Create draft JobRequest entries for students without a help request.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={handleBackfill} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</> : <><Database className="w-4 h-4 mr-2" />Run Backfill Now</>}
        </Button>
        {progress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }} />
            </div>
            <p className="text-sm text-blue-700">{progress.processed}/{progress.total} processed • {progress.created} created • {progress.errors} errors</p>
          </div>
        )}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-green-900">✅ Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white rounded-lg p-3 border"><p className="text-2xl font-bold">{result.summary.totalStudents}</p><p className="text-xs text-slate-600">Total</p></div>
              <div className="bg-white rounded-lg p-3 border"><p className="text-2xl font-bold">{result.summary.existingRequests}</p><p className="text-xs text-slate-600">Had Request</p></div>
              <div className="bg-white rounded-lg p-3 border"><p className="text-2xl font-bold text-green-600">{result.summary.created}</p><p className="text-xs text-slate-600">Created</p></div>
              <div className="bg-white rounded-lg p-3 border"><p className="text-2xl font-bold text-red-600">{result.summary.errors}</p><p className="text-xs text-slate-600">Errors</p></div>
            </div>
          </div>
        )}
        <CleanupDraftNames />
        <BackfillPosterEmails />
      </CardContent>
    </Card>
  );
}