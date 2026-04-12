import { useState, useEffect } from 'react';
import { resetPasswordWithToken } from '@/functions/resetPasswordWithToken';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hashPart = window.location.hash.split('?')[1] || '';
    const params = new URLSearchParams(hashPart);
    const t = params.get('token');
    if (!t || !t.startsWith('pr_')) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setIsLoading(true);
    try {
      const { data } = await resetPasswordWithToken({ token, new_password: password });
      if (data?.success) {
        setSuccess(true);
        setTimeout(() => navigate('GetStarted'), 2500);
      } else {
        setError(data?.error || 'Reset failed. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', fontSize: 14, padding: '14px 16px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 10, color: '#fff',
    fontFamily: dmSans, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#0d1117' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: playfair, fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            COLLEGE FAST FORWARD
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Set a new password
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 32 }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <p style={{ fontFamily: dmSans, fontSize: 16, color: '#22C55E', fontWeight: 600, margin: '0 0 12px' }}>Password updated!</p>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  style={inputStyle}
                  disabled={!!error && !token}
                />
              </div>
              <div>
                <label style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  style={inputStyle}
                  disabled={!!error && !token}
                />
              </div>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontFamily: dmSans, fontSize: 13, color: '#EF4444', margin: 0 }}>{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || (!!error && !token)}
                style={{ background: isLoading ? '#555' : '#E85D20', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto', marginTop: 4 }}
              >
                {isLoading ? 'Updating...' : 'Set New Password'}
              </button>
              <p style={{ textAlign: 'center', margin: 0 }}>
                <button
                  type="button"
                  onClick={() => { window.location.hash = '#MigrationSignIn'; }}
                  style={{ background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', textDecoration: 'underline', minHeight: 'auto', minWidth: 'auto' }}
                >
                  Back to sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

ResetPassword.isPublic = true;