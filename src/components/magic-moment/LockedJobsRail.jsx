import { Lock, Users, ChevronRight } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, R } from '@/components/onboarding-flow/onboardingShared';

// Locked insider-backed roles. This is curated VOLUME, not spray-and-pray: every
// row is a real on-chip role where CLIFF already confirmed someone on the inside.
// Fully visible on tablet (no blur, no clipping) — the value has to be legible
// before the wall. The Pro/parent CTA lives HERE, never next to the outreach.
export default function LockedJobsRail({ jobs, onUnlock, onAskParent }) {
  if (!jobs.length) return null;
  const withPeople = jobs.filter(j => (j.insiderCount || 0) > 0).length;
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: TEXT, margin: '0 0 4px' }}>
          {withPeople > 0
            ? `${withPeople} more role${withPeople === 1 ? '' : 's'} with people on the inside`
            : `${jobs.length} more role${jobs.length === 1 ? '' : 's'} CLIFF lined up`}
        </p>
        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.5 }}>
          Unlock to run the same plan on these — more insider paths, not more cold applications.
        </p>
      </div>
      <div data-testid="locked-jobs-rail" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {jobs.map((j, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px',
            background: '#fff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}`, opacity: 0.85,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f1e9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Lock size={15} color={INDIGO_DIM} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.job_title}</p>
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.name}{j.location ? ` · ${j.location}` : ''}</p>
            </div>
            {(j.insiderCount || 0) > 0 && (
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: INDIGO, background: '#f5f3ff', borderRadius: 999, padding: '5px 9px', flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                <Users size={11} /> {j.insiderCount} inside
              </span>
            )}
          </div>
        ))}
      </div>
      <PaywallCTA onUnlock={onUnlock} onAskParent={onAskParent} withPeople={withPeople} />
    </div>
  );
}

function PaywallCTA({ onUnlock, onAskParent, withPeople }) {
  return (
    <div style={{ marginTop: 14, background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)', borderRadius: R, padding: '24px 20px', textAlign: 'center', boxShadow: '0 12px 30px rgba(76,29,149,0.28)' }}>
      <Lock size={22} color="#fff" style={{ margin: '0 auto 10px' }} />
      <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
        You ran one complete path. Run it on the rest.
      </p>
      <p style={{ fontFamily: FONT, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', margin: '0 0 16px', lineHeight: 1.5 }}>
        {withPeople > 0
          ? 'Same method on every role above: the job, the person inside, and the note to send.'
          : 'CLIFF keeps hunting roles where someone inside can get you seen.'}
      </p>
      <button data-testid="cta-upgrade" onClick={onUnlock} style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#4c1d95', background: '#fff', border: 'none', borderRadius: 999, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        Unlock CLIFF Pro <ChevronRight size={16} />
      </button>
      <div>
        <button onClick={onAskParent} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto' }}>
          Ask a parent to unlock
        </button>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 11, color: 'rgba(255,255,255,0.55)', margin: '12px 0 0' }}>{TEXT3 ? '' : ''}Monthly · Annual</p>
    </div>
  );
}