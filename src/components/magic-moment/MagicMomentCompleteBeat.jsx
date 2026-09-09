import { useEffect, useRef } from 'react';
import { Gift, Sparkles, X, ArrowRight } from 'lucide-react';
import {
  FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, R,
} from '@/components/onboarding-flow/onboardingShared';
import { trackMmCompleteBeatShown, trackMmCompleteBeatDismissed, trackConversionEvent } from '@/lib/tracking';

// Soft completion beat — shown after Magic Moment completes, BEFORE the
// dashboard, if the student hasn't opened Ask a parent / Pro yet this session.
// Primary: Ask a parent → existing parent modal. Secondary: Unlock Pro myself.
// Dismiss is always allowed (logged) — never traps Continue with free.
const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50000, padding: 0,
};
const SHEET = {
  width: '100%', maxWidth: 440, background: '#fff',
  borderRadius: '20px 20px 0 0', padding: '24px 22px calc(28px + env(safe-area-inset-bottom))',
  maxHeight: '92vh', overflowY: 'auto',
};

export default function MagicMomentCompleteBeat({ onAskParent, onUnlockPro, onDismiss }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackMmCompleteBeatShown({ source: 'post_magic_moment' });
    trackConversionEvent('mm_complete_beat_shown', { trigger: 'post_magic_moment' });
  }, []);

  const dismiss = () => {
    trackMmCompleteBeatDismissed({ source: 'post_magic_moment' });
    trackConversionEvent('mm_complete_beat_dismissed', { trigger: 'post_magic_moment' });
    onDismiss();
  };

  return (
    <div style={OVERLAY} onClick={dismiss}>
      <div style={SHEET} onClick={(ev) => ev.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', color: TEXT3, padding: 0 }}><X size={20} /></button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '5px 12px', marginBottom: 12 }}>
            <Sparkles size={12} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Free stops here</span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: 0, lineHeight: 1.5 }}>
            You just felt the shift from "I have no clue" to a real plan. Free stops after this cycle. Pro keeps your guided search going — unlimited tailor, prep, and tracking so you don't fall back into winging it.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT3, margin: '10px 0 0', lineHeight: 1.4 }}>
            Warm intros unlock with Pro when available.
          </p>
        </div>

        {/* Primary — Ask a parent */}
        <button
          onClick={onAskParent}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '15px', cursor: 'pointer', boxShadow: '0 6px 18px rgba(109,40,217,0.32)', marginBottom: 10 }}
        >
          <Gift size={16} /> Ask a parent to unlock Pro
        </button>

        {/* Secondary — Unlock Pro myself */}
        <button
          onClick={onUnlockPro}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '14px', cursor: 'pointer', marginBottom: 14 }}
        >
          <Sparkles size={15} color={INDIGO} /> Unlock Pro myself — $19.96/mo
        </button>

        {/* Dismiss — always allowed */}
        <button
          onClick={dismiss}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
        >
          Continue with free <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}