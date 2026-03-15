import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

const YEARS_EXPERIENCE = [
  { id: '0-5', label: '0–5 years' },
  { id: '5-10', label: '5–10 years' },
  { id: '10-20', label: '10–20 years' },
  { id: '20+', label: '20+ years' },
];

const calculateCompleteness = (formData) => {
  let score = 0;
  if (formData.jobTitle?.trim()) score += 25;
  if (formData.company?.trim()) score += 20;
  if (formData.linkedinUrl?.trim()) score += 25;
  if (formData.bio?.trim() && formData.bio.length > 20) score += 20;
  if (formData.yearsExperience) score += 10;
  return score;
};

const fieldStyle = {
  width: '100%', background: '#fff',
  border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
  padding: '12px 16px', fontFamily: dmSans, fontSize: 14, fontWeight: 300,
  color: '#1a1a1a', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function ParentOnboardingStep1({ formData, onUpdate, onNext, userName }) {
  const canProceed = formData.jobTitle?.trim() && formData.company?.trim();
  const completeness = calculateCompleteness(formData);

  const missingHints = [];
  if (!formData.linkedinUrl?.trim()) missingHints.push('LinkedIn URL');
  if (!formData.bio?.trim() || formData.bio?.length < 20) missingHints.push('short bio');

  return (
    <div style={{ animation: 'parentFadeUp 0.5s ease both' }}>
      <style>{`
        @keyframes parentFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .po-field:focus { border-color: rgba(232,93,32,0.4) !important; }
        .po-field::placeholder { color: rgba(0,0,0,0.25); }
      `}</style>

      {/* Header */}
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#1a1a1a', marginBottom: 6 }}>
        Help students find you.
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 6 }}>
        The more students know about you, the more likely they'll reach out.
      </p>

      {/* Profile strength */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888' }}>Profile strength</span>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: orange }}>{completeness}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completeness}%`, background: orange, borderRadius: 3, transition: 'width 0.3s ease' }} />
        </div>
        {missingHints.length > 0 && completeness < 80 && (
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginTop: 6 }}>
            Add {missingHints.join(' and ')} to boost your profile
          </p>
        )}
      </div>

      {/* Student name */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
          Which student are you here for? <span style={{ fontWeight: 300, color: '#bbb' }}>(optional)</span>
        </label>
        <input
          className="po-field"
          style={fieldStyle}
          value={formData.studentName || ''}
          onChange={e => onUpdate({ studentName: e.target.value })}
          placeholder="Your student's name"
        />
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginTop: 6 }}>You can link them by email in Step 3</p>
      </div>

      {/* LinkedIn */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
          LinkedIn Profile <span style={{ fontWeight: 400, color: orange }}>(recommended)</span>
        </label>
        <input
          className="po-field"
          style={fieldStyle}
          type="url"
          value={formData.linkedinUrl || ''}
          onChange={e => onUpdate({ linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
        />
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginTop: 6 }}>Students check LinkedIn before reaching out.</p>
      </div>

      {/* Job title */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
          What's your job title? <span style={{ color: orange }}>*</span>
        </label>
        <input
          className="po-field"
          style={fieldStyle}
          value={formData.jobTitle || ''}
          onChange={e => onUpdate({ jobTitle: e.target.value })}
          placeholder="e.g. Marketing Director, Software Engineer, VP of Sales"
        />
        {!formData.jobTitle?.trim() && (
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: orange, marginTop: 6 }}>Please enter your job title to continue</p>
        )}
      </div>

      {/* Company */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
          Company <span style={{ color: orange }}>*</span>
        </label>
        <input
          className="po-field"
          style={fieldStyle}
          value={formData.company || ''}
          onChange={e => onUpdate({ company: e.target.value })}
          placeholder="e.g. Google, Deloitte, Johnson & Johnson"
        />
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginTop: 6 }}>Helps students who want to work at your company find you.</p>
      </div>

      {/* Years of experience */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
          Years of experience <span style={{ fontWeight: 300, color: '#bbb' }}>(optional)</span>
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {YEARS_EXPERIENCE.map(opt => {
            const selected = formData.yearsExperience === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-chip="true"
                onClick={() => onUpdate({ yearsExperience: opt.id })}
                style={{
                  padding: '10px 18px', borderRadius: 100,
                  background: selected ? orange : '#fff',
                  color: selected ? '#fff' : '#555',
                  border: `0.5px solid ${selected ? orange : 'rgba(0,0,0,0.1)'}`,
                  fontFamily: dmSans, fontSize: 13, fontWeight: selected ? 500 : 300,
                  cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto', minWidth: 'auto',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
          Short bio <span style={{ fontWeight: 400, color: orange }}>(recommended)</span>
        </label>
        <textarea
          className="po-field"
          style={{ ...fieldStyle, resize: 'none', minHeight: 96, lineHeight: 1.6 }}
          value={formData.bio || ''}
          onChange={e => onUpdate({ bio: e.target.value.slice(0, 280) })}
          placeholder={`Tell students a bit about yourself and how you can help...\n\ne.g. "15 years in brand marketing at CPG companies. Happy to review resumes and share what it's really like in the industry."`}
          rows={4}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb' }}>Profiles with bios get 2x more messages.</p>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb' }}>{formData.bio?.length || 0} / 280</span>
        </div>
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        style={{
          width: '100%', padding: 14, borderRadius: 100, border: 'none',
          background: canProceed ? orange : 'rgba(0,0,0,0.06)',
          color: canProceed ? '#fff' : '#bbb',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          cursor: canProceed ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s', minHeight: 'auto',
        }}
        onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = orangeHover; }}
        onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = orange; }}
      >
        Continue →
      </button>
    </div>
  );
}