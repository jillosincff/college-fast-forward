import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function EmailCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('authenticating');

  useEffect(() => {
    async function processTokens() {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (code && state) {
        try {
          const result = await base44.functions.invoke('handleEmailOAuthCallback', {
            code,
            stateUserId: state,
          });

          if (result?.success) {
            setStatus('success');
            setTimeout(() => {
              navigate('/FreeTierDashboard');
            }, 1500);
          } else {
            setStatus('error');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          setStatus('error');
        }
      } else if (!code && !state) {
        // No auth params - redirect to dashboard
        navigate('/FreeTierDashboard');
      }
    }

    processTokens();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm max-w-sm w-full space-y-4">
        {status === 'authenticating' && (
          <>
            <span className="text-3xl animate-spin inline-block">📨</span>
            <h3 className="font-bold text-slate-900 text-base">Securing Dashboard Pipeline...</h3>
            <p className="text-xs text-slate-500">
              CliFF is setting up your automated inbox tracking channels.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <span className="text-3xl">🚀</span>
            <h3 className="font-bold text-emerald-600 text-base">Inbox Sync Active!</h3>
            <p className="text-xs text-slate-500">
              Redirecting you to your automated career engine...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <span className="text-3xl">❌</span>
            <h3 className="font-bold text-rose-600 text-base">Connection Failed</h3>
            <p className="text-xs text-slate-500">
              We couldn't securely link your provider. Please try again.
            </p>
            <button
              onClick={() => navigate('/FreeTierDashboard')}
              className="mt-2 w-full bg-slate-950 text-white font-semibold text-xs py-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}