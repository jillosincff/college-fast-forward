import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function AlumniStep2About({ formData, onUpdate, onNext, onBack }) {
  return (
    <div>
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
        Tell us about yourself
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 28 }}>
        Where are you now professionally?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            Where do you work? <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={e => onUpdate({ company: e.target.value })}
            placeholder="Company name"
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            What's your job title? <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={e => onUpdate({ jobTitle: e.target.value })}
            placeholder="e.g., VP of Marketing, Software Engineer, Attorney"
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            LinkedIn Profile <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={formData.linkedinUrl}
            onChange={e => onUpdate({ linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourname"
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          <p style={{ fontFamily: dmSans, fontSize: 11, color: '#aaa', marginTop: 4 }}>
            Helps students learn more about your background
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
          <button onClick={onNext} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700, flex: 1, height: 52,
            borderRadius: 12, border: 'none', background: '#E85D20', color: '#fff',
            cursor: 'pointer',
          }}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}