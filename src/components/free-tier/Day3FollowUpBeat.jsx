import { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Send, Mic, MessageSquare, X, ChevronDown } from 'lucide-react';
import FollowUpDraftModal from '@/components/tracker/FollowUpDraftModal';
import { daysSince, getStatusGroup, formatAppliedDate } from '@/lib/simpleTracker';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Day-3 follow-up agent (in-app). CLIFF acts like a personal recruiter after
// apply: on return, Applied jobs with no update (≥ MIN_DAYS, no follow-up
// logged) get a nudge above the fold. Actions: draft a follow-up (free, copy/
// edit, never auto-send), pressure-test when they have an interview (existing
// Mock Interview w/ job context), mark another reply, or dismiss. Cap ≤3 per
// session. No email blast, no findCliffPeople on free.
const MIN_DAYS = 3;     // nudge after this many days with no update (configurable 3–5)
const MAX_NUDGES = 3;   // cap per session so it's not spam

export default function Day3FollowUpBeat({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(() => new Set());
  const shownLoggedRef = useRef(false);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 200)
      .then(recs => setRecords(recs || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  // Applied-group jobs, no follow-up logged yet, applied ≥ MIN_DAYS ago.
  // Oldest first (most overdue), session-dismissed removed, capped at MAX_NUDGES.
  const nudges = useMemo(() => {
    return records
      .filter(r => {
        if (getStatusGroup(r.status) !== 'applied') return false;
        if (r.reached_out_date) return false;
        return daysSince(r.created_date) >= MIN_DAYS;
      })
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .filter(r => !dismissed.has(r.id))
      .slice(0, MAX_NUDGES);
  }, [records, dismissed]);

  useEffect(() => {
    if (nudges.length > 0 && !shownLoggedRef.current) {
      shownLoggedRef.current = true;
      base44.analytics.track({ eventName: 'followup_nudge_shown', properties: { count: nudges.length } });
    }
  }, [nudges.length]);

  const applyUpdate = (id, updates) => {
    setRecords(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    base44.entities.NetworkingPipeline.update(id, updates).catch(() => {});
  };

  const handleDismiss = (id) => {
    setDismissed(prev => { const n = new Set(prev); n.add(id); return n; });
    base44.analytics.track({ eventName: 'followup_dismissed' });
  };

  if (loading || nudges.length === 0) return null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 16px 0' }}>
      {nudges.map(app => (
        <NudgeCard
          key={app.id}
          app={app}
          onUpdate={(updates) => applyUpdate(app.id, updates)}
          onDismiss={() => handleDismiss(app.id)}
        />
      ))}
    </div>
  );
}

function NudgeCard({ app, onUpdate, onDismiss }) {
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftOpened, setDraftOpened] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const role = app.job_title || 'the role';
  const company = app.company || 'the company';
  const days = daysSince(app.created_date);

  const openDraft = () => {
    setDraftOpen(true);
    setDraftOpened(true);
    base44.analytics.track({ eventName: 'followup_draft_shown', properties: { company } });
  };

  const markSent = () => {
    onUpdate({ reached_out_date: new Date().toISOString(), follow_up_count: (app.follow_up_count || 0) + 1 });
    base44.analytics.track({ eventName: 'followup_marked_sent', properties: { company } });
  };

  const pressureTest = () => {
    base44.analytics.track({ eventName: 'followup_pressure_test', properties: { company, role } });
    const jd = (app.job_description || '').slice(0, 1000);
    navigate('/MockInterview', {
      company: company || '',
      role: role || '',
      mm_free: '1',
      ...(jd ? { jd } : {}),
    });
  };

  const setStatus = (status) => {
    const updates = { status, status_date: new Date().toISOString() };
    if (status === 'offer') updates.offer_date = new Date().toISOString();
    onUpdate(updates);
    base44.analytics.track({ eventName: 'followup_status_updated', properties: { company, status } });
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e9d5ff', borderRadius: 14, padding: '14px 16px', marginBottom: 12, boxShadow: '0 1px 3px rgba(109,40,217,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: '1.4' }}>📨</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px', lineHeight: 1.4 }}>
            You applied to {role} at {company} {days} day{days === 1 ? '' : 's'} ago. Heard back?
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>
            {formatAppliedDate(app.created_date)} · no update yet
          </p>
        </div>
        <button onClick={onDismiss} title="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', color: '#9ca3af', flexShrink: 0 }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button onClick={openDraft} style={btnPrimary}>
          <Send size={14} /> No / not yet → Draft a follow-up
        </button>
        <button onClick={pressureTest} style={btnOutline}>
          <Mic size={14} /> Yes — interview → Pressure-test
        </button>
        <button onClick={() => setShowPicker(s => !s)} style={btnOutline}>
          <MessageSquare size={14} /> Yes — other reply
          <ChevronDown size={13} style={{ transform: showPicker ? 'rotate(180deg)' : 'none' }} />
        </button>
      </div>

      {showPicker && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <button onClick={() => setStatus('replied')} style={pickerBtn}>They replied</button>
          <button onClick={() => setStatus('offer')} style={pickerBtn}>Got an offer</button>
          <button onClick={() => setStatus('no_response')} style={pickerBtn}>Closed</button>
        </div>
      )}

      {draftOpened && !draftOpen && (
        <button onClick={markSent} style={{ ...btnOutline, marginTop: 10, color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}>
          ✓ I sent it — mark as followed up
        </button>
      )}

      <FollowUpDraftModal
        isOpen={draftOpen}
        onClose={() => setDraftOpen(false)}
        application={{ jobTitle: role, company, dateApplied: app.created_date }}
      />
    </div>
  );
}

const btnPrimary = { fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', border: 'none', borderRadius: 999, padding: '10px 16px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 };
const btnOutline = { fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6d28d9', background: '#fff', border: '1px solid #e9d5ff', borderRadius: 999, padding: '10px 16px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 };
const pickerBtn = { fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto' };