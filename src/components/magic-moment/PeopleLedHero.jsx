import { Users } from 'lucide-react';
import { FONT, TEXT, INDIGO_DIM, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';

// Dead-posting hero. When no live req exists, the screen is NOT a job page —
// it never presents the dead job title as an open role. It leads with people +
// the honest truth, and points to the live roles rail below for volume.
export default function PeopleLedHero({ companyName, jobTitle, insiderFirst, location }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <Users size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.2 }}>
            People from your school at {companyName || 'this company'}
          </p>
          {location && (
            <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, margin: '3px 0 4px' }}>{location}</p>
          )}
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            {jobTitle ? `No ${jobTitle} posting we can confirm right now. ` : 'No open posting we can confirm right now. '}
            Start with {insiderFirst || 'the insider'}, then check the live roles below.
          </p>
        </div>
      </div>
    </div>
  );
}