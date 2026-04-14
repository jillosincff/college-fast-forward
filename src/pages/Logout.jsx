import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function Logout() {
  useEffect(() => {
    localStorage.removeItem('pending_intent');
    base44.auth.logout(window.location.origin + '/#GatorAuth');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>Logging out...</p>
    </div>
  );
}

Logout.isPublic = true;