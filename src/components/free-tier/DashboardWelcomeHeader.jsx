const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

// Personalized pain-point welcome header for the free dashboard.
export default function DashboardWelcomeHeader({ badge, title, subtitle, ctaLabel, onCta }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 100%)',
      border: '1px solid rgba(109,40,217,0.18)',
      borderRadius: 20,
      padding: 'clamp(20px, 4vw, 28px)',
      marginBottom: 20,
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '5px 14px', marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
        <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{badge}</span>
      </div>
      <h1 style={{ fontFamily: SF, fontSize: 'clamp(19px, 4.5vw, 24px)', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#475569', margin: '0 0 16px', lineHeight: 1.65, maxWidth: 640 }}>
        {subtitle}
      </p>
      <button
        onClick={onCta}
        style={{ fontFamily: SF, fontSize: 14, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 999, padding: '11px 26px', cursor: 'pointer', minHeight: 44, boxShadow: '0 6px 20px rgba(109,40,217,0.28)', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {ctaLabel} →
      </button>
    </div>
  );
}