import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { runCliffDiscovery } from '@/functions/runCliffDiscovery';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { ArrowRight, X } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// "🔥 CLIFF Just Found" — proactive, high-relevance discoveries.
// Renders nothing unless CLIFF actually found something actionable.
export default function CliffJustFound({ user }) {
  const [discoveries, setDiscoveries] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    runCliffDiscovery({})
      .then(res => {
        const data = res?.data || res;
        if (!cancelled && Array.isArray(data?.discoveries)) setDiscoveries(data.discoveries);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.email]);

  const dismiss = (d) => {
    setDiscoveries(prev => prev.filter(x => x.id !== d.id));
    base44.entities.CliffDiscovery.update(d.id, { status: 'dismissed' }).catch(() => {});
  };

  const act = (d) => {
    base44.entities.CliffDiscovery.update(d.id, { status: 'actioned' }).catch(() => {});
    if (d.action_route === 'workspace' && d.company_name) {
      openCliffWorkspace({ company: d.company_name, role: d.job_title || '', jobUrl: d.job_url || '' });
    } else if (d.action_route?.startsWith('#/')) {
      window.location.hash = d.action_route;
    }
  };

  if (!discoveries.length) return null;

  return (
    <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: 16, padding: '18px 20px', boxShadow: '0 4px 20px rgba(76,29,149,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 15 }}>🔥</span>
        <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>CLIFF Just Found</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {discoveries.map(d => (
          <div key={d.id} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 16px', position: 'relative' }}>
            <button
              onClick={() => dismiss(d)}
              aria-label="Dismiss"
              style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, minHeight: 'auto', minWidth: 'auto', lineHeight: 1 }}
            >
              <X size={14} />
            </button>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 24px 4px 0', lineHeight: 1.4 }}>{d.headline}</p>
            {d.detail && <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '0 0 4px', lineHeight: 1.5 }}>{d.detail}</p>}
            {d.reason && <p style={{ fontFamily: dm, fontSize: 11, fontStyle: 'italic', color: '#c4b5fd', margin: '0 0 10px', lineHeight: 1.4 }}>{d.reason}</p>}
            <button
              onClick={() => act(d)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: '8px 16px' }}
            >
              {d.action_label || 'Take a look'} <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}