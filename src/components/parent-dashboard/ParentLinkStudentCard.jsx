import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

function ChainSVG({ color = '#fff', size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 18 18" fill="none"><path d="M7 11l4-4M5 9L3.5 10.5a2.5 2.5 0 003.5 3.5L8.5 12.5M9.5 5.5L11 4a2.5 2.5 0 013.5 3.5L13 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function getBoostMultiplier(karma) {
  if (karma >= 300) return '2.5×';
  if (karma >= 150) return '2.0×';
  if (karma >= 50) return '1.4×';
  if (karma > 0) return '1.1×';
  return '1.0×';
}

function getNextMilestone(karma) {
  if (karma >= 300) return null;
  if (karma >= 150) return { name: 'Champion', target: 300, multiplier: '2.5×' };
  if (karma >= 50) return { name: 'Advocate', target: 150, multiplier: '2.0×' };
  return { name: 'Connector', target: 50, multiplier: '1.4×' };
}

function getKarmaProgress(karma) {
  if (karma >= 300) return 100;
  if (karma >= 150) return ((karma - 150) / 150) * 100;
  if (karma >= 50) return ((karma - 50) / 100) * 100;
  return (karma / 50) * 100;
}

function getDisplayName(student) {
  const fn = student?.full_name || student?.email?.split('@')[0] || 'Student';
  if (fn.includes(',')) {
    const parts = fn.split(',').map(s => s.trim());
    return `${parts[1] || ''} ${parts[0] || ''}`.trim();
  }
  return fn;
}

function getFirstName(student) {
  return getDisplayName(student).split(' ')[0];
}

/* ── STATE A: NOT LINKED ── */
function UnlinkedCard({ onLinkClick }) {
  return (
    <div style={{
      background: '#f9f7f4', border: '0.5px solid rgba(232,93,32,0.12)',
      borderRadius: 14, padding: '20px 20px 16px', marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: orange,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ChainSVG color="#fff" size={18} />
        </div>
        <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 17, color: '#1a1a1a' }}>
          Link Your Student to Unlock Boosts
        </h3>
      </div>

      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.65, marginBottom: 14 }}>
        Every time you help a student in the network, your own student's questions move up in the feed. More karma = higher boost multiplier = more visibility for them.
      </p>

      <button
        onClick={onLinkClick}
        style={{
          width: '100%', padding: 12, borderRadius: 100, border: 'none',
          background: orange, color: '#fff',
          fontFamily: dmSans, fontSize: 14, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = orangeHover; }}
        onMouseLeave={e => { e.currentTarget.style.background = orange; }}
      >
        Find &amp; Link Your Student →
      </button>

      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', textAlign: 'center', marginTop: 8 }}>
        Search by name or email. If they haven't signed up yet, we'll connect you when they join.
      </p>
    </div>
  );
}

/* ── STATE B: LINKED ── */
function LinkedCard({ linkedStudent, familyKarma, boostsThisWeek, onChangeClick }) {
  const name = getDisplayName(linkedStudent);
  const initial = name.charAt(0).toUpperCase();
  const major = linkedStudent.major || '';
  const year = linkedStudent.graduation_year || linkedStudent.year || '';
  const university = linkedStudent.university || 'University of Florida';
  const karma = familyKarma || 0;
  const multiplier = getBoostMultiplier(karma);
  const next = getNextMilestone(karma);
  const progress = getKarmaProgress(karma);

  return (
    <div style={{
      background: '#fff', borderLeft: `4px solid ${orange}`,
      borderRadius: 14, padding: '18px 20px', marginBottom: 14,
      border: '0.5px solid rgba(0,0,0,0.06)', borderLeftWidth: 4, borderLeftColor: orange, borderLeftStyle: 'solid',
    }}>
      {/* Label */}
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: '#aaa', marginBottom: 10,
      }}>Your Student</p>

      {/* Student row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: orange,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0,
        }}>{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 1 }}>{name}</p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
            {university}{major ? ` · ${major}` : ''}{year ? ` · Class of ${year}` : ''}
          </p>
        </div>
      </div>

      {/* Linked badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'rgba(76,175,80,0.08)', borderRadius: 100, padding: '3px 10px', marginBottom: 14,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50' }} />
        <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#2e7d32' }}>Linked</span>
      </div>

      {/* Boost multiplier block */}
      <div style={{
        background: '#f9f7f4', borderRadius: 10, padding: '14px 16px', marginBottom: 12,
      }}>
        <p style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: '#aaa', marginBottom: 6,
        }}>Boost Multiplier</p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: orange }}>
            {multiplier}
          </span>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
            Based on your Family Karma level. Answer more questions to increase it.
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: orange, borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>

        {next && (
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa' }}>
            Reach <span style={{ fontWeight: 500, color: '#888' }}>{next.name}</span> to unlock {next.multiplier}
          </p>
        )}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa' }}>
          {boostsThisWeek > 0 ? `${boostsThisWeek} boosts applied this week` : 'No boosts applied yet this week'}
        </span>
        <button
          onClick={onChangeClick}
          style={{
            background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, fontWeight: 400,
            color: orange, cursor: 'pointer', padding: 0, minHeight: 'auto', width: 'auto',
          }}
        >
          Change Student →
        </button>
      </div>
    </div>
  );
}

export default function ParentLinkStudentCard({ linkedStudent, onLinkClick, familyKarma, boostsThisWeek }) {
  if (linkedStudent) {
    return (
      <LinkedCard
        linkedStudent={linkedStudent}
        familyKarma={familyKarma}
        boostsThisWeek={boostsThisWeek || 0}
        onChangeClick={onLinkClick}
      />
    );
  }

  return <UnlinkedCard onLinkClick={onLinkClick} />;
}