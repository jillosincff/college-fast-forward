import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

function ScoreRing({ score, size = 130 }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  const color = score >= 70 ? '#4CAF50' : score >= 50 ? '#FFA726' : '#e53935';
  useEffect(() => {
    setTimeout(() => setOffset(circ - (circ * Math.min(score, 100)) / 100), 100);
  }, [score]);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 32, fontWeight: 700, fontFamily: playfair, fill: color }}>
        {score}
      </text>
    </svg>
  );
}

function getLabel(score) {
  if (score >= 85) return 'Interview Ready 🎯';
  if (score >= 70) return 'Strong Candidate';
  if (score >= 55) return 'Almost There';
  if (score >= 40) return 'Keep Practicing';
  return 'More Practice Needed';
}

export default function InterviewResults({ session, onPracticeAgain, onViewHistory }) {
  const [expandedQ, setExpandedQ] = useState(null);
  const overallScore = session.overall_score || 0;
  const questions = session.questions || [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0d1117', zIndex: 100, overflow: 'auto' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes resFade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Score Ring */}
        <div style={{ textAlign: 'center', marginBottom: 24, animation: 'resFade 0.6s ease both' }}>
          <div style={{ display: 'inline-block' }}><ScoreRing score={overallScore} /></div>
          <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 500, color: overallScore >= 70 ? '#4CAF50' : overallScore >= 50 ? '#FFA726' : '#e53935', marginTop: 12 }}>
            {getLabel(overallScore)}
          </p>
          {session.company_name && (
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.4)', marginTop: 4 }}>
              {session.interview_type} interview{session.company_name ? ` · ${session.company_name}` : ''}
            </p>
          )}
        </div>

        {/* Question breakdown */}
        <div style={{ marginBottom: 24, animation: 'resFade 0.6s 0.1s ease both' }}>
          {questions.map((q, i) => {
            const scoreColor = q.score >= 70 ? '#4CAF50' : q.score >= 50 ? '#FFA726' : '#e53935';
            const dot = q.score >= 70 ? '🟢' : q.score >= 50 ? '🟡' : '🔴';
            const isExpanded = expandedQ === i;
            return (
              <div key={i}
                onClick={() => setExpandedQ(isExpanded ? null : i)}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '12px 16px', marginBottom: 6, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.6)', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12 }}>
                    Q{i + 1}: {q.skipped ? '(Skipped)' : q.question}
                  </p>
                  <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: scoreColor, flexShrink: 0 }}>
                    {q.skipped ? '—' : `${q.score}/100`} {!q.skipped && dot}
                  </span>
                </div>
                {isExpanded && !q.skipped && q.feedback && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                    {q.feedback.overall && <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.6)', lineHeight: 1.6 }}>{q.feedback.overall}</p>}
                    {q.feedback.strengths?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#4CAF50', marginBottom: 4 }}>Strengths:</p>
                        {q.feedback.strengths.map((s, j) => <p key={j} style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.5)', margin: '0 0 2px' }}>• {s}</p>)}
                      </div>
                    )}
                    {q.feedback.improvements?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: orange, marginBottom: 4 }}>Improvements:</p>
                        {q.feedback.improvements.map((s, j) => <p key={j} style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.5)', margin: '0 0 2px' }}>• {s}</p>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key takeaways */}
        <div style={{ animation: 'resFade 0.6s 0.2s ease both' }}>
          {session.strengths_shown?.length > 0 && (
            <div style={{ borderLeft: '3px solid #4CAF50', background: 'rgba(76,175,80,0.04)', borderRadius: '0 10px 10px 0', padding: '12px 16px', marginBottom: 12 }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: '#4CAF50', marginBottom: 6 }}>Strengths shown</p>
              {session.strengths_shown.map((s, i) => <p key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(76,175,80,0.8)', margin: '0 0 4px' }}>• {s}</p>)}
            </div>
          )}
          {session.areas_to_improve?.length > 0 && (
            <div style={{ borderLeft: '3px solid ' + orange, background: 'rgba(232,93,32,0.04)', borderRadius: '0 10px 10px 0', padding: '12px 16px', marginBottom: 12 }}>
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', color: orange, marginBottom: 6 }}>Areas to improve</p>
              {session.areas_to_improve.map((s, i) => <p key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(232,93,32,0.8)', margin: '0 0 4px' }}>• {s}</p>)}
            </div>
          )}
        </div>

        {/* FASTIQ assessment */}
        {session.overall_feedback && (
          <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 15, color: 'rgba(244,240,232,0.6)', lineHeight: 1.7, marginTop: 20, animation: 'resFade 0.6s 0.3s ease both' }}>
            "{session.overall_feedback}"
          </p>
        )}

        {/* Actions */}
        <div style={{ marginTop: 32, animation: 'resFade 0.6s 0.4s ease both' }}>
          <button onClick={onPracticeAgain} style={{
            width: '100%', padding: '13px 0', borderRadius: 100, border: 'none',
            background: orange, color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            cursor: 'pointer', minHeight: 48, marginBottom: 10,
          }}>
            Practice again →
          </button>
          <button onClick={onViewHistory} style={{
            width: '100%', padding: '13px 0', borderRadius: 100,
            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
            color: 'rgba(244,240,232,0.6)', fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            cursor: 'pointer', minHeight: 48, marginBottom: 10,
          }}>
            View all interviews →
          </button>
          <button onClick={() => navigate('FastIQ')} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.3)',
            background: 'none', border: 'none', cursor: 'pointer', display: 'block',
            margin: '4px auto', minHeight: 'auto', width: 'auto',
          }}>
            Go to dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}