import React from 'react';

/* Parent Dashboard Hero - dark gradient header */
const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

/* ── SVG Icons ── */
function ChainLinkSVG() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 12l4-4M6 10L4 12a2.83 2.83 0 004 4l2-2M10 6l2-2a2.83 2.83 0 014 4l-2 2" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}


function getKarmaLevel(pts) {
  if (pts >= 300) return 'Champion';
  if (pts >= 150) return 'Advocate';
  if (pts >= 50) return 'Connector';
  return 'Newcomer';
}

function ProgressStrip({ studentsHelped, profilePercent, introsMade }) {
  const steps = [
    { label: 'Answer a Question', karma: '+15', done: studentsHelped > 0 },
    { label: 'Make an Introduction', karma: '+50', done: introsMade > 0 },
    { label: 'Complete Your Profile', karma: '+25', done: profilePercent >= 100 },
  ];
  return (
    <div className="pd-quick-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div style={{ width: 32, height: 1, background: step.done ? orange : 'rgba(255,255,255,0.15)', margin: '0 4px', flexShrink: 0 }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: step.done ? orange : 'transparent',
              border: step.done ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: dmSans, fontSize: 9, fontWeight: 500,
              color: step.done ? '#fff' : 'rgba(244,240,232,0.4)',
              flexShrink: 0,
            }}>
              {step.done ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 6l2.5 2.5L9 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : i + 1}
            </div>
            <span style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: step.done ? 500 : 400,
              color: step.done ? orange : 'rgba(244,240,232,0.5)', whiteSpace: 'nowrap',
            }}>{step.label}</span>
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 500, color: orange,
              background: 'rgba(232,93,32,0.15)', borderRadius: 100, padding: '1px 7px',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>{step.karma}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function ParentDashboardHero({ user, data, onLinkStudentClick }) {
  const firstName = (() => {
    const fn = user?.full_name;
    if (!fn?.trim()) return 'Parent';
    if (fn.includes(',')) {
      const part = fn.split(',')[1]?.trim().split(/\s+/)[0];
      if (part) return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }
    const part = fn.trim().split(/\s+/)[0];
    return part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : 'Parent';
  })();

  const karma = data.familyKarma || 0;
  const karmaLevel = getKarmaLevel(karma);
  const hasLinkedStudent = !!data.linkedStudent;
  const studentsHelped = data.studentsHelped || 0;
  const profilePercent = [user?.company, user?.linkedin_url, user?.title || user?.job_title, user?.profile_image, user?.bio].filter(Boolean).length * 20;

  const studentFirstName = (() => {
    const s = data.linkedStudent;
    if (!s) return null;
    const fn = s.full_name;
    if (!fn?.trim()) return s.email?.split('@')[0] || null;
    if (fn.includes(',')) {
      const part = fn.split(',')[1]?.trim().split(/\s+/)[0];
      if (part?.length > 1) return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }
    const part = fn.trim().split(/\s+/)[0];
    return part?.length > 1 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : null;
  })();

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 70%, #0821A5 100%)',
      padding: '40px 32px 48px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes pdFadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pdPulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
        @media(max-width:768px){
          .pd-stats-grid { grid-template-columns: 1fr !important; }
          .pd-quick-actions { flex-wrap: wrap !important; justify-content: center !important; }
        }
      `}</style>
      {/* Radial glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse at center, rgba(232,93,32,0.08), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', animation: 'pdFadeUp 0.4s ease both' }}>
        {/* Eyebrow */}
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(244,240,232,0.4)', textAlign: 'center', marginBottom: 8,
        }}>Parent Dashboard</p>

        {/* Headline */}
        <h1 style={{ textAlign: 'center', marginBottom: 6, letterSpacing: '-0.02em' }}>
          <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: '#f4f0e8' }}>
            Welcome back,{' '}
          </span>
          <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 40px)', color: orange }}>
            {firstName}.
          </span>
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 300,
          color: 'rgba(244,240,232,0.55)', textAlign: 'center', marginBottom: 28,
        }}>
          Every action you take helps a student get closer to their career.
        </p>

        {/* Stat Cards */}
        <div className="pd-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {/* Karma */}
          <div style={{
            background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: 16, textAlign: 'center',
          }}>
            <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: karma > 0 ? orange : 'rgba(244,240,232,0.2)' }}>
              {karma > 0 ? karma : '--'}
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(244,240,232,0.5)' }}>
              Family Karma
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: 'rgba(244,240,232,0.3)', marginTop: 2 }}>
              {karmaLevel}
            </div>
          </div>

          {/* Link Student / Student Linked */}
          {!hasLinkedStudent ? (
            <div
              onClick={onLinkStudentClick}
              style={{
                background: 'rgba(232,93,32,0.15)', border: '0.5px solid rgba(232,93,32,0.4)',
                borderRadius: 14, padding: 16, textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'center' }}><ChainLinkSVG /></div>
              <div style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: orange }}>Link Your Student</div>
              <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(232,93,32,0.6)' }}>to activate boosts</div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#f4f0e8' }}>
                {studentFirstName || 'Student'}
              </div>
              <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(76,175,80,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', animation: 'pdPulse 2s infinite' }} />
                Linked · Boosts active
              </div>
            </div>
          )}

          {/* Students Helped */}
          <div style={{
            background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: 16, textAlign: 'center',
          }}>
            <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: studentsHelped > 0 ? '#f4f0e8' : 'rgba(244,240,232,0.2)' }}>
              {studentsHelped > 0 ? studentsHelped : '--'}
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(244,240,232,0.5)' }}>
              Students Helped
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: 'rgba(244,240,232,0.3)', marginTop: 2 }}>all time</div>
          </div>
        </div>

        {/* Progress Strip */}
        <ProgressStrip studentsHelped={studentsHelped} profilePercent={profilePercent} introsMade={data.introsMade || 0} />
      </div>
    </section>
  );
}