import { Lock, Users } from 'lucide-react';
import { FONT, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER, R } from '@/components/onboarding-flow/onboardingShared';

export default function LockedJobsRail({ jobs, onUnlock, onAskParent, isWarm, revealed }) {
  const anyAlumni = jobs.some(j => j.hasAlumni);
  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        {anyAlumni ? 'More jobs with alumni at those companies' : 'More roles CLIFF lined up for you'}
      </p>
      <div style={{ position: 'relative' }}>
        {jobs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, filter: 'blur(3px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }}>
            {jobs.map((j, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}` }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f1e9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  {j.hasAlumni ? <Users size={16} color={INDIGO} /> : <Lock size={16} color={INDIGO_DIM} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.job_title}</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '1px 0 0' }}>{j.name}{j.location ? ` · ${j.location}` : ''}</p>
                </div>
                {j.hasAlumni && (
                  <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: INDIGO, background: '#f5f3ff', borderRadius: 999, padding: '4px 8px', flex: '0 0 auto' }}>Alumni</span>
                )}
              </div>
            ))}
          </div>
        )}
        {/* The paywall only appears once the student has actually had their
            moment — a warm named person, or after they copied the draft. It
            never covers the result before the Wow lands. */}
        {revealed && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px' }}>
            <PaywallOverlay onUnlock={onUnlock} onAskParent={onAskParent} isWarm={isWarm} anyAlumni={anyAlumni} />
          </div>
        )}
      </div>
    </div>
  );
}

function PaywallOverlay({ onUnlock, onAskParent, isWarm, anyAlumni }) {
  // Never claim a warm intro the student didn't get.
  const headline = isWarm ? 'You just got one warm path.' : 'That was your one free path.';
  const sub = isWarm
    ? 'Unlock the rest of the jobs with alumni at those companies.'
    : anyAlumni
      ? 'Unlock the rest of these roles — some have alumni CLIFF can introduce you to.'
      : 'Unlock the rest of these roles, plus alumni matches as CLIFF finds them.';
  return (
    <div style={{ background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', borderRadius: R, padding: '24px 20px', textAlign: 'center', boxShadow: '0 12px 30px rgba(76,29,149,0.28)', maxWidth: 340 }}>
      <Lock size={22} color="#fff" style={{ margin: '0 auto 10px' }} />
      <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{headline}</p>
      <p style={{ fontFamily: FONT, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', margin: '0 0 16px', lineHeight: 1.5 }}>
        {sub}
      </p>
      <button data-testid="cta-upgrade" onClick={onUnlock} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        Unlock CLIFF Pro →
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