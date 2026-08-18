import { useState } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const CARD = '#ffffff';
const GREEN = '#06b6d4';
const GREEN_LIGHT = 'rgba(6,182,212,0.08)';
const GREEN_BORDER = 'rgba(6,182,212,0.22)';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
const BLUE = INDIGO;

const FIELD_CHIPS = [
  'Marketing', 'Finance', 'Software/Engineering', 'Sales', 'Operations',
  'Consulting', 'Healthcare', 'Data/Analytics', 'Product/UX', 'HR/Recruiting',
  'Communications/PR', 'Education/Nonprofit',
];
const OTHER_CHIP = 'Other';
const OPEN_CHIP = "I'm open";

/**
 * One-screen, fast role picker — flat chips, no nested job titles.
 * Writes the picked fields into `selectedIndustries` and an optional
 * free-text role (shown only when "Other" is picked) into `targetRoles`,
 * preserving the data shape job matching + Magic Moment targeting already read.
 */
export default function IndustryScreen({ selectedIndustries, setSelectedIndustries, targetRoles, setTargetRoles, onBack, onNext }) {
  const [otherRole, setOtherRole] = useState(targetRoles?.[0] || '');
  const chips = selectedIndustries || [];

  const toggle = (chip) => {
    if (chip === OPEN_CHIP) {
      // "I'm open" is mutually exclusive — no specific title required.
      if (chips.includes(OPEN_CHIP)) {
        setSelectedIndustries([]);
      } else {
        setSelectedIndustries([OPEN_CHIP]);
        setOtherRole('');
        setTargetRoles([]);
      }
      return;
    }
    // Picking a real field drops "I'm open".
    const next = chips.filter(c => c !== OPEN_CHIP);
    if (next.includes(chip)) {
      const removed = next.filter(c => c !== chip);
      setSelectedIndustries(removed);
      if (chip === OTHER_CHIP) { setOtherRole(''); setTargetRoles([]); }
    } else {
      setSelectedIndustries([...next, chip]);
    }
  };

  const onOtherText = (v) => {
    setOtherRole(v);
    setTargetRoles(v.trim() ? [v.trim()] : []);
  };

  const hasOther = chips.includes(OTHER_CHIP);
  const hasOpen = chips.includes(OPEN_CHIP);
  const canContinue = chips.length > 0 || otherRole.trim().length > 0;

  const chipBtn = (active) => ({
    fontFamily: FONT, fontSize: 13, fontWeight: active ? 700 : 600,
    color: active ? '#fff' : INDIGO_DIM,
    background: active ? GRAD_INDIGO : '#fff',
    border: `1.5px solid ${active ? INDIGO : INDIGO_BORDER}`,
    borderRadius: 999, padding: '10px 16px', cursor: 'pointer', minHeight: 'auto',
    transition: 'all 0.15s',
  });

  const summary = [...chips, ...(otherRole.trim() && hasOther ? [otherRole.trim()] : [])];

  return (
    <div style={{ textAlign: 'center', maxWidth: 560, width: '100%' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 100, padding: '5px 14px', marginBottom: 18 }}>
        <span style={{ fontSize: 11 }}>🗺️</span>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mapping Your Pipeline</span>
      </div>

      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
        What kind of role are you after?
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, lineHeight: 1.6, margin: '0 auto 22px', maxWidth: 440 }}>
        Pick the fields you're drawn to. You can change this anytime — CLIFF uses it to find and rank your opportunities.
      </p>

      {/* Field chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
        {FIELD_CHIPS.map(c => (
          <button key={c} onClick={() => toggle(c)} style={chipBtn(chips.includes(c))}>{c}</button>
        ))}
      </div>

      {/* Other + I'm open */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 4 }}>
        <button onClick={() => toggle(OTHER_CHIP)} style={chipBtn(hasOther)}>{hasOther ? '✓ ' : ''}{OTHER_CHIP}</button>
        <button onClick={() => toggle(OPEN_CHIP)} style={chipBtn(hasOpen)}>{hasOpen ? '✓ ' : ''}{OPEN_CHIP}</button>
      </div>

      {/* Other → optional specific role (only shown when Other is picked) */}
      {hasOther && (
        <div style={{ marginTop: 14, animation: 'fadeUp 0.2s ease' }}>
          <input
            type="text" value={otherRole}
            onChange={e => onOtherText(e.target.value)}
            placeholder="Specific role (optional) — e.g. Product Marketing Intern"
            style={{ width: '100%', maxWidth: 420, boxSizing: 'border-box', fontFamily: FONT, fontSize: 14, color: TEXT, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '12px 14px', outline: 'none' }}
          />
        </div>
      )}

      {/* Mirroring panel */}
      {canContinue && (
        <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '16px 18px', marginTop: 20, textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#065F46', margin: 0, lineHeight: 1.55 }}>
            {hasOpen
              ? "Got it — you're open to exploring. CLIFF will cast a wide net and surface a mix of roles to find what fits."
              : <>Got it — targeting <strong>{summary.join(', ')}</strong>. Your agent is prioritizing alumni insiders, role-specific prep, and hidden opportunities in these spaces.</>}
          </p>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
        <button onClick={onBack} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, background: CARD, border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: SHADOW }}>← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff', background: canContinue ? `linear-gradient(to bottom, ${BLUE}, #0052CC)` : '#CBD5E1', border: 'none', borderRadius: 8, padding: '15px 36px', cursor: canContinue ? 'pointer' : 'not-allowed', minHeight: 'auto', boxShadow: canContinue ? '0 4px 14px rgba(0,102,255,0.25)' : 'none', transition: 'all 0.2s' }}
        >{canContinue ? <>Continue → <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>Pipeline Mapped ✓</span></> : 'Select at least 1 →'}</button>
      </div>
    </div>
  );
}