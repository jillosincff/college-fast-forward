import React from 'react';
import { playfair, dmSans, ORANGE } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';
import CTAButton from './CTAButton';

const LIGHT_BG = '#F5F5F5';
const HEADLINE_COLOR = '#1A1A1A';
const BODY_COLOR = '#333333';
const MUTED_COLOR = '#666666';

const STEPS = [
  {
    num: '01',
    title: 'FastIQ builds the plan',
    body: 'Your student enters their goals. FastIQ identifies target companies, finds alumni to contact, and writes personalized outreach — in minutes.',
    thumbnail: 'fastiq',
  },
  {
    num: '02',
    title: 'The network steps in',
    body: 'When a parent in the community is connected to someone at your student\'s target company, they get a simple nudge:',
    nudge: '"A student is targeting Nike. You know someone there. Want to make an intro?" One click. Done.',
    thumbnail: 'nudge',
  },
  {
    num: '03',
    title: 'Your student gets in the room',
    body: 'Not another application into a black hole. A real introduction to a real person who can actually open the door. That\'s the difference between being considered and being ignored.',
    thumbnail: 'outreach',
  },
];

/* ── Simplified product thumbnails ─────────────────── */
function FastIQThumbnail() {
  return (
    <div style={{ background: '#111216', borderRadius: 12, padding: '14px 16px', border: '1px solid #23252B', maxWidth: 200, margin: '0 auto 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4F8CFF" strokeWidth="2.5"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/></svg>
        <span style={{ fontFamily: dmSans, fontSize: 8, fontWeight: 700, color: '#4F8CFF', letterSpacing: '0.04em' }}>FASTIQ</span>
      </div>
      <div style={{ background: '#1A1B20', borderRadius: 6, padding: '6px 8px', marginBottom: 6 }}>
        <span style={{ fontFamily: dmSans, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>I want to work at a top brand...</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {['Nike', 'Spotify', 'Ogilvy'].map(c => (
          <span key={c} style={{ fontFamily: dmSans, fontSize: 7, color: '#E5E7EB', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '2px 6px' }}>{c}</span>
        ))}
      </div>
    </div>
  );
}

function NudgeThumbnail() {
  return (
    <div style={{ background: '#111216', borderRadius: 12, padding: '14px 16px', border: '1px solid #23252B', maxWidth: 200, margin: '0 auto 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(232,93,32,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <span style={{ fontFamily: dmSans, fontSize: 8, fontWeight: 600, color: ORANGE }}>New nudge</span>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 7, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
        "A student is targeting Nike. You know someone there..."
      </p>
    </div>
  );
}

function OutreachThumbnail() {
  return (
    <div style={{ background: '#111216', borderRadius: 12, padding: '14px 16px', border: '1px solid #23252B', maxWidth: 200, margin: '0 auto 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        <span style={{ fontFamily: dmSans, fontSize: 7, color: 'rgba(255,255,255,0.35)' }}>To:</span>
        <span style={{ fontFamily: dmSans, fontSize: 8, fontWeight: 500, color: '#E5E7EB' }}>Tyler Moreno</span>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>
        <p style={{ fontFamily: dmSans, fontSize: 7, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
          Hi Tyler, I'm a student exploring brand marketing and noticed you're at Nike...
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
        <svg width="8" height="8" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" stroke="#10B981" strokeWidth="1"/><path d="M4 7.2L6 9.2L10 5" stroke="#10B981" strokeWidth="1" strokeLinecap="round"/></svg>
        <span style={{ fontFamily: dmSans, fontSize: 7, color: '#10B981' }}>Ready to send</span>
      </div>
    </div>
  );
}

const THUMBNAILS = { fastiq: FastIQThumbnail, nudge: NudgeThumbnail, outreach: OutreachThumbnail };

export default function V3ParentPeace({ onCTA }) {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: LIGHT_BG, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-pp-grid{grid-template-columns:1fr !important}}`}</style>
      <div className="max-w-[860px] mx-auto">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: ORANGE, marginBottom: 14, ...fadeStyle(vis, 0) }}>
          How It Works
        </p>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: HEADLINE_COLOR, lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.02) }}>
          This is how College Fast Forward{' '}
          <em style={{ color: ORANGE }}>actually works.</em>
        </h2>

        <div style={{ width: 40, height: 2, background: ORANGE, borderRadius: 1, margin: '0 auto 20px', ...fadeStyle(vis, 0.04) }} />

        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 500, color: BODY_COLOR, lineHeight: 1.55, maxWidth: 640, margin: '0 auto 52px', ...fadeStyle(vis, 0.06) }}>
          AI builds the strategy. Your community opens the doors. Together, they change everything.
        </p>

        <div className="v3-pp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 48, ...fadeStyle(vis, 0.10) }}>
          {STEPS.map((s, i) => {
            const Thumb = THUMBNAILS[s.thumbnail];
            return (
              <div key={i} style={{
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 20, padding: '28px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.35)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
              >
                {/* Product thumbnail */}
                {Thumb && <Thumb />}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(232,93,32,0.08)',
                    border: '1px solid rgba(232,93,32,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {i === 0 && <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>}
                      {i === 1 && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                      {i === 2 && <><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></>}
                    </svg>
                  </div>
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#A1A1AA', letterSpacing: '0.08em' }}>{s.num}</span>
                </div>
                <h3 style={{ fontFamily: dmSans, fontWeight: 700, fontSize: 18, color: HEADLINE_COLOR, marginBottom: 14, lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: MUTED_COLOR, lineHeight: 1.65, margin: 0 }}>{s.body}</p>

                {s.nudge && (
                  <div style={{
                    marginTop: 16,
                    background: '#F9FAFB',
                    borderRadius: 14,
                    borderLeft: `3px solid ${ORANGE}`,
                    padding: '14px 16px',
                  }}>
                    <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: HEADLINE_COLOR, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                      {s.nudge}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Closing line */}
        <p className="text-center" style={{
          fontFamily: playfair, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: ORANGE, lineHeight: 1.55,
          marginBottom: 36,
          ...fadeStyle(vis, 0.16),
        }}>
          This is what College Fast Forward does. And there's nothing else like it.
        </p>

        {/* CTA */}
        <div className="flex justify-center" style={fadeStyle(vis, 0.20)}>
          <CTAButton text="Start Free — It Takes 2 Minutes" onClick={onCTA} />
        </div>
      </div>
    </section>
  );
}