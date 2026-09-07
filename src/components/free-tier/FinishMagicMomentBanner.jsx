import { Sparkles, ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Shows when a student lands on the dashboard without completing their free
// Magic Moment. ONE primary CTA — demotes everything else until MM is done or
// they explicitly Continue with free on the Magic Moment screen.
// "Recent" = onboarded within the last 7 days (same window OnboardingGuard uses).
export default function FinishMagicMomentBanner({ user }) {
  if (!user) return null;
  if (user.magic_moment_completed === true) return null;

  const onboardingAt = user.onboarding_completed_at || user.created_date;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const isRecent = !onboardingAt || new Date(onboardingAt).getTime() > sevenDaysAgo;
  if (!isRecent) return null;

  const go = () => { window.location.hash = '#/MagicMoment'; };

  return (
    <div style={{
      margin: '0 0 16px',
      background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
      borderRadius: 16,
      padding: '18px 20px',
      boxShadow: '0 8px 24px rgba(109,40,217,0.22)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: '1 1 220px', minWidth: 220 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Sparkles size={14} color="#fff" />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.9 }}>
            Your free cycle isn{"\u2019"}t finished
          </span>
        </div>
        <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.4 }}>
          Finish your free Magic Moment to see your best path, real jobs, and alumni from your school.
        </p>
      </div>
      <button
        onClick={go}
        style={{
          fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#6d28d9',
          background: '#fff', border: 'none', borderRadius: 999,
          padding: '13px 22px', cursor: 'pointer', minHeight: 'auto',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
        }}
      >
        Finish your free Magic Moment <ArrowRight size={16} />
      </button>
    </div>
  );
}