import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { analyzeJobFit } from '@/functions/analyzeJobFit';
import { syncJobPursuit } from '@/functions/syncJobPursuit';
import { readWorkspaceJob, readWorkspaceStep, saveWorkspaceStep } from '@/lib/cliffWorkspace';
import { computeVerdict } from '@/components/workspace/workspaceNextStep';
import WorkspacePrepActions from '@/components/workspace/WorkspacePrepActions';
import BestAdvantageCard from '@/components/workspace/BestAdvantageCard';
import CompanyPrepCard from '@/components/workspace/CompanyPrepCard';
import TrustPanel from '@/components/workspace/TrustPanel';
import { ArrowLeft, ArrowRight, ExternalLink, FileText } from 'lucide-react';
import decodeEntities from '@/utils/decodeEntities';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Job-specific workspace: the prep room for ONE job.
// Progressive guide — one solid purple next step at a time:
// Interested → Tailor → Apply → Mark as applied (Track) → warm connections (after apply).
// JD is visible above the fold (that's the Read). Later steps tucked until their turn.
export default function CliffJobWorkspace() {
  const [job] = useState(() => readWorkspaceJob());
  const jobKey = job ? `${(job.company || '')}|${(job.role || job.job_title || '')}` : '';
  const [user, setUser] = useState(null);
  const [fit, setFit] = useState(null);
  const [fitLoading, setFitLoading] = useState(true);
  const [fitError, setFitError] = useState(false);
  const [pursuit, setPursuit] = useState(null);
  const [step, setStep] = useState(() => readWorkspaceStep(jobKey));
  const [applied, setApplied] = useState(false);

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

  // Warm connections gate: only after the student has applied to THIS role.
  useEffect(() => {
    if (!user || !job) return;
    let cancelled = false;
    base44.entities.NetworkingPipeline.filter(
      { user_email: user.email, company: job.company, job_title: job.role || job.job_title, status: 'applied' },
      '-status_date', 1
    ).then(rows => { if (!cancelled && rows?.length) setApplied(true); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, job]);

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

  // Progressive guide (Interested → Tailor → Apply → Track). `step` persists in
  // sessionStorage per job (survives the Tailor navigation); `applied` is real
  // (NetworkingPipeline) so warm connections only unlock after a real apply.
  const advance = (patch) => { setStep(s => ({ ...s, ...patch })); saveWorkspaceStep(jobKey, patch); };
  const onInterested = () => advance({ interested: true });
  const onTailor = () => { advance({ tailored: true }); goTailor(); };
  const onApplyClick = () => advance({ applyClicked: true });
  const currentStep = isSkip ? 'skip'
    : applied ? 'warm'
    : step.applyClicked ? 'track'
    : step.tailored ? (jobUrl ? 'apply' : 'track')
    : step.interested ? 'tailor'
    : 'interested';

  const nextLine = isSkip
    ? 'Probably not this one — I’d focus elsewhere.'
    : verdict.key === 'stretch'
      ? 'Stretch role — worth a look. Take the next step below if you want.'
      : 'Strong fit — take the next step below.';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 16px 80px' }}>
        <button onClick={goBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#374151', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, padding: '8px 14px 8px 10px', cursor: 'pointer', marginBottom: 12, minHeight: 44, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <ArrowLeft size={16} color="#6d28d9" />
          Back to dashboard
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

          {/* JD / description visible above the fold (the "Read"). Prefer hiring_description,
              then job_description/description. Posting link is secondary/backup — never the
              only way to read the role. Don't invent JD text. */}
          {(() => {
            const jdText = job.hiring_description || job.jobDescription || job.job_description || job.description || '';
            if (!jdText && !jobUrl) return null;
            return (
              <div style={{ marginTop: 14, background: '#f8f9fc', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Job description</p>
                {jdText ? (
                  <div style={{ fontFamily: dm, fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto' }}>
                    {decodeEntities(jdText)}
                  </div>
                ) : (
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '0 0 10px', lineHeight: 1.5 }}>We don't have the full description text for this one — open the original posting to read it.</p>
                )}
                {jobUrl && (
                  <a href={jobUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none', marginTop: jdText ? 10 : 0 }}>
                    View original posting <ExternalLink size={12} />
                  </a>
                )}
              </div>
            );
          })()}

          {/* Progressive guide — one solid purple next step at a time. Later steps tucked. */}
          {!isSkip && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {currentStep === 'interested' && (
                  <button onClick={onInterested} style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}>
                    I'm interested in this role
                  </button>
                )}
                {currentStep === 'tailor' && (
                  <button onClick={onTailor} style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}>
                    <FileText size={15} /> Tailor resume <ArrowRight size={14} />
                  </button>
                )}
                {currentStep === 'apply' && jobUrl && (
                  <a href={jobUrl} target="_blank" rel="noopener noreferrer" onClick={onApplyClick} style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}>
                    Apply to job <ExternalLink size={15} />
                  </a>
                )}
                {currentStep === 'track' && (
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#7c3aed', margin: 0 }}>Next: mark this one as applied ↓</p>
                )}
                {currentStep === 'warm' && (
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#15803d', margin: 0 }}>✓ Applied — warm connections unlocked below.</p>
                )}
              </div>
              {currentStep === 'tailor' && (
                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#7c3aed', margin: '10px 0 0' }}>Next: tailor your resume for this role.</p>
              )}
              <StepProgress step={step} applied={applied} current={currentStep} />
            </div>
          )}
          {isSkip && (
            <div style={{ marginTop: 16 }}>
              <button onClick={goBack} style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: '#6b7280', border: 'none', borderRadius: 999, padding: '12px 26px', cursor: 'pointer', minHeight: 44, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Back to dashboard
              </button>
            </div>
          )}

          {!fitLoading && (
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#4b5563', margin: '14px 0 0', lineHeight: 1.5 }}>{nextLine}</p>
          )}
        </div>

        {/* 2) MARK AS APPLIED (Track step) — tucked until you've clicked Apply. */}
        {user && step.applyClicked && <WorkspacePrepActions job={job} user={user} applied={applied} onApplied={() => setApplied(true)} />}

        {/* 3) WARM CONNECTIONS — only after you apply. Quiet, never the hero. */}
        {user && (applied ? (
          <BestAdvantageCard job={job} pursuit={pursuit} />
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 24px', marginBottom: 16 }}>
            <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Warm connections</h3>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
              After you apply, CLIFF can surface warm connections at {company} here.
            </p>
          </div>
        ))}

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

// Quiet progress strip: Interested → Tailor → Apply → Track. Done steps check
// green, the current step is bold indigo, future steps stay gray. "Warm" only
// appears once Track (applied) is done.
function StepProgress({ step, applied, current }) {
  const steps = [
    { key: 'interested', label: 'Interested', done: !!step.interested },
    { key: 'tailor', label: 'Tailor', done: !!step.tailored },
    { key: 'apply', label: 'Apply', done: !!step.applyClicked },
    { key: 'track', label: 'Track', done: !!applied },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{
            fontFamily: dm, fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
            color: s.done ? '#15803d' : current === s.key ? '#7c3aed' : '#9ca3af',
            background: s.done ? '#f0fdf4' : current === s.key ? '#faf5ff' : 'transparent',
            border: `1px solid ${s.done ? '#bbf7d0' : current === s.key ? '#ddd6fe' : '#e5e7eb'}`,
          }}>
            {s.done ? '✓ ' : ''}{s.label}
          </span>
          {i < steps.length - 1 && <span style={{ color: '#cbd5e1', fontSize: 11, margin: '0 4px' }}>›</span>}
        </span>
      ))}
    </div>
  );
}