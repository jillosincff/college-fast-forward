import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { analyzeJobFit } from '@/functions/analyzeJobFit';
import { syncJobPursuit } from '@/functions/syncJobPursuit';
import { readWorkspaceJob } from '@/lib/cliffWorkspace';
import JobFitCard from '@/components/workspace/JobFitCard';
import { computeVerdict } from '@/components/workspace/workspaceNextStep';
import WorkspacePrepActions from '@/components/workspace/WorkspacePrepActions';
import BestAdvantageCard from '@/components/workspace/BestAdvantageCard';
import CompanyPrepCard from '@/components/workspace/CompanyPrepCard';
import TrustPanel from '@/components/workspace/TrustPanel';
import WarmApplyFlow from '@/components/free-tier/WarmApplyFlow';
import { ArrowRight } from 'lucide-react';
import decodeEntities from '@/utils/decodeEntities';

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

  // ONE verdict drives the whole page. The hero shows it once; no other block repeats it.
  const verdict = computeVerdict(fit);
  const isSkip = verdict.key === 'skip';
  const goTailor = () => {
    const params = new URLSearchParams({ company, role, job_url: job.jobUrl || job.job_url || '', from: 'workspace' });
    window.location.hash = `#/ResumeTailoring?${params.toString()}`;
  };

  const nextLine = isSkip
    ? 'Probably not this one — I’d focus elsewhere.'
    : verdict.key === 'stretch'
      ? 'Stretch role — tailor your resume if you want, then apply.'
      : 'Strong fit — apply today.';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 80px' }}>
        <button onClick={goBack} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 12, minHeight: 44 }}>
          ← Back to dashboard
        </button>

        {/* SINGLE JOB HERO — title, company, one verdict badge, one primary action. */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
          <h1 style={{ fontFamily: dm, fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 900, color: '#111827', margin: '0 0 4px', lineHeight: 1.25, wordBreak: 'break-word' }}>{role}</h1>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#6b7280', margin: 0 }}>{company}</p>

          {/* The only verdict badge on the page. */}
          {fitLoading ? (
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#7c3aed', margin: '12px 0 0' }}>Analyzing fit…</p>
          ) : fit && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: dm, fontSize: 12, fontWeight: 800, marginTop: 12, padding: '5px 14px', borderRadius: 999,
              background: verdict.key === 'skip' ? '#fef2f2' : verdict.key === 'stretch' ? '#fffbeb' : '#ecfdf5',
              border: `1px solid ${verdict.key === 'skip' ? '#fecaca' : verdict.key === 'stretch' ? '#fde68a' : '#a7f3d0'}`,
              color: verdict.key === 'skip' ? '#b91c1c' : verdict.key === 'stretch' ? '#b45309' : '#047857' }}>
              {verdict.icon} {verdict.word}
            </span>
          )}

          <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
            {job.location && <span style={{ fontFamily: dm, fontSize: 12, color: '#6b7280' }}>📍 {decodeEntities(job.location)}</span>}
            {job.salary && <span style={{ fontFamily: dm, fontSize: 12, color: '#6b7280' }}>💰 {job.salary}</span>}
          </div>

          {/* One primary action. Skip → leave, otherwise Apply. Resume is the single secondary link. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
            {isSkip ? (
              <button onClick={goBack} style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: '#6b7280', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 }}>
                Back to dashboard
              </button>
            ) : (
              <button onClick={() => setShowApply(true)} style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}>
                Apply to job <ArrowRight size={15} />
              </button>
            )}
            {!isSkip && (
              <button onClick={goTailor} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6d28d9', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 44, textDecoration: 'underline' }}>
                Prepare resume for this role
              </button>
            )}
          </div>

          {/* One next-step sentence — replaces the whole Verdict / Next-Step card. */}
          {!fitLoading && (
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#4b5563', margin: '14px 0 0', lineHeight: 1.5 }}>{nextLine}</p>
          )}
        </div>

        {/* People at this company — networking is always part of the plan */}
        {user && <BestAdvantageCard job={job} pursuit={pursuit} />}

        <JobFitCard fit={fit} loading={fitLoading} error={fitError} />

        {/* Why this? + progress checklist (collapsed, no duplicate verdict label) */}
        {user && <TrustPanel job={job} fit={fit} fitLoading={fitLoading} />}

        {user && <WorkspacePrepActions job={job} user={user} />}

        {/* Company prep demoted under a "More" disclosure */}
        <MoreDisclosure>
          <CompanyPrepCard job={job} onPrepared={() => syncPursuit({ companyResearched: true })} />
        </MoreDisclosure>

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

function MoreDisclosure({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(v => !v)} style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 44 }}>
        {open ? '▾ Hide more' : '▸ More'}
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}