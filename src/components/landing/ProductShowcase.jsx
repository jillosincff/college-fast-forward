import Reveal from '@/components/landing/Reveal';
import { Check, Send, MapPin, Sparkles } from 'lucide-react';

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
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';

// Real, crisply-rendered product UI previews (not fake screenshots). These show
// the actual CLIFF interface — a match card with an ATS score and a warm-intro
// composer — so visitors see the product is real before they sign up.
export default function ProductShowcase({ go }) {
  return (
    <div style={{ padding: 'clamp(56px, 12vw, 96px) clamp(20px, 5vw, 40px)', background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)', borderTop: '1px solid #f1f5f9' }}>
      <Reveal>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 6vw, 40px)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 16px', fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>See it work</span>
            <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.2, letterSpacing: '-0.04em', margin: '0 0 12px' }}>
              Not a chatbot.{' '}
              <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>A career agent that ships.</span>
            </h2>
            <p style={{ fontFamily: INTER, fontSize: 'clamp(15px, 3vw, 17px)', color: TEXT2, lineHeight: 1.6, margin: '0 auto', maxWidth: 560 }}>
              Two real screens from CLIFF — the match that&rsquo;s actually worth your time, and the intro CLIFF drafts so you don&rsquo;t apply into a black hole.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(18px, 4vw, 28px)', alignItems: 'start' }}>

            {/* ── PREVIEW 1: Match card with ATS score + warm intro badge ── */}
            <div aria-label="CLIFF product preview: a job match card showing a Marketing Intern role at Nike with a 89% ATS match score and a warm intro available badge">
              <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Today&rsquo;s best move</p>
              <div style={{ background: '#fff', borderRadius: 20, boxShadow: SHADOW_LG, border: `1px solid ${INDIGO_BORDER}`, overflow: 'hidden' }}>
                {/* Company header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #000 0%, #333 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SF, fontSize: 16, fontWeight: 900, flexShrink: 0 }}>N</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>Marketing Intern</p>
                    <p style={{ fontFamily: SF, fontSize: 13, color: TEXT2, margin: '2px 0 0' }}>Nike</p>
                  </div>
                </div>
                {/* Tags */}
                <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '5px 12px', alignSelf: 'flex-start' }}>
                    <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: '#059669' }}>ATS match 89%</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '5px 12px', alignSelf: 'flex-start' }}>
                    <Sparkles size={12} color={INDIGO} />
                    <span style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: INDIGO }}>Warm intro available · 2 alumni</span>
                  </div>
                </div>
                {/* Location + CLIFF verdict */}
                <div style={{ padding: '0 20px 16px' }}>
                  <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} /> Beaverton, OR · Summer 2026</p>
                  <div style={{ background: 'rgba(245,243,255,0.6)', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 4px' }}>CLIFF&rsquo;s verdict</p>
                    <p style={{ fontFamily: INTER, fontSize: 13.5, color: TEXT, margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
                      <span style={{ color: '#059669', fontWeight: 800 }}>Pursue.</span> Strong fit with your brand coursework and the campus club you lead. Apply this week — deadline is Friday.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── PREVIEW 2: Warm intro composer ── */}
            <div aria-label="CLIFF product preview: a warm introduction message drafted to an alumni contact at Nike, ready to send">
              <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 800, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Warm intro, drafted for you</p>
              <div style={{ background: '#fff', borderRadius: 20, boxShadow: SHADOW_LG, border: `1px solid ${INDIGO_BORDER}`, overflow: 'hidden' }}>
                {/* Recipient */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SF, fontSize: 14, fontWeight: 800, flexShrink: 0 }}>SK</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0 }}>Sarah K.</p>
                    <p style={{ fontFamily: SF, fontSize: 12, color: TEXT2, margin: '2px 0 0' }}>Brand Marketing Manager, Nike · UF &rsquo;19</p>
                  </div>
                  <span style={{ marginLeft: 'auto', fontFamily: SF, fontSize: 11, fontWeight: 700, color: '#059669', background: 'rgba(16,185,129,0.10)', padding: '3px 10px', borderRadius: 100, border: '1px solid rgba(16,185,129,0.25)' }}>Alum match</span>
                </div>
                {/* Drafted message */}
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontFamily: INTER, fontSize: 13.5, color: TEXT, lineHeight: 1.6, margin: '0 0 12px' }}>
                    Hi Sarah — I&rsquo;m a UF junior studying brand marketing. CLIFF matched me to the Marketing Intern role at Nike and flagged you&rsquo;d be open to a quick chat. Your work on the &ldquo;You Can&rsquo;t Win&rdquo; campaign is exactly the kind of brand storytelling I want to learn.
                  </p>
                  <p style={{ fontFamily: INTER, fontSize: 13.5, color: TEXT, lineHeight: 1.6, margin: '0 0 12px' }}>
                    Would you have 15 minutes in the next two weeks? I&rsquo;d love your honest take on breaking into brand marketing at Nike.
                  </p>
                  <p style={{ fontFamily: INTER, fontSize: 13.5, color: TEXT2, margin: '0 0 4px' }}>Thanks for even considering it,</p>
                  <p style={{ fontFamily: INTER, fontSize: 13.5, color: TEXT, margin: '0 0 16px' }}>— Maya</p>
                </div>
                {/* Action bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: '#f8f9ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: INDIGO, fontFamily: SF, fontSize: 12, fontWeight: 700 }}>
                    <Check size={14} /> CLIFF-ready
                  </div>
                  <button onClick={go} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SF, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', minHeight: 40, boxShadow: '0 4px 14px rgba(109,40,217,0.30)' }}>
                    <Send size={13} /> Send intro
                  </button>
                </div>
              </div>
            </div>

          </div>

          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', color: TEXT2, textAlign: 'center', margin: 'clamp(24px, 6vw, 32px) 0 0', lineHeight: 1.6 }}>
            Every other tool stops at &ldquo;here are jobs.&rdquo;{' '}
            <span style={{ fontWeight: 800, color: TEXT }}>CLIFF writes the intro that gets you the reply.</span>
          </p>
        </div>
      </Reveal>
    </div>
  );
}