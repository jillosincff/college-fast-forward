import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const KARMA_LEVELS = [
  { key: 'newcomer', label: 'Newcomer', minPoints: 0, boostMultiplier: 1.0 },
  { key: 'connector', label: 'Connector', minPoints: 200, boostMultiplier: 2.0 },
  { key: 'advocate', label: 'Advocate', minPoints: 500, boostMultiplier: 3.0 },
  { key: 'champion', label: 'Champion', minPoints: 1000, boostMultiplier: 4.0 },
  { key: 'legend', label: 'Legend', minPoints: 2000, boostMultiplier: 5.0 },
];

function mapServerLevel(serverLevel) {
  const levelMap = {
    'none': 'newcomer',
    'active': 'connector',
    'engaged': 'advocate',
    'priority': 'champion',
    'champion': 'legend',
  };
  return levelMap[serverLevel] || 'newcomer';
}

export default function FamilyKarmaCard({ karmaData }) {
  const totalKarma = karmaData?.total_karma || 0;
  const serverLevel = karmaData?.karma_level || 'none';
  const boostMultiplier = karmaData?.boost_multiplier || 1.0;
  
  const currentLevelKey = mapServerLevel(serverLevel);
  const currentLevelIndex = KARMA_LEVELS.findIndex(l => l.key === currentLevelKey);
  const currentLevel = KARMA_LEVELS[currentLevelIndex] || KARMA_LEVELS[0];
  const nextLevel = KARMA_LEVELS[currentLevelIndex + 1];

  const pointsToNext = nextLevel ? nextLevel.minPoints - totalKarma : 0;
  const progressPercent = nextLevel
    ? Math.min(100, ((totalKarma - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.06)',
      borderLeft: '4px solid #E85D20', overflow: 'hidden', padding: '24px 24px 20px',
    }}>
      {/* Header */}
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#aaa', marginBottom: 8,
      }}>
        FAMILY KARMA
      </p>
      <h2 style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#E85D20',
        marginBottom: 4, letterSpacing: '-0.01em',
      }}>
        {currentLevel.label}
      </h2>
      {nextLevel && (
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: '0 0 16px',
        }}>
          {pointsToNext > 0 ? `${pointsToNext} more points to reach ${nextLevel.label}` : `Almost at ${nextLevel.label}!`}
        </p>
      )}

      {/* Progress bar */}
      <div style={{
        background: 'rgba(232,93,32,0.1)', borderRadius: 100, height: 8,
        overflow: 'hidden', marginBottom: 16,
      }}>
        <div style={{
          height: '100%', borderRadius: 100, background: '#E85D20',
          width: `${Math.max(4, progressPercent)}%`, transition: 'width 0.6s ease',
        }} />
      </div>

      {/* Level ladder */}
      <div className="karma-ladder" style={{
        display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 24,
      }}>
        {KARMA_LEVELS.map((level, i) => {
          const isCurrent = level.key === currentLevelKey;
          const isCompleted = i < currentLevelIndex;
          const isFuture = i > currentLevelIndex;
          return (
            <div key={level.key} style={{
              flex: 1, textAlign: 'center', padding: '6px 2px',
              borderRadius: 8,
              background: isCurrent ? 'rgba(232,93,32,0.08)' : 'transparent',
            }}>
              <p style={{
                fontFamily: dmSans, fontSize: 10, fontWeight: isCurrent ? 600 : 400,
                color: isCurrent ? '#E85D20' : isCompleted ? 'rgba(232,93,32,0.5)' : '#ccc',
                margin: 0, lineHeight: 1.3,
              }}>
                {level.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Boost multiplier */}
      <div style={{
        background: 'rgba(232,93,32,0.04)', borderRadius: 12, padding: '16px 20px',
      }}>
        <p style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#aaa', marginBottom: 6,
        }}>
          YOUR BOOST MULTIPLIER
        </p>
        <p style={{
          fontFamily: playfair, fontSize: 32, fontWeight: 700, color: '#E85D20',
          letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6,
        }}>
          {boostMultiplier > 0 ? `${boostMultiplier.toFixed(1)}×` : '--'}
        </p>
        <p style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#666', margin: 0, lineHeight: 1.5,
        }}>
          Your student's questions are getting {boostMultiplier > 0 ? `${boostMultiplier.toFixed(1)}×` : '--'} more visibility in the network.
        </p>
        {nextLevel && (
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', marginTop: 6, margin: '6px 0 0',
          }}>
            Reach {nextLevel.label} to unlock {nextLevel.boostMultiplier.toFixed(1)}×
          </p>
        )}
      </div>
    </div>
  );
}