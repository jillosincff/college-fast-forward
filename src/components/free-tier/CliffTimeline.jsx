import { useState, useEffect } from 'react';
import { decisionEngine } from '@/functions/decisionEngine';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { getCareerIntelligenceTimelineItems } from '@/lib/careerIntelligence/engine';
import { getTrajectoryTimelineItem } from '@/lib/careerTrajectory/engine';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check } from 'lucide-react';
import { matchesHeroPriority } from '@/lib/dashboardDedup';

// Daily record of items the student marked done — so "Did it" actually retires
// a task for the rest of the day instead of it snapping back on reload.
const doneKey = () => `cliff_timeline_done_${new Date().toISOString().slice(0, 10)}`;
function readDone() {
  try { return new Set(JSON.parse(localStorage.getItem(doneKey())) || []); } catch { return new Set(); }
}
function writeDone(set) {
  try { localStorage.setItem(doneKey(), JSON.stringify([...set])); } catch {}
}

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
  else if (a?.type === 'event' && a.event) window.dispatchEvent(new Event(a.event));
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function CliffTimeline({ user }) {
  const [data, setData] = useState(null);
  const [trajectory, setTrajectory] = useState(null);
  const [, setHeroTick] = useState(0);
  const [done, setDone] = useState(() => readDone());

  const markDone = (text) => {
    setDone(prev => {
      const next = new Set(prev); next.add(text);
      writeDone(next);
      return next;
    });
  };

  // Re-check dedup once the hero registers its Today's Priority
  useEffect(() => {
    const bump = () => setHeroTick(t => t + 1);
    window.addEventListener('cliff:hero-priority', bump);
    return () => window.removeEventListener('cliff:hero-priority', bump);
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.StudentCareerTrajectory.filter({ user_email: user.email, status: 'active' })
      .then(rows => setTrajectory(rows?.[0] || null))
      .catch(() => {});
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    decisionEngine({})
      .then(res => { if (!cancelled) setData(res?.data || res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.email]);

  // Career Intelligence + Trajectory items appear exactly like other CLIFF recommendations
  const trajItem = getTrajectoryTimelineItem(user, trajectory);
  const allItems = [...(data?.timeline || []), ...getCareerIntelligenceTimelineItems(user), ...(trajItem ? [trajItem] : [])];
  // Dedup layer: never repeat the hero's Today's Priority; retire anything
  // marked done today; cap at 3 actions.
  const heroDup = allItems.some(it => matchesHeroPriority(it.text));
  const items = allItems.filter(it => !matchesHeroPriority(it.text) && !done.has(it.text)).slice(0, 3);
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
      <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: heroDup ? '0 0 4px' : '0 0 14px' }}>Today's plan</h3>
      {heroDup && (
        <p style={{ fontFamily: dm, fontSize: 11.5, color: '#9ca3af', margin: '0 0 12px' }}>↑ Your top priority is already queued above — start with Continue.</p>
      )}
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
                  <button onClick={() => markDone(a.text)} aria-label="Mark done"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '7px 12px', flexShrink: 0 }}>
                    <Check size={12} /> Did it
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