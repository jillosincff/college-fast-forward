import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

/* ── SVG Icons ── */
function ChainLinkSVG() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 12l4-4M6 10L4 12a2.83 2.83 0 004 4l2-2M10 6l2-2a2.83 2.83 0 014 4l-2 2" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ChatBubbleSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7a5 5 0 01-5 5H3l1.5-1.5A5 5 0 1112 7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function PeopleSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1 11.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10.5" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.6"/><path d="M11 8c1.1 0 2 .9 2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/></svg>;
}
function ProfileSVG() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 12.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}

function getKarmaLevel(pts) {
  if (pts >= 300) return 'Champion';
  if (pts >= 150) return 'Advocate';
  if (pts >= 50) return 'Connector';
  return 'Newcomer';
}

export default function ParentDashboardHero({ user, data, onLinkStudentClick }) {
  const [tickerActivity, setTickerActivity] = useState(null);

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

  // Load recent activity for ticker
  useEffect(() => {
    (async () => {
      try {
        const answers = await base44.entities.Answer.list('-created_date', 5);
        const recent = (answers || []).filter(a => {
          const age = Date.now() - new Date(a.created_date).getTime();
          return age < 48 * 60 * 60 * 1000 && a.answerer_persona === 'parent';
        });
        if (recent.length > 0) {
          const a = recent[0];
          const ago = Math.round((Date.now() - new Date(a.created_date).getTime()) / (1000 * 60 * 60));
          setTickerActivity({
            name: a.answerer_name?.split(' ')[0] || 'A parent',
            timeAgo: ago < 1 ? 'just now' : `${ago}h ago`,
          });
        }
      } catch {}
    })();
  }, []);

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

        {/* Quick Actions */}
        <div className="pd-quick-actions" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {[
            { icon: <ChatBubbleSVG />, label: 'Answer a Question', karma: '+15' },
            null, // divider
            { icon: <PeopleSVG />, label: 'Make an Introduction', karma: '+10' },
            null,
            { icon: <ProfileSVG />, label: 'Complete Your Profile', karma: '+25' },
          ].map((item, i) => {
            if (!item) return <div key={`d${i}`} style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: 'rgba(244,240,232,0.5)', transition: 'color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f4f0e8'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.5)'; }}
              >
                {item.icon}
                <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400 }}>{item.label}</span>
                <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: orange, background: 'rgba(232,93,32,0.15)', borderRadius: 100, padding: '1px 6px' }}>{item.karma}</span>
              </div>
            );
          })}
        </div>

        {/* Activity Ticker */}
        {tickerActivity && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', animation: 'pdPulse 2s infinite' }} />
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.4)', margin: 0 }}>
              <span style={{ fontWeight: 500, color: 'rgba(244,240,232,0.65)' }}>{tickerActivity.name}</span> answered a student question · {tickerActivity.timeAgo}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}