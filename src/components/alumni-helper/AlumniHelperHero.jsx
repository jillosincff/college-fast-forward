import React from 'react';
import { getKarmaDisplayInfo, KARMA_ACTION_POINTS } from '../karma/karmaConfig';
import KarmaLadderTooltip from '../karma/KarmaLadderTooltip';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function StatCard({ label, value, sub, empty, children }) {
  return (
    <div style={{
      flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 16,
      padding: '20px 16px', textAlign: 'center',
      border: '0.5px solid rgba(255,255,255,0.08)',
    }}>
      {children ? children : (
        <>
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
        </>
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

  const karmaInfo = getKarmaDisplayInfo(karma);

  return (
    <div style={{
      background: 'linear-gradient(180deg, #0d1117 0%, #0a1a6e 60%, #0821A5 100%)',
      padding: '48px 24px 36px',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }} className="alumni-hero-stats">
          <StatCard>
            <KarmaLadderTooltip
              tierName={karmaInfo.tierName}
              points={karmaInfo.points}
              pointsToNext={karmaInfo.pointsToNext}
              nextTierName={karmaInfo.nextTierName}
              variant="alumni"
              dark={true}
            />
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#f4f0e8', marginTop: 4 }}>
              Karma
            </p>
          </StatCard>
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
          <ProgressStep label="Answer a Question" points={KARMA_ACTION_POINTS.answer} completed={hasAnswered} />
          <ProgressStep label="Make an Introduction" points={KARMA_ACTION_POINTS.referral_given} completed={hasIntro} />
          <ProgressStep label="Complete Your Profile" points={KARMA_ACTION_POINTS.best_answer} completed={profileComplete} />
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