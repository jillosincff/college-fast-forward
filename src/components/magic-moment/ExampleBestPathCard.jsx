import { useState } from 'react';
import { Check, Briefcase, Sparkles, FileText, MapPin, ArrowRight } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, R, SHADOW_MD } from '@/components/onboarding-flow/onboardingShared';

// A FIXED, APPROVED sample — clearly labeled "Example". Never presented as a
// real alum or a live person found for this student. Personalized ONLY with
// onboarding fields (school, chip, city) the student already entered.
// Renders instantly — no findCliffPeople, no Jesse, no 40s hang.
//
// Free Magic Moment wow = "I've got this": a real-feeling JOB + a NEXT STEP
// (apply + tailor). People / alumni stay behind the pay layer
// (LockedPeopleCard / Ask a parent / Unlock Pro) — NEVER shown in this example.

const SAMPLE_BY_CHIP = {
  sales:          { company: 'Salesforce',      jobTitle: 'Sales Development Representative', location: 'New York, NY',    match: 92 },
  marketing:      { company: 'Spotify',         jobTitle: 'Marketing Coordinator',            location: 'Miami, FL',       match: 91 },
  finance:        { company: 'Goldman Sachs',   jobTitle: 'Financial Analyst',               location: 'New York, NY',    match: 94 },
  operations:     { company: 'Amazon',          jobTitle: 'Operations Analyst',              location: 'Austin, TX',      match: 90 },
  healthcare:     { company: 'Pfizer',          jobTitle: 'Clinical Operations Associate',   location: 'Boston, MA',      match: 89 },
  legal:          { company: 'Kirkland & Ellis', jobTitle: 'Legal Intern',                    location: 'Chicago, IL',    match: 88 },
  engineering:    { company: 'Tesla',           jobTitle: 'Mechanical Engineer',              location: 'Austin, TX',      match: 93 },
  technology:     { company: 'Stripe',          jobTitle: 'Software Engineer',               location: 'San Francisco, CA', match: 95 },
  communications: { company: 'Edelman',         jobTitle: 'Communications Assistant',        location: 'New York, NY',    match: 90 },
  education:      { company: 'Teach For America', jobTitle: 'Program Coordinator',           location: 'Remote',          match: 87 },
};

function pickSample(chipText) {
  const c = (chipText || '').toLowerCase();
  if (/\bsale|business development|\bsdr|\bbdr|account executive|account manager/.test(c)) return SAMPLE_BY_CHIP.sales;
  if (/market|advertis|brand|social media|content strategy/.test(c)) return SAMPLE_BY_CHIP.marketing;
  if (/financ|bank|invest|asset|wealth|\baccounting|\baudit|\btax\b|\bcpa/.test(c)) return SAMPLE_BY_CHIP.finance;
  if (/operation|\bops\b|supply chain|logistic|project manage/.test(c)) return SAMPLE_BY_CHIP.operations;
  if (/health|clinical|nurs|patient|medical|pharma|biotech|pre-?med/.test(c)) return SAMPLE_BY_CHIP.healthcare;
  if (/legal|\blaw\b|attorney|paralegal|compliance|counsel/.test(c)) return SAMPLE_BY_CHIP.legal;
  if (/engineer|mechanical|electrical|\bcivil\b|manufactur|aerospace|industrial/.test(c)) return SAMPLE_BY_CHIP.engineering;
  if (/software|develop|frontend|backend|fullstack|\bswe\b|\btech|cyber|data|analyst|analytic|quant|product|\bux\b|\bui\b|design|user experience|user interface/.test(c)) return SAMPLE_BY_CHIP.technology;
  if (/communicat|public relations|\bpr\b|press|media relations/.test(c)) return SAMPLE_BY_CHIP.communications;
  if (/educat|teach|nonprofit|non-profit|\bngo\b|social impact|community|public service/.test(c)) return SAMPLE_BY_CHIP.education;
  return SAMPLE_BY_CHIP.marketing;
}

export default function ExampleBestPathCard({ school, chipText, chipLabel, city }) {
  const [gotIt, setGotIt] = useState(false);
  const sample = pickSample(chipText);
  const location = city || sample.location;

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
        CLIFF finds the roles worth your time — and shows you the next step for each one.
      </p>

      {/* Job card — title, company, location, "Strong fit" */}
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px', border: '1px solid #e2e8f0', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Briefcase size={12} color={INDIGO_DIM} />
            <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: TEXT3, textTransform: 'uppercase' }}>Job</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 999, padding: '3px 9px', fontFamily: FONT, fontSize: 10, fontWeight: 800, color: '#15803d' }}>
            <Check size={10} /> Strong fit
          </span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.3 }}>{sample.jobTitle}</p>
        <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, margin: '3px 0 0' }}>{sample.company}</p>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '6px 0 0' }}>
          <MapPin size={12} color={TEXT3} /> {location}
        </p>
      </div>

      {/* Next step */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#faf5ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
        <ArrowRight size={14} color={INDIGO} style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
          Next step: Apply + tailor your resume for this role
        </span>
      </div>

      {/* Resume tailored chip */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '5px 11px', marginBottom: 14 }}>
        <FileText size={12} color={INDIGO} />
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INDIGO_DIM }}>Resume tailored · {sample.match}% match</span>
      </div>

      <button
        onClick={() => setGotIt(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 12, fontWeight: 800, color: '#fff', background: INDIGO, border: 'none', borderRadius: 999, padding: '10px 16px', cursor: 'pointer', minHeight: 'auto', width: '100%', justifyContent: 'center' }}
      >
        {gotIt ? <><Check size={14} /> Got it</> : 'Got it'}
      </button>
    </div>
  );
}