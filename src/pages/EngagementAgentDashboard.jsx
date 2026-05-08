import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Mail, Eye, Clock, Send, AlertCircle, RefreshCw, Play } from 'lucide-react';
import IntentSegmentPanel from '@/components/engagement/IntentSegmentPanel';

const STATUS_COLORS = {
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  rejected: 'bg-slate-100 text-slate-500',
  skipped: 'bg-slate-100 text-slate-500',
};

const DAY_LABELS = {
  0: 'Day 0 — Welcome',
  2: 'Day 2 — Parent profiles',
  5: 'Day 5 — Activity summary',
  9: 'Day 9 — Industry update',
  14: 'Day 14 — Re-orientation',
};

export default function EngagementAgentDashboard() {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [runningAgent, setRunningAgent] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [rejectingStale, setRejectingStale] = useState(false);
  const [syncingOpens, setSyncingOpens] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); loadEmails(); }).catch(() => setLoading(false));
  }, []);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getEngagementEmails', {});
      setEmails(res.data?.emails || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const approveEmail = async (id) => {
    await base44.functions.invoke('updateEngagementEmail', {
      id,
      updates: { status: 'approved', approved_by: user?.email, approved_at: new Date().toISOString() },
    });
    setEmails(prev => prev.map(e => e.id === id ? { ...e, status: 'approved', approved_by: user?.email } : e));
    if (previewEmail?.id === id) setPreviewEmail(prev => ({ ...prev, status: 'approved' }));
  };

  const rejectEmail = async (id) => {
    const reason = prompt('Rejection reason (optional):') || 'Rejected by admin';
    await base44.functions.invoke('updateEngagementEmail', {
      id,
      updates: { status: 'rejected', rejected_reason: reason },
    });
    setEmails(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));
    if (previewEmail?.id === id) setPreviewEmail(prev => ({ ...prev, status: 'rejected' }));
  };

  const runAgent = async (dryRun = false) => {
    setRunningAgent(true);
    setActionMsg('');
    try {
      const res = await base44.functions.invoke('runEngagementAgent', { dryRun });
      const d = res.data;
      setActionMsg(`Done: ${d.queued} queued, ${d.skipped} skipped${dryRun ? ' (dry run)' : ''}`);
      if (!dryRun) await loadEmails();
    } catch (e) {
      setActionMsg(`Error: ${e.message}`);
    } finally {
      setRunningAgent(false);
    }
  };

  const syncOpens = async () => {
    setSyncingOpens(true);
    setActionMsg('');
    try {
      const res = await base44.functions.invoke('syncEngagementEmailOpens', {});
      const d = res.data;
      setActionMsg(`Synced: checked ${d.checked} emails, updated ${d.updated} with open/click data from SendGrid (${d.sendgridMessages} SG messages scanned)`);
      await loadEmails();
    } catch (e) {
      setActionMsg(`Sync error: ${e.message}`);
    } finally {
      setSyncingOpens(false);
    }
  };

  const rejectStale = async () => {
    setRejectingStale(true);
    setActionMsg('');
    try {
      const res = await base44.functions.invoke('rejectStaleEngagementEmails', { maxAgeDays: 2 });
      setActionMsg(`Rejected ${res.data.rejected} stale emails (older than 2 days)`);
      await loadEmails();
    } catch (e) {
      setActionMsg(`Error: ${e.message}`);
    } finally {
      setRejectingStale(false);
    }
  };

  const dispatchApproved = async () => {
    setDispatching(true);
    setActionMsg('');
    try {
      const res = await base44.functions.invoke('dispatchApprovedEngagementEmails', {});
      const d = res.data;
      setActionMsg(`Sent: ${d.sent}, Failed: ${d.failed}`);
      await loadEmails();
    } catch (e) {
      setActionMsg(`Error: ${e.message}`);
    } finally {
      setDispatching(false);
    }
  };

  const pending = emails.filter(e => e.status === 'pending_approval');
  const approved = emails.filter(e => e.status === 'approved');
  const sent = emails.filter(e => e.status === 'sent');
  const failed = emails.filter(e => e.status === 'failed');
  const rejected = emails.filter(e => e.status === 'rejected');

  // Stats
  const totalSent = sent.length;
  const openRate = totalSent > 0
    ? Math.round((sent.filter(e => e.opened_at).length / totalSent) * 100)
    : null;
  const loginRate = totalSent > 0
    ? Math.round((sent.filter(e => e.resulted_in_login).length / totalSent) * 100)
    : null;

  if (!user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">CFF Engagement Agent</h1>
            <p className="text-slate-500 text-sm mt-1">Workflow 1 — Student Onboarding Sequence</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={loadEmails} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => runAgent(true)} disabled={runningAgent} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Dry Run
            </Button>
            <Button variant="outline" size="sm" onClick={rejectStale} disabled={rejectingStale} className="border-red-800 text-red-400 hover:bg-red-900/20">
              {rejectingStale ? 'Rejecting...' : 'Reject Stale (>2d)'}
            </Button>
            <Button variant="outline" size="sm" onClick={syncOpens} disabled={syncingOpens} className="border-blue-800 text-blue-400 hover:bg-blue-900/20">
              {syncingOpens ? 'Syncing...' : '↻ Sync Opens'}
            </Button>
            <Button size="sm" onClick={() => runAgent(false)} disabled={runningAgent} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Play className="w-4 h-4 mr-1" /> {runningAgent ? 'Running...' : 'Run Agent'}
            </Button>
          </div>
        </div>

        {actionMsg && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-300">
            {actionMsg}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Pending Approval', value: pending.length, color: 'text-yellow-400' },
            { label: 'Approved', value: approved.length, color: 'text-blue-400' },
            { label: 'Sent', value: totalSent, color: 'text-green-400' },
            { label: 'Open Rate', value: openRate !== null ? `${openRate}%` : '—', color: 'text-slate-300' },
            { label: 'Login Rate', value: loginRate !== null ? `${loginRate}%` : '—', color: 'text-slate-300' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Intent Segment */}
        <IntentSegmentPanel />

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <div className="flex items-center justify-between">
            <TabsList className="bg-slate-800">
              <TabsTrigger value="pending" className="data-[state=active]:bg-slate-700">
                Pending {pending.length > 0 && <span className="ml-1 bg-yellow-500 text-black text-xs rounded-full px-1.5">{pending.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-slate-700">Approved ({approved.length})</TabsTrigger>
              <TabsTrigger value="sent" className="data-[state=active]:bg-slate-700">Sent ({sent.length})</TabsTrigger>
              <TabsTrigger value="rejected" className="data-[state=active]:bg-slate-700">Rejected ({rejected.length})</TabsTrigger>
            </TabsList>
            {approved.length > 0 && (
              <Button size="sm" onClick={dispatchApproved} disabled={dispatching} className="bg-green-700 hover:bg-green-600 text-white">
                <Send className="w-4 h-4 mr-1" /> {dispatching ? 'Sending...' : `Send ${approved.length} approved`}
              </Button>
            )}
          </div>

          {['pending', 'approved', 'sent', 'rejected'].map(tab => {
            const list = tab === 'pending' ? pending : tab === 'approved' ? approved : tab === 'sent' ? sent : rejected;
            return (
              <TabsContent key={tab} value={tab} className="mt-4 space-y-2">
                {list.length === 0 && (
                  <div className="text-center py-12 text-slate-600">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No emails in this queue</p>
                  </div>
                )}
                {list.map(email => (
                  <EmailRow
                    key={email.id}
                    email={email}
                    onApprove={approveEmail}
                    onReject={rejectEmail}
                    onPreview={() => setPreviewEmail(email)}
                  />
                ))}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewEmail(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
                    {DAY_LABELS[previewEmail.sequence_day] || previewEmail.template_id} · {previewEmail.user_email}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">{previewEmail.subject}</h2>
                </div>
                <button onClick={() => setPreviewEmail(null)} className="text-slate-400 hover:text-slate-700 text-xl leading-none ml-4">×</button>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{previewEmail.body_text}</pre>
              </div>
              {previewEmail.personalization_data && (
                <div className="text-xs text-slate-500 mb-4">
                  <strong>Personalization data:</strong>{' '}
                  {JSON.stringify(previewEmail.personalization_data, null, 0).slice(0, 200)}...
                </div>
              )}
              {previewEmail.status === 'pending_approval' && (
                <div className="flex gap-3">
                  <Button onClick={() => { approveEmail(previewEmail.id); setPreviewEmail(null); }} className="bg-green-600 hover:bg-green-700 text-white flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button onClick={() => { rejectEmail(previewEmail.id); setPreviewEmail(null); }} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 flex-1">
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailRow({ email, onApprove, onReject, onPreview }) {
  const dayLabel = DAY_LABELS[email.sequence_day] || email.template_id;
  const formattedDate = email.created_date
    ? new Date(email.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[email.status]}`}>
            {email.status.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-500">{dayLabel}</span>
        </div>
        <p className="text-sm font-semibold text-white truncate">{email.subject}</p>
        <p className="text-xs text-slate-500 mt-0.5">To: {email.user_email} · {formattedDate}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button size="sm" variant="ghost" onClick={onPreview} className="text-slate-400 hover:text-white h-8 px-2">
          <Eye className="w-4 h-4" />
        </Button>
        {email.status === 'pending_approval' && (
          <>
            <Button size="sm" onClick={() => onApprove(email.id)} className="bg-green-700 hover:bg-green-600 text-white h-8 px-3">
              <CheckCircle className="w-3 h-3 mr-1" /> Approve
            </Button>
            <Button size="sm" onClick={() => onReject(email.id)} variant="outline" className="border-red-800 text-red-400 hover:bg-red-900/20 h-8 px-3">
              <XCircle className="w-3 h-3 mr-1" /> Reject
            </Button>
          </>
        )}
        {email.status === 'sent' && email.opened_at && (
          <span className="text-xs text-green-400 flex items-center gap-1"><Eye className="w-3 h-3" /> Opened</span>
        )}
        {email.status === 'failed' && (
          <span className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>
        )}
      </div>
    </div>
  );
}