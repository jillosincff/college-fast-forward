import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One job, one follow-through action: mark the application as sent so CLIFF
// tracks it and schedules follow-ups. Preparation is led by WorkspaceNextStep.
export default function WorkspacePrepActions({ job, user }) {
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
        status: 'applied',
        status_date: new Date().toISOString(),
        location: job.location || '',
      });
      setTracked(true);
      window.dispatchEvent(new Event('cff:pipeline-changed'));
    } catch (e) { console.error('Failed to track:', e); }
    setTracking(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px' }}>
      <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>
        After You Apply
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: tracked ? '#f0fdf4' : '#f8f9fc', border: tracked ? '1px solid #bbf7d0' : '1px solid #f1f5f9', borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>📌</span>
        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
            {tracked ? 'Application tracked' : 'I submitted my application'}
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            {tracked
              ? "CLIFF is watching this one — you'll get a nudge when it's time to follow up."
              : 'Tell CLIFF once you send it — it goes in your tracker and CLIFF reminds you when to follow up.'}
          </p>
        </div>
        <button
          onClick={trackApplication}
          disabled={tracked}
          style={{
            fontFamily: dm, fontSize: 13, fontWeight: 800, borderRadius: 999, padding: '9px 20px', cursor: tracked ? 'default' : 'pointer', border: 'none', flexShrink: 0, minHeight: 44, transition: 'transform 0.1s',
            color: tracked ? '#15803d' : '#fff',
            background: tracked ? '#dcfce7' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            boxShadow: tracked ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
          }}
          onMouseEnter={e => { if (!tracked) e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {tracked ? 'Tracked ✓' : tracking ? 'Adding…' : 'Mark as applied'}
        </button>
      </div>

      {jobUrl && (
        <a href={jobUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none', marginTop: 14 }}>
          🔗 View original posting / apply on company site ↗
        </a>
      )}
    </div>
  );
}