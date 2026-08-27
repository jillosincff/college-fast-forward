import { useState } from 'react';
import { Check, Briefcase, Users, Sparkles } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, R, SHADOW_MD } from '@/components/onboarding-flow/onboardingShared';
import { buildOutreachDraft } from '@/lib/outreachDraft';

// A FIXED, APPROVED sample — clearly labeled "Example". Never presented as a
// real alum found for this student. Personalized ONLY with onboarding fields
// (school, chip, city) the student already entered. Renders instantly — no
// findCliffPeople, no 40s hang.

const SAMPLE_BY_CHIP = {
  marketing: { company: 'Spotify', jobTitle: 'Marketing Coordinator', personName: 'Maya Patel', personRole: 'Senior Marketing Manager' },
  sales: { company: 'Salesforce', jobTitle: 'Sales Development Representative', personName: 'Chris Hayes', personRole: 'Sales Director' },
  finance: { company: 'Goldman Sachs', jobTitle: 'Analyst, Investment Banking', personName: 'Priya Shah', personRole: 'Vice President' },
  healthcare: { company: 'Pfizer', jobTitle: 'Clinical Operations Associate', personName: 'Alex Kim', personRole: 'Clinical Research Manager' },
  software: { company: 'Stripe', jobTitle: 'Software Engineer', personName: 'Jordan Lee', personRole: 'Senior Engineer' },
  communications: { company: 'Edelman', jobTitle: 'Communications Assistant', personName: 'Taylor Brooks', personRole: 'Account Supervisor' },
  consulting: { company: 'Deloitte', jobTitle: 'Strategy & Operations Analyst', personName: 'Sam Rivera', personRole: 'Senior Consultant' },
  data: { company: 'Bloomberg', jobTitle: 'Data Analyst', personName: 'Nina Gupta', personRole: 'Lead Data Scientist' },
  product: { company: 'Figma', jobTitle: 'Product Designer', personName: 'Riley Chen', personRole: 'Senior Product Designer' },
};

function pickSample(chipText) {
  const c = (chipText || '').toLowerCase();
  if (/product|\bux\b|\bui\b|design|user experience|user interface/.test(c)) return SAMPLE_BY_CHIP.product;
  if (/market|media|content|brand|social|advertis/.test(c)) return SAMPLE_BY_CHIP.marketing;
  if (/\bsale|business development|\bsdr|\bbdr|account executive/.test(c)) return SAMPLE_BY_CHIP.sales;
  if (/financ|bank|invest|asset|wealth/.test(c)) return SAMPLE_BY_CHIP.finance;
  if (/health|clinical|nurs|patient|medical|pharma|biotech|pre-?med/.test(c)) return SAMPLE_BY_CHIP.healthcare;
  if (/software|engineer|develop|frontend|backend|fullstack|\bswe/.test(c)) return SAMPLE_BY_CHIP.software;
  if (/communicat|public relations|\bpr\b|press/.test(c)) return SAMPLE_BY_CHIP.communications;
  if (/consult|strategy|advisory/.test(c)) return SAMPLE_BY_CHIP.consulting;
  if (/\bdata\b|analyst|analytics|quant/.test(c)) return SAMPLE_BY_CHIP.data;
  return SAMPLE_BY_CHIP.marketing;
}

export default function ExampleBestPathCard({ school, chipText, chipLabel, city }) {
  const [gotIt, setGotIt] = useState(false);
  const sample = pickSample(chipText);

  const draft = buildOutreachDraft({
    school: school || 'your school',
    jobTitle: chipText || chipLabel || 'your field',
    company: sample.company,
    insiderName: sample.personName,
    studentName: '',
    applied: false,
    live: false,
  });

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, boxShadow: SHADOW_MD, position: 'relative' }}>
      {/* Example label */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 999, padding: '4px 10px', marginBottom: 12 }}>
        <Sparkles size={11} color="#92400e" />
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Example</span>
      </div>

      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 4px', lineHeight: 1.4 }}>
        Here's how it works for a {school || 'your school'} student looking at {chipLabel || chipText || 'your field'}{city ? ` in ${city}` : ''}.
      </p>
      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 14px', lineHeight: 1.5 }}>
        CLIFF matches a real job with a person from your school who works there — and writes the first message for you.
      </p>

      {/* Job + person row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Briefcase size={12} color={INDIGO_DIM} />
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: TEXT3, textTransform: 'uppercase' }}>Job</span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{sample.jobTitle}</p>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '2px 0 0' }}>{sample.company}</p>
        </div>
        <div style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Users size={12} color={INDIGO_DIM} />
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: TEXT3, textTransform: 'uppercase' }}>Contact</span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{sample.personName}</p>
          <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '2px 0 0' }}>{sample.personRole} · {sample.company}</p>
        </div>
      </div>

      {/* Draft */}
      <div style={{ background: '#faf5ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontFamily: FONT, fontSize: 12, color: TEXT2, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 80, overflow: 'hidden' }}>
        {draft?.message}
      </div>

      <button onClick={() => setGotIt(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 800, color: '#fff', background: INDIGO, border: 'none', borderRadius: 999, padding: '10px 16px', cursor: 'pointer', minHeight: 'auto', width: '100%', justifyContent: 'center' }}>
        {gotIt ? <><Check size={14} /> Got it</> : 'Got it'}
      </button>
    </div>
  );
}