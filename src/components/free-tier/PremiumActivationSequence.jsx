import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Sparkles } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const STEP_MS = 1400;

// One-time "activation moment" shown on a premium user's first dashboard visit.
// Peak-end rule: makes minute one of premium feel like a concierge switching on.
export default function PremiumActivationSequence({ user, shortName, networkCount, companiesCount }) {
  const storageKey = `cff_premium_activated_${user?.email || 'anon'}`;
  // Seen flag lives on the user account (works across devices/browsers),
  // with localStorage as a fast local backup.
  const [visible, setVisible] = useState(() => {
    if (user?.premium_activation_seen) return false;
    try { return !localStorage.getItem(storageKey); } catch { return false; }
  });
  const [stepsDone, setStepsDone] = useState(0);

  // If the user record loads/refreshes with the flag already set, hide immediately
  useEffect(() => {
    if (user?.premium_activation_seen) setVisible(false);
  }, [user?.premium_activation_seen]);

  const steps = [
    'Activating your 24/7 career agent',
    `Scanning the ${shortName || 'campus'} alumni & parent network`,
    'Mapping warm paths into your target companies',
    'Calibrating your daily job drop',
  ];

  useEffect(() => {
    if (!visible || stepsDone >= steps.length) return;
    const t = setTimeout(() => setStepsDone(n => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [visible, stepsDone, steps.length]);

  if (!visible) return null;
  const allDone = stepsDone >= steps.length;

  const dismiss = () => {
    try { localStorage.setItem(storageKey, '1'); } catch {}
    setVisible(false);
    // Persist on the account so it never shows again on any device
    base44.auth.updateMe({ premium_activation_seen: true }).catch(() => {});
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 30000, background: 'rgba(6,4,18,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(124,58,237,0.5)' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Premium activated</p>
            <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>CLIFF is coming online for you</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {steps.map((label, i) => {
            const done = i < stepsDone;
            const active = i === stepsDone;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: done || active ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#16a34a' : 'rgba(255,255,255,0.08)', border: done ? 'none' : '1px solid rgba(255,255,255,0.2)', transition: 'background 0.3s' }}>
                  {done ? <Check size={13} color="#fff" /> : active ? (
                    <span style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'pas-spin 0.7s linear infinite', display: 'block' }} />
                  ) : null}
                </div>
                <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: done ? '#fff' : 'rgba(255,255,255,0.7)' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {allDone && (
          <div style={{ animation: 'pas-fade 0.4s ease both' }}>
            <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px', lineHeight: 1.5 }}>
                {networkCount > 0
                  ? <>{networkCount} warm connection{networkCount === 1 ? '' : 's'} across {companiesCount} compan{companiesCount === 1 ? 'y' : 'ies'} are now working for you.</>
                  : <>Your agent is live and scouting roles and warm connections around the clock.</>}
              </p>
              <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
                CLIFF works while you sleep — fresh matches and warm paths land on your dashboard daily.
              </p>
            </div>
            <button
              onClick={dismiss}
              style={{ width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 12, padding: '14px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(124,58,237,0.45)' }}
            >
              Enter my Command Center →
            </button>
          </div>
        )}

        <style>{`
          @keyframes pas-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pas-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}