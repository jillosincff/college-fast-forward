import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { getAmbassadorStats } from '@/functions/getAmbassadorStats';
import {
  Users, Plus, Download, RefreshCw, Loader2, ChevronRight, ChevronLeft,
  Pause, Play, Trash2, Eye
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

export default function AmbassadorManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ambassadors, setAmbassadors] = useState([]);
  const [totalSignups, setTotalSignups] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [detailAmbassador, setDetailAmbassador] = useState(null);
  const [detailSignups, setDetailSignups] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => { loadAmbassadors(); }, []);

  const loadAmbassadors = async () => {
    setLoading(true);
    try {
      const res = await getAmbassadorStats({});
      if (res.data?.success) {
        setAmbassadors(res.data.ambassadors || []);
        setTotalSignups(res.data.totalSignups || 0);
      }
    } catch (e) {
      console.error('Load error:', e);
      toast({ title: 'Error', description: 'Failed to load ambassadors', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const viewDetail = async (ambassador) => {
    setDetailAmbassador(ambassador);
    setLoadingDetail(true);
    try {
      const res = await getAmbassadorStats({ ambassadorId: ambassador.id });
      if (res.data?.success) {
        setDetailSignups(res.data.signups || []);
      }
    } catch (e) {
      console.error('Detail error:', e);
    } finally { setLoadingDetail(false); }
  };

  const exportAll = async () => {
    try {
      const res = await getAmbassadorStats({ exportCsv: true });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ambassadors_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast({ title: 'Downloaded', description: 'Ambassador report CSV downloaded' });
    } catch (e) {
      toast({ title: 'Error', description: 'Export failed', variant: 'destructive' });
    }
  };

  const exportDetail = async (ambassador) => {
    try {
      const res = await getAmbassadorStats({ ambassadorId: ambassador.id, exportCsv: true });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ambassador_${ambassador.invite_code}_signups.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      toast({ title: 'Error', description: 'Export failed', variant: 'destructive' });
    }
  };

  const toggleStatus = async (ambassador) => {
    const newStatus = ambassador.status === 'active' ? 'paused' : 'active';
    try {
      await base44.entities.Ambassador.update(ambassador.id, { status: newStatus });
      toast({ title: 'Updated', description: `${ambassador.name} is now ${newStatus}` });
      loadAmbassadors();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const deleteAmbassador = async (ambassador) => {
    if (!confirm(`Delete ambassador ${ambassador.name}? This does not remove users who signed up.`)) return;
    try {
      await base44.entities.Ambassador.delete(ambassador.id);
      toast({ title: 'Deleted', description: `${ambassador.name} removed` });
      loadAmbassadors();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-slate-600">Loading ambassadors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{ambassadors.length}</p>
            <p className="text-sm text-slate-600">Total Ambassadors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{totalSignups}</p>
            <p className="text-sm text-slate-600">Total Signups via Ambassadors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {ambassadors.length > 0 ? (totalSignups / ambassadors.length).toFixed(1) : 0}
            </p>
            <p className="text-sm text-slate-600">Avg Signups per Ambassador</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Ambassador
        </Button>
        <Button onClick={exportAll} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export Report (CSV)
        </Button>
        <Button onClick={loadAmbassadors} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Ambassador List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ambassadors</CardTitle>
        </CardHeader>
        <CardContent>
          {ambassadors.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No ambassadors yet. Click "Add Ambassador" to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ambassadors.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{a.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.status === 'active' ? 'bg-green-100 text-green-700' :
                        a.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{a.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{a.invite_code}</span>
                      <span className="font-semibold text-blue-600">{a.live_signups} signups</span>
                      <span>Created {new Date(a.created_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => viewDetail(a)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportDetail(a)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(a)}>
                      {a.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteAmbassador(a)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateAmbassadorDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={loadAmbassadors} />

      {/* Detail Dialog */}
      {detailAmbassador && (
        <Dialog open={!!detailAmbassador} onOpenChange={() => setDetailAmbassador(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {detailAmbassador.name} — Signups
              </DialogTitle>
            </DialogHeader>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Code: <span className="font-mono font-bold">{detailAmbassador.invite_code}</span> · {detailSignups.length} signups
              </p>
              <Button size="sm" variant="outline" onClick={() => exportDetail(detailAmbassador)}>
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
            </div>
            {loadingDetail ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">Loading signups...</p>
              </div>
            ) : detailSignups.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No signups yet with this code.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-slate-700">Name</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-700">Email</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-700">Role</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-700">Signed Up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detailSignups.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-900">{s.full_name || '—'}</td>
                        <td className="px-4 py-2 text-slate-600">{s.email}</td>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            s.persona === 'parent' ? 'bg-orange-100 text-orange-700' :
                            s.persona === 'gator' ? 'bg-purple-100 text-purple-700' :
                            s.persona === 'alumni' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{s.persona || 'none'}</span>
                        </td>
                        <td className="px-4 py-2 text-slate-500">{s.created_date ? new Date(s.created_date).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateAmbassadorDialog({ open, onClose, onCreated }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name || !email || !code) {
      toast({ title: 'Missing fields', description: 'Name, email, and invite code are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Ambassador.create({
        name,
        email,
        invite_code: code,
        status: 'active',
        total_signups: 0,
        notes
      });
      toast({ title: 'Ambassador Created', description: `${name} with code "${code}"` });
      setName(''); setEmail(''); setCode(''); setNotes('');
      onClose();
      onCreated();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Ambassador</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Full Name *</label>
            <Input placeholder="Brandon Smith" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Email *</label>
            <Input type="email" placeholder="brandon@ufl.edu" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Invite Code *</label>
            <Input placeholder="BrandonUF" value={code} onChange={e => setCode(e.target.value)} />
            <p className="text-xs text-slate-500 mt-1">Users will enter this code when signing up. Keep it short and memorable (e.g., BrandonUF, MichelleUF).</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Notes (optional)</label>
            <Input placeholder="Sophomore, Marketing Club president" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Ambassador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}