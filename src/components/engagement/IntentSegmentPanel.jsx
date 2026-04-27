/**
 * IntentSegmentPanel
 * 
 * Shows students who evaluated FastIQ (viewed leads, score, paywall)
 * but never started a trial. High-priority segment for friction reduction.
 */
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw, Zap, AlertTriangle } from 'lucide-react';

const SIGNAL_LABELS = {
  paywall_viewed: { label: 'Hit Paywall', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  checkout_started: { label: 'Started Checkout', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  match_score_viewed: { label: 'Saw Match Score', color: '#E85D20', bg: 'rgba(232,93,32,0.12)' },
  teaser_reveal_viewed: { label: 'Saw Blurred Leads', color: '#eab308', bg: 'rgba(234,179,8,0.10)' },
  fastiq_leads_viewed: { label: 'Viewed In-App Leads', color: '#a3a3a3', bg: 'rgba(163,163,163,0.10)' },
};

const STRENGTH_LABELS = {
  5: { label: 'Very High', color: '#ef4444' },
  4: { label: 'High', color: '#f97316' },
  3: { label: 'Medium', color: '#E85D20' },
  2: { label: 'Low', color: '#a3a3a3' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function IntentSegmentPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getIntentSegment', {});
      setData(res.data);
    } catch (e) {
      setError(e.message || 'Failed to load segment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '24px',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertTriangle style={{ width: 14, height: 14, color: '#f97316' }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              Intent Segment — Evaluated, Didn't Trial
            </p>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Students who viewed FastIQ leads or the paywall but never started a trial
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
          minHeight: 'auto',
        }}>
          <RefreshCw style={{ width: 12, height: 12, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Loading…</p>
      )}
      {error && (
        <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>{error}</p>
      )}

      {data && (
        <>
          {/* Summary tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Segment', value: data.total, color: '#f97316' },
              { label: 'Hit Paywall', value: data.summary.paywallViewers, color: '#ef4444' },
              { label: 'Saw Score', value: data.summary.scoreViewers, color: '#E85D20' },
              { label: 'Saw Leads', value: data.summary.teaserViewers + data.summary.leadsViewers, color: '#eab308' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, padding: '14px 16px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Next step callout */}
          <div style={{
            background: 'rgba(249,115,22,0.08)',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <Zap style={{ width: 15, height: 15, color: '#f97316', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: '#f97316' }}>Friction sequence needed.</strong>{' '}
              These {data.total} students showed real intent but didn't convert. A targeted "here's what you'd actually get" email sequence — different from onboarding — could recover this segment.
              Paywall viewers ({data.summary.paywallViewers}) are highest priority.
            </p>
          </div>

          {/* User list */}
          {data.segment.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              No intent-but-no-trial users found.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {data.segment.map(u => {
                const strength = STRENGTH_LABELS[u.strongestScore] || STRENGTH_LABELS[2];
                const signal = SIGNAL_LABELS[u.strongestSignal] || {};
                return (
                  <div key={u.user_id} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.user_email}
                      </p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {u.events.map(ev => {
                          const s = SIGNAL_LABELS[ev] || {};
                          return (
                            <span key={ev} style={{
                              fontSize: 10, fontWeight: 600,
                              color: s.color || '#aaa',
                              background: s.bg || 'rgba(255,255,255,0.06)',
                              border: `1px solid ${s.color || '#aaa'}30`,
                              borderRadius: 100, padding: '2px 8px',
                            }}>
                              {s.label || ev}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{timeAgo(u.latestAt)}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: strength.color,
                        background: `${strength.color}15`,
                        border: `1px solid ${strength.color}40`,
                        borderRadius: 100, padding: '3px 10px',
                        whiteSpace: 'nowrap',
                      }}>
                        {strength.label} Intent
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}