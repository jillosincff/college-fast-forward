import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function AlumniImpactSnapshot({ studentsHelped, answersGiven, introsMade }) {
  const hasAnyAction = studentsHelped > 0 || answersGiven > 0 || introsMade > 0;
  if (!hasAnyAction) return null;

  const stats = [
    { label: 'Students Helped', value: studentsHelped },
    { label: 'Answers Given', value: answersGiven },
    { label: 'Intros Made', value: introsMade },
  ];

  return (
    <div style={{
      background: '#0d1117', borderRadius: 16, padding: '28px 24px',
      border: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'rgba(244,240,232,0.4)', margin: 0,
        }}>
          Your Impact
        </p>
        <button
          onClick={() => navigate('MyImpact')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#E85D20',
            minHeight: 'auto', width: 'auto',
          }}
        >
          View Full Impact →
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16 }} className="impact-stats-row">
        {stats.map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
            <p style={{
              fontFamily: playfair, fontSize: 32, fontWeight: 700,
              color: s.value > 0 ? '#E85D20' : 'rgba(244,240,232,0.25)',
              marginBottom: 4,
            }}>
              {s.value > 0 ? s.value : '--'}
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(244,240,232,0.5)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media(max-width:480px){
          .impact-stats-row { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>
    </div>
  );
}