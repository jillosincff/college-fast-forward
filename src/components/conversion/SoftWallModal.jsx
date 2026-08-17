import { useState, useEffect } from 'react';
import {
  FONT, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO,
} from '@/components/onboarding-flow/onboardingShared';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import { trackSoftWallViewed, trackSoftWallUpgradeClicked } from '@/lib/tracking';
import { X, Lock, Gift } from 'lucide-react';

// Compact soft-wall sheet shown when a free user tries a gated action outside
// the one-time Magic Moment. Both buttons open the existing hard paywall.
export default function SoftWallModal({ user, onClose, source = 'soft_wall' }) {
  const [showPro, setShowPro] = useState(false);

  useEffect(() => { trackSoftWallViewed({ source }); }, []);

  const goPro = (cta) => { trackSoftWallUpgradeClicked({ source, cta }); setShowPro(true); };

  if (showPro) {
    return <ProUpgradeModal user={user} onClose={onClose} source={source} />;
  }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div data-testid="soft-wall-modal" style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 22px calc(28px + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', color: '#94a3b8', padding: 0 }}><X size={20} /></button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={22} color={INDIGO} />
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>You've used your free cycle.</h1>
          <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 22px', lineHeight: 1.5 }}>Unlock CLIFF Pro to keep running the plan.</p>
          <button data-testid="soft-wall-upgrade" onClick={() => goPro('upgrade')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '15px', cursor: 'pointer', boxShadow: '0 6px 18px rgba(109,40,217,0.32)', marginBottom: 10 }}>
            Upgrade to Pro
          </button>
          <button data-testid="cta-parent" onClick={() => goPro('parent')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '14px', cursor: 'pointer' }}>
            <Gift size={15} color={INDIGO} /> Ask a parent to unlock
          </button>
        </div>
      </div>
    </div>
  );
}