import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TIER_DISPLAY } from '@/lib/cliffVerdict';

const VERDICT_HEADLINE = {
  pursue: '✅ Pursue — I think this is worth your time.',
  consider: '🤔 Worth a shot — solid, not urgent.',
  skip: "⚠️ I'd skip this one.",
};

// Opinionated CLIFF take on a job card: tier line + expandable reasoning.
export default function CliffVerdictBadge({ verdict, companyName, jobTitle }) {
  const [open, setOpen] = useState(false);
  if (!verdict) return null;
  const t = TIER_DISPLAY[verdict.tier] || TIER_DISPLAY.low;

  const toggle = () => {
    if (!open) {
      try { base44.analytics.track({ eventName: 'match_reasoning_expanded', properties: { company: companyName || '', role: jobTitle || '', tier: verdict.tier } }); } catch {}
    }
    setOpen(v => !v);
  };

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-extrabold rounded-full px-2 py-0.5 border"
          style={{ background: t.bg, borderColor: t.border, color: t.text }}
        >
          {t.icon} {t.label}
        </span>
        <span className="text-[11px] text-gray-500 font-medium">{t.line}</span>
        <button
          onClick={toggle}
          className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer ml-auto"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          CLIFF's take {open ? '▴' : '▾'}
        </button>
      </div>

      {open && (
        <div className="mt-1.5 rounded-xl border p-3" style={{ background: t.bg, borderColor: t.border }}>
          <p className="text-xs font-extrabold m-0" style={{ color: t.text }}>{VERDICT_HEADLINE[verdict.verdict]}</p>
          {verdict.reasons.length > 0 && (
            <ul className="m-0 mt-1.5 pl-4 text-[11px] text-gray-700 leading-relaxed space-y-0.5">
              {verdict.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
          {verdict.cautions.length > 0 && (
            <ul className="m-0 mt-1.5 pl-4 text-[11px] text-gray-400 leading-relaxed space-y-0.5">
              {verdict.cautions.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}