import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Loader2, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { fixMissingPersonas } from '@/functions/fixMissingPersonas';

export default function SignUpDiagnosticsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pendingAttempts, setPendingAttempts] = useState([]);
  const [expiredAttempts, setExpiredAttempts] = useState([]);
  const [usersWithoutPersona, setUsersWithoutPersona] = useState([]);
  const [deletingExpired, setDeletingExpired] = useState(false);

  useEffect(() => { loadDiagnostics(); }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const pending = await base44.entities.RegistrationAttempt.filter({ status: 'pending' }, '-created_date', 50);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const expired = (pending || []).filter(att => new Date(att.created_date) < new Date(twentyFourHoursAgo));
      const allUsers = await base44.entities.User.filter({}, '-created_date', 9999);
      const noPersona = (allUsers || []).filter(u => {
        const p = u.persona;
        return (!p || p === '' || (typeof p === 'string' && p.trim() === '')) && !u.roles?.includes('admin');
      });
      setPendingAttempts(pending || []);
      setExpiredAttempts(expired);
      setUsersWithoutPersona(noPersona);
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
    } finally { setLoading(false); }
  };

  const deleteExpiredAttempts = async () => {
    if (!confirm(`Delete ${expiredAttempts.length} expired attempts?`)) return;
    setDeletingExpired(true);
    let deleted = 0;
    for (const att of expiredAttempts) {
      try { await base44.entities.RegistrationAttempt.delete(att.id); deleted++; } catch {}
    }
    toast({ title: "Cleanup Complete", description: `Deleted ${deleted} expired attempts` });
    setDeletingExpired(false);
    loadDiagnostics();
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={pendingAttempts.length > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-600" /><div><p className="text-2xl font-bold">{pendingAttempts.length}</p><p className="text-sm text-slate-600">Pending Email Verification</p></div></div></CardContent>
        </Card>
        <Card className={expiredAttempts.length > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><AlertTriangle className="w-8 h-8 text-red-600" /><div><p className="text-2xl font-bold">{expiredAttempts.length}</p><p className="text-sm text-slate-600">Expired (24h+)</p></div></div>{expiredAttempts.length > 0 && <Button size="sm" variant="destructive" onClick={deleteExpiredAttempts} disabled={deletingExpired}>{deletingExpired ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete All'}</Button>}</div></CardContent>
        </Card>
        <Card className={usersWithoutPersona.length > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="w-8 h-8 text-orange-600" /><div><p className="text-2xl font-bold">{usersWithoutPersona.length}</p><p className="text-sm text-slate-600">Users Without Persona</p></div></div></CardContent>
        </Card>
      </div>
      <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Pending Email Verifications</CardTitle><Button onClick={loadDiagnostics} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button></CardHeader>
        <CardContent>{pendingAttempts.length === 0 ? <div className="text-center py-8"><CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" /><p>All verified</p></div> :
          <div className="space-y-3">{pendingAttempts.map(att => {
            const h = Math.floor((Date.now() - new Date(att.created_date)) / 3600000);
            return <div key={att.id} className={`p-4 rounded-lg border ${h >= 24 ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
              <p className="font-semibold">{att.full_name} {h >= 24 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">Expired</span>}</p>
              <p className="text-sm text-slate-600">{att.email}</p>
              <p className="text-xs text-slate-500">{h}h ago · {att.persona || 'N/A'}</p>
            </div>;
          })}</div>}
        </CardContent>
      </Card>
    </div>
  );
}