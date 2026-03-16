import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const INDUSTRIES = [
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'consulting', label: 'Consulting', emoji: '📊' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { id: 'marketing', label: 'Marketing', emoji: '📣' },
  { id: 'engineering', label: 'Engineering', emoji: '⚙️' },
  { id: 'law', label: 'Law', emoji: '⚖️' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'real_estate', label: 'Real Estate', emoji: '🏠' },
  { id: 'nonprofit', label: 'Nonprofit', emoji: '❤️' },
  { id: 'government', label: 'Government', emoji: '🏛️' },
  { id: 'media', label: 'Media/Entertainment', emoji: '🎬' },
  { id: 'startups', label: 'Startups', emoji: '🚀' },
  { id: 'other', label: 'Other', emoji: '✨' },
];

export default function AlumniStep2Seeker({ formData, onUpdate, onNext, onBack }) {
  const toggle = (id) => {
    const current = formData.industries || [];
    onUpdate({ industries: current.includes(id) ? current.filter(i => i !== id) : [...current, id] });
  };

  return (
    <div>
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
        Tell us what you're looking for
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 28 }}>
        This helps us match you with the right people.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            What kind of work are you looking for? <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </label>
          <input
            type="text"
            value={formData.targetRole || ''}
            onChange={e => onUpdate({ targetRole: e.target.value })}
            placeholder="e.g., Software Engineering, Marketing, Finance"
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
              border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#333', display: 'block', marginBottom: 6 }}>
            Target industry <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </label>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#aaa', marginBottom: 10, marginTop: 0 }}>
            Select any industries you're interested in
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {INDUSTRIES.map(ind => {
              const selected = (formData.industries || []).includes(ind.id);
              return (
                <button
                  key={ind.id}
                  onClick={() => toggle(ind.id)}
                  style={{
                    fontFamily: dmSans, fontSize: 13, fontWeight: 500, display: 'flex',
                    alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 10,
                    border: selected ? '2px solid #E85D20' : '2px solid #e5e7eb',
                    background: selected ? 'rgba(232,93,32,0.06)' : '#fff',
                    color: selected ? '#E85D20' : '#555', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.15s', minHeight: 'auto', width: 'auto',
                  }}
                >
                  <span>{ind.emoji}</span>
                  <span style={{ flex: 1 }}>{ind.label}</span>
                  {selected && <span>✓</span>}
                </button>
              );
            })}
          </div>
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
            Helps people learn more about your background
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
            borderRadius: 12, border: 'none', background: '#E85D20', color: '#fff', cursor: 'pointer',
          }}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}