import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const DAY = 86400000;

// Momentum for a 30-day window ending at endMs — measures activity, not worth.
function scoreWindow(pipeline, resumes, endMs) {
  const start = endMs - 30 * DAY;
  const inWin = d => { const t = new Date(d).getTime(); return t >= start && t <= endMs; };
  let s = 40;
  const applied = pipeline.filter(r => ['applied', 'interview', 'offer'].includes(r.status) && inWin(r.status_date || r.created_date)).length;
  s += Math.min(applied * 8, 32);
  s += Math.min(pipeline.filter(r => r.follow_up_date && inWin(r.follow_up_date)).length * 5, 15);
  s += Math.min(pipeline.filter(r => r.status === 'interview' && inWin(r.status_date || r.created_date)).length * 10, 20);
  s += Math.min(resumes.filter(r => r.status === 'completed' && inWin(r.created_date)).length * 4, 16);
  const times = [...pipeline.map(r => r.status_date || r.created_date), ...resumes.map(r => r.created_date)]
    .map(d => new Date(d).getTime()).filter(t => t <= endMs);
  const idleDays = times.length ? (endMs - Math.max(...times)) / DAY : 30;
  s -= Math.min(Math.floor(idleDays) * 2, 25);
  return Math.max(5, Math.min(99, Math.round(s)));
}

export default function MomentumScore({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 200).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 50).catch(() => []),
    ]).then(([pipeline, resumes]) => {
      if (cancelled) return;
      const now = Date.now();
      const score = scoreWindow(pipeline || [], resumes || [], now);
      const delta = score - scoreWindow(pipeline || [], resumes || [], now - 7 * DAY);
      const week = d => now - new Date(d).getTime() < 7 * DAY;

      const reasons = [];
      const appliedWk = (pipeline || []).filter(r => ['applied', 'interview', 'offer'].includes(r.status) && week(r.status_date || r.created_date)).length;
      if (appliedWk) reasons.push(`Applied to ${appliedWk} job${appliedWk === 1 ? '' : 's'} this week`);
      const followWk = (pipeline || []).filter(r => r.follow_up_date && week(r.follow_up_date)).length;
      if (followWk) reasons.push(`Sent ${followWk} follow-up${followWk === 1 ? '' : 's'}`);
      if ((pipeline || []).some(r => r.status === 'interview')) reasons.push('Interview in play');
      const tailoredWk = (resumes || []).filter(r => r.status === 'completed' && week(r.created_date)).length;
      if (tailoredWk) reasons.push(`Tailored ${tailoredWk} resume${tailoredWk === 1 ? '' : 's'}`);

      let coach;
      if (delta < 0) coach = 'Momentum is slipping — one small action today turns it around.';
      else if (appliedWk > 0) coach = `You're on pace for ~${appliedWk * 4} applications this month. Keep stacking.`;
      else coach = "Let's stack one win today — momentum compounds fast.";

      // Reassurance, not ranking: answers "am I doing enough?"
      const reassure = (score >= 55 || delta > 0)
        ? "You're making good progress. You're doing enough."
        : "You're closer than it feels — one small step today counts.";

      setData({ score, delta, reasons: reasons.slice(0, 3), coach, reassure });
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!data) return null;
  const up = data.delta >= 0;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Career Momentum</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
        <span style={{ fontFamily: dm, fontSize: 42, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{data.score}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 13, fontWeight: 800, color: up ? '#059669' : '#dc2626' }}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {up ? '+' : ''}{data.delta} this week
        </span>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ width: `${data.score}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 999 }} />
      </div>
      {data.reasons.map((r, i) => (
        <p key={i} style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 4px' }}>✅ {r}</p>
      ))}
      <p style={{ fontFamily: dm, fontSize: 12, fontStyle: 'italic', color: '#6b7280', margin: data.reasons.length ? '10px 0 0' : 0, lineHeight: 1.5 }}>{data.reassure}</p>
      <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6d28d9', margin: '4px 0 0', lineHeight: 1.5 }}>{data.coach}</p>
    </div>
  );
}