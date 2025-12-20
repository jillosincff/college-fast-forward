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
        // Verify the token with our backend
        const res = await verifyMagicLink({ token });
        
        if (res?.data?.success && res?.data?.email) {
          console.log('✅ Magic link verified for:', res.data.email);
          setStatus('success');
          
          // Store the verified email so GatorAuth knows this is a magic link login
          sessionStorage.setItem('magic_link_email', res.data.email);
          sessionStorage.setItem('magic_link_verified', 'true');
          
          // Redirect to platform login with the email pre-filled
          // The platform will recognize this as a verified magic link session
          setTimeout(() => {
            const callbackUrl = window.location.origin + '/#GatorAuth';
            base44.auth.redirectToLogin(callbackUrl);
          }, 1500);
        } else {
          throw new Error(res?.data?.error || 'Verification failed');
        }
      } catch (err) {
        console.error('❌ Magic link verification failed:', err);
        setStatus('error');
        setErrorMessage(err?.response?.data?.error || err?.message || 'This link is invalid or has expired.');
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
            <h2 className="text-xl font-semibold text-white mb-2">Link verified!</h2>
            <p className="text-white/70">Signing you in...</p>
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