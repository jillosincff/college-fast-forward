import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

console.log('🔵 [GatorAuth] Module loaded');

/**
 * UNIFIED AUTH FLOW - Single page handles:
 * 1. Welcome screen with Google sign-in (unauthenticated users)
 * 2. Role selection (authenticated users without persona)
 * 3. Auto-routing (authenticated users with persona)
 */

/* ── design tokens ──────────────────────────────────── */
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

/* ── shared shell ───────────────────────────────────── */
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

/* ── role card ──────────────────────────────────────── */
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
      {/* icon */}
      <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: role.iconBg, border: `1px solid ${role.iconBorder}` }}>
        {role.icon}
      </div>
      {/* text */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>{role.name}</span>
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{role.desc}</span>
        {role.micro && <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, marginTop: 2, ...(role.microStyle || { color: 'rgba(255,255,255,0.35)' }) }}>{role.micro}</span>}
      </div>
      {/* arrow */}
      <ArrowSVG color={hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'} />
    </button>
  );
}

/* ── SVG icons ──────────────────────────────────────── */
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

function AwardSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(244,240,232,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
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
  
  let authContext;
  try {
    authContext = useAuth();
    console.log('🔵 [GatorAuth] useAuth succeeded:', !!authContext);
  } catch (e) {
    console.error('❌ [GatorAuth] useAuth failed:', e);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <p className="text-red-600 font-bold">Auth Error</p>
          <p className="text-red-500 text-sm">{e.message}</p>
        </div>
      </div>
    );
  }
  
  const { user, isLoading, refreshUser } = authContext;
  
  // NEW FLOW: Role selection FIRST, then OAuth
  // Steps: null (determining) → 'role-select' (pick role) → 'oauth' (sign in) → 'processing' (applying role)
  const [step, setStep] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const processingRef = useRef(false);
  
  // Auto-redirect timer for welcome-back screen
  useEffect(() => {
    if (step === 'welcome-back' && user) {
      const timer = setTimeout(() => {
        const isParentOrAlumni = user.persona === 'parent' || user.persona === 'alumni' || 
                                  user.roles?.includes('parent') || user.roles?.includes('alumni');
        navigate(isParentOrAlumni ? 'ParentDashboard' : 'Dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, user]);

  // Main routing logic
  useEffect(() => {
    if (isLoading) return;

    // CRITICAL: Detect if we somehow ended up on wrong domain (mobile OAuth bug)
    const currentHost = window.location.hostname;
    console.log('🔍 [GatorAuth] Current hostname:', currentHost);
    
    if (currentHost.includes('ufl.edu') || currentHost.includes('google.com') || currentHost.includes('accounts.google')) {
      console.error('❌ [GatorAuth] WRONG DOMAIN DETECTED! This should not happen.');
      // Can't redirect from wrong domain - just log the error
      return;
    }

    // Handle OAuth callback token extraction
    const hashFragment = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(window.location.search);
    const hasAccessToken = hashFragment.includes('access_token=') || urlParams.has('access_token');
    const isNewUser = urlParams.has('is_new_user');

    if (hasAccessToken && !user) {
      const tokenMatch = hashFragment.match(/access_token=([^&]+)/);
      const urlToken = urlParams.get('access_token');
      const extractedToken = tokenMatch?.[1] || urlToken;
      
      if (extractedToken && base44.auth.setToken) {
        console.log('🔑 Setting token from OAuth callback');
        try {
          base44.auth.setToken(extractedToken);
        } catch (e) {
          console.error('Failed to set token:', e);
        }
        window.history.replaceState(null, '', window.location.origin + '/#GatorAuth');
        // Add small delay before refresh for Edge/slower browsers
        setTimeout(() => {
          if (refreshUser) refreshUser();
        }, 100);
        return;
      }
    }

    // Clean URL
    if (isNewUser || hasAccessToken) {
      window.history.replaceState(null, '', window.location.origin + '/#GatorAuth');
    }

    // ROUTING LOGIC
    if (user) {
      console.log('🔍 User:', user.email, 'persona:', user.persona, 'onboarding_completed:', user.onboarding_completed);
      
      // Get pending role from localStorage OR database (fallback for Safari/in-app browsers)
      const pendingRole = localStorage.getItem('pending_invite_role') || user.pending_role;
      const pendingCode = localStorage.getItem('pending_invite_code') || user.pending_code;

      // Already onboarded → Dashboard (returning user - prevent duplicate registration)
      if (user.persona && user.onboarding_completed === true) {
        console.log('✅ [GatorAuth] Returning user detected (already registered), redirecting to dashboard');
        // Clear any stale pending data
        localStorage.removeItem('pending_invite_role');
        localStorage.removeItem('pending_invite_code');
        // Show welcome back message before redirecting
        setStep('welcome-back');
        return;
      }
      
      // Legacy user (onboarding_completed field doesn't exist) → treat as complete
      if (user.persona && user.onboarding_completed === undefined) {
        console.log('✅ [GatorAuth] Legacy user detected (no onboarding_completed field), redirecting to dashboard');
        localStorage.removeItem('pending_invite_role');
        localStorage.removeItem('pending_invite_code');
        // Show welcome back message before redirecting
        setStep('welcome-back');
        return;
      }
      
      // Handle null onboarding_completed (bad data) - treat as complete
      if (user.persona && user.onboarding_completed === null) {
        console.log('⚠️ [GatorAuth] User with null onboarding_completed, treating as complete');
        localStorage.removeItem('pending_invite_role');
        localStorage.removeItem('pending_invite_code');
        setStep('welcome-back');
        return;
      }
      
      // Mid-onboarding (explicitly false)
      if (user.persona && user.onboarding_completed === false) {
        console.log('🔄 [GatorAuth] Returning user mid-onboarding, continuing...');
        if (user.persona === 'gator') {
          navigate('StudentOnboarding');
        } else if (user.persona === 'parent') {
          navigate('ParentOnboarding');
        } else {
          navigate('Onboarding');
        }
        return;
      }

      // Has pending role from BEFORE OAuth → Apply it and continue
      if (pendingRole && !user.persona) {
        const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');
        if (processingRef.current) return;
        processingRef.current = true;
        setStep('processing');
        
        (async () => {
          try {
            console.log('🔄 [GatorAuth] Applying pending role:', pendingRole);
            
            // Students with gator role - apply directly (any email allowed)
            if (pendingRole === 'gator') {
              await base44.auth.updateMe({
                persona: 'gator',
                roles: ['gator'],
                onboarding_completed: false,
                is_new_signup: true,
                invite_code_used: isUFLStudent ? 'ufl_direct' : 'direct'
              });
              localStorage.removeItem('pending_invite_role');
              if (refreshUser) await refreshUser();
              navigate('StudentOnboarding');
              return;
            }
            
            // For parent/alumni, check for invite code
            if (!pendingCode && (pendingRole === 'parent' || pendingRole === 'alumni')) {
              console.log('🚫 [GatorAuth] No invite code for parent/alumni, redirecting to invite code page');
              navigate('GatorInviteCode');
              processingRef.current = false;
              return;
            }
            
            // CRITICAL: Use the pendingRole directly - don't default to 'parent'
            console.log('🔄 [GatorAuth] Applying role:', pendingRole, 'with code:', pendingCode);
            await base44.auth.updateMe({
              persona: pendingRole,
              roles: [pendingRole],
              onboarding_completed: false,
              is_new_signup: true,
              invite_code_used: pendingCode || 'direct'
            });
            
            // Verify update succeeded before navigating
            await new Promise(r => setTimeout(r, 300));
            const updatedUser = await base44.auth.me();
            
            if (updatedUser?.persona === pendingRole) {
              console.log('✅ [GatorAuth] Pending role applied successfully');
              localStorage.removeItem('pending_invite_role');
              localStorage.removeItem('pending_invite_code');
              if (refreshUser) await refreshUser();
              
              // Route to correct onboarding
              if (pendingRole === 'gator') {
                navigate('StudentOnboarding');
              } else if (pendingRole === 'parent') {
                navigate('ParentOnboarding');
              } else {
                navigate('Onboarding');
              }
            } else {
              console.warn('⚠️ [GatorAuth] Role update not reflected, retrying...');
              await base44.auth.updateMe({
                persona: pendingRole,
                roles: [pendingRole],
                onboarding_completed: false,
                is_new_signup: true
              });
              await new Promise(r => setTimeout(r, 500));
              localStorage.removeItem('pending_invite_role');
              localStorage.removeItem('pending_invite_code');
              if (refreshUser) await refreshUser();
              
              if (pendingRole === 'gator') {
                navigate('StudentOnboarding');
              } else if (pendingRole === 'parent') {
                navigate('ParentOnboarding');
              } else {
                navigate('Onboarding');
              }
            }
          } catch (err) {
            console.error('Failed to apply pending role:', err);
            localStorage.removeItem('pending_invite_role');
            localStorage.removeItem('pending_invite_code');
            setError('Something went wrong. Please try again.');
            setStep('role-select');
          } finally {
            processingRef.current = false;
          }
        })();
        return;
      }

      // No persona AND no pending role → Show role selection
      console.log('🎯 [GatorAuth] No role found, showing role selection');
      setStep('role-select');
      return;
    } else {
      // Not authenticated → Check if role was already selected (e.g., from GatorParentInvite)
      const pendingRole = localStorage.getItem('pending_invite_role');
      const pendingCode = localStorage.getItem('pending_invite_code');
      
      if (pendingRole && pendingCode) {
        // Role AND code already set (from GatorParentInvite) → Go straight to OAuth
        console.log('🔐 [GatorAuth] Found pending role+code, skipping role selection:', pendingRole);
        setSelectedRole(pendingRole);
        setStep('oauth');
      } else if (pendingRole) {
        // Role set but no code → Pre-select role and show selection (they might need a code)
        console.log('🔐 [GatorAuth] Found pending role without code:', pendingRole);
        setSelectedRole(pendingRole);
        setStep('role-select');
      } else {
        // No role selected → Show role selection FIRST (before OAuth)
        setStep('role-select');
      }
    }
  }, [user, isLoading, refreshUser]);

  const handleGoogleSignIn = (isReturningUser = false) => {
    // For new users, role must be selected BEFORE OAuth
    // For returning users (sign in flow), skip role requirement
    if (!selectedRole && !isReturningUser) {
      console.error('❌ [GatorAuth] No role selected before OAuth!');
      return;
    }
    
    setLoading(true);
    
    // Save role to localStorage BEFORE OAuth redirect (only if role selected)
    // This survives the OAuth redirect (mobile browsers may clear sessionStorage)
    try {
      if (selectedRole) {
        localStorage.setItem('pending_invite_role', selectedRole);
        localStorage.setItem('pending_invite_timestamp', Date.now().toString());
        console.log('💾 [GatorAuth] Saved pending role to localStorage:', selectedRole);
      } else {
        // Returning user - clear any stale pending role
        localStorage.removeItem('pending_invite_role');
        console.log('🔐 [GatorAuth] Returning user sign-in (no role pre-selected)');
      }
    } catch (e) {
      console.warn('localStorage unavailable in handleGoogleSignIn:', e);
    }
    
    // CRITICAL: Ensure we use the app's actual origin, not any redirect URL
    const appOrigin = window.location.origin;
    const callbackUrl = appOrigin + '/#GatorAuth';
    
    console.log('🔐 [GatorAuth] Starting Google sign-in');
    console.log('🔐 [GatorAuth] App origin:', appOrigin);
    console.log('🔐 [GatorAuth] Callback URL:', callbackUrl);
    console.log('🔐 [GatorAuth] Selected role:', selectedRole || '(returning user)');
    
    // Validate that the origin is our app, not an external site
    if (appOrigin.includes('ufl.edu') || appOrigin.includes('google.com')) {
      console.error('❌ [GatorAuth] Invalid origin detected:', appOrigin);
      setLoading(false);
      return;
    }
    
    base44.auth.redirectToLogin(callbackUrl);
  };

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    
    // Save role FIRST (before anything else)
    // CRITICAL: selectedRole should be exactly 'alumni', 'parent', or 'gator'
    console.log('💾 [GatorAuth] handleRoleSelect called with selectedRole:', selectedRole, 'type:', typeof selectedRole);
    try {
      localStorage.setItem('pending_invite_role', selectedRole);
      localStorage.setItem('pending_invite_timestamp', Date.now().toString());
      console.log('💾 [GatorAuth] Verified localStorage pending_invite_role:', localStorage.getItem('pending_invite_role'));
    } catch (e) {
      console.warn('localStorage unavailable in handleRoleSelect:', e);
    }
    
    // If user is NOT authenticated yet, show OAuth button
    if (!user) {
      console.log('🔐 [GatorAuth] User not authenticated, showing OAuth');
      setStep('oauth');
      return;
    }
    
    // User IS authenticated - check if they need invite code
    setLoading(true);
    const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');
    const hasInviteCode = localStorage.getItem('pending_invite_code');
    
    // Students selecting gator can proceed directly (any email allowed)
    if (selectedRole === 'gator') {
      try {
        console.log('🎓 [GatorAuth] Student selecting gator role, proceeding directly');
        await base44.auth.updateMe({
          persona: 'gator',
          roles: ['gator'],
          onboarding_completed: false,
          is_new_signup: true,
          invite_code_used: isUFLStudent ? 'ufl_direct' : 'direct'
        });
        localStorage.removeItem('pending_invite_role');
        if (refreshUser) await refreshUser();
        navigate('StudentOnboarding');
      } catch (err) {
        console.error('Failed to set role:', err);
        setLoading(false);
      }
      return;
    }
    
    // Parents and Alumni need invite code
    if ((selectedRole === 'parent' || selectedRole === 'alumni') && !hasInviteCode) {
      console.log('📝 [GatorAuth] Parent/Alumni needs invite code, selectedRole:', selectedRole);
      // Ensure role is saved before navigating
      localStorage.setItem('pending_invite_role', selectedRole);
      navigate('GatorInviteCode');
      return;
    }
    
    // Has invite code - apply role and continue
    try {
      // CRITICAL: Use selectedRole which is the ACTUAL role the user picked (alumni vs parent)
      console.log('🔄 [GatorAuth] Applying selected role:', selectedRole, 'with code:', hasInviteCode);
      await base44.auth.updateMe({
        persona: selectedRole,
        roles: [selectedRole],
        onboarding_completed: false,
        is_new_signup: true,
        invite_code_used: hasInviteCode || 'direct'
      });
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      if (refreshUser) await refreshUser();
      
      if (selectedRole === 'gator') {
        navigate('StudentOnboarding');
      } else if (selectedRole === 'parent') {
        navigate('ParentOnboarding');
      } else {
        navigate('Onboarding');
      }
    } catch (err) {
      console.error('Failed to set role:', err);
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // WELCOME BACK (returning user trying to register again)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'welcome-back') {
    const isParentOrAlumni = user?.persona === 'parent' || user?.persona === 'alumni' || 
                              user?.roles?.includes('parent') || user?.roles?.includes('alumni');
    const dashboardUrl = isParentOrAlumni ? 'ParentDashboard' : 'Dashboard';
    const firstName = user?.first_name || (user?.full_name && user.full_name.includes(' ') ? user.full_name.split(' ')[0] : null) || 'there';
    
    return (
      <AuthPageShell>
        <AuthCard>
          <LogoBlock />
          <h1 style={S.headline}>Welcome back, {firstName}.</h1>
          <p style={S.subhead}>Taking you to your dashboard...</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '24px 0' }}>
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={{ ...S.finePrint, fontSize: 14 }}>Redirecting...</span>
          </div>
          <button onClick={() => navigate(dashboardUrl)} style={S.primaryBtn}>
            Go to Dashboard
            <ArrowSVG color="#fff" />
          </button>
        </AuthCard>
      </AuthPageShell>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // LOADING / PROCESSING STATE
  // ═══════════════════════════════════════════════════════════
  
  if (step === null || step === 'processing' || isLoading) {
    return (
      <AuthPageShell>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: ACCENT, margin: '0 auto 16px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>Setting up your account...</p>
        </div>
      </AuthPageShell>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // OAUTH SCREEN (role selected, need to sign in)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'oauth') {
    const roleLabel = selectedRole === 'gator' ? 'a Student' : selectedRole === 'parent' ? 'a Parent' : 'an Alum';
    return (
      <AuthPageShell>
        <AuthCard delay={0}>
          <LogoBlock delay={0.05} />
          <h1 style={S.headline}>Almost there.</h1>
          <p style={{ ...S.subhead, marginBottom: 32 }}>Sign in to continue as {roleLabel}</p>

          <button
            onClick={() => handleGoogleSignIn(false)}
            disabled={loading}
            style={{ ...S.googleBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#fff', marginRight: 10 }} />Connecting...</>
            ) : (
              <><GoogleIcon /><span>Continue with Google</span></>
            )}
          </button>

          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 12, marginBottom: 24 }}>
            Works with any email — Gmail, school, Outlook, etc.
          </p>

          <button
            onClick={() => setStep('role-select')}
            style={{ display: 'block', margin: '0 auto 24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline', minHeight: 'auto', width: 'auto' }}
          >
            ← Choose a different role
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
          <FinePrint />
        </AuthCard>
      </AuthPageShell>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ROLE SELECTION (FIRST STEP - before OAuth)
  // ═══════════════════════════════════════════════════════════
  
  if (step === 'role-select') {
    const roles = [
      {
        id: 'gator',
        name: "I'm a Job Seeker",
        desc: 'Looking for internships or my first job. I want a plan and real connections.',
        micro: 'Students and recent grads welcome.',
        microStyle: { color: 'rgba(255,255,255,0.35)' },
        iconBg: 'rgba(255,255,255,0.04)',
        iconBorder: 'rgba(255,255,255,0.08)',
        icon: <GradCapSVG />,
      },
      {
        id: 'parent',
        name: "I'm a Parent",
        desc: "Supporting my student's career journey and joining a network that opens real doors.",
        iconBg: 'rgba(255,255,255,0.04)',
        iconBorder: 'rgba(255,255,255,0.08)',
        icon: <HeartSVG />,
      },
    ];

    const handleCardClick = (roleId) => {
      console.log('🔵 [GatorAuth]', roleId, 'button clicked');
      setSelectedRole(roleId);
      try {
        localStorage.setItem('pending_invite_role', roleId);
        localStorage.setItem('pending_invite_timestamp', Date.now().toString());
      } catch (e) { console.warn('localStorage unavailable:', e); }

      if (!user) {
        setStep('oauth');
        return;
      }

      if (roleId === 'gator') {
        const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');
        setLoading(true);
        base44.auth.updateMe({
          persona: 'gator', roles: ['gator'], onboarding_completed: false,
          is_new_signup: true, invite_code_used: isUFLStudent ? 'ufl_direct' : 'direct'
        }).then(() => {
          localStorage.removeItem('pending_invite_role');
          if (refreshUser) refreshUser();
          navigate('StudentOnboarding');
        });
        return;
      }

      // Parent / Alumni
      let hasInviteCode = null;
      try { hasInviteCode = localStorage.getItem('pending_invite_code'); } catch (e) { /* private browsing */ }
      if (!hasInviteCode) {
        navigate('GatorInviteCode');
      } else {
        handleRoleSelect();
      }
    };

    return (
      <AuthPageShell>
        <AuthCard delay={0}>
          <LogoBlock delay={0.05} />

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#f87171', lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: 8, animation: 'authFadeUp 0.4s ease both', animationDelay: '0.1s' }}>
            <h1 style={S.headline}>Welcome to College Fast Forward</h1>
            <p style={S.subhead}>Tell us who you are so we can personalize your experience.</p>
            <p style={S.supportLine}>
              Two different roles. One shared goal. Getting your student hired.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
            {roles.map((r, i) => (
              <RoleCard key={r.id} role={r} index={i} isPrimary={!!r.primary} onClick={() => handleCardClick(r.id)} />
            ))}
          </div>

          {/* Reassurance line */}
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.5, marginBottom: 24 }}>
            Free to join. FastIQ unlocks the full AI career engine — try it free for 7 days.
          </p>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0 16px' }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: ACCENT }} />
              <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>Setting up...</span>
            </div>
          )}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
          <FinePrint />

          <div style={{ textAlign: 'center', marginTop: 16, animation: 'authFadeUp 0.4s ease both', animationDelay: '0.3s' }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>
              Already have an account?{' '}
              <button
                onClick={() => {
                  try { localStorage.removeItem('pending_invite_role'); } catch (e) { /* private browsing */ }
                  handleGoogleSignIn(true);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ACCENT, minHeight: 'auto', width: 'auto', padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
              >
                Sign in
              </button>
            </p>
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  // Fallback
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