
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from '@/components/router/SimpleRouter';
import { sendMagicLink } from '@/functions/sendMagicLink';
import { sendMagicLinkEmail } from '@/functions/sendMagicLinkEmail';

export default function MagicLinkAuth() {
  const { navigate } = useRouter();
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

    try {
      // First try primary function
      const res = await sendMagicLink({ email: email.toLowerCase() });
      if (res?.data?.success) {
        setStatus('sent');
        setMessage('Success! Check your email for a sign-in link (valid for 15 minutes).');
      } else {
        // If success is explicitly false, or if there's an error field
        // Treat it as an error to be caught by the outer catch block
        throw new Error(res?.data?.error || 'Failed to send via primary function.');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || '';
      // Check for specific conditions indicating a deployment issue
      const isDeploymentMissing = err?.response?.status === 404 || (typeof msg === 'string' && msg.toLowerCase().includes('deployment does not exist'));

      if (isDeploymentMissing) {
        // Fallback to alternate function that does not require existing account
        try {
          const res2 = await sendMagicLinkEmail({ email: email.toLowerCase() });
          if (res2?.data?.success) {
            setStatus('sent');
            setMessage('Success! Check your email for a sign-in link (valid for 15 minutes).');
          } else {
            // If fallback also fails, throw an error to be caught by the inner catch block
            throw new Error(res2?.data?.error || 'Failed to send link. Please try again.');
          }
        } catch (err2) {
          // Handle error from fallback function
          const errMsg2 = err2?.response?.data?.error || err2?.message || 'Failed to send link. Please try again.';
          setStatus('error');
          setMessage(errMsg2);
        }
      } else {
        // Handle other types of errors from the primary function
        setStatus('error');
        setMessage(msg || 'Failed to send link. Please try again.');
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
            onClick={() => navigate('LandingPage')}
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
