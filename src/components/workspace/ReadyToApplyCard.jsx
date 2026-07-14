import { useState } from 'react';
import WarmApplyFlow from '@/components/free-tier/WarmApplyFlow';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const isDone = s => ['ready_for_review', 'approved', 'complete'].includes(s || '');

// Action-first workspace header: can I apply, and what's ready?
export default function ReadyToApplyCard({ job, pursuit, user }) {
  const [showApply, setShowApply] = useState(false);
  const company = job?.company || '';
  const role = job?.role || job?.job_title || '';
  const jobUrl = job?.jobUrl || job?.job_url || '';

  const goTailor = () => {
    const params = new URLSearchParams({ company, role, job_url: jobUrl, from: 'workspace' });
    window.location.hash = `#/ResumeTailoring?${params.toString()}`;
  };

  const rows = [
    { label: 'Resume', ready: isDone(pursuit?.resume_status), action: 'Tailor now →', onClick: goTailor },
    { label: 'Cover letter', ready: isDone(pursuit?.cover_letter_status), hint: 'Drafted during Apply' },
    { label: 'Interview practice', ready: pursuit?.interview_status === 'completed', action: 'Practice →', onClick: () => { window.location.hash = '#/MockInterview'; } },
    { label: 'Connection', ready: isDone(pursuit?.connection_search_status), hint: 'Searching your network' },
  ];

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 16, padding: '20px 24px', marginBottom: 16, boxShadow: '0 4px 16px rgba(109,40,217,0.08)' }}>
      <h2 style={{ fontFamily: dm, fontSize: 16, fontWeight: 900, color: '#111827', margin: '0 0 14px' }}>Ready to apply?</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 12px', background: '#f8f9fc', borderRadius: 10 }}>
            <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#374151' }}>{r.label}</span>
            {r.ready ? (
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#059669' }}>✅ Ready</span>
            ) : r.action ? (
              <button onClick={r.onClick} style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', minHeight: 'auto', minWidth: 'auto' }}>{r.action}</button>
            ) : (
              <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>{r.hint}</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowApply(true)}
        style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontFamily: dm, fontSize: 15, fontWeight: 900, cursor: 'pointer', minHeight: 52, boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}
      >
        Apply →
      </button>

      {showApply && (
        <WarmApplyFlow job={{ company, role, jobUrl }} user={user} applyOnly onClose={() => setShowApply(false)} />
      )}
    </div>
  );
}