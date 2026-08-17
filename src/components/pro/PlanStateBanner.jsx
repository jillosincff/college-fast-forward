import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import useAccessPlan from '@/hooks/useAccessPlan';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const device = () => (window.innerWidth < 768 ? 'mobile' : 'desktop');

// Plan-based dashboard state:
// - Magic moment available → subtle reminder that the first application is free
// - Magic moment used → outcome-framed CLIFF Pro conversion card
// Renders nothing for Pro users, excluded accounts, or while loading.
export default function PlanStateBanner({ user, onUpgrade }) {
  const { loading, excludePrompts, magicMomentAvailable, magicMomentCompleted } = useAccessPlan(user);

  // Track exposure of the post-magic-moment Pro card so the conversion funnel
  // reflects real reach — once per session.
  useEffect(() => {
    if (loading || excludePrompts || !magicMomentCompleted) return;
    try { if (sessionStorage.getItem('cff_plan_banner_shown')) return; sessionStorage.setItem('cff_plan_banner_shown', '1'); } catch {}
    base44.functions.invoke('conversionEngine', {
      action: 'promptAction', trigger: 'plan_state_banner', act: 'shown', device: device(),
    }).catch(() => {});
  }, [loading, excludePrompts, magicMomentCompleted]);

  if (loading || excludePrompts) return null;

  if (magicMomentAvailable) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, background: '#f5f3ff',
        border: '1px solid #ddd6fe', borderRadius: 12, padding: '10px 16px', marginBottom: 16,
      }}>
        <span style={{ fontSize: 16 }}>🎁</span>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#5b21b6', margin: 0 }}>
          Your first CLIFF-powered application is free — pick any job below and CLIFF builds the whole thing.
        </p>
      </div>
    );
  }

  if (magicMomentCompleted) {
    const handleCta = () => {
      base44.functions.invoke('conversionEngine', {
        action: 'promptAction', trigger: 'plan_state_banner', act: 'cta_clicked', device: device(),
      }).catch(() => {});
      onUpgrade?.('CLIFF Pro', 'plan_state_banner');
    };
    return (
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
        boxShadow: '0 6px 24px rgba(124,58,237,0.28)',
        borderRadius: 16, padding: '18px 22px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
            You've used your free cycle.
          </p>
          <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.5 }}>
            Unlock CLIFF Pro to run this for every job — unlimited tailored resumes, alumni or parent matches, and ready-to-send outreach.
          </p>
        </div>
        <button
          onClick={handleCta}
          style={{
            fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#5b21b6',
            background: '#fff', border: 'none', borderRadius: 999, padding: '12px 24px',
            cursor: 'pointer', flexShrink: 0, minHeight: 44,
          }}
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return null;
}