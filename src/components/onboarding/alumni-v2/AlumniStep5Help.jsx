import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const HELP_AREAS = [
  { id: 'career_guidance', emoji: '💼', label: 'Career guidance', desc: 'Career paths, transitions, mentorship, salary advice' },
  { id: 'jobs_referrals', emoji: '🔍', label: 'Jobs & referrals', desc: 'Job search help, referrals, sharing opportunities' },
  { id: 'resume_interviews', emoji: '📄', label: 'Resume & interviews', desc: 'Resume review, LinkedIn optimization, mock interviews' },
  { id: 'industry_insights', emoji: '📊', label: 'Industry insights', desc: 'Day-to-day work, breaking into a field, career paths' },
  { id: 'introductions', emoji: '🤝', label: 'Introductions', desc: 'Connecting with specific people or companies' },
];

export default function AlumniStep5Help({ formData, onUpdate, onNext, onBack }) {
  const helpTypes = formData.helpTypes || [];
  const canProceed = helpTypes.length > 0;

  const toggle = (id) => {
    onUpdate({ helpTypes: helpTypes.includes(id) ? helpTypes.filter(h => h !== id) : [...helpTypes, id] });
  };

  return (
    <div>
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
        How would you like to help?
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 24 }}>
        Select at least one
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {HELP_AREAS.map(area => {
          const selected = helpTypes.includes(area.id);
          return (
            <button
              key={area.id}
              onClick={() => toggle(area.id)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '16px 18px', borderRadius: 12, textAlign: 'left',
                border: selected ? '2px solid #E85D20' : '2px solid #e5e7eb',
                background: selected ? 'rgba(232,93,32,0.04)' : '#fff',
                cursor: 'pointer', transition: 'all 0.15s', minHeight: 'auto', width: '100%',
              }}
            >
              <span style={{ fontSize: 22 }}>{area.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: dmSans, fontSize: 14, fontWeight: 600,
                  color: selected ? '#E85D20' : '#333', marginBottom: 2,
                }}>
                  {area.label}
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', margin: 0 }}>
                  {area.desc}
                </p>
              </div>
              {selected && <span style={{ color: '#E85D20', fontWeight: 700 }}>✓</span>}
            </button>
          );
        })}
      </div>

      {!canProceed && (
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#E85D20', marginBottom: 12 }}>
          Please select at least one way you'd like to help
        </p>
      )}

      {/* Years of experience */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
          Years of experience <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
        </label>
        <select
          value={formData.yearsExperience}
          onChange={e => onUpdate({ yearsExperience: e.target.value })}
          style={{
            fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
            border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
            background: '#fff', outline: 'none',
          }}
        >
          <option value="">Select range</option>
          <option value="0-2">0–2 years</option>
          <option value="3-5">3–5 years</option>
          <option value="6-10">6–10 years</option>
          <option value="11-15">11–15 years</option>
          <option value="16-20">16–20 years</option>
          <option value="20+">20+ years</option>
        </select>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
          Anything else you'd like others to know? <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
        </label>
        <textarea
          value={formData.bio}
          onChange={e => onUpdate({ bio: e.target.value.slice(0, 500) })}
          placeholder="e.g., specific industries you know well, companies you've worked at, topics you're passionate about..."
          style={{
            fontFamily: dmSans, fontSize: 14, width: '100%', height: 80,
            border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 14px',
            outline: 'none', resize: 'none', boxSizing: 'border-box',
          }}
          maxLength={500}
        />
        <p style={{ fontFamily: dmSans, fontSize: 11, color: '#aaa', textAlign: 'right', marginTop: 2 }}>
          {(formData.bio || '').length}/500
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, padding: '0 24px', height: 52,
          borderRadius: 12, border: '2px solid #e5e7eb', background: '#fff', color: '#555',
          cursor: 'pointer', minHeight: 'auto',
        }}>
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700, flex: 1, height: 52,
            borderRadius: 12, border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed',
            background: canProceed ? '#E85D20' : '#e5e7eb',
            color: canProceed ? '#fff' : '#aaa',
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}