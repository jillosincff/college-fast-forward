import React, { useEffect, useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

console.log('🔵 [GatorAuth] Module loaded');

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";
const ACCENT = '#4F8CFF';

const S = {
  headline: { fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(30px, 5vw, 40px)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8, textAlign: 'center' },
  subhead: { fontFamily: dmSans, fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, textAlign: 'center', marginTop: 10, marginBottom: 12 },
  supportLine: { fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, textAlign: 'center', marginBottom: 36 },
  finePrint: { fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6, textAlign: 'center' },
  primaryBtn: { fontFamily: dmSans, fontSize: 16, fontWeight: 500, color: '#fff', background: ACCENT, border: 'none', borderRadius: 100, padding: '16px 40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', transition: 'background 0.2s', minHeight: 'auto' },
  googleBtn: { fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '16px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', transition: 'all 0.2s', minHeight: 'auto' },
};

const FONT_LINK_ID = 'gator-auth-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const STYLE_TAG_ID = 'gator-auth-keyframes';
function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_TAG_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    @keyframes authFadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

function AuthPageShell({ children }) {
  React.useEffect(() => { ensureFonts(); ensureKeyframes(); }, []);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#050505', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 700, background: 'radial-gradient(ellipse at center, rgba(79,140,255,0.04), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500 }}>{children}</div>
    </div>
  );
}

function AuthCard({ children, delay = 0 }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '48px 36px', animation: `authFadeUp 0.4s ease both ${delay}s` }}>
      <style>{`@media (max-width: 480px) { .auth-card-inner { padding: 36px 20px !important; } }`}</style>
      {children}
    </div>
  );
}

function LogoBlock({ delay = 0.05 }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 36, animation: `authFadeUp 0.4s ease both ${delay}s` }}>
      <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}>
        College Fast Forward
      </span>
    </div>
  );
}

function FinePrint() {
  return (
    <p style={{ ...S.finePrint, marginBottom: 0 }}>
      By continuing you agree to our{' '}
      <button onClick={() => navigate('Terms')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', padding: 0, minHeight: 'auto', width: 'auto' }}>Terms</button>
      {' '}and{' '}
      <button onClick={() => navigate('Privacy')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', padding: 0, minHeight: 'auto', width: 'auto' }}>Privacy Policy</button>
    </p>
  );
}

function RoleCard({ role, index, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const delay = 0.15 + index * 0.06;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, width: '100%',
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 18, padding: '24px 22px', cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        textAlign: 'left', minHeight: 'auto',
        animation: `authFadeUp 0.4s ease both ${delay}s`,
        position: 'relative',
      }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: role.iconBg, border: `1px solid ${role.iconBorder}` }}>
        {role.icon}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>{role.name}</span>
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{role.desc}</span>
        {role.micro && <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, marginTop: 2, ...(role.microStyle || { color: 'rgba(255,255,255,0.35)' }) }}>{role.micro}</span>}
      </div>
      <ArrowSVG color={hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'} />
    </button>
  );
}

function ArrowSVG({ color = 'rgba(244,240,232,0.25)' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transition: 'stroke 0.2s' }}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GradCapSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M2 8v6c0 2 4 4 10 4s10-2 10-4V8" />
      <path d="M22 8v6" />
    </svg>
  );
}

function HeartSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(244,240,232,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function GatorAuth() {
  console.log('🔵 [GatorAuth] Component rendering');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me || null);
      } catch (e) {
        console.warn('No user authenticated yet');
        setUser(null);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // Route based on user state
  useEffect(() => {
    if (isLoading) return;
    
    if (user?.persona && user.onboarding_completed) {
      navigate('Dashboard');
      return;
    }
    
    if (user?.persona && !user.onboarding_completed) {
      if (user.persona === 'parent' || user.roles?.includes('parent')) {
        navigate('ParentOnboarding');
      } else {
        navigate('StudentOnboarding');
      }
      return;
    }
    
    if (user && !user.persona) {
      // After OAuth — read role from sessionStorage (reliable same-tab) or localStorage
      const pendingRole = sessionStorage.getItem('pending_invite_role') || localStorage.getItem('pending_invite_role');
      if (pendingRole === 'parent') {
        navigate('ParentOnboarding');
        return;
      }
      if (pendingRole === 'gator') {
        navigate('StudentOnboarding');
        return;
      }
      setStep('role-select');
      return;
    }
    
    console.log('🔴 [GatorAuth] Routing to role-select. user:', user);
    setStep('role-select');
  }, [user, isLoading]);

  const handleGoogleSignIn = () => {
    const role = selectedRole || '';
    if (role) {
      // sessionStorage persists within the same tab across OAuth redirects
      try { sessionStorage.setItem('pending_invite_role', role); } catch (e) {}
      try { localStorage.setItem('pending_invite_role', role); } catch (e) {}
    }
    // Keep callback URL clean — no extra params that could break OAuth token parsing
    const callbackUrl = window.location.origin + '/#GetStarted';
    base44.auth.redirectToLogin(callbackUrl);
  };

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    try {
      localStorage.setItem('pending_invite_role', selectedRole);
    } catch (e) { /* private browsing */ }
    
    if (!user) {
      setStep('oauth');
      return;
    }
    
    if (selectedRole === 'gator') {
      navigate('StudentOnboarding');
      return;
    }
    
    navigate('GatorInviteCode');
  };

  if (step === 'oauth') {
    const roleLabel = selectedRole === 'gator' ? 'a Student' : selectedRole === 'parent' ? 'a Parent' : 'an Alum';
    return (
      <AuthPageShell>
        <AuthCard delay={0}>
          <LogoBlock delay={0.05} />
          <h1 style={S.headline}>Almost there.</h1>
          <p style={{ ...S.subhead, marginBottom: 32 }}>Sign in to continue as {roleLabel}</p>
          <button onClick={() => handleGoogleSignIn()} disabled={loading} style={{ ...S.googleBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Connecting...</> : <><GoogleIcon /><span>Continue with Google</span></>}
          </button>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 12, marginBottom: 24 }}>Works with any email — Gmail, school, Outlook, etc.</p>
          <button onClick={() => setStep('role-select')} style={{ display: 'block', margin: '0 auto 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline', minHeight: 'auto', width: 'auto' }}>← Choose a different role</button>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
          <FinePrint />
        </AuthCard>
      </AuthPageShell>
    );
  }

  if (step === 'role-select') {
    const roles = [
      { id: 'gator', name: "I'm a Job Seeker", desc: 'Looking for internships or my first job. I want a plan and real connections.', micro: 'Students and recent grads welcome.', microStyle: { color: 'rgba(255,255,255,0.35)' }, iconBg: 'rgba(255,255,255,0.04)', iconBorder: 'rgba(255,255,255,0.08)', icon: <GradCapSVG /> },
      { id: 'parent', name: "I'm a Parent", desc: "Supporting my student's career journey and joining a network that opens real doors.", iconBg: 'rgba(255,255,255,0.04)', iconBorder: 'rgba(255,255,255,0.08)', icon: <HeartSVG /> },
    ];

    const handleCardClick = (roleId) => {
      setSelectedRole(roleId);
      if (!user) {
        setStep('oauth');
      } else if (roleId === 'gator') {
        navigate('StudentOnboarding');
      } else {
        navigate('GatorInviteCode');
      }
    };

    return (
      <AuthPageShell>
        <AuthCard delay={0}>
          <LogoBlock delay={0.05} />
          <div style={{ textAlign: 'center', marginBottom: 8, animation: 'authFadeUp 0.4s ease both', animationDelay: '0.1s' }}>
            <h1 style={S.headline}>Welcome to College Fast Forward</h1>
            <p style={S.subhead}>Tell us who you are so we can personalize your experience.</p>
            <p style={S.supportLine}>Two different roles. One shared goal. Getting your student hired.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {roles.map((r, i) => <RoleCard key={r.id} role={r} index={i} onClick={() => handleCardClick(r.id)} />)}
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.5, marginBottom: 24 }}>Free to join. FastIQ unlocks the full AI career engine — try it free for 7 days.</p>
          {loading && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0 16px' }}><Loader2 className="w-5 h-5 animate-spin" style={{ color: ACCENT }} /><span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>Setting up...</span></div>}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
          <FinePrint />
          <div style={{ textAlign: 'center', marginTop: 16, animation: 'authFadeUp 0.4s ease both', animationDelay: '0.3s' }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>Already have an account? <button onClick={() => handleGoogleSignIn()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ACCENT, minHeight: 'auto', width: 'auto', padding: 0 }}>Sign in</button></p>
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <div style={{ textAlign: 'center' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT, margin: '0 auto 16px' }} />
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>Loading...</p>
      </div>
    </AuthPageShell>
  );
}

GatorAuth.isPublic = true;