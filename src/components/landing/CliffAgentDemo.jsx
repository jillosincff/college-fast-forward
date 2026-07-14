import { useState, useEffect } from 'react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const GOAL_TEXT = 'Healthcare marketing internship';

// The sequence CLIFF runs after the student states a goal
const STAGES = [
  { type: 'thinking', duration: 1000 },
  { type: 'msg', text: 'I found 43 jobs.', duration: 900 },
  { type: 'msg', text: 'I narrowed them to 3.', duration: 900 },
  { type: 'check', text: 'Resume ready', duration: 620 },
  { type: 'check', text: 'Found one warm connection', duration: 620 },
  { type: 'check', text: 'Interview prep ready', duration: 620 },
  { type: 'done', text: "Today's Plan complete", duration: 1500 },
];

const MOVES = [
  { medal: '🥇', text: 'Apply to Johnson & Johnson' },
  { medal: '🥈', text: 'Follow up with Nike' },
  { medal: '🥉', text: 'Practice tomorrow\u2019s interview' },
];

// Hero simulation: student pastes a goal → CLIFF thinks, narrows, prepares →
// Today's Plan complete → the plan itself, including proof that CLIFF remembers.
export default function CliffAgentDemo() {
  const [typed, setTyped] = useState(0);
  const [stage, setStage] = useState(-1); // -1 = typing, 0..n = STAGES index, done → moves
  const [phase, setPhase] = useState('run'); // run → moves

  useEffect(() => {
    let t;
    if (phase === 'run') {
      if (stage === -1) {
        if (typed < GOAL_TEXT.length) t = setTimeout(() => setTyped(typed + 1), 30);
        else t = setTimeout(() => setStage(0), 350);
      } else if (stage < STAGES.length - 1) {
        t = setTimeout(() => setStage(stage + 1), STAGES[stage].duration);
      } else {
        t = setTimeout(() => setPhase('moves'), STAGES[stage].duration);
      }
    } else {
      t = setTimeout(() => { setTyped(0); setStage(-1); setPhase('run'); }, 5200);
    }
    return () => clearTimeout(t);
  }, [phase, stage, typed]);

  const visible = STAGES.slice(0, stage + 1);
  const isThinkingNow = stage === 0;

  return (
    <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, boxShadow: '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(109,40,217,0.15)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <style>{`
        @keyframes cadFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cadBlink { 50% { opacity: 0; } }
        @keyframes cadDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
      `}</style>

      {/* Window chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafaff' }}>
        {['#fda4af', '#fcd34d', '#86efac'].map(c => (
          <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#94a3b8', marginLeft: 'auto' }}>CLIFF — your career agent</span>
      </div>

      <div style={{ padding: '18px 18px 20px', minHeight: 340 }}>
        {phase === 'run' ? (
          <>
            {/* Goal field */}
            <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Tell CLIFF your goal</p>
            <div style={{ border: `1.5px solid ${typed > 0 ? INDIGO : '#e2e8f0'}`, borderRadius: 10, padding: '11px 14px', fontFamily: SF, fontSize: 13.5, fontWeight: 600, color: '#0f172a', marginBottom: 16, background: '#fafaff', minHeight: 42, transition: 'border-color 0.3s' }}>
              {GOAL_TEXT.slice(0, typed)}
              <span style={{ display: 'inline-block', width: 2, height: 14, background: INDIGO, marginLeft: 1, verticalAlign: 'middle', opacity: stage === -1 ? 1 : 0, animation: 'cadBlink 0.9s step-end infinite' }} />
            </div>

            {/* CLIFF working feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visible.map((s, i) => {
                if (s.type === 'thinking') {
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'cadFadeIn 0.3s ease both' }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✨</span>
                      {isThinkingNow ? (
                        <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                          {[0, 1, 2].map(d => (
                            <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: INDIGO, animation: `cadDot 1s ${d * 0.15}s ease-in-out infinite` }} />
                          ))}
                          <span style={{ fontFamily: SF, fontSize: 12.5, fontWeight: 600, color: '#94a3b8', marginLeft: 6 }}>CLIFF is thinking…</span>
                        </span>
                      ) : (
                        <span style={{ fontFamily: SF, fontSize: 12.5, fontWeight: 600, color: '#94a3b8' }}>On it.</span>
                      )}
                    </div>
                  );
                }
                if (s.type === 'msg') {
                  return (
                    <div key={i} style={{ alignSelf: 'flex-start', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '12px 12px 12px 4px', padding: '9px 14px', animation: 'cadFadeIn 0.35s ease both' }}>
                      <span style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: '#4c1d95' }}>"{s.text}"</span>
                    </div>
                  );
                }
                if (s.type === 'check') {
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, animation: 'cadFadeIn 0.3s ease both' }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>✓</span>
                      <span style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{s.text}</span>
                    </div>
                  );
                }
                // done
                return (
                  <div key={i} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: '10px 14px', textAlign: 'center', animation: 'cadFadeIn 0.35s ease both', marginTop: 4 }}>
                    <span style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 900, color: '#059669' }}>🎉 {s.text}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Today's Best Moves — the plan CLIFF hands you, with proof it remembers you */
          <div style={{ animation: 'cadFadeIn 0.4s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 15 }}>✨</span>
              <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 900, color: '#0f172a', margin: 0 }}>Today's Best Moves</p>
            </div>
            <p style={{ fontFamily: SF, fontSize: 12, color: '#64748b', margin: '0 0 14px' }}>Every morning, CLIFF hands you a ranked plan.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOVES.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f9fc', border: '1px solid #eef0f5', borderRadius: 12, padding: '12px 14px', animation: `cadFadeIn 0.35s ${0.15 + i * 0.15}s ease both` }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{m.medal}</span>
                  <span style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>{m.text}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO }}>Go →</span>
                </div>
              ))}
            </div>
            {/* The memory moment — MY AI, not just AI */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 12, padding: '11px 13px', marginTop: 12, animation: 'cadFadeIn 0.35s 0.65s ease both' }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>🧠</span>
              <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 600, fontStyle: 'italic', color: '#4c1d95', lineHeight: 1.55 }}>
                "I skipped sales jobs because I know you're focused on healthcare marketing."
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}