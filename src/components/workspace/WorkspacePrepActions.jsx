import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import WarmApplyFlow from '@/components/free-tier/WarmApplyFlow';
import useAccessPlan from '@/hooks/useAccessPlan';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One workflow, many tools: CLIFF organizes the existing prep systems for this job.
export default function WorkspacePrepActions({ job, user }) {
  const [showApplyFlow, setShowApplyFlow] = useState(false);
  const { isPro, magicMomentAvailable, magicMomentCompleted, excludePrompts } = useAccessPlan(user);
  const [tracked, setTracked] = useState(false);
  const [tracking, setTracking] = useState(false);

  const company = job.company || '';
  const role = job.role || job.job_title || '';
  const jobUrl = job.jobUrl || job.job_url || '';

  const trackApplication = async () => {
    if (tracked || tracking) return;
    setTracking(true);
    try {
      await base44.entities.NetworkingPipeline.create({
        user_email: user.email,
        company,
        job_title: role,
        job_description: job.jobDescription || '',
        job_url: jobUrl,
        application_path: 'cold_apply',
        status: 'identified',
        location: job.location || '',
      });
      setTracked(true);
    } catch (e) { console.error('Failed to track:', e); }
    setTracking(false);
  };

  // Plan-based state for the execution action
  const prepDesc = isPro || excludePrompts
    ? 'CLIFF tailors your resume for this exact role and walks you through applying.'
    : magicMomentAvailable
      ? 'CLIFF builds this application end-to-end — your first one is free.'
      : 'On Free, CLIFF queues your tailored resume (~24h). Instant with CLIFF Pro.';
  const prepTag = !isPro && !excludePrompts
    ? (magicMomentAvailable ? '🎁 Free — first application' : 'Instant on Pro')
    : null;

  const actions = [
    { icon: '📄', title: 'Prepare my application', desc: prepDesc, tag: prepTag, cta: 'Start', go: () => setShowApplyFlow(true), primary: true },
    { icon: '🎤', title: 'Practice the interview', desc: 'Run a mock interview tuned to this kind of role before you talk to anyone.', cta: 'Practice', go: () => { window.location.hash = '#/MockInterview'; } },
    { icon: '📌', title: tracked ? 'Tracking this application' : 'Track this application', desc: tracked ? 'CLIFF is watching this one — follow-up reminders included.' : 'Add it to your pipeline so CLIFF reminds you when to follow up.', cta: tracked ? 'Tracked ✓' : tracking ? 'Adding…' : 'Track', go: trackApplication, done: tracked },
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px' }}>
      <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>
        CLIFF's Preparation Plan
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actions.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: a.primary ? '#f5f3ff' : '#f8f9fc', border: a.primary ? '1px solid #ddd6fe' : '1px solid #f1f5f9', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                {a.title}
                {a.tag && (
                  <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#6d28d9', background: '#ede9fe', borderRadius: 999, padding: '2px 8px', marginLeft: 8, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    {a.tag}
                  </span>
                )}
              </p>
              <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{a.desc}</p>
            </div>
            <button
              onClick={a.go}
              disabled={a.done}
              style={{
                fontFamily: dm, fontSize: 13, fontWeight: 800, borderRadius: 999, padding: '9px 20px', cursor: a.done ? 'default' : 'pointer', border: 'none', flexShrink: 0, minHeight: 44, transition: 'transform 0.1s',
                color: a.done ? '#15803d' : '#fff',
                background: a.done ? '#dcfce7' : a.primary ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#111827',
                boxShadow: a.primary && !a.done ? '0 4px 14px rgba(124,58,237,0.3)' : 'none',
              }}
              onMouseEnter={e => { if (!a.done) e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {a.cta}
            </button>
          </div>
        ))}
      </div>

      {jobUrl && (
        <a href={jobUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none', marginTop: 14 }}>
          🔗 View original posting / apply on company site ↗
        </a>
      )}

      {showApplyFlow && (
        <WarmApplyFlow job={{ company, role, jobUrl }} user={user} onClose={() => setShowApplyFlow(false)} />
      )}
    </div>
  );
}