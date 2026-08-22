import { useState, useEffect } from 'react';
import { getTrustContext } from '@/functions/getTrustContext';
import { computeVerdict } from './workspaceNextStep';
import OutcomeTimeline from '@/components/workspace/OutcomeTimeline';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

const VERDICT_STYLE = {
  pursue: { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
  stretch: { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
  skip: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
};

// Strip any backend reason that contradicts the verdict (e.g. "networking won't
// move the needle") so the Why-this? copy can never argue with the badge.
const CONTRADICTS = /networking won't|move the needle|don't.*network|not worth networking/i;
const cleanReasons = (rs = []) => rs.filter(r => !CONTRADICTS.test(String(r)));

// CLIFF Trust Engine panel: "Why this?" reasoning, "Why not the others?",
// confidence label (never a number), what changed, and the outcome timeline.
export default function TrustPanel({ job, fit, fitLoading }) {
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
  const verdict = computeVerdict(fit);
  const vs = VERDICT_STYLE[verdict.tone] || VERDICT_STYLE.stretch;
  const isSkip = verdict.key === 'skip';
  const reasons = cleanReasons(ctx.reasons);
  const gaps = fit?.gaps || [];

  return (
    <>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setOpen(v => !v)} style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto' }}>
            💡 Why this? {open ? '▾' : '▸'}
          </button>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: vs.bg, border: `1px solid ${vs.border}`, color: vs.color, borderRadius: 999, padding: '4px 12px' }}>
            {verdict.icon} {verdict.word}
          </span>
        </div>

        {open && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              {isSkip ? 'Why you may want to pass:' : 'Why CLIFF surfaced this:'}
            </p>
            {(isSkip && reasons.length === 0 ? ['The fit gaps outweigh the upside for your profile right now.'] : reasons).map((r, i) => (
              <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#374151', margin: '0 0 6px', lineHeight: 1.55 }}>• {r}</p>
            ))}

            {!isSkip && gaps.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#b45309', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gaps to watch</p>
                {gaps.slice(0, 3).map((g, i) => (
                  <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#4b5563', margin: '0 0 4px', lineHeight: 1.5 }}>• {g}</p>
                ))}
              </div>
            )}

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