import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function getKarmaLevelName(points) {
  if (points >= 500) return 'Legend';
  if (points >= 300) return 'Platinum';
  if (points >= 150) return 'Gold';
  if (points >= 50) return 'Silver';
  if (points > 0) return 'Bronze';
  return 'Newcomer';
}

function StatCard({ label, value, sub, empty }) {
  return (
    <div style={{
      flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 16,
      padding: '20px 16px', textAlign: 'center',
      border: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      <p style={{
        fontFamily: playfair, fontSize: 28, fontWeight: 700,
        color: empty ? 'rgba(244,240,232,0.25)' : '#E85D20',
        marginBottom: 2,
      }}>
        {empty ? '--' : value}
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#f4f0e8', marginBottom: 2 }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.4)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function ProgressStep({ label, points, completed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
        background: completed ? '#E85D20' : 'rgba(255,255,255,0.15)',
        border: completed ? 'none' : '1px solid rgba(255,255,255,0.2)',
      }} />
      <span style={{
        fontFamily: dmSans, fontSize: 12, fontWeight: 400,
        color: completed ? '#E85D20' : 'rgba(244,240,232,0.35)',
      }}>
        {label} <span style={{ fontWeight: 500 }}>+{points}</span>
      </span>
    </div>
  );
}

export default function AlumniHelperHero({
  user, karma, studentsHelped, matchedQuestionsCount,
  hasAnswered, hasIntro, profileComplete,
}) {
  const fullName = user?.full_name || '';
  let firstName;
  if (fullName.includes(',')) {
    firstName = fullName.split(',')[1]?.trim().split(/\s+/)[0] || 'Alumni';
  } else {
    firstName = fullName.split(/\s+/)[0] || 'Alumni';
  }

  const karmaLevel = getKarmaLevelName(karma);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #0d1117 0%, #0a1a6e 60%, #0821A5 100%)',
      padding: '48px 24px 36px',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Eyebrow */}
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'rgba(244,240,232,0.4)', marginBottom: 12,
        }}>
          Alumni Dashboard
        </p>

        {/* H1 */}
        <h1 style={{
          fontFamily: playfair, fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 700,
          color: '#f4f0e8', marginBottom: 10, lineHeight: 1.2,
        }}>
          Welcome back, <span style={{ fontFamily: playfair, fontStyle: 'italic', color: '#E85D20' }}>{firstName}.</span>
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 300,
          color: 'rgba(244,240,232,0.55)', marginBottom: 32, maxWidth: 480,
        }}>
          Your experience opens doors. Every answer, every intro — it matters.
        </p>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }} className="alumni-hero-stats">
          <StatCard
            label="Karma"
            value={karmaLevel}
            empty={karma === 0}
          />
          <StatCard
            label="Students Helped"
            value={studentsHelped}
            sub="all time"
            empty={studentsHelped === 0}
          />
          <StatCard
            label="Questions Matched"
            value={matchedQuestionsCount}
            sub="need your expertise"
            empty={matchedQuestionsCount === 0}
          />
        </div>

        {/* Progress strip */}
        <div style={{
          display: 'flex', gap: 20, flexWrap: 'wrap',
          padding: '14px 18px', borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          <ProgressStep label="Answer a Question" points={15} completed={hasAnswered} />
          <ProgressStep label="Make an Introduction" points={50} completed={hasIntro} />
          <ProgressStep label="Complete Your Profile" points={25} completed={profileComplete} />
        </div>
      </div>

      <style>{`
        @media(max-width:640px){
          .alumni-hero-stats { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}