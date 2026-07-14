import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

export default function PipelineImpactBar({ user, theme }) {
  const [stats, setStats] = useState({ appsSent: 0, networkNudges: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    base44.entities.NetworkingPipeline.list('-created_date', 200)
      .then(records => {
        const all = records || [];
        const interviewStatuses = ['interview', 'offer'];
        setStats({
          appsSent: all.length,
          networkNudges: all.filter(r => r.alumni_name || r.alumni_email || r.alumni_linkedin).length,
          interviews: all.filter(r => interviewStatuses.includes(r.status)).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  // Refresh when pipeline changes
  useEffect(() => {
    const handler = () => setLoading(true) || base44.entities.NetworkingPipeline.list('-created_date', 200)
      .then(records => {
        const all = records || [];
        setStats({
          appsSent: all.length,
          networkNudges: all.filter(r => r.alumni_name || r.alumni_email || r.alumni_linkedin).length,
          interviews: all.filter(r => ['interview', 'offer'].includes(r.status)).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    window.addEventListener('cliff:pipeline-refresh', handler);
    window.addEventListener('cff:pipeline-changed', handler);
    return () => {
      window.removeEventListener('cliff:pipeline-refresh', handler);
      window.removeEventListener('cff:pipeline-changed', handler);
    };
  }, []);

  // Never show a zero — hide empty tiles; if everything is zero, show that CLIFF is watching.
  const tiles = [
    { label: 'Apps Sent', value: stats.appsSent, icon: '📋', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Network Nudges', value: stats.networkNudges, icon: '🤝', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { label: 'Interviews', value: stats.interviews, icon: '🎤', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  ].filter(t => loading || t.value > 0);

  if (!loading && tiles.length === 0) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #ddd6fe', borderRadius: 14,
        padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👀</div>
        <div>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#6d28d9', margin: 0 }}>CLIFF is watching opportunities for you</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '2px 0 0', lineHeight: 1.4 }}>I'm continuously evaluating openings — I'll only surface the ones worth your time.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${tiles.length}, 1fr)`,
      gap: 10,
      marginBottom: 20,
    }}>
      {tiles.map(tile => (
        <div key={tile.label} style={{
          background: '#fff',
          border: `1px solid ${tile.border}`,
          borderRadius: 14,
          padding: '14px 12px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: tile.bg, margin: '0 auto 8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {tile.icon}
          </div>
          <p style={{
            fontFamily: dm, fontSize: 22, fontWeight: 800,
            color: tile.color, margin: 0, lineHeight: 1,
          }}>
            {loading ? '–' : tile.value}
          </p>
          <p style={{
            fontFamily: dm, fontSize: 10, fontWeight: 700,
            color: '#6b7280', margin: '4px 0 0',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {tile.label}
          </p>
        </div>
      ))}
    </div>
  );
}