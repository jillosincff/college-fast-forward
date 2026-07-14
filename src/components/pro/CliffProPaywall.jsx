import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'Satoshi', 'DM Sans', system-ui, sans-serif";
const GRAD = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';

const FREE_ITEMS = ['You drive. CLIFF helps.', 'Personalized opportunities', "Today's Best Moves", 'Career Timeline & Momentum', 'One CLIFF-powered application'];
const PRO_ITEMS = ['CLIFF keeps working — even when you\u2019re not', 'Unlimited CLIFF-powered applications', 'Unlimited resume, interview & company prep', 'Unlimited outreach & follow-ups', 'Proactive background work', 'Brings you back only when it matters'];

const logEvent = (event_name, properties) =>
  base44.functions.invoke('logAnalyticsEvent', { event_name, properties }).catch(() => {});

/**
 * Reusable CLIFF Pro paywall — "Let CLIFF do the work."
 * Show only when the student attempts a valuable Pro action; never trap them.
 *
 * @param {function} onClose     - "Keep Using Free" / dismiss
 * @param {function} onUpgrade   - Optional custom checkout handler
 * @param {string}   trigger     - Feature that triggered this (for analytics)
 * @param {string}   contextLine - Optional value-specific line, e.g. "You've used this week's free CLIFF messages."
 */
export default function CliffProPaywall({ onClose, onUpgrade, trigger = 'generic', contextLine }) {
  useEffect(() => { logEvent('paywall_viewed', { trigger }); }, [trigger]);

  const startPro = async () => {
    logEvent('upgrade_cta_clicked', { trigger });
    if (onUpgrade) { onUpgrade(); return; }
    const res = await base44.functions.invoke('createCheckoutSession', { source: 'cliff_pro_paywall', trigger });
    const url = res?.data?.url || res?.data?.checkout_url;
    if (url) window.location.href = url;
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 20000, background: 'rgba(2,6,23,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, maxWidth: 440, width: '100%', padding: '28px 26px 24px', boxShadow: '0 32px 72px -12px rgba(0,0,0,0.20)', overflowY: 'auto', maxHeight: '90vh' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 100, padding: '4px 14px', marginBottom: 14 }}>
          <span style={{ fontSize: 12 }}>✨</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Included with CLIFF Pro</span>
        </div>

        <h3 style={{ fontFamily: dm, fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Let CLIFF take it from here.
        </h3>
        {contextLine && (
          <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#6d28d9', margin: '0 0 8px', lineHeight: 1.5 }}>{contextLine}</p>
        )}
        <p style={{ fontFamily: dm, fontSize: 13, color: '#64748b', margin: '0 0 18px', lineHeight: 1.6 }}>
          CLIFF Pro works in the background — finding better opportunities, watching deadlines, preparing your applications, and bringing you back only when something important changes.
        </p>

        {/* Outcome comparison — guidance vs execution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>CFF Free</p>
            {FREE_ITEMS.map(t => (
              <p key={t} style={{ fontFamily: dm, fontSize: 11.5, fontWeight: 600, color: '#475569', margin: '0 0 6px', lineHeight: 1.4 }}>· {t}</p>
            ))}
          </div>
          <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 14, padding: '14px' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>CLIFF Pro</p>
            {PRO_ITEMS.map(t => (
              <p key={t} style={{ fontFamily: dm, fontSize: 11.5, fontWeight: 700, color: '#4c1d95', margin: '0 0 6px', lineHeight: 1.4 }}>✓ {t}</p>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 14px' }}>
          Free helps you make progress. Pro makes sure you never lose momentum.
        </p>

        <button onClick={startPro} style={{ width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff', background: GRAD, border: 'none', borderRadius: 14, padding: '15px 20px', cursor: 'pointer', minHeight: 52, boxShadow: '0 8px 24px rgba(109,40,217,0.30)', marginBottom: 8 }}>
          Keep CLIFF Working
        </button>
        <button onClick={onClose} style={{ width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#64748b', background: 'none', border: 'none', padding: '10px', cursor: 'pointer', minHeight: 44 }}>
          Keep Using Free
        </button>
      </div>
    </div>
  );
}