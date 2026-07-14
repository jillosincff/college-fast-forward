import { useState, useEffect } from 'react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const URL_TEXT = 'linkedin.com/jobs/3928471…';
const TASKS = [
  'Resume tailored',
  'Company researched',
  'Warm connection found',
  'Outreach drafted',
  'Interview questions prepared',
  'Ready to apply',
];
const MOVES = [
  { medal: '🥇', text: 'Apply to Johnson & Johnson' },
  { medal: '🥈', text: 'Follow up with Nike' },
  { medal: '🥉', text: 'Practice tomorrow\u2019s interview' },
];

// Hero mini-simulation: paste a job link → CLIFF does everything → Today's Best Moves.
// The whole run completes in under 5 seconds, then loops.
export default function CliffAgentDemo() {
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing → working → moves

  useEffect(() => {
    let t;
    if (phase === 'typing') {
      if (typed < URL_TEXT.length) t = setTimeout(() => setTyped(typed + 1), 32);
      else t = setTimeout(() => setPhase('working'), 400);
    } else if (phase === 'working') {
      if (done < TASKS.length) t = setTimeout(() => setDone(done + 1), 500);
      else t = setTimeout(() => setPhase('moves'), 1300);
    } else {
      t = setTimeout(() => { setTyped(0); setDone(0); setPhase('typing'); }, 4200);
    }
    return () => clearTimeout(t);
  }, [phase, typed, done]);

  return (
    <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, boxShadow: '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(109,40,217,0.15)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <style>{`@keyframes cadFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafaff' }}>
        {['#fda4af', '#fcd34d', '#86efac'].map(c => (
          <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#94a3b8', marginLeft: 'auto' }}>CLIFF — your career agent</span>
      </div>

      <div style={{ padding: '18px 18px 20px', minHeight: 320 }}>
        {phase !== 'moves' ? (
          <>
            {/* Paste field */}
            <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Paste a job link</p>
            <div style={{ border: `1.5px solid ${typed > 0 ? INDIGO : '#e2e8f0'}`, borderRadius: 10, padding: '11px 14px', fontFamily: "'Monaco', monospace", fontSize: 12.5, color: '#334155', marginBottom: 16, background: '#fafaff', minHeight: 42, transition: 'border-color 0.3s' }}>
              {URL_TEXT.slice(0, typed)}
              <span style={{ display: 'inline-block', width: 2, height: 14, background: INDIGO, marginLeft: 1, verticalAlign: 'middle', opacity: phase === 'typing' ? 1 : 0, animation: 'cadBlink 0.9s step-end infinite' }} />
              <style>{`@keyframes cadBlink { 50% { opacity: 0; } }`}</style>
            </div>

            {/* Tasks completing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {TASKS.map((task, i) => {
                const isDone = i < done;
                const isNext = i === done && phase === 'working';
                return (
                  <div key={task} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: isDone ? 1 : isNext ? 0.75 : 0.28, transition: 'opacity 0.3s', animation: isDone ? 'cadFadeIn 0.3s ease both' : 'none' }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: isDone ? GRAD : '#f1f5f9', border: isDone ? 'none' : '1.5px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 11, fontWeight: 800,
                    }}>
                      {isDone ? '✓' : ''}
                      {isNext && <span style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${INDIGO}`, borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />}
                    </span>
                    <span style={{ fontFamily: SF, fontSize: 13.5, fontWeight: isDone ? 700 : 500, color: isDone ? '#0f172a' : '#94a3b8' }}>{task}</span>
                  </div>
                );
              })}
            </div>

            {done === TASKS.length && (
              <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: '#059669', margin: '16px 0 0', animation: 'cadFadeIn 0.3s ease both' }}>
                ✓ Done in seconds — not weekends.
              </p>
            )}
          </>
        ) : (
          /* Today's Best Moves — the daily plan CLIFF hands you */
          <div style={{ animation: 'cadFadeIn 0.4s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15 }}>✨</span>
              <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 900, color: '#0f172a', margin: 0 }}>Today's Best Moves</p>
            </div>
            <p style={{ fontFamily: SF, fontSize: 12, color: '#64748b', margin: '0 0 14px' }}>Every morning, CLIFF hands you a ranked plan.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOVES.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', border: '1px solid #eef0f5', borderRadius: 12, padding: '13px 14px', animation: `cadFadeIn 0.35s ${0.15 + i * 0.15}s ease both` }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{m.medal}</span>
                  <span style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{m.text}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO }}>Go →</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: SF, fontSize: 11.5, fontStyle: 'italic', color: '#7c3aed', margin: '14px 0 0', animation: 'cadFadeIn 0.35s 0.7s ease both' }}>
              "If you only have 20 minutes today, this is where they should go."
            </p>
          </div>
        )}
      </div>
    </div>
  );
}