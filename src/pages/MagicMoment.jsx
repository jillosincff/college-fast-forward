import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { parsedResumeToText, saveParsedResume } from '@/lib/resumeText';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  VIOLET, GRAD_INDIGO, SHADOW, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import {
  Copy, Download, Linkedin, Save, Check, Loader2, Briefcase, Users, Mail, FileText, Lock, Sparkles,
} from 'lucide-react';
import { trackMagicMomentStarted, trackMagicMomentCompleted, trackOutreachCopied, markMagicMomentCompleted } from '@/lib/tracking';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import SoftWallModal from '@/components/conversion/SoftWallModal';

// The free Magic Moment — one complete plan cycle shown on a single screen:
// a high-fit job, a tailored resume, real alumni at the company, and a
// ready-to-send warm outreach draft. Everything after this is the hard paywall.

const PLAN_STEPS = [
  'Target the right job',
  'Tailor the resume',
  'Apply',
  'Surface alumni at the company',
  'Send the warm outreach',
  'Track and follow up',
];

const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    location: { type: 'string' },
    linkedin: { type: 'string' },
    summary: { type: 'string' },
    education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' }, gpa: { type: 'string' }, honors: { type: 'string' } } } },
    experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
    activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, dates: { type: 'string' } } } },
    skills: { type: 'array', items: { type: 'string' } },
  },
};

const pill = (extra) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
  border: 'none', borderRadius: 999, padding: '14px 22px', cursor: 'pointer', minHeight: 'auto',
  boxShadow: '0 6px 18px rgba(109,40,217,0.32)', display: 'inline-flex', alignItems: 'center', gap: 8,
  ...extra,
});
const ghostBtn = (extra) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, background: '#fff',
  border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '13px 20px', cursor: 'pointer', minHeight: 'auto',
  display: 'inline-flex', alignItems: 'center', gap: 8, ...extra,
});

