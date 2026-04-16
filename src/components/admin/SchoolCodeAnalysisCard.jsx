import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function SchoolCodeAnalysisCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
        <Button onClick={runAnalysis} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</> : '📊 Run Analysis'}
        </Button>
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