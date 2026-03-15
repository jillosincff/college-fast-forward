import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function ThisWeekCard({ weeklyStats }) {
  const answered = weeklyStats?.questionsAnswered || 0;
  const helped = weeklyStats?.studentsHelped || 0;
  const needHelp = weeklyStats?.studentsNeedHelp || 0;

  return (
    <div style={{
      background: '#0d1117', borderRadius: 16, padding: '28px 24px',
      overflow: 'hidden',
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 20,
      }}>
        THIS WEEK IN THE NETWORK
      </p>

      <div className="week-stats-row" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#E85D20',
            letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6,
          }}>
            {answered || '--'}
          </p>
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.45)',
            margin: 0, lineHeight: 1.4,
          }}>
            Questions answered by parents
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: playfair, fontSize: 36, fontWeight: 700, color: '#E85D20',
            letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6,
          }}>
            {helped || '--'}
          </p>
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.45)',
            margin: 0, lineHeight: 1.4,
          }}>
            Students helped this week
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: playfair, fontSize: 42, fontWeight: 700, color: '#E85D20',
            letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6,
          }}>
            {needHelp || '--'}
          </p>
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
            margin: 0, lineHeight: 1.4,
          }}>
            Students who could use your help
          </p>
          <button onClick={() => navigate('Connections')} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#E85D20',
            marginTop: 8, transition: 'opacity 0.2s', minHeight: 'auto', width: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Answer a question →
          </button>
        </div>
      </div>

      <style>{`
        @media(max-width:640px) {
          .week-stats-row { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
}