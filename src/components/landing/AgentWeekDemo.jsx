import { useState, useEffect } from 'react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";

// Hero demo: a calm week of CLIFF managing a student's career — the point is
// that CLIFF keeps working even after the student leaves.
const WEEK = [
  { day: 'Monday', from: 'you', text: '"I want a marketing internship."' },
  { day: 'Monday', from: 'cliff', text: 'Building your plan…' },
  { day: 'Tuesday', from: 'cliff', text: 'I found three opportunities worth your time.' },
  { day: 'Wednesday', from: 'cliff', text: 'I tailored your resume.' },
  { day: 'Thursday', from: 'cliff', text: 'Your follow-up is due today.' },
  { day: 'Friday', from: 'cliff', text: 'Interview tomorrow.' },
  { day: 'Saturday', from: 'cliff', text: 'I removed five expired jobs.' },
  { day: 'Sunday', from: 'cliff', text: 'Everything is on track. ✅' },
];

export default function AgentWeekDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s + 1) % WEEK.length), 2400);
    return () => clearInterval(iv);
  }, []);

  // Show the current step plus up to two previous ones, fading back
  const visible = [step - 2, step - 1, step].filter(i => i >= 0).map(i => ({ ...WEEK[i], i }));

  return (
    <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 24, border: '1px solid rgba(109,40,217,0.15)', boxShadow: '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)', padding: '20px 20px 22px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulseGreen 2s infinite' }} />
        <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>CLIFF · working all week</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 240, justifyContent: 'flex-end' }}>
        {visible.map((m, idx) => {
          const isCurrent = idx === visible.length - 1;
          const isYou = m.from === 'you';
          return (
            <div key={m.i} style={{ opacity: isCurrent ? 1 : idx === visible.length - 2 ? 0.55 : 0.3, transition: 'opacity 0.6s ease', animation: isCurrent ? 'fadeUp 0.5s ease both' : 'none' }}>
              <p style={{ fontFamily: SF, fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px', textAlign: isYou ? 'right' : 'left' }}>
                {m.day} · {isYou ? 'You' : 'CLIFF'}
              </p>
              <div style={{ display: 'flex', justifyContent: isYou ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', borderRadius: isYou ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px',
                  background: isYou ? 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)' : '#f1f5ff',
                  border: isYou ? 'none' : '1px solid rgba(109,40,217,0.12)',
                }}>
                  <p style={{ fontFamily: SF, fontSize: 13.5, fontWeight: 600, color: isYou ? '#fff' : '#0f172a', margin: 0, lineHeight: 1.45 }}>{m.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week progress dots */}
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 16 }}>
        {WEEK.map((_, i) => (
          <span key={i} style={{ width: i === step ? 18 : 6, height: 6, borderRadius: 3, background: i === step ? '#6d28d9' : i < step ? 'rgba(109,40,217,0.35)' : '#e2e8f0', transition: 'all 0.4s ease' }} />
        ))}
      </div>
      <p style={{ fontFamily: SF, fontSize: 11.5, fontWeight: 600, color: '#94a3b8', textAlign: 'center', margin: '10px 0 0' }}>
        CLIFF keeps working — even after you close the app.
      </p>
    </div>
  );
}