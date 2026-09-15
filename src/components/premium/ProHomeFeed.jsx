import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Briefcase, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { logJobApplied } from '@/lib/magicMomentLog';
import { useJobsFeed } from '@/hooks/useJobsFeed';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';
import JobsRefreshBar from '@/components/free-tier/JobsRefreshBar';
import JobsList from '@/components/magic-moment/JobsList';
import ProNextMoveCard from '@/components/premium/ProNextMoveCard';
import Day3FollowUpBeat from '@/components/free-tier/Day3FollowUpBeat';
import LimitedFreshResultsCard from '@/components/free-tier/LimitedFreshResultsCard';
import WeeklyActivityStrip from '@/components/free-tier/WeeklyActivityStrip';

// Pro home — personal recruiter loop. Above the fold: weekly activity strip →
// Day-3 follow-up beat (if eligible) → Your Next Move (Tailor / Apply / Track).
// Warm connections live ONLY on the job workspace after applying (post-apply
// beat), never as their own section on home.
export default function ProHomeFeed({ user, onOpenTools }) {
  const navigate = useNavigate();
  const {
    jobsList, jobsLoading, shortMessage, lastUpdated, isStale, error, mostlyFallback, refresh,
  } = useJobsFeed({ user, maxJobs: 30 });
  const [nextIdx, setNextIdx] = useState(0);
  const [interviewMove, setInterviewMove] = useState(null);

  const nextJob = jobsList[nextIdx] || null;
  const city = user?.career_goals?.location_preference || user?.location || '';

  // If the student has a tracked application in 'interview' status, the Next
  // Move becomes a pressure-test for that role — more urgent than a new apply.
  useEffect(() => {
    if (!user?.email) return;
    let mounted = true;
    base44.entities.NetworkingPipeline.filter({ user_email: user.email, status: 'interview' }, '-status_date', 10)
      .then(rows => {
        if (!mounted) return;
        const r = (rows || [])[0];
        if (r) setInterviewMove({ company: r.company, company_name: r.company, job_title: r.job_title, role: r.job_title, job_description: r.job_description });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [user?.email]);

  const featuredFeedJob = interviewMove ? null : nextJob;
  const moreJobs = interviewMove ? jobsList : jobsList.filter((_, i) => i !== nextIdx);
  const showMoreJobs = !jobsLoading && !mostlyFallback && moreJobs.length > 0 && (interviewMove ? true : jobsList.length > 1);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 100px', fontFamily: FONT }}>
      <WeeklyActivityStrip user={user} />
      {/* 1. Day-3 follow-up beat — reusable recruiter nudge (Applied ≥3 days, no update) */}
      <Day3FollowUpBeat user={user} />

      {/* 2. Your Next Move — interview (if any) else next feed job. Tailor-primary loop. */}
      {interviewMove ? (
        <ProNextMoveCard interviewMove={interviewMove} />
      ) : jobsLoading ? (
        <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '24px 18px', marginBottom: 16, boxShadow: SHADOW_MD, textAlign: 'center' }}>
          <div style={{ width: 20, height: 20, border: `2.5px solid #e9d5ff`, borderTop: `2.5px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>Finding your next move…</p>
        </div>
      ) : mostlyFallback && jobsList.length > 0 ? (
        <LimitedFreshResultsCard
          jobs={jobsList}
          onRefresh={refresh}
          refreshing={jobsLoading}
          onApply={(job) => logJobApplied({ user, job })}
        />
      ) : nextJob ? (
        <ProNextMoveCard
          job={nextJob}
          city={city}
          onApply={() => logJobApplied({ user, job: nextJob })}
          onPrepare={() => openCliffWorkspace({ company: nextJob.name, role: nextJob.job_title, jobUrl: nextJob.job_url || nextJob.apply_url, ...nextJob })}
          onAddApplied={() => logJobApplied({ user, job: nextJob })}
          onDismiss={() => setNextIdx(i => Math.min(i + 1, jobsList.length))}
        />
      ) : jobsList.length > 0 ? (
        <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>You're all caught up.</p>
          <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>CLIFF refreshes matches daily — check back tomorrow for new opportunities.</p>
        </div>
      ) : (
        <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>No jobs matched right now.</p>
          <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>CLIFF refreshes matches daily. Try editing your goals to widen the search.</p>
        </div>
      )}

      {/* 3. More jobs for you — live Apply URLs only */}
      {jobsLoading ? (
        <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '24px 18px', marginBottom: 16, boxShadow: SHADOW_MD, textAlign: 'center' }}>
          <div style={{ width: 22, height: 22, border: `2.5px solid #e9d5ff`, borderTop: `2.5px solid ${INDIGO}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>We're scouring the internet for roles worth your time…</p>
          <p style={{ fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>sit tight.</p>
        </div>
      ) : showMoreJobs ? (
        <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, boxShadow: SHADOW_MD }}>
          <JobsRefreshBar lastUpdated={lastUpdated} isStale={isStale} error={error} mostlyFallback={mostlyFallback} onRefresh={refresh} loading={jobsLoading} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Briefcase size={14} color={INDIGO_DIM} />
            <span style={{ fontSize: 12, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>More jobs for you</span>
          </div>
          {shortMessage && (
            <p style={{ fontSize: 12, color: TEXT3, margin: '0 0 10px', lineHeight: 1.4, fontFamily: FONT }}>
              {shortMessage}
            </p>
          )}
          <JobsList variant="pro_loop" jobs={moreJobs} excludeJobKey={featuredFeedJob ? `${featuredFeedJob.name}|${featuredFeedJob.job_title}` : ''} onApply={(job) => logJobApplied({ user, job })} onPrepare={(job) => openCliffWorkspace({ company: job.name, role: job.job_title, jobUrl: job.job_url || job.apply_url, ...job })} onTailor={(job) => { const p = new URLSearchParams({ company: job.name, role: job.job_title, job_url: job.job_url || job.apply_url || '', from: 'prohome' }); navigate(`/ResumeTailoring?${p.toString()}`); }} />
        </div>
      ) : null}

      {/* 4. Application history — quiet link */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <button onClick={() => navigate('/ApplicationTracker')} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
          Application history <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </button>
      </div>

      {/* 5. Quiet toolbox link — paste a job link / Ask CLIFF */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button onClick={onOpenTools} style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: INDIGO_DIM, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
          Got a job in mind? <ArrowRight size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </button>
      </div>
    </div>
  );
}