import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getCliffWins } from '@/functions/getCliffWins';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const TYPE_META = {
  offer: { icon: '🏆', color: '#047857', bg: '#ecfdf5' },
  interview: { icon: '🎤', color: '#1d4ed8', bg: '#eff6ff' },
  reply: { icon: '💬', color: '#7c3aed', bg: '#f5f3ff' },
  magic_moment: { icon: '✨', color: '#b45309', bg: '#fffbeb' },
  application: { icon: '📨', color: '#374151', bg: '#f8fafc' },
  resume: { icon: '📄', color: '#6b7280', bg: '#f8fafc' },
};

// Admin-only "CLIFF Wins" — a chronological feed of real student outcomes.
// This page exists to remind us what matters: outcomes, not clicks.
export default function CliffWins() {
  const [state, setState] = useState({ loading: true, forbidden: false, feed: [], trust: null });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        if (u?.role !== 'admin') { setState(s => ({ ...s, loading: false, forbidden: true })); return null; }
        return getCliffWins({}).then(res => {
          const d = res?.data || res || {};
          setState({ loading: false, forbidden: false, feed: d.feed || [], trust: d.trust || null });
        });
      })
      .catch(() => setState(s => ({ ...s, loading: false, forbidden: true })));
  }, []);

  if (state.loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm, color: '#6b7280' }}>Loading wins…</div>;
  }
  if (state.forbidden) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm, color: '#6b7280' }}>Admins only.</div>;
  }

  const fmt = (d) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return ''; } };
  const t = state.trust;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px 80px' }}>
        <h1 style={{ fontFamily: dm, fontSize: 26, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>CLIFF Wins</h1>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>Real outcomes, chronologically. Not clicks.</p>

        {t && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
            {[
              ['Recommendations', t.recommendations],
              ['Adoption', `${t.adoption_rate}%`],
              ['Interview conv.', `${t.interview_conversion}%`],
              ['Offer conv.', `${t.offer_conversion}%`],
            ].map(([label, val]) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontFamily: dm, fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {state.feed.length === 0 ? (
          <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280' }}>No recorded wins yet — they'll show up here as students earn them.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.feed.map((w, i) => {
              const meta = TYPE_META[w.type] || TYPE_META.application;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{meta.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 800, color: meta.color, margin: 0, lineHeight: 1.4 }}>{w.headline}</p>
                    <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', margin: '2px 0 0' }}>{w.school}</p>
                  </div>
                  <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', flexShrink: 0 }}>{fmt(w.date)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}