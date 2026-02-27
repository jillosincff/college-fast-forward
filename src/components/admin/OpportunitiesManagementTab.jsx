import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Opportunity } from '@/entities/Opportunity';

export default function OpportunitiesManagementTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { loadOpportunities(); }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    try { setOpportunities(await Opportunity.filter({}, '-created_date', 100) || []); }
    catch (e) { toast({ title: "Error", description: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (opp) => {
    if (!confirm(`Delete "${opp.title}"?`)) return;
    setDeleting(opp.id);
    try { await Opportunity.delete(opp.id); toast({ title: "Deleted" }); loadOpportunities(); }
    catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setDeleting(null); }
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle className="text-lg"><Briefcase className="w-5 h-5 inline mr-2 text-green-600" />Manage Opportunities ({opportunities.length})</CardTitle></div>
        <Button onClick={loadOpportunities} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? <p className="text-center py-8 text-slate-500">No opportunities</p> :
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {opportunities.map(opp => <div key={opp.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{opp.title}</h3>
              <p className="text-sm text-slate-600">{opp.org_name || 'No org'}</p>
              <p className="text-xs text-slate-500 mt-1">Created: {new Date(opp.created_date).toLocaleDateString()}</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(opp)} disabled={deleting === opp.id}>
              {deleting === opp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-1" />Delete</>}
            </Button>
          </div>)}
        </div>}
      </CardContent>
    </Card>
  );
}