import { Linkedin } from 'lucide-react';
import { FONT, TEXT, TEXT2, INDIGO_DIM, GRAD_INDIGO, INDIGO_BORDER } from '@/components/onboarding-flow/onboardingShared';

export default function HeroPeople({ connections, companyName }) {
  if (!connections || connections.length === 0) {
    return (
      <div data-testid="mm-alumni-fallback" style={{ padding: '12px 14px', background: '#faf7ff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}` }}>
        <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>No alum found at {companyName} yet</p>
        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0, lineHeight: 1.5 }}>
          CLIFF wrote you a sendable cold message below — search LinkedIn for a hiring manager at {companyName} and paste it in.
        </p>
      </div>
    );
  }
  return (
    <div data-testid="mm-alumni-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {connections.slice(0, 2).map((c) => (
        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#faf7ff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: GRAD_INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 13, flex: '0 0 auto' }}>
            {(c.name || '?').split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>{c.name}</p>
            <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '1px 0 2px' }}>{c.role_title || ''}</p>
            <p style={{ fontFamily: FONT, fontSize: 11, color: INDIGO_DIM, fontWeight: 700, margin: 0 }}>
              {c.persona === 'alumni' ? 'Alum' : 'Parent connection'}{c.label ? ` · ${c.label}` : ''}
            </p>
          </div>
          {c.linkedin_url && (
            <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: INDIGO_DIM, flex: '0 0 auto' }}>
              <Linkedin size={18} />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}