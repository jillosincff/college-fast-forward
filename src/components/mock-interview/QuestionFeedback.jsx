import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

function AnimatedScore({ target }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);

  const color = current >= 70 ? '#4CAF50' : current >= 50 ? '#FFA726' : '#e53935';
  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 64, color, margin: 0, lineHeight: 1 }}>{current}</p>
      <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 300, color: 'rgba(244,240,232,0.3)', margin: 0 }}>/ 100</p>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color, marginTop: 8 }}>
        {target >= 90 ? 'Exceptional 🎯' : target >= 70 ? 'Strong answer' : target >= 50 ? 'Getting there' : target >= 30 ? 'Needs work' : "Let's improve this"}
      </p>
    </div>
  );
}

function STARResult({ breakdown }) {
  if (!breakdown) return null;
  const items = [
    { key: 'situation', label: 'Situation' },
    { key: 'task', label: 'Task' },
    { key: 'action', label: 'Action' },
    { key: 'result', label: 'Result' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
      {items.map(item => {
        const data = breakdown[item.key];
        const quality = data?.quality || 'missing';
        const color = quality === 'strong' ? '#4CAF50' : quality === 'weak' ? '#FFA726' : '#e53935';
        const label = quality === 'strong' ? '✓' : quality === 'weak' ? '~' : '✗';
        return (
          <div key={item.key} style={{ textAlign: 'center' }}>
            <span style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 500, color,
              background: `${color}15`, border: `0.5px solid ${color}40`,
              borderRadius: 100, padding: '4px 12px', display: 'inline-block',
            }}>
              {item.label} {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function QuestionFeedback({ question, score, feedback, isLast, onNext, onRetry }) {
  const [showExample, setShowExample] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0d1117', zIndex: 100, overflow: 'auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes miFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '48px 24px 80px' }}>
        <AnimatedScore target={score} />

        {/* STAR breakdown for behavioral */}
        {question?.type === 'behavioral' && <STARResult breakdown={feedback?.star_breakdown} />}

        {/* Strengths */}
        {feedback?.strengths?.length > 0 && (
          <div style={{ borderLeft: '3px solid #4CAF50', background: 'rgba(76,175,80,0.04)', borderRadius: '0 10px 10px 0', padding: '12px 16px', marginBottom: 12, animation: 'miFadeUp 0.4s ease both' }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#4CAF50', marginBottom: 6 }}>What you did well</p>
            {feedback.strengths.map((s, i) => (
              <p key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.7)', lineHeight: 1.6, margin: '0 0 4px' }}>• {s}</p>
            ))}
          </div>
        )}

        {/* Improvements */}
        {feedback?.improvements?.length > 0 && (
          <div style={{ borderLeft: '3px solid ' + orange, background: 'rgba(232,93,32,0.04)', borderRadius: '0 10px 10px 0', padding: '12px 16px', marginBottom: 12, animation: 'miFadeUp 0.4s 0.06s ease both' }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: orange, marginBottom: 6 }}>What to improve</p>
            {feedback.improvements.map((s, i) => (
              <p key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.7)', lineHeight: 1.6, margin: '0 0 4px' }}>• {s}</p>
            ))}
          </div>
        )}

        {/* Overall feedback */}
        {feedback?.overall && (
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.65)', lineHeight: 1.7, marginTop: 16, animation: 'miFadeUp 0.4s 0.12s ease both' }}>
            {feedback.overall}
          </p>
        )}

        {/* Model answer */}
        {feedback?.example_answer && (
          <div style={{ marginTop: 16, animation: 'miFadeUp 0.4s 0.18s ease both' }}>
            <button onClick={() => setShowExample(!showExample)} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: orange,
              background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto',
            }}>
              {showExample ? 'Hide strong answer ▴' : 'See a strong answer ▾'}
            </button>
            {showExample && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: 'rgba(244,240,232,0.3)', marginBottom: 8 }}>Example of a strong answer:</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.7)', lineHeight: 1.7, margin: 0 }}>
                  {feedback.example_answer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: 32 }}>
          <button onClick={onNext} style={{
            width: '100%', padding: '13px 0', borderRadius: 100, border: 'none',
            background: orange, color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            cursor: 'pointer', minHeight: 48,
          }}>
            {isLast ? 'See results →' : 'Next question →'}
          </button>
          <button onClick={onRetry} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.3)',
            background: 'none', border: 'none', cursor: 'pointer', display: 'block',
            margin: '12px auto', minHeight: 'auto', width: 'auto',
          }}>
            Retry this question →
          </button>
        </div>
      </div>
    </div>
  );
}