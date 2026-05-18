import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const BLUE = '#0066FF';
const BLUE_LIGHT = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const GREEN = '#10B981';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';

const QUESTIONS = [
  {
    id: 'energy_source',
    title: 'What energizes you most?',
    options: [
      { key: 'analyzing', emoji: '📊', label: 'Breaking down complex problems' },
      { key: 'creating', emoji: '🎨', label: 'Building something from nothing' },
      { key: 'helping', emoji: '💙', label: 'Helping others succeed' },
      { key: 'leading', emoji: '🚀', label: 'Leading teams and projects' },
    ],
  },
  {
    id: 'work_style',
    title: 'How do you prefer to work?',
    options: [
      { key: 'independent', emoji: '🧘', label: 'Deep focus, independent work' },
      { key: 'collaborative', emoji: '👥', label: 'Brainstorming with others' },
      { key: 'structured', emoji: '📋', label: 'Clear processes and systems' },
      { key: 'flexible', emoji: '🌊', label: 'Adapting to change daily' },
    ],
  },
  {
    id: 'success_metric',
    title: 'What does success look like?',
    options: [
      { key: 'impact', emoji: '🌍', label: 'Making a real difference' },
      { key: 'mastery', emoji: '🎯', label: 'Becoming an expert' },
      { key: 'wealth', emoji: '💰', label: 'Financial freedom' },
      { key: 'balance', emoji: '⚖️', label: 'Time freedom and flexibility' },
    ],
  },
];

export default function ArchetypeAssessment({ onComplete, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSelect = (optionKey) => {
    const newAnswers = { ...answers, [QUESTIONS[currentQuestion].id]: optionKey };
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        submitAssessment(newAnswers);
      }
    }, 250);
  };

  const submitAssessment = async (finalAnswers) => {
    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateCareerArchetype', {
        answers: finalAnswers,
      });
      onComplete(result);
    } catch (err) {
      console.error('Assessment failed:', err);
      // Fallback to basic archetype
      onComplete({ archetype: 'Explorer', description: 'You thrive in roles that offer variety and growth.' });
    }
    setLoading(false);
  };

  const q = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div style={{ textAlign: 'center', maxWidth: 560, width: '100%', animation: 'fadeUp 0.3s ease' }}>
      {/* Progress */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E2E8F0' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: BLUE, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ position: 'absolute', top: 18, left: 24, fontFamily: FONT, fontSize: 12, color: TEXT2, fontWeight: 600 }}>
        Question {currentQuestion + 1} of {QUESTIONS.length}
      </div>

      {/* Content */}
      <div style={{ paddingTop: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px' }}>
          🔮
        </div>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
          {q.title}
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 auto 28px', maxWidth: 420, lineHeight: 1.6 }}>
          Be honest — there are no wrong answers. This helps us discover your natural strengths.
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          {q.options.map(opt => (
            <button
              key={opt.key}
              onClick={() => handleSelect(opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                width: '100%',
                background: '#fff',
                border: `2px solid #E2E8F0`,
                borderRadius: 14,
                padding: '18px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                minHeight: 'auto',
                transition: 'all 0.18s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = BLUE;
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,102,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUE_LIGHT, borderRadius: 12, border: `1px solid ${BLUE_BORDER}` }}>
                {opt.emoji}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: TEXT, flex: 1 }}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Back button */}
        {currentQuestion > 0 && (
          <button
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            style={{
              marginTop: 28,
              fontFamily: FONT,
              fontSize: 13,
              color: TEXT2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              minHeight: 'auto',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            ← Back
          </button>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20000 }}>
            <div style={{ fontSize: 56, marginBottom: 24, animation: 'bounce 1s infinite' }}>🔮</div>
            <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Analyzing your responses...</p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2 }}>Building your Career Archetype profile</p>
            <div style={{ width: 48, height: 48, border: '4px solid #E2E8F0', borderTop: '4px solid ' + BLUE, borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginTop: 24 }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
}