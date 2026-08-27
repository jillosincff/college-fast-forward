import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FONT, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, R } from '@/components/onboarding-flow/onboardingShared';

// Action-aware footer — never sends the student to the dashboard before
// they've engaged with the people/drafts above. That's how 88% drop after
// the Magic Moment: they saw jobs and left without copying a message.
export default function NextStepFooter({ didAction, peopleCount, bestPathCompany, onUpgrade }) {
  const navigate = useNavigate();
  const hasPeople = peopleCount > 0;

  return (
    <div style={{ marginTop: 20, background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Sparkles size={14} color={INDIGO} />
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          What's next
        </span>
      </div>

      {!didAction && hasPeople ? (
        <>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>
            Copy your outreach message first ↑
          </p>
          <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 14px', lineHeight: 1.5 }}>
            Scroll up to the people section, copy a message, and open LinkedIn. Once you've reached out, your dashboard takes over — it tracks everyone you've messaged.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#f5f3ff', borderRadius: 10, border: `1px solid ${INDIGO_BORDER}` }}>
            <MessageSquare size={16} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM }}>
              {peopleCount} {peopleCount === 1 ? 'person' : 'people'} waiting above
            </span>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>
            {didAction ? 'Nice — that\'s saved.' : 'Your dashboard is ready.'}
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
        </>
      )}

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