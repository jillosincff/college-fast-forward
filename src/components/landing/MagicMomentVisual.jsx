import { useEffect, useRef, useState } from 'react';
import { Check, FileText, Sparkles } from 'lucide-react';

// A realistic "guided cycle" product card for the homepage hero.
// Shows the core of a guided job search — a strong-fit target job, a tailored
// resume, and a clear next step. Warm intros are demoted to a single muted
// line so the visual center is the plan + resume + next step, not networking.

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
  { label: 'Next step', done: false },
];

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
          @keyframes mmv-chip {
            0%, 21.25% { opacity: 0; transform: translateY(10px); }
            30% { opacity: 1; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .mmv-card .mmv-a-job,
          .mmv-card .mmv-a-resume,
          .mmv-card .mmv-a-chip { opacity: 0; transform: translateY(10px); }
          .mmv-card.mmv-playing .mmv-a-job { animation: mmv-job 8s ease both; }
          .mmv-card.mmv-playing .mmv-a-resume { animation: mmv-resume 8s ease both; }
          .mmv-card.mmv-playing .mmv-a-chip { animation: mmv-chip 8s ease both; }
          @media (max-width: 600px) {
            .mmv-card { padding: 20px 16px !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .mmv-a-job, .mmv-a-resume, .mmv-a-chip {
              animation: none !important; opacity: 1 !important; transform: none !important;
            }
          }
        `}</style>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header: guided cycle + plan progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '4px 10px', fontFamily: SF, fontSize: 10, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Sparkles size={11} /> Your guided cycle
          </span>
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO_DIM }}>2 of 3 done</span>
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
        <div className="mmv-a-resume" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '10px 12px', marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <FileText size={12} /> Resume tailored
          </span>
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 800, color: INDIGO, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '2px 8px' }}>92% match</span>
        </div>

        {/* Warm intros — demoted to a single muted line, not a hero block */}
        <div className="mmv-a-chip" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SF, fontSize: 11, fontWeight: 600, color: TEXT3, padding: '0 2px' }}>
          <Sparkles size={11} /> Warm intros unlock later
        </div>
      </div>
    </div>
  );
}