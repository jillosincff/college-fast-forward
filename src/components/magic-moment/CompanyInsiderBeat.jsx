import { Users, Gift, Sparkles } from 'lucide-react';
import { FONT, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';

// Shown INLINE under a single move card only after the student taps
// "I'm interested in this company". No live people on free — this is the
// unlock/pay layer for THAT company. Ask a parent primary, Unlock Pro secondary.
export default function CompanyInsiderBeat({ company, onAskParent, onUpgrade }) {
  return (
    <div style={{ background: '#faf5ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Users size={13} color={INDIGO_DIM} />
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: INDIGO_DIM }}>Want insiders at {company}?</span>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 10px', lineHeight: 1.5 }}>
        CLIFF can find people from your school at {company} — with ready-to-send outreach. Unlock it with a parent's help or Pro.
      </p>
      <button onClick={onAskParent} style={{ width: '100%', fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '11px 14px', cursor: 'pointer', minHeight: 'auto', marginBottom: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Gift size={14} /> Ask a parent to unlock
      </button>
      <button onClick={onUpgrade} style={{ width: '100%', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '10px 14px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Sparkles size={13} /> Unlock with Pro — $19.96/mo
      </button>
    </div>
  );
}