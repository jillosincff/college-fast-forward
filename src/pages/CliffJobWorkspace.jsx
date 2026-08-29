import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { analyzeJobFit } from '@/functions/analyzeJobFit';
import { syncJobPursuit } from '@/functions/syncJobPursuit';
import { readWorkspaceJob } from '@/lib/cliffWorkspace';
import { computeVerdict } from '@/components/workspace/workspaceNextStep';
import WorkspacePrepActions from '@/components/workspace/WorkspacePrepActions';
import BestAdvantageCard from '@/components/workspace/BestAdvantageCard';
import CompanyPrepCard from '@/components/workspace/CompanyPrepCard';
import TrustPanel from '@/components/workspace/TrustPanel';
import { ArrowRight, ExternalLink, FileText } from 'lucide-react';
import decodeEntities from '@/utils/decodeEntities';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Job-specific workspace: the prep room for ONE job.
// Order: (1) title + company + Apply (live URL), (2) prepare resume for this role,
// (3) people at this company in THIS function, (4) mark as applied.
// Job Fit stays short (one verdict line in the hero; detailed block under "More").
export default function CliffJobWorkspace() {
  const [job] = useState(() => readWorkspaceJob());
  const [user, setUser] = useState(null);
  const [fit, setFit] = useState(null);
  const [fitLoading, setFitLoading] = useState(true);
  const [fitError, setFitError] = useState(false);
  const [pursuit, setPursuit] = useState(null);

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
          <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 18px' }}>Pick a job from your feed and tap "Prepare in CLIFF" to open its workspace.</p>
          <button onClick={goBack} style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', border: 'none', borderRadius: 999, padding: '11px 26px', cursor: 'pointer', minHeight: 44 }}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const company = decodeEntities(job.company || '');
  const role = decodeEntities(job.role || job.job_title || '');
  const jobUrl = job.jobUrl || job.job_url || job.apply_url || job.url || '';

  // ONE verdict drives the whole page. The hero shows it once; no other block repeats it.
  const verdict = computeVerdict(fit);
  const isSkip = verdict.key === 'skip';
  const goTailor = () => {
    const params = new URLSearchParams({ company, role, job_url: jobUrl, from: 'workspace' });
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

        {/* 1) JOB HERO — title, company, one verdict line, Apply (live URL). */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
          <h1 style={{ fontFamily: dm, fontSize: 'clamp(18px, 4.5vw, 24px)', fontWeight: 900, color: '#111827', margin: '0 0 4px', lineHeight: 1.25, wordBreak: 'break-word' }}>{role}</h1>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#6b7280', margin: 0 }}>{company}</p>

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

          {/* Apply = the live external URL. Does NOT open a workspace or modal. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
            {isSkip ? (
              <button onClick={goBack} style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: '#6b7280', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 }}>
                Back to dashboard
              </button>
            ) : jobUrl ? (
              <a href={jobUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}>
                Apply to job <ExternalLink size={15} />
              </a>
            ) : null}
            {jobUrl && !isSkip && (
              <a href={jobUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
                View original posting ↗
              </a>
            )}
          </div>

          {!fitLoading && (
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#4b5563', margin: '14px 0 0', lineHeight: 1.5 }}>{nextLine}</p>
          )}
        </div>

        {/* 2) PREPARE RESUME FOR THIS ROLE — one entry. */}
        {!isSkip && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>📄</span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0 }}>Prepare resume for this role</p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '2px 0 0', lineHeight: 1.5 }}>CLIFF tailors your resume to this job's keywords so you clear ATS filters.</p>
            </div>
            <button onClick={goTailor} style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '11px 22px', cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FileText size={15} /> Tailor resume <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* 3) PEOPLE at this company — in THIS function (role-scoped). */}
        {user && <BestAdvantageCard job={job} pursuit={pursuit} />}

        {/* 4) MARK AS APPLIED — tracks the application + schedules follow-ups. */}
        {user && <WorkspacePrepActions job={job} user={user} />}

        {/* Job Fit (short) + company prep — available but non-prominent. */}
        <MoreDisclosure label="Job Fit & company research">
          {user && <TrustPanel job={job} fit={fit} fitLoading={fitLoading} error={fitError} />}
          <CompanyPrepCard job={job} onPrepared={() => syncPursuit({ companyResearched: true })} />
        </MoreDisclosure>
      </div>
    </div>
  );
}

function MoreDisclosure({ children, label = 'More' }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(v => !v)} style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 44 }}>
        {open ? `▾ Hide ${label}` : `▸ ${label}`}
      </button>
      {open && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
}