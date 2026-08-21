import { useState } from 'react';
import { Linkedin, Copy, Check, ExternalLink } from 'lucide-react';
import { FONT, CARD, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER, SHADOW, R } from '@/components/onboarding-flow/onboardingShared';

// Support + social proof only. Sits under the hero, above the locked rail.
// Shows people from the student's school who already hold a role like the
// hero's chip. Never promoted as an open role — just "this path is real."
// Data is reused from the warm scan (no extra API calls, never fabricated).

function shortNote(person, school, chipLabel) {
  const first = (person.name || '').trim().split(/\s+/)[0] || '';
  const role = person.role_title || '';
  const company = person.company || '';
  const schoolBit = school ? ` at ${school}` : '';
  const chipBit = chipLabel || 'this field';
  const lines = [];
  lines.push(first ? `Hi ${first} —` : 'Hi —');
  lines.push(`I'm a student${schoolBit} exploring ${chipBit} roles.`);
  if (role && company) lines.push(`I saw you're a ${role} at ${company} and would love to connect.`);
  else if (company) lines.push(`I saw you're at ${company} and would love to connect.`);
  lines.push('Would you be open to a quick chat about your path?');
  return lines.join(' ');
}

export default function RoleAlumniStrip({ people, school, chipLabel }) {
  const [copiedIdx, setCopiedIdx] = useState(null);
  if (!people || people.length < 2) return null;

  const copy = async (p, i) => {
    const text = shortNote(p, school, chipLabel);
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      } catch (e2) {}
    }
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 2200);
  };

  return (
    <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '18px 18px', marginBottom: 16, border: '1px solid #f1e9ff' }}>
      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0 }}>
        People from your school in roles like this
      </p>
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '4px 0 0' }}>
        {school ? `${school} alumni` : 'Alumni'} in {chipLabel || 'your field'} — proof this path is real.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {people.map((p, i) => {
          const srcUrl = p.linkedin_url || p.source_url;
          const isLinkedIn = !!p.linkedin_url || /linkedin\.com/i.test(p.source_url || '');
          const initial = (p.name || '?').trim().charAt(0).toUpperCase();
          const copied = copiedIdx === i;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#faf8ff', borderRadius: 10, border: '1px solid #f1e9ff' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name || 'Alumni'}</p>
                <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.role_title ? p.role_title : ''}{p.company ? ` · ${p.company}` : ''}
                </p>
              </div>
              {srcUrl && (
                <a
                  href={srcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={isLinkedIn ? 'LinkedIn' : 'Source'}
                  style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: '1px solid #ece4ff', background: '#fff', color: INDIGO_DIM, minHeight: 'auto', minWidth: 'auto' }}
                >
                  {isLinkedIn ? <Linkedin size={15} /> : <ExternalLink size={15} />}
                </a>
              )}
              <button
                onClick={() => copy(p, i)}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: copied ? '#fff' : INDIGO_DIM, background: copied ? INDIGO : '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', minHeight: 'auto' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Note'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}