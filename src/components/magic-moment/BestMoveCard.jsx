import { useState } from 'react';
import { Briefcase, MapPin, Zap, Mic, FileText, ExternalLink, Check, X } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, R, SHADOW_MD, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';
import { applyUrlOf } from '@/lib/jobFreshness';

const BADGE = {
  pursue: { label: 'Pursue', bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  stretch: { label: 'Stretch', bg: '#fef3c7', border: '#fcd34d', text: '#a16207' },
};

// One ranked move in the recruiter loop. Primary CTA (pressure-test) only on #1.
// Interested reveals the company-specific insider beat (passed in via prop).
// Tailor / Apply / Add to Applied are demoted secondary actions that work unpaid.
// "Not for me" dismisses so the next ranked candidate backfills (still max 3).
export default function BestMoveCard({ move, index, onPressureTest, onInterested, onTailor, onApply, onAddApplied, onNotForMe, insiderBeat }) {
  const { job, verdict, why } = move;
  const isPrimary = index === 0;
  const badge = BADGE[verdict] || BADGE.stretch;
  const [applied, setApplied] = useState(false);
  const applyUrl = applyUrlOf(job);

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
      <p style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 8px' }}>
        <MapPin size={11} color={TEXT3} /> {job.location || 'Location not listed'}
      </p>

      {/* Why — one honest line from real signals */}
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 12px', lineHeight: 1.5, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px' }}>
        {why}
      </p>

      {/* Primary CTA — pressure-test, only on #1 */}
      {isPrimary && (
        <button onClick={() => onPressureTest(job)} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '13px 16px', cursor: 'pointer', minHeight: 'auto', marginBottom: 8, boxShadow: '0 4px 14px rgba(109,40,217,0.25)' }}>
          <Mic size={15} /> Pressure-test me for this role →
        </button>
      )}

      {/* Interested — reveals the company-specific insider beat */}
      <button onClick={() => onInterested(job)} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '11px 16px', cursor: 'pointer', minHeight: 'auto', marginBottom: 10 }}>
        I'm interested in this company
      </button>

      {/* Insider beat (company-specific, only after Interested) */}
      {insiderBeat}

      {/* Secondary actions — demoted, all work unpaid on this free cycle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
        <button onClick={() => onTailor(job)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 6px' }}>
          <FileText size={13} /> Tailor resume
        </button>
        {applied ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 800, color: '#15803d', padding: '4px 6px' }}>
            <Check size={13} /> Applied
          </span>
        ) : applyUrl ? (
          <a href={applyUrl} target="_blank" rel="noopener noreferrer" onClick={() => { onApply(job); setApplied(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: INDIGO, textDecoration: 'none', padding: '4px 6px' }}>
            <ExternalLink size={13} /> Apply
          </a>
        ) : null}
        <button onClick={() => onAddApplied(job)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 6px' }}>
          <Check size={13} /> Add to Applied
        </button>
        <button onClick={() => onNotForMe(job)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 6px', marginLeft: 'auto' }}>
          <X size={13} /> Not for me
        </button>
      </div>
    </div>
  );
}