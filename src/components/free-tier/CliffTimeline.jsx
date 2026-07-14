import { useState, useEffect } from 'react';
import { decisionEngine } from '@/functions/decisionEngine';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One timeline, one brain. Every item comes from the Decision Engine — CLIFF
// has already decided the order, held back the noise, and lined up one move
// per day. Suppressed decisions are shown (overridable), never hidden facts.

const dayLabel = (date) => {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const runAction = (a) => {
  if (a?.type === 'workspace') openCliffWorkspace(a.payload);
  else if (a?.type === 'route' && a.route) window.location.hash = a.route;
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function CliffTimeline({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    decisionEngine({})
      .then(res => { if (!cancelled) setData(res?.data || res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.email]);

  const items = data?.timeline || [];
  const waiting = data?.waiting || [];
  const suppressed = data?.suppressed || [];
  if (!items.length && !waiting.length) return null;

  // Group by day label, preserving order
  const groups = [];
  for (const item of items) {
    const label = dayLabel(item.date);
    const g = groups[groups.length - 1];
    if (g && g.label === label) g.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 14px' }}>Your plan — I've already lined it up</h3>
      {groups.map((g, gi) => (
        <div key={g.label} style={{ display: 'flex', gap: 14 }}>
          {/* Timeline rail */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: gi === 0 ? '#7c3aed' : '#d1d5db', marginTop: 5, flexShrink: 0 }} />
            {gi < groups.length - 1 && <div style={{ width: 2, flex: 1, background: '#e5e7eb', margin: '4px 0' }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: gi < groups.length - 1 ? 16 : 0, minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: gi === 0 ? '#7c3aed' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>{g.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: gi === 0 ? '#faf9ff' : '#f8f9fc', border: gi === 0 ? '1px solid #ede9fe' : '1px solid transparent', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{a.emoji}</span>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#374151', margin: 0, flex: 1, lineHeight: 1.4 }}>{a.text}</p>
                  <button onClick={() => runAction(a.action)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12, fontWeight: 800, color: gi === 0 ? '#fff' : '#6d28d9', background: gi === 0 ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#f5f3ff', border: 'none', borderRadius: 999, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '7px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {a.cta} <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {waiting.length > 0 && (
        <div style={{ display: 'flex', gap: 14, marginTop: groups.length ? 0 : 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#d1d5db', marginTop: 5 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Waiting</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {waiting.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>👀</span>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#6b7280', margin: 0, flex: 1, lineHeight: 1.4 }}>
                    {w} — no action needed. I'll let you know if something changes.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {suppressed.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #e5e7eb' }}>
          {suppressed.map((s, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 11.5, color: '#9ca3af', margin: '0 0 3px', lineHeight: 1.5 }}>
              🤫 {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}