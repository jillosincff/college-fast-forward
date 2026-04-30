import { useState, useEffect } from 'react';
import { handleUnsubscribe } from '@/functions/handleUnsubscribe';

export default function Unsubscribe() {
  const [status, setStatus] = useState('loading'); // loading | success | already | error

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const token = hashParams.get('token');

    if (!token) {
      setStatus('error');
      return;
    }

    handleUnsubscribe({ token })
      .then(res => {
        if (res.data?.success) setStatus('success');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif", padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: 480, width: '100%', textAlign: 'center',
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '48px 40px',
      }}>
        {status === 'loading' && (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(232,93,32,0.3)', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>Processing your request…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>You've been unsubscribed.</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
              You won't receive any more emails from College Fast Forward.<br/>
              You can always update your preferences from your profile settings.
            </p>
            <a href="/#" style={{
              display: 'inline-block', color: 'rgba(255,255,255,0.4)', fontSize: 13,
              textDecoration: 'underline',
            }}>
              Back to College Fast Forward
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Something went wrong.</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
              This unsubscribe link may be invalid or expired.<br/>
              Email us at <a href="mailto:support@collegefastforward.com" style={{ color: '#E85D20' }}>support@collegefastforward.com</a> and we'll remove you immediately.
            </p>
          </>
        )}
      </div>
    </div>
  );
}