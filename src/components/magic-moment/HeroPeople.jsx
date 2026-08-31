import { Linkedin, ExternalLink, Search } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO_DIM, GRAD_INDIGO, INDIGO_BORDER } from '@/components/onboarding-flow/onboardingShared';

// People card for the Magic Moment hero. Renders opt-in CFF members and
// public-web-found alumni with their school/year, why they match, and a source
// link. When nobody was found, shows an honest empty state plus a helper that
// opens LinkedIn's alumni search for School + Company (the student does the
// reaching out — we never scrape or email on their behalf).
export default function HeroPeople({ connections, companyName, school }) {
  if (!connections || connections.length === 0) {
    const linkedinAlumniUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${school || ''} ${companyName || ''}`.trim())}`;
    return (
      <div data-testid="mm-alumni-fallback" style={{ padding: '14px', background: '#faf7ff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}` }}>
        <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>People from your school at {companyName}</p>
        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 12px', lineHeight: 1.5 }}>
          Alumni from {school || 'your school'} at {companyName} unlock with CLIFF Pro — names, roles, and a ready-to-send outreach message. You can also search LinkedIn now.
        </p>
        <a href={linkedinAlumniUrl} target="_blank" rel="noopener noreferrer" data-testid="mm-linkedin-alumni-helper"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, borderRadius: 999, padding: '10px 16px', textDecoration: 'none', minHeight: 'auto' }}>
          <Search size={13} /> Search LinkedIn alumni
        </a>
      </div>
    );
  }
  return (
    <div data-testid="mm-alumni-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {connections.slice(0, 2).map((c) => {
        const isOptIn = c.source === 'opt_in';
        const schoolLine = [c.school, c.graduation_year].filter(Boolean).join(' · ');
        const sourceHref = c.linkedin_url || c.source_url;
        return (
          <div key={c.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px', background: '#faf7ff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: GRAD_INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 13, flex: '0 0 auto' }}>
              {(c.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>{c.name}</p>
              {c.role_title && <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '1px 0 2px' }}>{c.role_title}</p>}
              {schoolLine && <p style={{ fontFamily: FONT, fontSize: 11, color: INDIGO_DIM, fontWeight: 700, margin: 0 }}>{schoolLine}</p>}
              {c.why && <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: '3px 0 0', lineHeight: 1.4 }}>{c.why}</p>}
              <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: isOptIn ? INDIGO_DIM : TEXT3, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0' }}>
                {isOptIn ? `${c.label || 'Possible connection'} · CLIFF network` : 'Found publicly'}
              </p>
            </div>
            {sourceHref && (
              <a href={sourceHref} target="_blank" rel="noopener noreferrer" style={{ color: INDIGO_DIM, flex: '0 0 auto', marginTop: 2 }} title={isOptIn ? 'View profile' : 'View source'}>
                {c.linkedin_url ? <Linkedin size={18} /> : <ExternalLink size={16} />}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}