import { useState, useEffect, useRef } from 'react';
import { getWhileYouWereAway } from '@/functions/getWhileYouWereAway';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { setHeroPriority } from '@/lib/dashboardDedup';
import { base44 } from '@/api/base44Client';
import { Clock } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Compressed mission-control hero: greeting + agent status + ONE Today's Priority + Continue.
// Never multiple competing actions, never metric blocks.
export default function DashboardHero({ user, firstName }) {
  const [data, setData] = useState(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    let since = null;
    try { since = localStorage.getItem('cliff_last_visit'); } catch {}
    getWhileYouWereAway({ since })
      .then(res => { if (!cancelled) setData(res?.data || res); })
      .catch(() => {});
    try { localStorage.setItem('cliff_last_visit', new Date().toISOString()); } catch {}
    return () => { cancelled = true; };
  }, [user?.email]);

  const rec = data?.recommendation;

  // Register the priority in the shared dedup layer so no other module repeats it
  useEffect(() => {
    if (!rec || trackedRef.current) return;
    trackedRef.current = true;
    setHeroPriority(rec.title);
    try { base44.analytics.track({ eventName: 'hero_priority_shown', properties: { title: rec.title || '' } }); } catch {}
  }, [rec]);

  const handleContinue = () => {
    try { base44.analytics.track({ eventName: 'hero_continue_clicked', properties: { title: rec?.title || '' } }); } catch {}
    const a = rec?.action || {};
    if (a.type === 'workspace') openCliffWorkspace(a.payload);
    else if (a.type === 'route' && a.route) window.location.hash = a.route;
    else document.getElementById('cff-daily-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const items = (data?.items || []).slice(0, 3);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 55%, #8b5cf6 100%)',
      borderRadius: 20, padding: 'clamp(16px, 3vw, 22px)', marginBottom: 16,
      boxShadow: '0 10px 30px rgba(109,40,217,0.25)',
    }}>
      <h1 style={{ fontFamily: dm, fontSize: 'clamp(19px, 4.5vw, 24px)', fontWeight: 900, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
        {greeting()}, {firstName}.
      </h1>
      <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: 'rgba(255,255,255,0.75)', margin: '0 0 10px' }}>
        I've already been working.
      </p>

      {!data ? (
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '0 0 12px' }}>
          Checking what changed…
        </p>
      ) : data.on_track || !items.length ? (
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.5 }}>
          Everything is on track. I'm still watching — nothing needs your attention right now.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          {items.map((it, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.45 }}>{it}</p>
          ))}
        </div>
      )}

      {rec ? (
        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '12px 14px' }}>
          <p style={{ fontFamily: dm, fontSize: 10.5, fontWeight: 800, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
            Today's priority
          </p>
          <p style={{ fontFamily: dm, fontSize: 15.5, fontWeight: 900, color: '#fff', margin: '0 0 10px', lineHeight: 1.35, overflowWrap: 'anywhere' }}>
            {rec.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            {rec.time ? (
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} /> {rec.time}
              </span>
            ) : <span />}
            <button onClick={handleContinue}
              style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#6d28d9', background: '#fff', border: 'none', borderRadius: 999, padding: '11px 30px', cursor: 'pointer', minHeight: 44, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              Continue →
            </button>
          </div>
        </div>
      ) : data && (
        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, padding: '12px 14px' }}>
          <p style={{ fontFamily: dm, fontSize: 14.5, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>You're on track.</p>
          <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '0 0 10px', lineHeight: 1.5 }}>
            Nothing needs your attention today. I'm still watching your opportunities and timing.
          </p>
          <button onClick={handleContinue}
            style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#6d28d9', background: '#fff', border: 'none', borderRadius: 999, padding: '10px 24px', cursor: 'pointer', minHeight: 44, boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
            Explore My Next Opportunity →
          </button>
        </div>
      )}
    </div>
  );
}