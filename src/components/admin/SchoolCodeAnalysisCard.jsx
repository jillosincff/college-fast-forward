import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function SchoolCodeAnalysisCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState(null);
  const [result, setResult] = useState(null);

  const runBackfill = async () => {
    if (!confirm(`This will set school_code=ufl and school_name="University of Florida" for all users without a school_code (~790 users). Continue?`)) return;
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const res = await base44.functions.invoke('backfillUFUsers', {});
      setBackfillResult(res.data);
      toast({
        title: "✅ Backfill Complete!",
        description: `Updated ${res.data.updated} users as University of Florida.`,
        duration: 8000,
      });
      // Re-run analysis to show updated counts
      setResult(null);
    } catch (err) {
      toast({ title: "Backfill Failed", description: err.message, variant: "destructive" });
    } finally {
      setBackfilling(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('analyzeSchoolCodes', {});
      const a = res.data.analysis;
      setResult(a);
      toast({
        title: "Analysis Complete",
        description: `UF by name: ${a.ufByNameCount} | UF by code: ${a.ufByCodeCount} | UF unknown signals: ${a.ufUnknownCount} | Total missing code: ${a.totalMissingCode}`,
        duration: 10000,
      });
    } catch (err) {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-cyan-200 bg-cyan-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">🔧 School Code Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">Analyze UF school code issues and prepare for bulk fix.</p>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={runAnalysis} disabled={loading || backfilling} className="bg-cyan-600 hover:bg-cyan-700">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</> : '📊 Run Analysis'}
          </Button>
          <Button onClick={runBackfill} disabled={backfilling || loading} className="bg-orange-600 hover:bg-orange-700">
            {backfilling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Backfilling...</> : '🐊 Backfill UF Users'}
          </Button>
        </div>
        {backfillResult && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            ✅ Backfill complete: <strong>{backfillResult.updated}</strong> users updated as University of Florida.
          </div>
        )}
        {result && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border text-center">
              <p className="text-2xl font-bold text-cyan-700">{result.ufByNameCount}</p>
              <p className="text-xs text-slate-500">UF by name, no code</p>
            </div>
            <div className="bg-white rounded-lg p-3 border text-center">
              <p className="text-2xl font-bold text-cyan-700">{result.ufByCodeCount}</p>
              <p className="text-xs text-slate-500">UF code, no name</p>
            </div>
            <div className="bg-white rounded-lg p-3 border text-center">
              <p className="text-2xl font-bold text-orange-600">{result.ufUnknownCount}</p>
              <p className="text-xs text-slate-500">UF signals, no data</p>
            </div>
            <div className="bg-white rounded-lg p-3 border text-center">
              <p className="text-2xl font-bold text-slate-700">{result.totalMissingCode}</p>
              <p className="text-xs text-slate-500">Total missing code</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}