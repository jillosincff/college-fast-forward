import { Copy, Check } from 'lucide-react';
import { FONT, TEXT, TEXT3, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';

const pill = (extra) => ({
  fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
  border: 'none', borderRadius: 999, padding: '15px 22px', cursor: 'pointer', minHeight: 'auto',
  boxShadow: '0 6px 18px rgba(109,40,217,0.32)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  ...extra,
});

// Under the outreach draft we keep ONLY job actions. The parent-unlock / Pro
// wall lives in the locked-jobs section below — it must never compete with the
// student's next step on THIS job.
export default function HeroOutreach({ outreach, copied, onCopy, highlight }) {
  return (
    <div style={highlight ? { borderRadius: 14, boxShadow: '0 0 0 3px rgba(109,40,217,0.25)', padding: 10, margin: -10 } : undefined}>
      {outreach?.cold && (
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Cold outreach · no alumni found</p>
      )}
      {outreach?.subject && (
        <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: TEXT3, margin: '0 0 8px' }}>Subject: {outreach.subject}</p>
      )}
      <div data-testid="mm-outreach-draft" style={{ background: '#faf7ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12, padding: '14px 16px', fontFamily: FONT, fontSize: 14, color: TEXT, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {outreach?.message || ''}
      </div>
      <div style={{ marginTop: 12 }}>
        <button data-testid="mm-copy-send" onClick={onCopy} style={pill({ width: '100%', padding: '16px' })}>
          {copied ? <><Check size={16} /> <span data-testid="mm-copy-confirmation">Message copied — paste it into LinkedIn</span></> : <><Copy size={16} /> Copy message &amp; open LinkedIn</>}
        </button>
      </div>
    </div>
  );
}