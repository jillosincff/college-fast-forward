import { Check, ExternalLink } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, GRAD_INDIGO } from '@/components/onboarding-flow/onboardingShared';

const applyBtn = {
  fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
  border: 'none', borderRadius: 999, padding: '13px 22px', cursor: 'pointer', minHeight: 'auto',
  boxShadow: '0 6px 18px rgba(109,40,217,0.32)', display: 'inline-flex', alignItems: 'center', gap: 8,
  textDecoration: 'none',
};

function Dot({ state, n }) {
  const base = { width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', fontFamily: FONT, fontSize: 12, fontWeight: 800 };
  if (state === 'done') return <div style={{ ...base, background: '#dcfce7', color: '#16a34a' }}><Check size={14} /></div>;
  if (state === 'active') return <div style={{ ...base, background: GRAD_INDIGO, color: '#fff' }}>{n}</div>;
  return <div style={{ ...base, background: '#f1f5f9', color: TEXT3 }}>{n}</div>;
}

// The free cycle's guided plan: apply → message the insider → tracked.
// Parent / upgrade CTAs never appear here — they live on the locked wall only.
export default function HeroStepPlan({ applied, onApply, onAlreadyApplied, applyUrl, messaged, trackedStatus, insiderFirst }) {
  const step1 = applied ? 'done' : 'active';
  const step2 = messaged ? 'done' : (applied ? 'active' : 'pending');
  const step3 = messaged ? 'done' : 'pending';
  const row = { display: 'flex', gap: 12, alignItems: 'flex-start' };
  const title = (state) => ({ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: state === 'pending' ? TEXT3 : TEXT, margin: 0, lineHeight: '26px' });
  const sub = { fontFamily: FONT, fontSize: 12.5, color: TEXT2, margin: '2px 0 0', lineHeight: 1.5 };

  return (
    <div data-testid="mm-step-plan" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={row}>
        <Dot state={step1} n={1} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={title(step1)}>Apply to this job</p>
          {!applied ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
              {applyUrl ? (
                <button data-testid="mm-apply" onClick={onApply} style={applyBtn}>
                  Apply to job <ExternalLink size={14} />
                </button>
              ) : (
                <button data-testid="mm-apply" onClick={onAlreadyApplied} style={applyBtn}>Start with the application</button>
              )}
              <button data-testid="mm-already-applied" onClick={onAlreadyApplied} style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: INDIGO_DIM, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: 0 }}>
                I already applied
              </button>
            </div>
          ) : (
            <p style={sub}>Applied — nice. Now give it an edge.</p>
          )}
        </div>
      </div>

      <div style={row}>
        <Dot state={step2} n={2} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={title(step2)}>{insiderFirst ? `Send the note to ${insiderFirst}` : 'Send the note to someone inside'}</p>
          <p style={sub}>{step2 === 'active' ? 'Your draft is ready below — copy it and send it on LinkedIn.' : step2 === 'done' ? 'Sent.' : 'Your draft is ready below when you are.'}</p>
        </div>
      </div>

      <div style={row}>
        <Dot state={step3} n={3} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={title(step3)}>Tracked in your applications</p>
          <p style={{ ...sub, ...(trackedStatus ? { color: '#15803d', fontWeight: 700 } : {}) }}>
            {trackedStatus || 'CLIFF logs this automatically when you send.'}
          </p>
        </div>
      </div>
    </div>
  );
}