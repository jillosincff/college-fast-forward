import { Users, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { FONT, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER, R, SHADOW_MD, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';

// Replaces the live people section for FREE users in the Magic Moment.
// No findCliffPeople call during onboarding — people unlock after pay or on
// the dashboard. Free users get: one line + pre-filled LinkedIn (school +
// chip + city) + Upgrade / Ask a parent.
export default function LockedPeopleCard({ school, chipText, chipLabel, city, onUpgrade, onAskParent }) {
  const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${school || ''} ${chipText || chipLabel || ''} ${city || ''}`.trim())}`;

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, boxShadow: SHADOW_MD, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Users size={14} color={INDIGO_DIM} />
        <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          People from your school
        </span>
        <Lock size={11} color={INDIGO_DIM} style={{ marginLeft: 'auto' }} />
      </div>

      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>
        Unlock people from your school in {chipLabel || chipText || 'your field'}
      </p>
      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 14px', lineHeight: 1.5 }}>
        CLIFF finds alumni from {school || 'your school'} working in {chipLabel || chipText || 'this field'}{city ? ` in ${city}` : ''} — with ready-to-send outreach messages and a Best Path match.
      </p>

      {/* Pre-filled LinkedIn (free) */}
      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, padding: '11px 16px', borderRadius: 999, textDecoration: 'none', marginBottom: 12, width: '100%', justifyContent: 'center' }}>
        Search LinkedIn now <ExternalLink size={12} />
      </a>

      {/* Upgrade / Ask parent */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onUpgrade} style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Sparkles size={13} /> Unlock with Pro
        </button>
        <button onClick={onAskParent} style={{ flex: 1, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' }}>
          Ask a parent
        </button>
      </div>
    </div>
  );
}