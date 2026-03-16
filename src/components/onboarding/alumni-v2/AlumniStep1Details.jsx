import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const currentYear = new Date().getFullYear();
const gradYears = [];
for (let y = currentYear; y >= 1960; y--) gradYears.push(y);

function getSeniorityLabel(year) {
  if (!year) return null;
  const diff = currentYear - parseInt(year);
  if (diff <= 2) return { label: 'Recent grad', sub: "We'll tailor your experience for early-career alumni.", color: '#E85D20' };
  return { label: 'Established alumni', sub: 'Full onboarding with helper/seeker options.', color: '#0821A5' };
}

export default function AlumniStep1Details({ formData, onUpdate, onNext }) {
  const canProceed = formData.gradYear && formData.major.trim();

  return (
    <div>
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
        Your Alumni Details
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 28 }}>
        Let's start with your time at the University of Florida.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            What year did you graduate? <span style={{ color: '#E85D20' }}>*</span>
          </label>
          <select
            value={formData.gradYear}
            onChange={e => onUpdate({ gradYear: e.target.value })}
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              background: '#fff', outline: 'none', color: formData.gradYear ? '#333' : '#aaa',
            }}
          >
            <option value="">Select year</option>
            {gradYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            What was your major? <span style={{ color: '#E85D20' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.major}
            onChange={e => onUpdate({ major: e.target.value })}
            placeholder="e.g., Computer Science, Finance, Political Science"
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            Minor <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={formData.minor}
            onChange={e => onUpdate({ minor: e.target.value })}
            placeholder="e.g., Business Administration, Psychology"
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            Any graduate degrees? <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={formData.graduateDegrees}
            onChange={e => onUpdate({ graduateDegrees: e.target.value })}
            placeholder="e.g., MBA Harvard 2015, JD Yale 2018"
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <p style={{ fontFamily: dmSans, fontSize: 11, color: '#aaa', marginTop: 4 }}>
            List any graduate degrees with school and year
          </p>
        </div>

        {/* Seniority indicator */}
        {formData.gradYear && (() => {
          const info = getSeniorityLabel(formData.gradYear);
          if (!info) return null;
          return (
            <div style={{
              background: `${info.color}08`, border: `1px solid ${info.color}25`,
              borderRadius: 10, padding: '12px 16px',
            }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: info.color, marginBottom: 2 }}>
                {info.label}
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', margin: 0 }}>
                {info.sub}
              </p>
            </div>
          );
        })()}

        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700, width: '100%', height: 52,
            borderRadius: 12, border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed',
            background: canProceed ? '#E85D20' : '#e5e7eb',
            color: canProceed ? '#fff' : '#aaa',
            transition: 'all 0.2s',
          }}
        >
          Continue →
        </button>

        {!canProceed && (
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#E85D20', textAlign: 'center' }}>
            Please enter your graduation year and major
          </p>
        )}
      </div>
    </div>
  );
}