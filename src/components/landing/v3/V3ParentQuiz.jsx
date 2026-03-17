import React, { useState } from 'react';
import { playfair, dmSans, LIGHT_BG } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const QUESTIONS = [
  'Does your student have clear target companies?',
  'Do they know what kinds of roles fit them?',
  'Are they reaching out to anyone directly?',
  'Are they hearing back from employers?',
  'Do they have a real action plan each week?',
];

const RESULTS = [
  { min: 0, max: 1, label: 'Guessing', color: '#EF4444', desc: 'Your student likely has no clear direction. FastIQ can change that.' },
  { min: 2, max: 2, label: 'Stalled', color: '#F59E0B', desc: "They have some ideas but aren't making real progress yet." },
  { min: 3, max: 3, label: 'Starting to Move', color: '#06B6D4', desc: "They're on their way, but could use more structure and outreach help." },
  { min: 4, max: 5, label: 'On the Right Track', color: '#10B981', desc: 'Great signs! FastIQ can help them go further, faster.' },
];

export default function V3ParentQuiz() {
  const { ref, vis } = useFadeIn();
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const yesCount = Object.values(answers).filter(Boolean).length;
  const result = RESULTS.find(r => yesCount >= r.min && yesCount <= r.max);
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  const handleAnswer = (idx, val) => {
    setAnswers(prev => ({ ...prev, [idx]: val }));
    setShowResult(false);
  };

  return (
    <section ref={ref} style={{ background: LIGHT_BG, padding: '110px 24px 120px' }}>
      <div className="max-w-[560px] mx-auto">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', marginBottom: 14, ...fadeStyle(vis, 0) }}>
          Parent Check-In
        </p>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.5vw, 40px)', color: '#0d1117', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          Wondering if your student is actually on track?
        </h2>

        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 16, color: '#6B7280', lineHeight: 1.65, marginBottom: 36, ...fadeStyle(vis, 0.08) }}>
          Take this quick check-in to see if they're stuck, guessing, or making real progress.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, ...fadeStyle(vis, 0.12) }}>
          {QUESTIONS.map((q, i) => (
            <div key={i} style={{
              background: '#fff',
              border: `1px solid ${answers[i] !== undefined ? (answers[i] ? '#10B981' : '#EF4444') + '40' : '#e5e7eb'}`,
              borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#0d1117', lineHeight: 1.4, flex: 1 }}>{q}</span>
              <div className="flex gap-2 flex-shrink-0">
                {['Yes', 'No'].map(label => {
                  const isYes = label === 'Yes';
                  const isSelected = answers[i] === isYes;
                  return (
                    <button
                      key={label}
                      onClick={() => handleAnswer(i, isYes)}
                      style={{
                        fontFamily: dmSans, fontSize: 13, fontWeight: 600,
                        padding: '6px 16px', borderRadius: 100, cursor: 'pointer',
                        border: isSelected ? 'none' : '1px solid #d1d5db',
                        background: isSelected ? (isYes ? '#10B981' : '#EF4444') : '#fff',
                        color: isSelected ? '#fff' : '#6B7280',
                        transition: 'all 0.2s',
                        minHeight: 'auto', minWidth: 'auto', width: 'auto',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {allAnswered && !showResult && (
          <div className="text-center">
            <button
              onClick={() => setShowResult(true)}
              style={{
                fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                background: 'linear-gradient(135deg, #E85D20, #d44e14)',
                color: '#fff', padding: '14px 32px', borderRadius: 100,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 20px rgba(232,93,32,0.3)',
                minHeight: 'auto', minWidth: 'auto', width: 'auto',
              }}
            >
              Take the Parent Check-In
            </button>
          </div>
        )}

        {showResult && result && (
          <div className="text-center" style={{
            background: '#fff',
            border: `2px solid ${result.color}40`,
            borderRadius: 16, padding: '28px 24px', marginTop: 8,
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your student is</p>
            <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: result.color, marginBottom: 12 }}>{result.label}</p>
            <p style={{ fontFamily: dmSans, fontSize: 15, color: '#374151', lineHeight: 1.6 }}>{result.desc}</p>
          </div>
        )}
      </div>
    </section>
  );
}