export default function MagicMoment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  const [phase, setPhase] = useState('Finding a high-fit job…');
  const [job, setJob] = useState(null);
  const [tailored, setTailored] = useState(null);
  const [connections, setConnections] = useState([]);
  const [outreach, setOutreach] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [showSoftWall, setShowSoftWall] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || ranRef.current) return;
    ranRef.current = true;
    trackMagicMomentStarted({
      target_field: ((user.career_goals?.target_industries) || []).join(', '),
      target_role: (user.career_goals?.target_roles || [])[0] || '',
      school: user.school || '',
    });
    (async () => {
      try {
        const cg = user.career_goals || {};
        const role = (cg.target_roles || [])[0] || '';
        const industries = cg.target_industries || [];
        const location = cg.location_preference || '';

        // 1. Find a high-fit job — the live jobs provider is flaky (intermittent
        //    timeouts / tight filtering can return an empty pool on a single pull),
        //    so retry once before showing the "no jobs" empty state. A transient
        //    empty must not look like "no jobs exist" when the next pull succeeds.
        const fetchJobs = async () => {
          const r = await base44.functions.invoke('getLiveJobMatchesFn', {
            career_goals: { role, industries, locations: location ? [location] : [], seeking: cg.seeking || 'both' },
            force_refresh: true,
          });
          return r?.data?.companies || r?.companies || [];
        };
        let jobs = await fetchJobs();
        if (!jobs.length) {
          setPhase('Widening the search…');
          await new Promise(res => setTimeout(res, 1500));
          jobs = await fetchJobs();
        }
        if (!jobs.length) {
          setError("CLIFF couldn't find a job matching that target yet. Try widening your field or location in your profile.");
          setPhase(null);
          return;
        }
        // 2. Pick the job that actually has a real insider. Scan the top
        //    candidates in parallel and prefer the first with an alumni/parent
        //    hit — cold-only is the last resort, not the default first
        //    impression. The Magic Moment is only "holy shit" when the insider
        //    is on the screen.
        setPhase('Finding people on the inside…');
        const candidates = jobs.slice(0, 6);
        const connResults = await Promise.all(candidates.map(j =>
          base44.functions.invoke('findWorkspaceConnections', { companyName: j.name, targetRole: j.job_title || role, magic_moment: true })
            .then(r => ({ job: j, res: r }))
            .catch(() => ({ job: j, res: { connections: [] } }))
        ));
        if (connResults.some(r => r.res?.data?.upgrade_required || r.res?.upgrade_required)) {
          setShowSoftWall(true); setPhase(null); return;
        }
        let topJob = candidates[0];
        let conns = [];
        for (const r of connResults) {
          const c = r.res?.data?.connections || r.res?.connections || [];
          if (c.length > 0) { topJob = r.job; conns = c; break; }
        }
        setJob(topJob);
        setConnections(conns.slice(0, 3));
        const targetField = industries[0] || role || 'your target';

        // 2. Tailor the resume — uploaded if present, otherwise a starter built
        //    from the student's profile so the cycle always shows a resume
        //    artifact (never an empty slot).
        setPhase('Tailoring your resume for this role…');
        let tailoredResult = null;
        let isStarter = false;
        let starterText = '';
        try {
          let resumeText = '';
          const resumeUrl = user.resume_url || user.resume_file_url;
          if (resumeUrl) {
            let resumes = [];
            try { resumes = await base44.entities.Resume.filter({ student_email: user.email }, '-created_date', 5); } catch (e) {}
            resumeText = resumes?.[0]?.parsed_text || '';
            if (!resumeText) {
              const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url: resumeUrl, json_schema: RESUME_SCHEMA });
              const parsed = extracted?.output || extracted;
              resumeText = parsedResumeToText(parsed);
              if (resumeText.length > 100) await saveParsedResume(base44, user.email, parsed, resumeUrl, '').catch(() => {});
            }
          }
          if (!resumeText || resumeText.length <= 100) {
            // No usable uploaded resume — generate a starter from profile + target role
            starterText = buildStarterResumeText(user, topJob);
            resumeText = starterText;
            isStarter = true;
          }
          if (resumeText.length > 100) {
            try {
              const tailRes = await base44.functions.invoke('tailorResume', {
                resumeText, jobTitle: topJob.job_title, companyName: topJob.name,
                jobDescription: topJob.hiring_description || '',
              });
              tailoredResult = tailRes?.data || tailRes;
            } catch (e) { /* tailor best-effort — fall back to starter text below */ }
          }
        } catch (e) { /* resume tailoring is best-effort — don't block the plan */ }
        if (tailoredResult) {
          setTailored({ ...tailoredResult, starter: isStarter });
        } else if (isStarter && starterText) {
          // Tailoring failed — still show the starter resume so the block is never empty
          setTailored({ starter: true, starter_untailored: true, tailored_content: starterText });
        }

        // Alumni were already surfaced above when picking the job with a real
        // insider — nothing to do here.

        // 4. Write the outreach — warm if an alum was found, cold fallback otherwise
        const top = conns[0];
        const hasAlumni = !!top;
        setPhase(hasAlumni ? 'Writing your warm outreach…' : 'Writing your outreach…');
        try {
          const outRes = await base44.functions.invoke('generateOutreachDraft', {
            studentName: user.full_name || '',
            major: cg.target_industries?.[0] || '',
            targetRole: topJob.job_title || role,
            graduationYear: user.graduation_year || '',
            school: user.school || '',
            alumniName: hasAlumni ? top.name : '',
            alumniTitle: hasAlumni ? (top.role_title || '') : (topJob.job_title || role),
            alumniCompany: topJob.name,
            cold: !hasAlumni,
            magic_moment: true,
          });
          if (outRes?.data?.upgrade_required || outRes?.upgrade_required) { setShowSoftWall(true); setPhase(null); return; }
          const outData = outRes?.data || outRes;
          setOutreach({ ...outData, message: normalizeOutreachMessage(outData?.message), cold: !hasAlumni });
        } catch (e) {
          // Graceful fallback — never leave the user with an empty outreach block.
          const roleLabel = topJob.job_title || role || 'this role';
          const schoolLabel = user.school ? ` at ${user.school}` : '';
          const first = hasAlumni ? (top.name.split(' ')[0] || 'there') : '';
          const msg = hasAlumni
            ? `Hey ${first} — I'm a student${schoolLabel} and just applied to the ${roleLabel} role at ${topJob.name}. I saw you're on the team and would love any quick advice on standing out. Thanks either way.`
            : `Hi — I'm a student${schoolLabel} interested in the ${roleLabel} role at ${topJob.name}. I'd value any quick advice on how to stand out. Thanks either way.`;
          setOutreach({ message: msg, cold: !hasAlumni });
        }

        base44.functions.invoke('completeMagicMoment', {}).catch(() => {});
        trackMagicMomentCompleted({
          job_title: topJob?.job_title || '',
          company: topJob?.name || '',
          alumni_count: conns?.length || 0,
          has_tailored_resume: !!tailored,
          outreach_cold: !conns?.[0],
        });
        markMagicMomentCompleted();
        setPhase(null);
      } catch (e) {
        setError('CLIFF hit a snag building your plan. Please try again in a moment.');
        setPhase(null);
      }
    })();
  }, [user]);

  const fitReason = job
    ? `Hiring now for ${job.job_title}${job.location ? ` in ${job.location}` : ''} — matches your ${((user?.career_goals?.target_industries) || [])[0] || (user?.career_goals?.target_roles || [])[0] || 'target'}.`
    : '';

  const handlePrimaryAction = async () => {
    const text = outreach?.message || '';
    if (!text) return;
    // 1. Copy the full draft to the clipboard (with a fallback for insecure contexts)
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(text);
      copiedOk = true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        copiedOk = true;
      } catch (e2) {}
    }
    // 2. Track reliably
    trackOutreachCopied({ company: job?.name || '', alumni: connections[0]?.name || '', cold: !!outreach?.cold });
    // 3. Open LinkedIn — alum's profile if we have it, else a people search for hiring managers at the company
    const top = connections[0];
    let url;
    if (top?.linkedin_url) {
      url = top.linkedin_url;
    } else if (outreach?.cold) {
      url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${job?.name || ''} ${job?.job_title || ''} recruiter OR hiring`)}`;
    } else {
      url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((top?.name || '') + ' ' + (job?.name || ''))}`;
    }
    try { window.open(url, '_blank', 'noopener'); } catch (e) {}
    // 4. Confirmation — tells them the draft is on the clipboard even if the popup was blocked
    if (copiedOk) { setCopied(true); setTimeout(() => setCopied(false), 2600); }
  };

  const downloadResume = () => {
    if (!tailored?.tailoredResume?.tailored_content && !tailored?.tailored_content) return;
    const content = tailored.tailoredResume?.tailored_content || tailored.tailored_content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `CLIFF-tailored-${(job?.name || 'resume').replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading state ──────────────────────────────────────────────
  if (phase) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 30px rgba(109,40,217,0.35)' }}>
            <Sparkles size={30} color="#fff" />
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>CLIFF is running your plan…</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 14, color: INDIGO_DIM }}>
            <Loader2 size={15} className="animate-spin" /> {phase}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error && !job) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, marginBottom: 20 }}>{error}</p>
          <button onClick={() => navigate('/FreeTierDashboard')} style={pill({})}>Go to dashboard →</button>
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)', paddingBottom: 48 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div data-testid="mm-free-cycle-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '6px 14px', marginBottom: 14 }}>
            <Sparkles size={13} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your free cycle</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>Your first plan is ready.</h1>
          <p style={{ fontFamily: FONT, fontSize: 16, color: TEXT2, margin: 0 }}>CLIFF just ran the full cycle for one role. Here's everything you need.</p>
        </div>

        {/* The plan (numbered, always visible) */}
        <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '20px 22px', marginBottom: 16, border: `1px solid #f1e9ff` }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Your plan for this role</p>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
            {PLAN_STEPS.map((s, i) => (
              <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT, fontSize: 13, color: TEXT }}>
                <span style={{ flex: '0 0 auto', width: 20, height: 20, borderRadius: 999, background: GRAD_INDIGO, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                <span style={{ fontWeight: 600 }}>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* The job */}
        <Block icon={<Briefcase size={16} color={INDIGO} />} label="The job" testId="mm-job">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {job?.logo_url && <img src={job.logo_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flex: '0 0 auto' }} onError={(e) => { e.target.style.display = 'none'; }} />}
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: TEXT, margin: 0 }}>{job?.job_title}</p>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: INDIGO_DIM, margin: '2px 0 6px' }}>{job?.name} {job?.location ? `· ${job.location}` : ''}</p>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.55 }}>{fitReason}</p>
            </div>
          </div>
        </Block>

        {/* Tailored resume */}
        <Block icon={<FileText size={16} color={INDIGO} />} label="Tailored resume" testId="mm-resume">
          {tailored ? (
            <div>
              {!tailored.starter_untailored && tailored.originalScore != null && tailored.tailoredScore != null && (
                <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 6px' }}>Match score improved from <strong style={{ color: TEXT }}>{tailored.originalScore}%</strong> to <strong style={{ color: INDIGO }}>{tailored.tailoredScore}%</strong> for this role.</p>
              )}
              <button onClick={downloadResume} style={ghostBtn({ marginBottom: 8 })}><Download size={14} /> Download {tailored.starter ? 'starter resume' : 'tailored resume'}</button>
              {tailored.starter && (
                <p style={{ fontFamily: FONT, fontSize: 12, color: INDIGO_DIM, margin: '8px 0 0', lineHeight: 1.5 }}>Starter version built from your profile — <button onClick={() => navigate('/FreeTierDashboard')} style={{ background: 'none', border: 'none', padding: 0, color: INDIGO, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>upload your resume</button> for a stronger match.</p>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 8px' }}>Add your resume and CLIFF will tailor a version for this exact role.</p>
              <button onClick={() => navigate('/FreeTierDashboard')} style={ghostBtn({})}>Upload resume</button>
            </div>
          )}
        </Block>

        {/* Alumni cards */}
        <Block icon={<Users size={16} color={INDIGO} />} label="Alumni at this company" testId="mm-alumni">
          {connections.length > 0 ? (
            <div data-testid="mm-alumni-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {connections.map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#faf7ff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 999, background: GRAD_INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 14, flex: '0 0 auto' }}>
                    {(c.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>{c.name}</p>
                    <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '1px 0 2px' }}>{c.role_title || ''}</p>
                    <p style={{ fontFamily: FONT, fontSize: 11, color: INDIGO_DIM, fontWeight: 600, margin: 0 }}>{c.persona === 'alumni' ? 'Alum' : 'Parent'} · {c.label}</p>
                  </div>
                  {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: INDIGO }}><Linkedin size={18} /></a>}
                </div>
              ))}
            </div>
          ) : (
            <div data-testid="mm-alumni-fallback">
              <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>No strong alumni match found at {job?.name} yet.</p>
              <p style={{ fontFamily: FONT, fontSize: 12.5, color: TEXT2, margin: '0 0 10px', lineHeight: 1.55 }}>CLIFF still wrote you a sendable cold outreach below — search LinkedIn for a hiring manager or recruiter at {job?.name} and paste it in. Pro surfaces same-industry alumni automatically.</p>
              <button onClick={() => setShowPro(true)} style={ghostBtn({})}>See how Pro finds alumni →</button>
            </div>
          )}
        </Block>

        {/* Outreach draft */}
        <Block icon={<Mail size={16} color={INDIGO} />} label="Your warm outreach">
          {outreach?.message ? (
            <div>
              {outreach.cold && (
                <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Cold outreach · no alumni found</p>
              )}
              {outreach.subject && <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: TEXT3, margin: '0 0 8px' }}>Subject: {outreach.subject}</p>}
              <div data-testid="mm-outreach-draft" style={{ background: '#faf7ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '14px 16px', fontFamily: FONT, fontSize: 13.5, color: TEXT, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {outreach.message}
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>CLIFF will draft your outreach once a connection is found.</p>
          )}
        </Block>

        {/* Primary + secondary CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          <button data-testid="mm-copy-send" onClick={handlePrimaryAction} style={pill({ width: '100%', justifyContent: 'center', padding: '16px' })}>
            {copied ? <><Check size={16} /> <span data-testid="mm-copy-confirmation">Message copied — paste it into LinkedIn</span></> : <><Copy size={16} /> Copy message &amp; open LinkedIn</>}
          </button>
          <button onClick={() => navigate('/FreeTierDashboard')} style={ghostBtn({ width: '100%', justifyContent: 'center', padding: '15px' })}>
            <Save size={15} /> Save for later
          </button>
        </div>

        {/* Hard-wall teaser — hidden once the user is already Pro */}
        {user?.subscription_status !== 'active' && (
        <div style={{ marginTop: 20, background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', borderRadius: R, padding: '22px 20px', textAlign: 'center', boxShadow: '0 12px 30px rgba(76,29,149,0.28)' }}>
          <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>This was your free cycle.</p>
          <p style={{ fontFamily: FONT, fontSize: 13.5, color: 'rgba(255,255,255,0.8)', margin: '0 0 16px', lineHeight: 1.5 }}>Unlock unlimited so CLIFF can run this plan for every job you actually want.</p>
          <button data-testid="cta-upgrade" onClick={() => setShowPro(true)} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Lock size={15} /> Unlock CLIFF Pro →
          </button>
        </div>
        )}
      </div>
      {showPro && <ProUpgradeModal user={user} onClose={() => setShowPro(false)} source="magic_moment" />}
      {showSoftWall && <SoftWallModal user={user} onClose={() => setShowSoftWall(false)} source="soft_wall" />}
    </div>
  );
}

