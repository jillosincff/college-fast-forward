import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import { recordRecommendation } from '@/functions/recordRecommendation';

const isDone = s => ['ready_for_review', 'approved', 'complete'].includes(s || '');

// Section 5: in-progress jobs surface the current next step — never a restart CTA
function pursuitNextStep(p) {
  if (!p) return null;
  if (p.interview_status === 'scheduled') return '🎤 Interview Coming — Practice';
  if (p.application_status === 'follow_up_due' || (p.next_action_due_date && new Date(p.next_action_due_date) < new Date())) return '📬 Follow-Up Due — Open Draft';
  if (p.application_status === 'applied' || p.application_status === 'interviewing') return '⏳ Waiting on Employer — View Plan';
  if (isDone(p.resume_status)) return '📄 Resume Ready — Review';
  return '▶ Continue Preparation';
}

const primaryBtn = 'w-full py-3 rounded-xl text-white text-sm font-extrabold transition-all cursor-pointer active:scale-[0.98]';
const primaryStyle = { minHeight: 'auto', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' };

// Plan-aware primary CTA for a job feed card. One primary action, subtle plan cues.
// Uses the canonical access plan (useAccessPlan upstream) — no plan logic of its own.
export default function JobCardPlanCTA({ access, pursuit, verdict, rank = 0, onUpgrade, companyName, jobTitle, jobDesc, jobUrl, location, salary, alumniCount }) {
  const plan = access?.isPro ? 'pro' : 'free';
  const mmStatus = access?.magicMomentCompleted ? 'completed' : access?.magicMomentAvailable ? 'available' : 'none';

  const track = (eventName, extra = {}) => {
    try {
      base44.analytics.track({ eventName, properties: { plan, magic_moment_status: mmStatus, company: companyName, role: jobTitle, card_rank: rank, ...extra } });
    } catch {}
  };

  // CLIFF Learning Engine — every recommendation becomes gradable
  const grade = (event) => {
    recordRecommendation({
      company: companyName,
      role: jobTitle,
      event,
      recommendation_level: verdict?.tier,
      verdict: verdict?.verdict,
      score: verdict?.score,
    }).catch(() => {});
  };

  // One meaningful view per card per session — repeated renders don't re-count
  useEffect(() => {
    if (access?.loading) return;
    try {
      const key = `cff_jcv_${companyName}_${jobTitle}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        track('job_card_viewed');
        if (access?.magicMomentAvailable) track('free_magic_moment_cta_viewed');
        grade('shown');
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access?.loading]);

  const goWorkspace = (cta) => {
    track('job_workspace_opened', { cta });
    grade('pursued');
    openCliffWorkspace({ company: companyName, role: jobTitle, jobDescription: jobDesc, jobUrl, location, salary, alumniCount: alumniCount || 0 });
  };

  // 1. Job already in progress — one contextual next-step CTA, all plans
  const nextStep = pursuitNextStep(pursuit);
  if (nextStep) {
    return (
      <button onClick={() => { track('preparation_resumed', { cta: 'Prepare this application' }); goWorkspace('Prepare this application'); }} className={primaryBtn} style={primaryStyle}>
        Prepare this application
      </button>
    );
  }

  // 2. Pro / excluded / plan unknown — clean execution CTA, zero plan messaging
  if (!access || access.loading || access.isPro || access.excludePrompts) {
    return (
      <button onClick={() => goWorkspace('Prepare this application')} className={primaryBtn} style={primaryStyle}>
        Prepare this application
      </button>
    );
  }

  // 3. Free with the one-time magic moment available — same destination as every
  // other card (the Job Workspace owns the resume step for this role).
  if (access.magicMomentAvailable && (jobDesc || jobUrl)) {
    const goMagic = () => {
      track('free_magic_moment_cta_clicked');
      goWorkspace('Prepare this application');
    };
    return (
      <div>
        {rank === 0 && (
          <span className="inline-block text-[10px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-0.5 mb-1.5">
            🎁 First CLIFF application free
          </span>
        )}
        <button onClick={goMagic} className={primaryBtn} style={primaryStyle}>
          Prepare this application
        </button>
        {rank === 0 ? (
          <p className="text-[11px] text-gray-500 text-center mt-1.5 mb-0">CLIFF will tailor your resume and prepare your next steps.</p>
        ) : (
          <p className="text-[10px] text-purple-600 font-semibold text-center mt-1 mb-0">Eligible for your free CLIFF application</p>
        )}
      </div>
    );
  }

  // 4. Free after the magic moment — same CTA and destination. The workspace shows
  // the plan for this job and puts the soft wall on the resume step itself.
  return (
    <div>
      <button onClick={() => goWorkspace('Prepare this application')} className={primaryBtn} style={primaryStyle}>
        Prepare this application
      </button>
      <p className="text-[10px] text-gray-500 text-center mt-1 mb-0">
        Your free resume tailoring is used — CLIFF Pro tailors every application.
      </p>
    </div>
  );
}