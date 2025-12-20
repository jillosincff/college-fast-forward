import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

export default function MagicLinkAuth() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('input');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setStatus('loading');
    setMessage('Sending your secure login link...');

    const emailLower = email.toLowerCase().trim();
    const callbackUrl = window.location.origin + '/#GatorWelcome';

    try {
      // Use Supabase's built-in magic link (client-side, no service key needed)
      // This creates a real authenticated session when the user clicks the link
      const { data, error } = await base44.auth.signInWithOtp({
        email: emailLower,
        options: {
          emailRedirectTo: callbackUrl,
          shouldCreateUser: true, // Auto-create new users
        },
      });

      if (error) {
        throw error;
      }

      console.log('✅ Magic link sent via Supabase OTP');
      setStatus('sent');
      setMessage('Success! Check your email for a sign-in link (valid for 15 minutes).');
    } catch (err) {
      console.error('❌ Magic link error:', err);
      const errMsg = err?.message || 'Failed to send link. Please try again.';
      
      // Rate limit handling
      if (errMsg.includes('rate') || errMsg.includes('60')) {
        setStatus('error');
        setMessage('Please wait 60 seconds before requesting another link.');
      } else {
        setStatus('error');
        setMessage(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToInput = () => {
    setStatus('input');
    setMessage('');
    setEmail('');
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🐊</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            College Fast Forward
          </h1>
          <p className="text-white/80">Sign in with your email</p>
        </div>

        {status === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-lg bg-white/90 border-0 placeholder:text-slate-500"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[var(--uf-orange)] hover:bg-orange-600 text-white font-semibold text-lg rounded-xl shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>
        )}

        {status === 'loading' && (
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 mx-auto animate-spin mb-4" />
            <p className="text-lg">{message}</p>
          </div>
        )}

        {status === 'sent' && (
          <div className="text-center text-white">
            <div className="w-12 h-12 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold">✓</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Check Your Email</h2>
            <p className="text-white/80 mb-6">{message}</p>
            <Button
              onClick={handleBackToInput}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Use a different email
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold">!</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Oops!</h2>
            <p className="text-white/80 mb-6">{message}</p>
            <Button
              onClick={handleBackToInput}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('GatorAuth')}
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            ← Back to Sign In Options
          </Button>
        </div>
      </div>
    </div>
  );
}