// Normalizes the outreach message so a raw/fenced JSON response from the LLM
// never reaches the screen. Extracts the body field and unescapes line breaks.
function normalizeOutreachMessage(raw) {
  if (!raw) return '';
  let text = String(raw);
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const extract = (str) => {
    try {
      const obj = JSON.parse(str);
      return obj.body || obj.message || '';
    } catch (e) { return ''; }
  };
  if (text.trim().startsWith('{')) {
    const body = extract(text) || extract(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    if (body) return body.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return text.replace(/\\n/g, '\n').replace(/\\"/g, '"');
}

// Builds a starter resume text from the student's profile + target role when
// they haven't uploaded one — so the Magic Moment always shows a resume
// artifact. It's honestly labeled in the UI as a starter version.
function buildStarterResumeText(user, job) {
  const cg = user?.career_goals || {};
  const role = job?.job_title || (cg.target_roles || [])[0] || 'your target role';
  const industry = (cg.target_industries || [])[0] || '';
  const school = user?.school_name || user?.school || '';
  const grad = user?.graduation_year || '';
  const name = user?.full_name || '';
  const email = user?.email || '';
  const linkedin = user?.linkedin_url || '';
  const lines = [];
  if (name) lines.push(name);
  const contact = [email, linkedin].filter(Boolean).join(' | ');
  if (contact) lines.push(contact);
  lines.push('');
  lines.push('SUMMARY');
  lines.push(`${school ? school + ' student' : 'Student'}${industry ? ` interested in ${industry}` : ''}${grad ? `, graduating ${grad}` : ''}. Targeting ${role} roles.`);
  lines.push('');
  if (school) {
    lines.push('EDUCATION');
    lines.push(`${school}${grad ? ` — Expected ${grad}` : ''}`);
    lines.push('');
  }
  lines.push('SKILLS');
  lines.push([role, industry, 'communication', 'teamwork', 'problem-solving'].filter(Boolean).join(', '));
  lines.push('');
  lines.push('EXPERIENCE');
  lines.push('Relevant coursework, projects, and campus involvement — add your experience here.');
  return lines.join('\n');
}

function Block({ icon, label, children, testId }) {
  return (
    <div data-testid={testId} style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '18px 20px', marginBottom: 14, border: '1px solid #f1e9ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}