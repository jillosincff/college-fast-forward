import React from 'react';
import { playfair, dmSans, DARK_BG_ALT } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

export default function V3Numbers() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG_ALT, padding: '120px 24px 130px' }}>
      <style>{`@media(max-width:640px){.v3-stats-row{flex-direction:column !important;gap:32px !important}.v3-stats-vs{display:none !important}}`}</style>
      <div className="max-w-[700px] mx-auto text-center">
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 14, ...fadeStyle(vis, 0) }}>
          The Difference
        </p>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.02) }}>
          Most resumes never reach a human.
        </h2>

        <div style={{ width: 40, height: 2, background: '#E85D20', borderRadius: 1, margin: '0 auto 48px', ...fadeStyle(vis, 0.04) }} />

        <div className="v3-stats-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginBottom: 40, ...fadeStyle(vis, 0.08) }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(40px, 6vw, 60px)', color: '#4B5563', lineHeight: 1, marginBottom: 8 }}>1 in 250</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cold Application</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>leads to an offer</p>
          </div>

          <div className="v3-stats-vs" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: 'rgba(255,255,255,0.3)' }}>vs</div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(40px, 6vw, 60px)', color: 'var(--accent-primary, #4F8CFF)', lineHeight: 1, marginBottom: 8, transition: 'color 0.4s' }}>1 in 5</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'var(--accent-primary, #4F8CFF)', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'color 0.4s' }}>Referral</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>can lead to an interview</p>
          </div>
        </div>

        <p style={{ fontFamily: dmSans, fontSize: 17, color: '#FFFFFF', lineHeight: 1.65, ...fadeStyle(vis, 0.14) }}>
          We help your student get in front of someone who can actually open the door.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>That's the difference between being ignored and getting in the room.</span>
        </p>

        {/* Testimonial */}
        <div style={{ marginTop: 36, ...fadeStyle(vis, 0.18) }}>
          <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginBottom: 12 }}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#E85D20" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <p style={{ fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(16px, 2vw, 20px)', color: '#fff', lineHeight: 1.55, marginBottom: 8 }}>
            "My son got 3 responses in a week after using this."
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            — Parent, Class of 2026
          </p>
        </div>

        {/* CTA text link */}
        <div style={{ marginTop: 32, ...fadeStyle(vis, 0.22) }}>
          <button
            onClick={() => { const el = document.getElementById('pricing'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else window.location.hash = '#GetStarted'; }}
            onMouseEnter={e => { e.currentTarget.style.color = '#d44e14'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#E85D20'; }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 15, fontWeight: 500,
              color: '#E85D20', transition: 'color 0.2s',
              minHeight: 'auto', minWidth: 'auto', textAlign: 'center',
            }}
          >
            Try FastIQ Free for 7 Days →
          </button>
        </div>
      </div>
    </section>
  );
}