import React, { useEffect, useState } from 'react';
import { navigate, useParams } from '@/components/utils/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { verifyMagicLink } from '@/functions/verifyMagicLink';
import { base44 } from '@/api/base44Client';

export default function MagicLogin() {
  const params = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

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
        // Verify the token with our backend
        const res = await verifyMagicLink({ token });
        const data = res?.data;
        
        if (data?.success && data?.email) {
          const emailLower = data.email.toLowerCase();
          console.log('✅ Magic link verified for:', emailLower);
          setStatus('success');
          setVerifiedEmail(emailLower);
          
          // Store post-magic context in localStorage (survives redirects)
          localStorage.setItem('post_magic_email', emailLower);
          localStorage.setItem('post_magic_verified', 'true');
          localStorage.setItem('post_magic_timestamp', Date.now().toString());
          
          // Set role - existing persona or default to parent (most magic link users are parents)
          const role = data.persona || 'parent';
          localStorage.setItem('post_magic_role', role);
          
          // Store if they need onboarding
          localStorage.setItem('post_magic_needs_onboarding', data.onboarding_completed ? 'false' : 'true');
          
          console.log('📦 Stored post-magic context:', { email: emailLower, role, needsOnboarding: !data.onboarding_completed });
          
          // Redirect to Google OAuth - callback goes to GatorAuth which handles the context
          setTimeout(() => {
            console.log('🔄 Redirecting to Google OAuth...');
            const callbackUrl = window.location.origin + '/#GatorAuth';
            base44.auth.redirectToLogin(callbackUrl);
          }, 1500);
        } else {
          throw new Error(data?.error || 'Verification failed');
        }
      } catch (err) {
        console.error('❌ Magic link verification failed:', err);
        setStatus('error');
        const errorMsg = err?.response?.data?.error || err?.message || 'This link is invalid or has expired.';
        setErrorMessage(errorMsg);
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
            <h2 className="text-xl font-semibold text-white mb-2">Email Verified! 🐊</h2>
            <p className="text-white/70 mb-2">Quick Google sign-in to complete setup...</p>
            <p className="text-white/60 text-sm bg-white/10 rounded-lg px-3 py-2 mt-2">
              Sign in with: <strong>{verifiedEmail}</strong>
            </p>
            <div className="mt-4">
              <Loader2 className="w-5 h-5 animate-spin text-white/50 mx-auto" />
            </div>
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