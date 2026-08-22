import { useState, useEffect } from 'react';
import { getTrustContext } from '@/functions/getTrustContext';
import { computeVerdict } from './workspaceNextStep';
import OutcomeTimeline from '@/components/workspace/OutcomeTimeline';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

// Keep the fit read short — one or two sentences, never an essay.
const shortSummary = (t = '') => {
  const parts = String(t).match(/[^.!?]+[.!?]?/g) || [];
  return parts.slice(0, 2).join('').trim();
};

// Strip any backend reason that contradicts the verdict (e.g. "networking won't
// move the needle") so the Why-this? copy can never argue with the badge or the
// Apply CTA. For non-skip roles we also drop "research before deciding" language
// that would soften the user into not applying.
const CONTRADICTS = /networking won't|move the needle|don't.*network|not worth networking/i;
const SOFTENS_APPLY = /before deciding|hold off|consider passing|maybe don't|reconsider|not worth|research.*before.*apply|wait.*before.*apply|reconsider.*whether/i;
const cleanReasons = (rs = [], isSkip) =>
  rs.filter(r => {
    const s = String(r);
    if (CONTRADICTS.test(s)) return false;
    if (!isSkip && SOFTENS_APPLY.test(s)) return false;
    return true;
  });

// Single combined "Fit & why" block: intro, what you bring, gaps (one place),
// and a softened "Why CLIFF surfaced this." Keeps "Why not the others?" collapsed.
export default function TrustPanel({ job, fit, fitLoading, error }) {
  const [ctx, setCtx] = useState(null);
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

  const verdict = computeVerdict(fit);
  const isSkip = verdict.key === 'skip';
  const reasons = cleanReasons(ctx?.reasons || [], isSkip);
  const gaps = fit?.gaps || [];

  return (
    <>
      <div style={card}>
        <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>Job Fit</h3>

        {fitLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7c3aed', fontFamily: dm, fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, border: '2px solid #ddd6fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
            CLIFF is analyzing how this job fits you…
            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : error || !fit ? (
          <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: 0 }}>
            CLIFF couldn't analyze this job right now — you can still prepare your application below.
          </p>
        ) : (
          <>
            <p style={{ fontFamily: dm, fontSize: 14, color: '#1f2937', lineHeight: 1.65, margin: '0 0 14px' }}>{shortSummary(fit.why_match)}</p>

            {fit.matching_qualifications?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#15803d', margin: '0 0 6px' }}>✓ WHAT YOU ALREADY BRING</p>
                {fit.matching_qualifications.slice(0, 3).map((q, i) => (
                  <p key={i} style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 4px', lineHeight: 1.5 }}>• {q}</p>
                ))}
              </div>
            )}

            {gaps.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#b45309', margin: '0 0 6px' }}>⚠ GAPS TO WATCH</p>
                {gaps.slice(0, 3).map((g, i) => (
                  <p key={i} style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 4px', lineHeight: 1.5 }}>• {g}</p>
                ))}
              </div>
            )}

            {reasons.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
                  {isSkip ? 'Why you may want to pass:' : 'Why CLIFF surfaced this:'}
                </p>
                {reasons.map((r, i) => (
                  <p key={i} style={{ fontFamily: dm, fontSize: 12.5, color: '#374151', margin: '0 0 4px', lineHeight: 1.55 }}>• {r}</p>
                ))}
              </div>
            )}

            {fit.deadline && (
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#dc2626', margin: '12px 0 0' }}>⏰ Application deadline: {fit.deadline}</p>
            )}

            {(ctx?.why_not || []).length > 0 && (
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
          </>
        )}
      </div>

      <OutcomeTimeline timeline={ctx?.timeline || []} />
    </>
  );
}