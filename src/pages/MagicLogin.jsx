import React, { useEffect, useState } from 'react';
import { navigate, useParams } from '@/components/utils/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { verifyMagicLink } from '@/functions/verifyMagicLink';
import { base44 } from '@/api/base44Client';

export default function MagicLogin() {
  const params = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyAndLogin = async () => {
      // Get token from params or hash
      let token = params?.token;
      if (!token) {
        const hash = window.location.hash.split('?')[1] || '';
        const urlParams = new URLSearchParams(hash);
        token = urlParams.get('token') || '';
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('No login token found. Please request a new magic link.');
        return;
      }

      console.log('🔐 Verifying magic link token...');

      try {
        // Verify the token with our backend - this also creates a session
        const res = await verifyMagicLink({ token });
        const data = res?.data;
        
        if (data?.success && data?.session_token) {
          console.log('✅ Magic link verified, session created for:', data.email);
          setStatus('success');
          
          // Set the session token - this authenticates the user
          base44.auth.setToken(data.session_token);
          
          // Determine where to redirect based on user state
          setTimeout(() => {
            if (data.is_new_user || !data.persona) {
              // New user or no persona - go to welcome/role selection
              console.log('🆕 New user, redirecting to GatorWelcome');
              navigate('GatorWelcome');
            } else {
              // Existing user with persona - go to dashboard
              console.log('👤 Existing user, redirecting to Dashboard');
              const destination = data.persona === 'parent' ? 'ParentDashboard' : 'Dashboard';
              navigate(destination);
            }
          }, 1500);
        } else if (data?.success && data?.email) {
          // Fallback: session token not available, but verification succeeded
          // This means Base44 SDK might not support createSessionForUser
          console.log('⚠️ Magic link verified but no session token - falling back');
          setStatus('error');
          setErrorMessage('Magic link login is not fully configured. Please use Google sign-in or contact support.');
        } else {
          throw new Error(data?.error || 'Verification failed');
        }
      } catch (err) {
        console.error('❌ Magic link verification failed:', err);
        setStatus('error');
        const errorMsg = err?.response?.data?.error || err?.message || 'This link is invalid or has expired.';
        
        // Check if it's a SDK limitation error
        if (errorMsg.includes('createSessionForUser') || errorMsg.includes('not a function')) {
          setErrorMessage('Magic link login requires platform configuration. Please use Google sign-in for now.');
        } else {
          setErrorMessage(errorMsg);
        }
      }
    };

    verifyAndLogin();
  }, [params]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying your link...</h2>
            <p className="text-white/70">Just a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">You're in! 🐊</h2>
            <p className="text-white/70">Taking you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Unable to sign in</h2>
            <p className="text-white/70 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate('GatorAuth')}
              className="bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

MagicLogin.isPublic = true;