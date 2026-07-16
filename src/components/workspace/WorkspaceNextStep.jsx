import { useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import WarmApplyFlow from '@/components/free-tier/WarmApplyFlow';
import { computeVerdict, computeNextStep, computePlan } from './workspaceNextStep';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const VERDICT_STYLES = {
  pursue: { bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
  consider: { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
  skip: { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
};

// The one answer this workspace exists to give: "What is my best next move?"
// CLIFF decides the step — the student never chooses the workflow.
export default function WorkspaceNextStep({ job, pursuit, fit, fitLoading, user }) {
  const [showApply, setShowApply] = useState(false);
  const company = job?.company || '';
  const role = job?.role || job?.job_title || '';
  const jobUrl = job?.jobUrl || job?.job_url || '';

  if (fitLoading) {
    return (
      <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#7c3aed', margin: 0 }}>
          Deciding your best next move…
        </p>
      </div>
    );
  }

  const verdict = computeVerdict(fit);
  const step = computeNextStep(pursuit, fit);
  const plan = computePlan(pursuit, step.key);
  const vs = VERDICT_STYLES[verdict.tone];

  // Location reasoning lives inside the Next Step reasoning — proof CLIFF listened.
  // (Skip verdicts already carry the location explanation as their detail.)
  const locFit = fit?.location_fit;
  const locNote = step.key !== 'skip' && locFit?.display_explanation && ['strong', 'tradeoff'].includes(locFit.location_match)
    ? locFit.display_explanation
    : '';

  const act = () => {
    if (step.cta === 'tailor') {
      const params = new URLSearchParams({ company, role, job_url: jobUrl, from: 'workspace' });
      window.location.hash = `#/ResumeTailoring?${params.toString()}`;
    } else if (step.cta === 'apply') setShowApply(true);
    else if (step.cta === 'interview') window.location.hash = '#/MockInterview';
    else if (step.cta === 'tracker') window.location.hash = '#/ApplicationTracker?highlight=' + encodeURIComponent(company);
    else window.location.hash = '#/FreeTierDashboard';
  };

  return (
    <div style={{ background: '#fff', border: '2px solid #ddd6fe', borderRadius: 16, padding: '20px 24px', marginBottom: 16, boxShadow: '0 6px 24px rgba(109,40,217,0.10)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          CLIFF's Verdict
        </span>
        <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 900, background: vs.bg, color: vs.text, border: `1px solid ${vs.border}`, borderRadius: 999, padding: '5px 14px' }}>
          {verdict.icon} {verdict.word}
        </span>
      </div>

      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 4px' }}>Next step</p>
      <h2 style={{ fontFamily: dm, fontSize: 19, fontWeight: 900, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 }}>{step.title}</h2>
      <p style={{ fontFamily: dm, fontSize: 13, color: '#4b5563', margin: '0 0 14px', lineHeight: 1.55 }}>{step.detail}{locNote ? ` ${locNote}` : ''}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} /> {step.time}
        </span>
        <button onClick={act}
          style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', background: step.cta === 'back' ? '#6b7280' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 24px', cursor: 'pointer', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6, boxShadow: step.cta === 'back' ? 'none' : '0 6px 20px rgba(124,58,237,0.3)' }}>
          {step.ctaLabel} <ArrowRight size={15} />
        </button>
      </div>

      {/* This job's plan — only the steps it actually needs */}
      {verdict.tone !== 'skip' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 16, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 2 }}>This job's plan:</span>
          {plan.map((s, i) => (
            <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: s.done ? '#059669' : s.key === step.key ? '#6d28d9' : '#9ca3af', background: s.key === step.key ? '#f5f3ff' : 'transparent', border: s.key === step.key ? '1px solid #ddd6fe' : '1px solid transparent', borderRadius: 999, padding: '3px 10px' }}>
                {s.done ? '✓ ' : ''}{s.label}
              </span>
              {i < plan.length - 1 && <span style={{ color: '#d1d5db', fontSize: 10 }}>→</span>}
            </span>
          ))}
        </div>
      )}

      {showApply && (
        <WarmApplyFlow
          job={{ company, role, jobUrl }}
          user={user}
          applyOnly
          resumeReady={['ready_for_review', 'approved', 'complete'].includes(pursuit?.resume_status || '')}
          onClose={() => setShowApply(false)}
        />
      )}
    </div>
  );
}