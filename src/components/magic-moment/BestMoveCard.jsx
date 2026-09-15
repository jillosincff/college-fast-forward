import { Briefcase, MapPin, Zap, ArrowRight, X } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO_DIM, INDIGO_BORDER, R, SHADOW_MD, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';
import { postedLabel } from '@/lib/jobFreshness';

const BADGE = {
  pursue: { label: 'Pursue', bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  stretch: { label: 'Stretch', bg: '#fef3c7', border: '#fcd34d', text: '#a16207' },
};

// One ranked move. The card points to the CLIFF job page (workspace with the JD
// + the progressive Interested → Tailor → Apply → Track → warm-connections
// loop). The list itself doesn't force Tailor/Apply as primaries. "Not for me"
// stays on the card to dismiss + backfill.
export default function BestMoveCard({ move, index, onOpen, onNotForMe }) {
  const { job, verdict, why } = move;
  const badge = BADGE[verdict] || BADGE.stretch;

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '16px 16px 12px', marginBottom: 12, boxShadow: SHADOW_MD }}>
      {/* Badge + rank */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 999, padding: '3px 9px', fontFamily: FONT, fontSize: 10, fontWeight: 800, color: badge.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {verdict === 'pursue' && <Zap size={10} />} {badge.label}
        </span>
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: TEXT3 }}>#{index + 1}</span>
      </div>

      {/* Job */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <Briefcase size={12} color={INDIGO_DIM} />
        <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.3 }}>{job.job_title}</h3>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, margin: '2px 0 2px' }}>{job.name}</p>
      {job.location ? (
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 8px' }}>
          <MapPin size={11} color={TEXT3} /> {job.location}
        </p>
      ) : null}
      {postedLabel(job) && (
        <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: '0 0 8px' }}>{postedLabel(job)}</p>
      )}

      {/* Why — one honest line from real signals */}
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 12px', lineHeight: 1.5, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px' }}>
        {why}
      </p>

      {/* Open in CLIFF — primary → job page (progressive loop there) */}
      <button onClick={() => onOpen(job)} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '13px 16px', cursor: 'pointer', minHeight: 'auto', marginBottom: 8, boxShadow: '0 4px 14px rgba(109,40,217,0.25)' }}>
        Open in CLIFF <ArrowRight size={15} />
      </button>

      {/* Not for me — quiet dismiss */}
      <button onClick={() => onNotForMe(job)} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '6px 6px' }}>
        <X size={13} /> Not for me
      </button>
    </div>
  );
}