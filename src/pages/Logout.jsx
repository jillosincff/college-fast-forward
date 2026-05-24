import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { queryClientInstance } from '@/lib/query-client';

export default function Logout() {
  useEffect(() => {
    try {
      queryClientInstance.clear();
      localStorage.removeItem('pending_intent');
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_student_email');
      localStorage.removeItem('pending_referral_code');
      localStorage.removeItem('oauth_attempt_count');
      localStorage.removeItem('oauth_start_time');
      sessionStorage.clear();
    } catch (e) { /* private browsing */ }

    // Call logout (clears the session token), then redirect ourselves
    base44.auth.logout().catch(() => {});
    setTimeout(() => {
      window.location.href = window.location.origin + '/#/StudentLandingPage';
    }, 300);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>Logging out...</p>
    </div>
  );
}

Logout.isPublic = true;