import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const FOLLOW_UP_DAYS = 3;

// Progress-only metrics: zero-value tiles are hidden, never shown as discouraging
// empty inventory. If nothing is non-zero, the row disappears entirely.
export default function DashboardStatsRow({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    const load = async () => {
      const [pipeline, tailored] = await Promise.all([
        base44.entities.NetworkingPipeline.filter({ user_email: user.email }).catch(() => []),
        base44.entities.TailoredResume.filter({ user_email: user.email }).catch(() => []),
      ]);
      if (cancelled) return;
      const p = pipeline || [];
      const watching = p.filter(e => ['identified', 'matched'].includes(e.status)).length;
      const interviews = p.filter(e => ['interview', 'offer'].includes(e.status)).length;
      const cutoff = Date.now() - FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000;
      const followUps = p.filter(e =>
        ['reached_out', 'messaged'].includes(e.status) &&
        e.status_date && new Date(e.status_date).getTime() < cutoff
      ).length;
      const ready = (tailored || []).filter(t => t.status !== 'pending' && t.tailored_content).length;
      setStats({ watching, ready, interviews, followUps });
    };
    load();
    const refresh = () => load();
    window.addEventListener('cff:pipeline-changed', refresh);
    return () => { cancelled = true; window.removeEventListener('cff:pipeline-changed', refresh); };
  }, [user?.email]);

  if (!stats) return null;

  const tiles = [];
  if (stats.ready > 0) tiles.push({ label: 'Applications ready', value: stats.ready });
  if (stats.interviews > 0) tiles.push({ label: 'Interviews scheduled', value: stats.interviews });
  if (stats.followUps > 0) tiles.push({ label: 'Follow-ups due', value: stats.followUps });
  if (stats.watching > 0) tiles.push({
    label: 'Opportunities being watched', value: stats.watching,
    sub: "I'll only recommend them when they're worth your time.",
  });

  if (!tiles.length) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
      {tiles.map((t, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
          <p style={{ fontFamily: dm, fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 2px', lineHeight: 1.3 }}>
            {t.value}
          </p>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t.label}
          </p>
          {t.sub && (
            <p style={{ fontFamily: dm, fontSize: 10.5, color: '#9ca3af', margin: '4px 0 0', lineHeight: 1.4 }}>{t.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}