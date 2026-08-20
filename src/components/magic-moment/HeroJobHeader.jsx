import { Briefcase, ExternalLink, CheckCircle } from 'lucide-react';
import { FONT, TEXT, INDIGO_DIM, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';

const applyBtn = {
  fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
  border: 'none', borderRadius: 999, padding: '13px 22px', cursor: 'pointer', minHeight: 'auto',
  boxShadow: '0 6px 18px rgba(109,40,217,0.32)', display: 'inline-flex', alignItems: 'center', gap: 8,
  textDecoration: 'none', marginTop: 14,
};

export default function HeroJobHeader({ job, fitReason, trackedStatus }) {
  const applyUrl = job?.job_url || job?.apply_url || job?.url;
  return (
    <div>
      <div data-testid="mm-job" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {job?.logo_url ? (
          <img src={job.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flex: '0 0 auto' }} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: 10, background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Briefcase size={20} color="#fff" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.2 }}>{job?.job_title}</p>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, margin: '3px 0 4px' }}>
            {job?.name}{job?.location ? ` · ${job.location}` : ''}
          </p>
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{fitReason}</p>
        </div>
      </div>
      {applyUrl && (
        <a data-testid="mm-apply" href={applyUrl} target="_blank" rel="noopener noreferrer" style={applyBtn}>
          Apply to job <ExternalLink size={14} />
        </a>
      )}
      {trackedStatus && (
        <div data-testid="mm-tracked" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px' }}>
          <CheckCircle size={15} color="#16a34a" />
          <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: '#15803d' }}>{trackedStatus}</span>
        </div>
      )}
    </div>
  );
}