import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const INTENTS = [
  {
    id: 'help_students',
    emoji: '🤝',
    title: 'I want to help students',
    body: 'Use your professional experience to answer questions, make introductions, and help students succeed.',
  },
  {
    id: 'seeking_help',
    emoji: '🔍',
    title: "I'm looking for career opportunities",
    body: 'Get matched with parents and alumni who can help you with introductions, career advice, and job search.',
  },
];

export default function AlumniStep4Intent({ formData, onUpdate, onNext, onBack }) {
  const selected = formData.intent;

  return (
    <div>
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
        What brings you to College Fast Forward?
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 28 }}>
        This helps us tailor your experience.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {INTENTS.map(intent => {
          const isActive = selected === intent.id;
          return (
            <button
              key={intent.id}
              onClick={() => onUpdate({ intent: intent.id })}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: '20px 20px', borderRadius: 14, textAlign: 'left',
                border: isActive ? '2px solid #E85D20' : '2px solid #e5e7eb',
                background: isActive ? 'rgba(232,93,32,0.04)' : '#fff',
                cursor: 'pointer', transition: 'all 0.15s', minHeight: 'auto', width: '100%',
              }}
            >
              <span style={{ fontSize: 28, marginTop: 2 }}>{intent.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: dmSans, fontSize: 16, fontWeight: 700,
                  color: isActive ? '#E85D20' : '#1a1a1a', marginBottom: 4,
                }}>
                  {intent.title}
                </p>
                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.5, margin: 0 }}>
                  {intent.body}
                </p>
              </div>
              {isActive && (
                <span style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 700, color: '#E85D20', marginTop: 4 }}>✓</span>
              )}
            </button>
          );
        })}
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
          disabled={!selected}
          style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700, flex: 1, height: 52,
            borderRadius: 12, border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
            background: selected ? '#E85D20' : '#e5e7eb',
            color: selected ? '#fff' : '#aaa',
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}