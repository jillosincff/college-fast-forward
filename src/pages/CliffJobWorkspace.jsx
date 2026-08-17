import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { analyzeJobFit } from '@/functions/analyzeJobFit';
import { syncJobPursuit } from '@/functions/syncJobPursuit';
import WorkspaceNextStep from '@/components/workspace/WorkspaceNextStep';
import { readWorkspaceJob } from '@/lib/cliffWorkspace';
import JobFitCard from '@/components/workspace/JobFitCard';
import WorkspacePrepActions from '@/components/workspace/WorkspacePrepActions';
import BestAdvantageCard from '@/components/workspace/BestAdvantageCard';
import CompanyPrepCard from '@/components/workspace/CompanyPrepCard';
import TrustPanel from '@/components/workspace/TrustPanel';
import TrajectoryFitCard from '@/components/workspace/TrajectoryFitCard';
import CliffReadyCard from '@/components/conversion/CliffReadyCard';
import WarmApplyFlow from '@/components/free-tier/WarmApplyFlow';
import { ArrowRight } from 'lucide-react';
import decodeEntities from '@/utils/decodeEntities';
import { computeNextStep } from '@/components/workspace/workspaceNextStep';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Job-specific workspace: CLIFF assesses the fit and organizes every prep step in one place.
export default function CliffJobWorkspace() {
  const [job] = useState(() => readWorkspaceJob());
  const [user, setUser] = useState(null);
  const [fit, setFit] = useState(null);
  const [fitLoading, setFitLoading] = useState(true);
  const [fitError, setFitError] = useState(false);
  const [pursuit, setPursuit] = useState(null);
  const [showApply, setShowApply] = useState(false);

  // Keep the unified JobPursuit record in sync with what CLIFF has prepared
  const syncPursuit = (extra = {}) => {
    if (!job) return;
    syncJobPursuit({
      company: job.company,
      role: job.role || job.job_title,
      jobId: job.id || '',
      jobUrl: job.jobUrl || job.job_url || '',
      location: job.location || '',
      connectionsSearched: true,
      ...extra,
    })
      .then(res => {
        const data = res?.data || res;
        if (data?.pursuit) setPursuit(data.pursuit);
      })
      .catch(() => {});
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/#/CliffJobWorkspace'));
  }, []);

  useEffect(() => {
    if (!job) { setFitLoading(false); return; }
    let cancelled = false;
    analyzeJobFit({
      company: job.company,
      role: job.role || job.job_title,
      jobDescription: job.jobDescription || '',
      location: job.location || '',
    })
      .then(res => {
        const data = res?.data || res;
        if (!cancelled) {
          if (data?.fit) setFit(data.fit);
          else setFitError(true);
        }
      })
      .catch(() => { if (!cancelled) setFitError(true); })
      .finally(() => { if (!cancelled) setFitLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Sync the pursuit once the fit assessment settles (fit fields included when available)
  useEffect(() => {
    if (!job || fitLoading) return;
    syncPursuit({
      fitLevel: fit?.fit_label || fit?.label || '',
      fitExplanation: fit?.recommendation || fit?.summary || '',
    });
  }, [fitLoading]);

  const goBack = () => { window.location.hash = '#/FreeTierDashboard'; };

  if (!job) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
          <h2 style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>No job selected</h2>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>Pick a job from your feed and tap "Let CLIFF Handle This" to open its workspace.</p>
          <button onClick={goBack} style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', borderRadius: 999, padding: '11px 26px', cursor: 'pointer', minHeight: 44 }}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const company = decodeEntities(job.company || '');
  const role = decodeEntities(job.role || job.job_title || '');

  // The header CTA leads with the plan's next step — not the final step.
  // Mirrors the WorkspaceNextStep card so the top action and the plan never disagree.
  const nextStep = computeNextStep(pursuit, fit);
  const goTailor = () => {
    const params = new URLSearchParams({ company, role, job_url: job.jobUrl || job.job_url || '', from: 'workspace' });
    window.location.hash = `#/ResumeTailoring?${params.toString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 80px' }}>
        <button onClick={goBack} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 12, minHeight: 44 }}>
          ← Back to dashboard
        </button>

        {/* Job header */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 100, padding: '4px 12px', marginBottom: 10 }}>
            <span style={{ fontSize: 11 }}>✨</span>
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#6d28d9', letterSpacing: '0.06em', textTransform: 'uppercase' }}>CLIFF Job Workspace</span>
          </div>
          <h1 style={{ fontFamily: dm, fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 900, color: '#111827', margin: '0 0 4px', lineHeight: 1.25, wordBreak: 'break-word' }}>{role}</h1>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#6b7280', margin: 0 }}>{company}</p>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', margin: '6px 0 0' }}>I'm on it — everything for this application lives right here.</p>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            {job.location && <span style={{ fontFamily: dm, fontSize: 12, color: '#6b7280' }}>📍 {decodeEntities(job.location)}</span>}
            {job.salary && <span style={{ fontFamily: dm, fontSize: 12, color: '#6b7280' }}>💰 {job.salary}</span>}
          </div>

          {/* Header CTA leads with the plan's next step — not the final step. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
            {nextStep.cta === 'tailor' && (
              <button
                onClick={goTailor}
                style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
              >
                Prepare my resume <ArrowRight size={15} />
              </button>
            )}
            {nextStep.cta === 'apply' && (
              <button
                onClick={() => setShowApply(true)}
                style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
              >
                Apply <ArrowRight size={15} />
              </button>
            )}
            {(job.jobUrl || job.job_url) && (
              <a href={job.jobUrl || job.job_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6d28d9', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                View posting ↗
              </a>
            )}
            {/* Apply stays reachable while the resume is being prepared — just demoted, never competing */}
            {nextStep.cta === 'tailor' && (
              <button
                onClick={() => setShowApply(true)}
                style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 44, textDecoration: 'underline' }}
              >
                or apply now
              </button>
            )}
          </div>
        </div>

        {/* One Next Step: CLIFF's single strongest recommendation leads the workspace */}
        {user && <WorkspaceNextStep job={job} pursuit={pursuit} fit={fit} fitLoading={fitLoading} user={user} />}

        {/* "CLIFF Is Ready" preview — Free students post-Magic-Moment only (backend-gated) */}
        {user && <CliffReadyCard job={job} />}

        <JobFitCard fit={fit} loading={fitLoading} error={fitError} />

        {/* Career Trajectory: why this job matters for the student's long-term path */}
        {user && <TrajectoryFitCard job={job} user={user} />}

        {/* CLIFF Trust Engine: why this, why not others, confidence, what changed, outcome timeline */}
        {user && <TrustPanel job={job} />}

        {user && <WorkspacePrepActions job={job} user={user} />}

        <CompanyPrepCard job={job} onPrepared={() => syncPursuit({ companyResearched: true })} />

        {user && <BestAdvantageCard job={job} pursuit={pursuit} />}

        {showApply && user && (
          <WarmApplyFlow
            job={{ company, role, jobUrl: job.jobUrl || job.job_url || '' }}
            user={user}
            applyOnly
            onClose={() => setShowApply(false)}
          />
        )}
      </div>
    </div>
  );
}