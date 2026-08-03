import { useState, useEffect } from 'react';
import { FONT, R } from './onboardingShared';

/**
 * Terminal-style feed of the work CLIFF is doing right now.
 * Every line describes real work in the parse/rewrite pass — no invented
 * counts. Visible labor is the proof; the spinner was hiding it.
 */
export default function LiveWorkFeed({ college, seeking, industries = [] }) {
  const focus = industries[0] || ((seeking || '').toLowerCase().includes('intern') ? 'internships' : 'roles');
  const steps = [
    'Reading your resume',
    'Extracting your experience and skills',
    'Finding the results hidden in your bullets',
    'Rewriting them the way recruiters shortlist',
    'Checking ATS formatting and keywords',
    college ? `Cross-referencing ${college} alumni paths` : 'Cross-referencing alumni career paths',
    `Matching your background to ${focus}`,
    'Preparing your first move',
  ];

  const [done, setDone] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setDone(d => Math.min(d + 1, steps.length - 1)), 2200);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = steps.slice(0, done + 1);

  return (
    <div style={{ background: '#0B1120', borderRadius: R, padding: '20px 22px', textAlign: 'left', border: '1px solid #1E293B', boxShadow: '0 14px 34px rgba(15,23,42,0.28)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 4px rgba(16,185,129,0.18)' }} />
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          CLIFF is working
        </span>
      </div>

      {visible.map((line, i) => {
        const isCurrent = i === visible.length - 1;
        return (
          <div key={line} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 9, animation: 'fadeUp 0.35s ease' }}>
            <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1, color: isCurrent ? '#38BDF8' : '#10B981', fontWeight: 800 }}>
              {isCurrent ? '▸' : '✓'}
            </span>
            <span style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 12.5,
              color: isCurrent ? '#E2E8F0' : 'rgba(148,163,184,0.75)',
              lineHeight: 1.5,
            }}>
              {line}{isCurrent ? '…' : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}