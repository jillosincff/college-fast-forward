import { Briefcase } from 'lucide-react';
import { FONT, TEXT, INDIGO_DIM, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';

export default function HeroJobHeader({ job, fitReason }) {
  return (
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
  );
}