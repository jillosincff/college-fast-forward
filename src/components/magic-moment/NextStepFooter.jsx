import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FONT, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, R } from '@/components/onboarding-flow/onboardingShared';

// Always-present destination out of the free cycle. Never a dead end:
// the dashboard continues the plan (best path status, jobs, messages).
export default function NextStepFooter({ didAction, bestPathCompany, onUpgrade }) {
  const navigate = useNavigate();
  return (
    <div style={{ marginTop: 20, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Sparkles size={14} color={INDIGO} />
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          What's next
        </span>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>
        {didAction ? 'Nice — that\'s saved.' : 'Keep this going on your dashboard.'}
      </p>
      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 14px', lineHeight: 1.5 }}>
        {didAction
          ? `Your dashboard tracks ${bestPathCompany ? `your ${bestPathCompany} path` : 'this move'}, your jobs, and everyone you've messaged.`
          : 'Your jobs, your messages, and your next step all live there.'}
      </p>
      <button
        onClick={() => navigate('/FreeTierDashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
          border: 'none', borderRadius: 999, padding: '12px 18px', cursor: 'pointer',
          minHeight: 'auto', width: '100%', marginBottom: 8,
        }}
      >
        Continue your plan <ArrowRight size={14} />
      </button>
      <button
        onClick={onUpgrade}
        style={{
          fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: INDIGO_DIM,
          background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: '100%',
        }}
      >
        Unlock more paths — go Pro or ask a parent
      </button>
    </div>
  );
}