import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

const dm = "'DM Sans', system-ui, sans-serif";

const PERKS = [
  {
    icon: '⚡',
    title: 'Warm Internal Referrals',
    desc: 'Direct lines to parents who are VPs, Directors, and Executives at target companies. They aren\'t looking at your GPA—they\'re looking out for their school community.',
  },
  {
    icon: '💬',
    title: 'Automated Intros',
    desc: 'Let the AI draft perfect, high-converting introduction messages tailored specifically to a parent\'s perspective.',
  },
  {
    icon: '🔒',
    title: 'Verified Network Only',
    desc: 'Every parent in our system is hand-verified through student enrollment links. No random recruiters, no spam.',
  },
];

export default function ParentUnlockModal({ onClose, theme, college }) {
  const t = theme || { primary: '#1E293B', secondary: '#475569', bgTint: 'rgba(30,41,59,0.03)' };
  const shortName = t.shortName || college || 'Your School\'s';

  // Close on backdrop click or Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCheckout = async () => {
    try {
      const res = await createCheckoutSession({ price_tier: 'weekly_sprint', college });
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        base44.auth.redirectToLogin('/#FreeTierDashboard');
      }
    } catch {
      base44.auth.redirectToLogin('/#FreeTierDashboard');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
          borderTop: `4px solid ${t.primary}`,
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b7280', minHeight: 'auto', minWidth: 'auto', lineHeight: 1 }}
        >×</button>

        {/* Hero */}
        <div style={{ padding: '32px 32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
          <h2 style={{ fontFamily: dm, fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Unlock Your School's<br />
            <span style={{ color: t.primary }}>Secret Weapon.</span>
          </h2>
          <p style={{ fontFamily: dm, fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            Hundreds of <strong style={{ color: '#374151' }}>{shortName} parents</strong> are waiting to champion your applications. Stop fighting the HR algorithm alone.
          </p>
        </div>

        {/* Perks */}
        <div style={{ padding: '0 32px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PERKS.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: t.bgTint, border: `1px solid ${t.primary}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                {p.icon}
              </div>
              <div>
                <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{p.title}</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Box */}
        <div style={{ margin: '0 32px 32px', background: t.bgTint, border: `1px solid ${t.primary}33`, borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: dm, fontSize: 28, fontWeight: 900, color: t.primary, letterSpacing: '-0.03em' }}>$4.99</span>
            <span style={{ fontFamily: dm, fontSize: 14, color: '#6b7280', fontWeight: 500 }}>/ week</span>
          </div>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5 }}>
            Cancel anytime. One single referral pays for an entire year of college.
          </p>
          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              fontFamily: dm,
              fontSize: 15,
              fontWeight: 800,
              color: '#fff',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              border: 'none',
              borderRadius: 12,
              padding: '14px 0',
              cursor: 'pointer',
              minHeight: 'auto',
              boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
              letterSpacing: '-0.01em',
            }}
          >
            Deploy My Career Agent Now →
          </button>
        </div>
      </div>
    </div>
  );
}