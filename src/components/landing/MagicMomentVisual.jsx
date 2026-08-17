import { useEffect, useRef, useState } from 'react';
import { Check, Linkedin, Copy, FileText, Sparkles } from 'lucide-react';

// A realistic "completed free cycle" product card for the homepage hero.
// Shows the Magic Moment result — a strong-fit job, a tailored resume
// preview, real alumni insiders, and a ready-to-send warm outreach draft —
// so a new student instantly sees exactly what CLIFF gives them.

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const INDIGO = '#6d28d9';
const INDIGO_DIM = '#5b21b6';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const SHADOW_LG = '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)';

const PLAN = [
  { label: 'Target job', done: true },
  { label: 'Tailor resume', done: true },
  { label: 'Find alumni', done: true },
  { label: 'Draft outreach', done: false },
];

const ALUMNI = [
  { name: 'Jordan Avery', title: 'Brand Marketing Manager', note: 'From your school · Possible connection', initials: 'JA' },
  { name: 'Priya Shah', title: 'Senior Recruiter', note: 'From your school', initials: 'PS' },
];

const OUTREACH = "Hey Jordan — I'm a marketing student and just applied to a role at Nike. Saw you work on the brand side and would love any advice if you have a sec. Thanks either way.";

export default function MagicMomentVisual() {
  const rootRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  // Play the assembly sequence once when the card first scrolls into view,
  // then hold on the completed state (no continuous looping).
  useEffect(() => {
    if (playing) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setPlaying(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [playing]);

  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
      <div ref={rootRef} className={`mmv-card ${playing ? 'mmv-playing' : ''}`} style={{
        background: '#fff', borderRadius: 20, boxShadow: SHADOW_LG,
        border: '1px solid #f1e9ff', padding: '18px 16px', fontFamily: SF,
        position: 'relative', overflow: 'hidden',
      }}>
        <style>{`
          @keyframes mmv-job {
            0%, 3.75% { opacity: 0; transform: translateY(10px); }
            10% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes mmv-resume {
            0%, 11.25% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes mmv-alumni1 {
            0%, 21.25% { opacity: 0; transform: translateY(10px); }
            30% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes mmv-alumni2 {
            0%, 31.25% { opacity: 0; transform: translateY(10px); }
            40% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes mmv-outreach-anim {
            0%, 41.25% { opacity: 0; transform: translateY(10px); }
            62.5% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes mmv-pulse {
            0%, 62.5% { transform: scale(1); box-shadow: 0 6px 16px rgba(109,40,217,0.30); }
            67.5% { transform: scale(1.06); box-shadow: 0 12px 26px rgba(109,40,217,0.45); }
            72.5%, 100% { transform: scale(1); box-shadow: 0 6px 16px rgba(109,40,217,0.30); }
          }
          .mmv-card .mmv-a-job,
          .mmv-card .mmv-a-resume,
          .mmv-card .mmv-a-alumni1,
          .mmv-card .mmv-a-alumni2,
          .mmv-card .mmv-a-outreach { opacity: 0; transform: translateY(10px); }
          .mmv-card.mmv-playing .mmv-a-job { animation: mmv-job 8s ease both; }
          .mmv-card.mmv-playing .mmv-a-resume { animation: mmv-resume 8s ease both; }
          .mmv-card.mmv-playing .mmv-a-alumni1 { animation: mmv-alumni1 8s ease both; }
          .mmv-card.mmv-playing .mmv-a-alumni2 { animation: mmv-alumni2 8s ease both; }
          .mmv-card.mmv-playing .mmv-a-outreach { animation: mmv-outreach-anim 8s ease both; }
          .mmv-card.mmv-playing .mmv-a-pulse { animation: mmv-pulse 8s ease both; }
          @media (max-width: 600px) {
            .mmv-card { padding: 20px 16px !important; }
            .mmv-outreach { padding: 14px !important; }
            .mmv-alumni-list { gap: 10px !important; }
            .mmv-alumni-row { padding: 11px !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .mmv-a-job, .mmv-a-resume, .mmv-a-alumni1, .mmv-a-alumni2, .mmv-a-outreach, .mmv-a-pulse {
              animation: none !important; opacity: 1 !important; transform: none !important;
            }
          }
        `}</style>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header: free cycle + plan progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '4px 10px', fontFamily: SF, fontSize: 10, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Sparkles size={11} /> Your free cycle
          </span>
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO_DIM }}>3 of 4 done</span>
        </div>

        {/* Plan steps */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {PLAN.map((p) => (
            <div key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: p.done ? INDIGO_LIGHT : '#fff', border: `1px solid ${p.done ? INDIGO_BORDER : '#e2e8f0'}`, borderRadius: 999, padding: '4px 9px' }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: p.done ? GRAD_INDIGO : 'transparent', border: p.done ? 'none' : '1.5px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {p.done ? <Check size={9} color="#fff" strokeWidth={4} /> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: TEXT3 }} />}
              </span>
              <span style={{ fontFamily: SF, fontSize: 10.5, fontWeight: 700, color: p.done ? INDIGO_DIM : TEXT3 }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Job block */}
        <div className="mmv-a-job" style={{ background: '#faf7ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: GRAD_INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>N</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.2 }}>Marketing Intern</p>
              <p style={{ fontFamily: SF, fontSize: 12, fontWeight: 600, color: INDIGO_DIM, margin: '2px 0 0' }}>Nike · Summer 2026</p>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 999, padding: '3px 8px', fontFamily: SF, fontSize: 10, fontWeight: 800, color: '#15803d', flexShrink: 0 }}>
              <Check size={10} strokeWidth={4} /> Strong fit
            </span>
          </div>
          <p style={{ fontFamily: SF, fontSize: 11.5, color: TEXT2, margin: 0, lineHeight: 1.45 }}>Matches your marketing target in your preferred location.</p>
        </div>

        {/* Tailored resume snippet */}
        <div className="mmv-a-resume" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <FileText size={12} /> Tailored for this role
            </span>
            <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '2px 8px' }}>92% match</span>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 11px' }}>
            <p style={{ fontFamily: SF, fontSize: 12.5, fontWeight: 800, color: TEXT, margin: '0 0 2px' }}>Maya Rodriguez</p>
            <p style={{ fontFamily: SF, fontSize: 10.5, color: TEXT3, margin: '0 0 8px' }}>State University · Marketing, Class of 2026</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontFamily: SF, fontSize: 11, color: TEXT2, margin: 0, lineHeight: 1.4 }}>• Led campus brand campaign — +28% engagement</p>
              <p style={{ fontFamily: SF, fontSize: 11, color: TEXT2, margin: 0, lineHeight: 1.4 }}>• Grew org Instagram to 12k followers</p>
            </div>
          </div>
        </div>

        {/* Alumni cards */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>Alumni at Nike</p>
          <div className="mmv-alumni-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ALUMNI.map((a, i) => (
              <div key={a.name} className={`mmv-alumni-row ${i === 0 ? 'mmv-a-alumni1' : 'mmv-a-alumni2'}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faf7ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '9px 10px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: GRAD_INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{a.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: SF, fontSize: 12.5, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.2 }}>{a.name}</p>
                  <p style={{ fontFamily: SF, fontSize: 11, color: TEXT2, margin: '1px 0 0', lineHeight: 1.3 }}>{a.title}</p>
                  <p style={{ fontFamily: SF, fontSize: 10, color: INDIGO_DIM, fontWeight: 700, margin: '2px 0 0' }}>{a.note}</p>
                </div>
                <Linkedin size={16} color={INDIGO} style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Outreach draft */}
        <div className="mmv-outreach mmv-a-outreach" style={{ background: '#fff', border: `1.5px solid ${INDIGO}`, borderRadius: 14, padding: 12, boxShadow: '0 6px 18px rgba(109,40,217,0.10)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            <Check size={12} strokeWidth={4} /> Warm outreach · ready to send
          </span>
          <div style={{ background: '#faf7ff', borderRadius: 10, padding: '10px 11px', marginBottom: 10, marginTop: 8 }}>
            <p style={{ fontFamily: SF, fontSize: 11.5, color: TEXT, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{OUTREACH}</p>
          </div>
          <div className="mmv-a-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: GRAD_INDIGO, color: '#fff', borderRadius: 999, padding: '9px 16px', fontFamily: SF, fontSize: 12.5, fontWeight: 800, boxShadow: '0 6px 16px rgba(109,40,217,0.30)' }}>
            <Copy size={13} /> Copy & send →
          </div>
        </div>
      </div>
    </div>
  );
}