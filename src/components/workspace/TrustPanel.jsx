import { useState, useEffect } from 'react';
import { getTrustContext } from '@/functions/getTrustContext';
import OutcomeTimeline from '@/components/workspace/OutcomeTimeline';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

const CONF_STYLE = {
  'Very confident': { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
  'Confident': { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
  'Worth considering': { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
  'Not recommended': { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
};

// CLIFF Trust Engine panel: "Why this?" reasoning, "Why not the others?",
// confidence label (never a number), what changed, and the outcome timeline.
export default function TrustPanel({ job }) {
  const [ctx, setCtx] = useState(null);
  const [open, setOpen] = useState(false);
  const [showWhyNot, setShowWhyNot] = useState(false);

  const company = job.company || '';
  const role = job.role || job.job_title || '';

  useEffect(() => {
    let cancelled = false;
    getTrustContext({ companyName: company, roleTitle: role })
      .then(res => { if (!cancelled) setCtx(res?.data || res); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [company]);

  if (!ctx || ctx.error) return null;
  const confStyle = CONF_STYLE[ctx.confidence] || CONF_STYLE['Worth considering'];

  return (
    <>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setOpen(v => !v)} style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto' }}>
            💡 Why this? {open ? '▾' : '▸'}
          </button>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: confStyle.bg, border: `1px solid ${confStyle.border}`, color: confStyle.color, borderRadius: 999, padding: '4px 12px' }}>
            {ctx.confidence}
          </span>
        </div>

        {open && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>I recommended this because:</p>
            {(ctx.reasons || []).map((r, i) => (
              <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#374151', margin: '0 0 6px', lineHeight: 1.55 }}>• {r}</p>
            ))}

            {(ctx.changes || []).length > 0 && (
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '10px 14px', marginTop: 10 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>What changed?</p>
                {ctx.changes.map((c, i) => (
                  <p key={i} style={{ fontFamily: dm, fontSize: 12, color: '#4c1d95', margin: '0 0 4px', lineHeight: 1.5 }}>↻ {c.text}</p>
                ))}
              </div>
            )}

            {(ctx.why_not || []).length > 0 && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setShowWhyNot(v => !v)} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto' }}>
                  Why not the others? {showWhyNot ? '▾' : '▸'}
                </button>
                {showWhyNot && (
                  <div style={{ marginTop: 6 }}>
                    <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 6px' }}>I passed on these so you could focus here:</p>
                    {ctx.why_not.map((w, i) => (
                      <p key={i} style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 4px', lineHeight: 1.5 }}>
                        ✕ {w.company ? <strong>{w.company}{w.role ? ` — ${w.role}` : ''}</strong> : null}{w.company ? ': ' : ''}{w.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <OutcomeTimeline timeline={ctx.timeline || []} />
    </>
  );
}