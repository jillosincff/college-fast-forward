import { useState, useEffect } from 'react';
import { getWhileYouWereAway } from '@/functions/getWhileYouWereAway';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// Purple dashboard hero: greeting + "While you were away..." highlights + Continue.
export default function DashboardHero({ user, firstName }) {
  const [data, setData] = useState(null);

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

  const handleContinue = () => {
    const a = rec?.action || {};
    if (a.type === 'workspace') openCliffWorkspace(a.payload);
    else if (a.type === 'route' && a.route) window.location.hash = a.route;
    else document.getElementById('cff-daily-feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 55%, #8b5cf6 100%)',
      borderRadius: 20, padding: 'clamp(22px, 4.5vw, 32px)', marginBottom: 16,
      boxShadow: '0 10px 30px rgba(109,40,217,0.25)',
    }}>
      <h1 style={{ fontFamily: dm, fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
        {greeting()}, {firstName}.
      </h1>

      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
        While you were away…
      </p>

      {!data ? (
        <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)', margin: '0 0 18px' }}>
          Checking what changed…
        </p>
      ) : data.on_track ? (
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 18px', lineHeight: 1.5 }}>
          ✅ Everything is on track. Nothing needs your attention — I'll keep watching.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
          {(data.items || []).slice(0, 3).map((it, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.5 }}>{it}</p>
          ))}
        </div>
      )}

      <button onClick={handleContinue}
        style={{ fontFamily: dm, fontSize: 14.5, fontWeight: 800, color: '#6d28d9', background: '#fff', border: 'none', borderRadius: 999, padding: '13px 34px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
        Continue →
      </button>
    </div>
  );
}