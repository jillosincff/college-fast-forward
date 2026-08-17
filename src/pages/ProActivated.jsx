import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { trackProActivated } from '@/lib/tracking';
import {
  FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Sparkles, Check, Loader2, ArrowRight, Briefcase, Rocket } from 'lucide-react';

// Post-pay landing. Stripe redirects here after a successful self-pay checkout.
// We poll the user's access until the webhook flips them to Pro, then show a
// clear "You're on CLIFF Pro" win + a single immediate next action — resuming
// the flow they were mid-way through when they upgraded, or running the next
// plan cycle. Never drops a brand-new Pro user into a directionless dashboard.

const isPro = (u) => u?.subscription_status === 'active';

export default function ProActivated() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const firedRef = useRef(false);

  const params = new URLSearchParams(location.search);
  const returnTo = params.get('return_to') || '';
  const source = params.get('source') || '';

  const [activating, setActivating] = useState(true);
  const [active, setActive] = useState(false);

  // Poll the user record until the Stripe webhook flips subscription_status to
  // 'active'. The webhook usually fires within a couple of seconds; we wait up
  // to ~12s and then show the win anyway so the user is never stuck on a spinner.
  useEffect(() => {
    let stopped = false;
    let tries = 0;
    const tick = async () => {
      if (stopped) return;
      let u;
      try { u = await refreshUser(); } catch (e) { u = null; }
      if (stopped) return;
      if (isPro(u)) { setActive(true); setActivating(false); return; }
      tries++;
      if (tries >= 6) { setActivating(false); return; }
      setTimeout(tick, 2000);
    };
    tick();
    return () => { stopped = true; };
  }, [refreshUser]);

  // Fire the activation conversion event exactly once, the moment we leave the
  // activating state (whether we detected active or timed out and assumed it).
  useEffect(() => {
    if (activating) return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackProActivated({ source: source || 'self_pay', detected_active: active });
  }, [activating, active, source]);

  // Resume mid-flow when possible. If they were on the Magic Moment (or no
  // return path), the next best action is to run a fresh plan cycle.
  const resumeFlow = returnTo && returnTo !== '/ProActivated' && returnTo !== '/MagicMoment' && returnTo !== '/';
  const primaryLabel = resumeFlow ? 'Continue where you left off' : 'Run your next plan cycle';
  const primaryTarget = resumeFlow ? returnTo : '/MagicMoment';

  const primaryBtn = (extra) => ({
    fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
    border: 'none', borderRadius: 999, padding: '16px', cursor: 'pointer', minHeight: 'auto',
    boxShadow: '0 6px 18px rgba(109,40,217,0.32)', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, ...extra,
  });
  const ghostBtn = (extra) => ({
    fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INDIGO_DIM, background: '#fff',
    border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '14px', cursor: 'pointer',
    minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...extra,
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 460, width: '100%' }}>
        {activating ? (
          <>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 30px rgba(109,40,217,0.35)' }}>
              <Loader2 size={30} color="#fff" className="animate-spin" />
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>Activating your CLIFF Pro access…</h1>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: 0 }}>Hang tight — this only takes a moment.</p>
          </>
        ) : (
          <>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <Check size={36} color="#16a34a" />
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '5px 12px', marginBottom: 12 }}>
              <Sparkles size={12} color={INDIGO} />
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>You're on CLIFF Pro</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>Your full plan engine is unlocked.</h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 0 24px', lineHeight: 1.55 }}>CLIFF can now run this exact cycle for every job you want — tailored resumes, alumni matches, and outreach, on repeat.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => navigate(primaryTarget)} style={primaryBtn({ width: '100%' })}>
                {resumeFlow ? <><ArrowRight size={16} /> {primaryLabel}</> : <><Rocket size={16} /> {primaryLabel}</>}
              </button>
              <button onClick={() => navigate('/FreeTierDashboard')} style={ghostBtn({ width: '100%' })}>
                <Briefcase size={15} /> See your next best jobs
              </button>
            </div>
            {!active && <p style={{ fontFamily: FONT, fontSize: 11.5, color: TEXT3, margin: '16px 0 0', lineHeight: 1.5 }}>If your access isn't reflected everywhere yet, it's still processing — your features are unlocked.</p>}
          </>
        )}
      </div>
    </div>
  );
}