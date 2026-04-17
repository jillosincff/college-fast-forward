import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { useState } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

export default function AlumniAllSet() {
  const { user, isLoadingAuth } = useAuth();
  const [copied, setCopied] = useState(false);

  if (isLoadingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(232,93,32,0.3)', borderTop: '3px solid #E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';
  const schoolName = user?.school_name || user?.school || 'your network';

  const handleShare = () => {
    const url = 'https://collegefastforward.com';
    if (navigator.share) {
      navigator.share({ title: 'College Fast Forward', text: 'Help students from our network land real opportunities.', url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        <div style={{ fontSize: 48, marginBottom: 24 }}>✅</div>

        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: ORANGE, margin: '0 0 16px' }}>
          YOU'RE IN THE NETWORK
        </p>

        <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>
          Welcome to the {schoolName} network.
        </p>

        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 5vw, 40px)', color: '#fff', lineHeight: 1.2, margin: '0 0 32px' }}>
          You're live, {firstName}.
        </h1>

        <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: '0 0 16px' }}>
          Students from <strong style={{ color: '#fff' }}>{schoolName}</strong> can now find you and reach out directly.
        </p>

        <p style={{ fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: '0 0 40px' }}>
          Every alumni who shows up makes the network stronger for every student behind them.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
          <button
            onClick={() => {
              if (user?.alumni_intent === 'giving_help') navigate('AlumniHome');
              else navigate('FreeTierDashboard');
            }}
            style={{ width: '100%', padding: '14px 24px', borderRadius: 100, border: 'none', background: ORANGE, color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}
          >
            Go to Dashboard →
          </button>
          <button
            onClick={() => navigate('ProfileEdit')}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontFamily: dmSans, fontSize: 13, cursor: 'pointer', minHeight: 'auto' }}
          >
            Edit my profile →
          </button>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 40 }}>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 16px' }}>
            Know another alumni who'd want to help?<br />
            Every person makes the network stronger for everyone's kids.
          </p>
          <button
            onClick={handleShare}
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '10px 24px', color: '#fff', fontFamily: dmSans, fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}
          >
            {copied ? '✓ Link Copied!' : 'Share College Fast Forward →'}
          </button>
        </div>

        <p style={{ fontFamily: playfair, fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.25)', marginTop: 40 }}>
          Thank you for being part of something new.
        </p>
      </div>
    </div>
  );
}