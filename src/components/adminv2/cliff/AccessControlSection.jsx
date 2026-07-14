import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const ACTIONS = [
  { value: 'grant_pro', label: 'Grant CLIFF Pro' },
  { value: 'remove_pro', label: 'Remove CLIFF Pro' },
  { value: 'start_trial', label: 'Start / Extend Pro Trial' },
  { value: 'set_expiration', label: 'Set Access Expiration' },
  { value: 'mark_grandfathered', label: 'Mark Grandfathered' },
  { value: 'mark_internal', label: 'Mark Internal / Test' },
  { value: 'reset_magic_moment', label: 'Reset Magic Moment' },
  { value: 'set_exclude_prompts', label: 'Exclude from Upgrade Prompts' },
];

const Tile = ({ label, value, accent }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
    <p className="text-slate-500 text-[11px] uppercase tracking-wider">{label}</p>
    <p className={`text-xl font-bold ${accent || 'text-white'}`}>{value ?? '—'}</p>
  </div>
);

export default function AccessControlSection() {
  const [summary, setSummary] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [email, setEmail] = useState('');
  const [lookup, setLookup] = useState(null);
  const [action, setAction] = useState('grant_pro');
  const [days, setDays] = useState('7');
  const [expiresAt, setExpiresAt] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const runMigration = async (dryRun) => {
    setMigrating(true);
    setMsg(null);
    try {
      const res = await base44.functions.invoke('migrateAccessPlans', { dryRun });
      setSummary(res.data.summary);
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setMigrating(false);
    }
  };

  const doLookup = async () => {
    setBusy(true);
    setMsg(null);
    setLookup(null);
    try {
      const res = await base44.functions.invoke('adminSetAccess', { email: email.trim(), action: 'lookup' });
      setLookup(res.data);
    } catch (e) {
      setMsg({ ok: false, text: e?.response?.data?.error || e.message });
    } finally {
      setBusy(false);
    }
  };

  const applyOverride = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const payload = { email: email.trim(), action, reason };
      if (action === 'start_trial') payload.days = Number(days) || 7;
      if (action === 'set_expiration' || action === 'grant_pro') payload.expires_at = expiresAt || undefined;
      const res = await base44.functions.invoke('adminSetAccess', payload);
      setLookup(prev => prev ? { ...prev, plan: res.data.plan } : prev);
      setMsg({ ok: true, text: 'Override applied and logged.' });
      setReason('');
    } catch (e) {
      setMsg({ ok: false, text: e?.response?.data?.error || e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Access Plans & Overrides</h2>
          <p className="text-slate-500 text-xs mt-0.5">Classify every user before gating. Overrides are audited.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => runMigration(true)} disabled={migrating} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700" style={{ minHeight: 'auto' }}>
            {migrating ? 'Running…' : 'Dry Run'}
          </button>
          <button onClick={() => runMigration(false)} disabled={migrating} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold" style={{ minHeight: 'auto' }}>
            {migrating ? 'Running…' : 'Run Migration'}
          </button>
        </div>
      </div>

      {summary && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Tile label="Evaluated" value={summary.evaluated} />
            <Tile label="Free" value={summary.freeAssigned} />
            <Tile label="Pro" value={summary.proAssigned} accent="text-purple-400" />
            <Tile label="Trials Preserved" value={summary.trialsPreserved} />
            <Tile label="Grandfathered" value={summary.grandfathered} accent="text-amber-400" />
            <Tile label="Admin Overrides Kept" value={summary.adminOverridesPreserved} />
            <Tile label="Internal / Test" value={summary.internalTest} />
            <Tile label="Needs Review" value={summary.needsReview} accent={summary.needsReview > 0 ? 'text-red-400' : 'text-green-400'} />
          </div>
          <div className={`rounded-xl p-3 text-sm font-semibold ${summary.gatingSafe ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
            {summary.dryRun ? 'DRY RUN — no records written. ' : ''}
            {summary.gatingSafe
              ? '✓ Safe to enforce gating — no unresolved errors or review items.'
              : '⚠ Do NOT enforce gating yet — resolve review items and errors below first.'}
          </div>
          {summary.reviewAccounts?.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto">
              {summary.reviewAccounts.map((r, i) => (
                <p key={i} className="text-xs text-slate-400 mb-1"><span className="text-white">{r.email}</span> — {r.reason}</p>
              ))}
            </div>
          )}
          {summary.errors?.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 max-h-40 overflow-y-auto">
              {summary.errors.map((r, i) => (
                <p key={i} className="text-xs text-red-400 mb-1">{r.email}: {r.error}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-user override */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <p className="text-sm font-bold text-white">User Override</p>
        <div className="flex gap-2 flex-wrap">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="student@email.com" className="flex-1 min-w-[220px] bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
          <button onClick={doLookup} disabled={busy || !email.trim()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700" style={{ minHeight: 'auto' }}>Look Up</button>
        </div>

        {lookup && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1">
            <p><span className="text-white font-semibold">{lookup.user.full_name || lookup.user.email}</span> · {lookup.user.persona || 'no persona'}</p>
            <p>Plan: <span className="text-purple-400 font-bold">{lookup.plan?.plan || 'no record'}</span> · State: {lookup.plan?.access_state || '—'} · Source: {lookup.plan?.access_source || '—'}</p>
            <p>Magic moment: {lookup.plan?.magic_moment_status || '—'} · Excluded from prompts: {lookup.plan?.exclude_upgrade_prompts ? 'yes' : 'no'}</p>
            <p>Legacy flags: sub={lookup.user.subscription_status || '—'} · tier={lookup.user.membership_tier || '—'} · trial={lookup.user.trial_status || '—'} · fastiq_active={String(!!lookup.user.fastiq_active)}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap items-center">
          <select value={action} onChange={e => setAction(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
            {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
          {action === 'start_trial' && (
            <input value={days} onChange={e => setDays(e.target.value)} type="number" min="1" className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="Days" />
          )}
          {(action === 'set_expiration' || action === 'grant_pro') && (
            <input value={expiresAt} onChange={e => setExpiresAt(e.target.value)} type="date" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
          )}
        </div>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (required — recorded in the audit log)" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
        <button onClick={applyOverride} disabled={busy || !email.trim() || !reason.trim()} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-sm font-semibold" style={{ minHeight: 'auto' }}>
          {busy ? 'Applying…' : 'Apply Override'}
        </button>
        {msg && <p className={`text-xs font-semibold ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>}
      </div>
    </div>
  );
}