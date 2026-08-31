import { Users, Gift, Sparkles, Lock } from 'lucide-react';
import { FONT, TEXT2, INDIGO_DIM, INDIGO_BORDER, R, SHADOW_MD, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';
import PeopleList from '@/components/magic-moment/PeopleList';

// Shows ONE real alum with the existing PeopleList/PersonRow UI (name, school,
// company, buildOutreachDraft, "Copy message & open LinkedIn"). The rest are
// locked with a short line. Two buttons below:
//   - Primary: "Ask a parent to unlock" → opens parent-email view
//   - Secondary: "Unlock with Pro" → opens the monthly/annual pay view
//
// After the student copies the message, the person stays on screen and the
// buttons stay visible (PersonRow handles its own "Copied" state internally).
export default function MagicMomentPersonCard({ person, user, liveJobCompanies, chipText, onAction, onAskParent, onUpgrade }) {
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, boxShadow: SHADOW_MD, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Users size={14} color={INDIGO_DIM} />
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          People from your school
        </span>
      </div>

      {/* ONE real person — existing PeopleList / PersonRow UI */}
      <PeopleList
        people={[person]}
        user={user}
        liveJobCompanies={liveJobCompanies}
        chipText={chipText}
        onAction={onAction}
      />

      {/* Lock line — more people unlock with Pro */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '10px 12px', background: '#f5f3ff', borderRadius: 8, border: `1px solid ${INDIGO_BORDER}` }}>
        <Lock size={12} color={INDIGO_DIM} />
        <span style={{ fontFamily: FONT, fontSize: 12, color: INDIGO_DIM, fontWeight: 600 }}>
          More people from your school unlock with CLIFF Pro
        </span>
      </div>

      {/* Two buttons — Ask a parent is primary, Unlock with Pro is secondary */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={onAskParent} style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Gift size={13} /> Ask a parent to unlock
        </button>
        <button onClick={onUpgrade} style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Sparkles size={13} /> Unlock with Pro
        </button>
      </div>
    </div>
  );
}