import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INTER = "'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SHADOW_MD = '0 4px 16px rgba(109,40,217,0.12), 0 1px 4px rgba(0,0,0,0.06)';

// Pre-launch, the founder IS the brand. This block surfaces Jill's face (via
// initials until a real headshot is dropped in), her origin story, and a
// LinkedIn link — the highest-trust signal available before beta stories exist.
export default function FounderBlock() {
  return (
    <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
      <Reveal>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Meet the founder</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Real headshot slot — gradient initials until Jill's photo is uploaded */}
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 30, fontWeight: 900, color: '#fff', marginBottom: 16, boxShadow: '0 8px 24px rgba(109,40,217,0.30)' }} aria-label="Jill Osinoff, founder">
              JO
            </div>
            <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: TEXT, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Jill Osinoff</h2>
            <p style={{ fontFamily: SF, fontSize: 15, color: INDIGO, fontWeight: 700, margin: '0 0 10px' }}>Founder, College Fast Forward</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
              {['UF Mom', 'Former Professional Recruiter'].map((badge) => (
                <span key={badge} style={{ fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO_DIM, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '5px 14px' }}>{badge}</span>
              ))}
            </div>

            <blockquote style={{ fontFamily: INTER, fontSize: 'clamp(16px, 3vw, 19px)', color: TEXT2, lineHeight: 1.75, margin: '0 0 24px', fontStyle: 'italic', borderLeft: `4px solid ${INDIGO}`, paddingLeft: 20, textAlign: 'left', maxWidth: 560 }}>
              &ldquo;As a former recruiter, I watched brilliant students burn out beating automated HR software just to get a foot in the door. And as a UF mom, I watched the same students give up. I built CLIFF to give every student the advocate my own network gave my kids — an agent that works overnight, opens doors, and turns &lsquo;who you know&rsquo; into something you can actually use.&rdquo;
            </blockquote>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a
                href="https://www.linkedin.com/in/jillosinoff"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, borderRadius: 999, padding: '12px 24px', textDecoration: 'none', boxShadow: '0 8px 28px rgba(109,40,217,0.30)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
                Connect with Jill on LinkedIn
              </a>
              <a href="#/about" style={{ display: 'inline-flex', alignItems: 'center', fontFamily: SF, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '12px 24px', textDecoration: 'none' }}>Read our story →</a>
            </div>

            <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '20px 0 0', lineHeight: 1.5 }}>
              Pre-launch, the founder is the proof. No venture backing, no hype — just a recruiter and a parent who refused to watch another student get ghosted.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}