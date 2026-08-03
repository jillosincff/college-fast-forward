import { useState, useEffect } from 'react';
import { getWhileYouWereAway } from '@/functions/getWhileYouWereAway';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { ArrowRight, Clock, Target } from 'lucide-react';
import { useProPrompt } from '@/components/conversion/useProPrompt';
import ProTriggerPrompt from '@/components/conversion/ProTriggerPrompt';
import CliffProPaywall from '@/components/pro/CliffProPaywall';
import OvernightBrief from '@/components/free-tier/OvernightBrief';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Proactive agent surface: what CLIFF verified changed since the last visit,
// plus the single most valuable next move. Every line is real — never invented.
export default function WhileYouWereAway({ user }) {
  const [data, setData] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Contextual Pro prompt: only when the proactive engine found a real update.
  // Frequency-controlled (session dedupe, 7-day suppression, never for Pro users).
  const { eligible, dismiss, clickCta } = useProPrompt({
    user,
    trigger: 'proactive_discovery',
    active: !!data && !data.on_track,
  });

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

  if (!data) return null;
  const rec = data.recommendation;

  const go = () => {
    const a = rec.action || {};
    if (a.type === 'workspace') openCliffWorkspace(a.payload);
    else if (a.type === 'route' && a.route) window.location.hash = a.route;
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <OvernightBrief overnight={data.overnight} />
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
        While you were away…
      </p>

      {data.on_track ? (
        <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#15803d', margin: '0 0 12px', lineHeight: 1.5 }}>
          Everything is on track. Nothing needs your attention today — I'll keep watching. ✅
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
          {data.items.map((it, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#374151', margin: 0, lineHeight: 1.5 }}>{it}</p>
          ))}
        </div>
      )}

      {rec && (
        <div style={{ background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', margin: '0 0 4px' }}>
            {data.brief} Here's the one thing I'd do:
          </p>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>{rec.title}</p>
          <p style={{ fontFamily: dm, fontSize: 12.5, color: '#4b5563', margin: '0 0 8px', lineHeight: 1.5 }}>{rec.reason}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {rec.time}
              </span>
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Target size={11} /> {rec.outcome}
              </span>
            </div>
            <button onClick={go}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', flexShrink: 0 }}>
              {rec.cta} <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {data.suppressed?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {data.suppressed.map((s, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 11.5, color: '#9ca3af', margin: '0 0 3px', lineHeight: 1.5 }}>
              🤫 {s}
            </p>
          ))}
        </div>
      )}

      {eligible && (
        <div style={{ marginTop: 12, marginBottom: -8 }}>
          <ProTriggerPrompt
            trigger="proactive_discovery"
            detail="CLIFF Pro keeps this running in the background and brings you back only when something matters."
            onCta={() => { clickCta(); setShowPaywall(true); }}
            onDismiss={() => dismiss(false)}
          />
        </div>
      )}
      {showPaywall && <CliffProPaywall trigger="proactive_discovery" onClose={() => setShowPaywall(false)} />}
    </div>
    </>
  );
}