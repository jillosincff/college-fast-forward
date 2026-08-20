import { Lock, Users, ChevronRight } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, R } from '@/components/onboarding-flow/onboardingShared';

// Locked jobs rail — shows 3-5 real on-chip jobs with lock icons, clearly
// visible (not blurred to a sliver). The paywall CTA sits below the list as a
// standalone card, not an overlay that hides the jobs.
export default function LockedJobsRail({ jobs, onUnlock, onAskParent, isWarm, revealed }) {
  const anyAlumni = jobs.some(j => j.hasAlumni);
  if (!jobs.length) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {anyAlumni ? 'More jobs with alumni at those companies' : 'More roles CLIFF lined up for you'}
        </span>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: TEXT3, background: '#f5f3ff', borderRadius: 999, padding: '2px 8px' }}>
          {jobs.length} locked
        </span>
      </div>
      <div data-testid="locked-jobs-rail" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {jobs.map((j, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
            background: '#fff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}`,
            opacity: 0.78, position: 'relative',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f1e9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Lock size={15} color={INDIGO_DIM} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.job_title}</p>
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.name}{j.location ? ` · ${j.location}` : ''}</p>
            </div>
            {j.hasAlumni && (
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: INDIGO, background: '#f5f3ff', borderRadius: 999, padding: '4px 8px', flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Users size={11} /> Alumni
              </span>
            )}
          </div>
        ))}
      </div>
      {revealed && (
        <PaywallCTA onUnlock={onUnlock} onAskParent={onAskParent} isWarm={isWarm} anyAlumni={anyAlumni} />
      )}
    </div>
  );
}

function PaywallCTA({ onUnlock, onAskParent, isWarm, anyAlumni }) {
  const headline = isWarm ? 'You just got one warm path.' : 'That was your one free path.';
  const sub = isWarm
    ? 'Unlock the rest of the jobs with alumni at those companies.'
    : anyAlumni
      ? 'Unlock the rest of these roles — some have alumni CLIFF can introduce you to.'
      : 'Unlock the rest of these roles, plus alumni matches as CLIFF finds them.';
  return (
    <div style={{ marginTop: 12, background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', borderRadius: R, padding: '24px 20px', textAlign: 'center', boxShadow: '0 12px 30px rgba(76,29,149,0.28)' }}>
      <Lock size={22} color="#fff" style={{ margin: '0 auto 10px' }} />
      <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{headline}</p>
      <p style={{ fontFamily: FONT, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', margin: '0 0 16px', lineHeight: 1.5 }}>{sub}</p>
      <button data-testid="cta-upgrade" onClick={onUnlock} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        Unlock CLIFF Pro <ChevronRight size={16} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
        <span>Monthly</span><span>·</span><span>Annual</span>
      </div>
      <button onClick={onAskParent} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Ask a parent to unlock
      </button>
    </div>
  );
}