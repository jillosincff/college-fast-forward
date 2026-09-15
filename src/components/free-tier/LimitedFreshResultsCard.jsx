import { useState } from 'react';
import { RefreshCw, ChevronDown, Briefcase } from 'lucide-react';
import {
  FONT, TEXT, TEXT2, TEXT3, INDIGO_DIM, INDIGO_BORDER,
  GRAD_INDIGO, R, SHADOW_MD,
} from '@/components/onboarding-flow/onboardingShared';
import JobsList from '@/components/magic-moment/JobsList';

// Honest state for when the live job feed is mostly curated / BuiltIn fallback
// (JSearch returned nothing live or timed out). Never paints the prestige pack
// as the live hero — shows a "Limited fresh results" banner + Refresh, with the
// curated vetted career pages available ONLY behind an explicit, labeled
// disclosure (off by default). Matches the spec: "optional curated only behind
// that banner — never unlabeled prestige loop."
export default function LimitedFreshResultsCard({ jobs, onRefresh, refreshing, onApply }) {
  const [showVetted, setShowVetted] = useState(false);
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, boxShadow: SHADOW_MD }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <h3 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: TEXT, margin: 0 }}>Limited fresh results right now</h3>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 14px', lineHeight: 1.5 }}>
        CLIFF couldn't pull live postings this moment — the job provider may be slow or returning nothing for your goals. Tap Refresh to try again, or widen your goals to get more matches.
      </p>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '12px 22px', cursor: refreshing ? 'not-allowed' : 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 14 }}
      >
        <RefreshCw size={15} style={refreshing ? { animation: 'spin 0.7s linear infinite' } : undefined} /> Refresh
      </button>
      <button
        onClick={() => setShowVetted(s => !s)}
        style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}
      >
        {showVetted ? 'Hide vetted career pages' : 'Or browse vetted career pages'}
        <ChevronDown size={14} style={{ transform: showVetted ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {showVetted && (
        <div style={{ marginTop: 14, borderTop: `1px solid ${INDIGO_BORDER}`, paddingTop: 14 }}>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Briefcase size={12} /> Vetted career pages — not live-verified
          </p>
          <JobsList jobs={jobs} onApply={onApply} />
        </div>
      )}
    </div>
  );
}