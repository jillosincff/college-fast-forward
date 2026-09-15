import { ExternalLink, MapPin, FileText, Check, Mic, ArrowRight, Calendar, X } from 'lucide-react';
import { FONT, R, SHADOW_MD } from '@/components/onboarding-flow/onboardingShared';
import { navigate } from '@/components/utils/navigation';
import { postedLabel } from '@/lib/jobFreshness';

// Pro Next Move — same personal-recruiter loop as the free Magic Moment, with
// people unlocked. The hero names the NEXT STEP, not just "Apply to…".
//
// Day-0 mode (a live feed job):
//   Primary   → Tailor resume for this role (opens the CLIFF workspace tailored to this job)
//   Secondary → Apply on {company} → (logs Applied via logJobApplied)
//   Tertiary  → Add to Applied / Track
//
// Interview mode (a tracked application whose status is 'interview'):
//   Primary   → Pressure-test → MockInterview preloaded with company/role
//   Tertiary  → Track
export default function ProNextMoveCard({ job, interviewMove, city, onApply, onPrepare, onAddApplied, onDismiss }) {
  if (interviewMove) return <InterviewCard move={interviewMove} />;
  return <Day0Card job={job} city={city} onApply={onApply} onPrepare={onPrepare} onAddApplied={onAddApplied} onDismiss={onDismiss} />;
}

function Day0Card({ job, city, onApply, onPrepare, onAddApplied, onDismiss }) {
  const jobUrl = job.job_url || job.apply_url || job.url || '#';
  const tierLabel = job._tier === 'same_location' || job._tier === 'nearby'
    ? `Matches your ${city || 'location'} preference`
    : job._tier === 'remote'
      ? 'Remote role in your field'
      : '';

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)', borderRadius: R, padding: '22px 18px', marginBottom: 16, boxShadow: SHADOW_MD, color: '#fff' }}>
      <button onClick={onDismiss} aria-label="Dismiss" style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.16)', border: 'none', borderRadius: '50%', cursor: 'pointer', minHeight: 'auto', padding: 0, color: '#fff' }}>
        <X size={15} />
      </button>
      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>Your next move</p>
      <h2 style={{ fontFamily: FONT, fontSize: 21, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
        {job.job_title} at {job.name}
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 14px' }}>
        Next step: tailor your resume, then apply.
      </p>
      {tierLabel && (
        <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={12} /> {tierLabel}
        </p>
      )}
      {postedLabel(job) && (
        <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 14px' }}>{postedLabel(job)}</p>
      )}

      {/* Primary — Tailor resume (opens the workspace tailored to this job) */}
      <button onClick={onPrepare} style={{ width: '100%', fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '13px 18px', cursor: 'pointer', minHeight: 'auto', marginBottom: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <FileText size={15} /> Tailor resume for this role
      </button>

      {/* Secondary — Apply on {company} → */}
      {jobUrl !== '#' && (
        <a href={jobUrl} target="_blank" rel="noopener noreferrer" onClick={onApply} style={{ width: '100%', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 999, padding: '11px 18px', cursor: 'pointer', minHeight: 'auto', marginBottom: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
          <ExternalLink size={14} /> Apply on {job.name || 'site'} →
        </a>
      )}

      {/* Tertiary — Add to Applied / Track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button onClick={onAddApplied} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Check size={13} /> Add to Applied
        </button>
        <button onClick={() => navigate('/ApplicationTracker')} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Track <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function InterviewCard({ move }) {
  const company = move.company || move.company_name || 'the company';
  const role = move.job_title || move.role || 'the role';
  const jd = (move.job_description || '').slice(0, 1000);

  const goPressureTest = () => navigate('/MockInterview', {
    company, role, ...(jd ? { jd } : {}),
  });

  return (
    <div style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)', borderRadius: R, padding: '22px 18px', marginBottom: 16, boxShadow: SHADOW_MD, color: '#fff' }}>
      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', margin: '0 0 8px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={12} /> Your next move
      </p>
      <h2 style={{ fontFamily: FONT, fontSize: 21, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
        Interview coming up: {role} at {company}
      </h2>
      <p style={{ fontFamily: FONT, fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 16px' }}>
        Next step: pressure-test your answers before you go.
      </p>

      <button onClick={goPressureTest} style={{ width: '100%', fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '13px 18px', cursor: 'pointer', minHeight: 'auto', marginBottom: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Mic size={15} /> Pressure-test →
      </button>

      <button onClick={() => navigate('/ApplicationTracker')} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        Track <ArrowRight size={12} />
      </button>
    </div>
  );
}