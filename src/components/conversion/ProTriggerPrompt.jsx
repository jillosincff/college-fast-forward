const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Outcome-based copy per approved trigger — never generic "upgrade now" messaging.
const COPY = {
  second_application: { headline: "I know exactly how I'd prepare this one.", cta: 'Let CLIFF Take It From Here' },
  connection_found: { headline: 'I found a possible path into this company.', cta: 'Review With CLIFF Pro' },
  interview_prep: { headline: 'Your company-specific practice session is ready.', cta: 'Practice With CLIFF Pro' },
  proactive_discovery: { headline: 'I found something that changes your plan.', cta: 'Keep CLIFF Working' },
  tailored_resume: { headline: 'Your full tailored resume is ready to generate.', cta: 'Keep CLIFF Working' },
  follow_up_draft: { headline: 'Your follow-up draft is ready.', cta: 'Keep CLIFF Working' },
  usage_limit: { headline: "You've used today's free CLIFF guidance.", cta: 'Keep CLIFF Working' },
};

// Contextual Pro prompt card. Render only when useProPrompt says eligible.
export default function ProTriggerPrompt({ trigger, detail, onCta, onDismiss }) {
  const copy = COPY[trigger] || { headline: 'CLIFF is ready to handle this for you.', cta: 'Keep CLIFF Working' };
  return (
    <div style={{ background: '#faf9ff', border: '1.5px solid #c4b5fd', borderRadius: 16, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#6d28d9', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 100, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          CLIFF Pro
        </span>
        <button onClick={onDismiss} aria-label="Not now" style={{ background: 'none', border: 'none', fontSize: 18, color: '#9ca3af', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, lineHeight: 1 }}>×</button>
      </div>
      <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 900, color: '#111827', margin: '10px 0 4px', lineHeight: 1.3 }}>
        {copy.headline}
      </p>
      {detail && (
        <p style={{ fontFamily: dm, fontSize: 12.5, color: '#4b5563', margin: '0 0 12px', lineHeight: 1.5 }}>{detail}</p>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: detail ? 0 : 12 }}>
        <button
          onClick={onCta}
          style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '10px 22px', cursor: 'pointer', minHeight: 'auto' }}
        >
          {copy.cta}
        </button>
        <button
          onClick={onDismiss}
          style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '10px 8px' }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}