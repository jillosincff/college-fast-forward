
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter } from '@/components/router/SimpleRouter';
import { registerUser } from '@/functions/registerUser';
import { signInWithPassword } from '@/functions/signInWithPassword';
import { sendMagicLink } from '@/functions/sendMagicLink'; // New import

export default function EmailPasswordAuth() {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState('existing');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(''); // New state for success/info messages

  // Sign in
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Sign up
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Magic link
  const [magicEmail, setMagicEmail] = useState(''); // New state for magic link email

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setInfo(''); // Clear info on sign-in attempt
    if (!signinEmail || !signinPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await signInWithPassword({ email: signinEmail, password: signinPassword });
      // The backend returns a magicLink URL to finalize the session securely.
      if (data?.success && data?.magicLink) {
        window.location.href = data.magicLink;
      } else {
        setError(data?.error || 'Sign in failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setInfo(''); // Clear info on sign-up attempt
    if (!fullName || !signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (signupPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await registerUser({ email: signupEmail, password: signupPassword, full_name: fullName });
      if (response.data?.success) {
        navigate('RegistrationSuccess', { email: signupEmail });
      } else {
        setError(response.data?.error || 'Registration failed.');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Registration failed.';
      setError(msg.includes('duplicate') ? 'An account with this email already exists.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  // New handler for sending magic link
  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setInfo(''); // Clear info and error on magic link attempt
    if (!magicEmail) {
      setError('Please enter your email.');
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await sendMagicLink({ email: magicEmail });
      if (data?.success) {
        setInfo('Check your email for a secure sign-in link. It expires in 15 minutes.');
      } else {
        setError(data?.error || 'Could not send magic link. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🐊</div>
          <h1 className="text-3xl font-bold text-white">College Fast Forward</h1>
          <p className="text-white/80 mt-1">Choose how you want to sign in</p> {/* Updated text */}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(''); setInfo(''); }}> {/* Clear messages on tab change */}
          <TabsList className="grid w-full grid-cols-3"> {/* Changed to 3 columns */}
            <TabsTrigger value="existing">Sign in</TabsTrigger>
            <TabsTrigger value="new">Create account</TabsTrigger>
            <TabsTrigger value="magic">Magic link</TabsTrigger> {/* New tab trigger */}
          </TabsList>

          <TabsContent value="existing" className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
                <Input type="email" value={signinEmail} onChange={(e) => setSigninEmail(e.target.value)} placeholder="you@example.com" className="h-12 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                <Input type="password" value={signinPassword} onChange={(e) => setSigninPassword(e.target.value)} placeholder="••••••••" className="h-12 bg-white" />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[var(--uf-orange)] hover:bg-orange-600">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : 'Sign in'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Albert Gator" className="h-12 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
                <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" className="h-12 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Min. 8 characters" className="h-12 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Confirm Password</label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="h-12 bg-white" />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[var(--uf-blue)] hover:bg-blue-700">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create account'}
              </Button>
            </form>
          </TabsContent>

          {/* New TabsContent for Magic Link */}
          <TabsContent value="magic" className="mt-6">
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
                <Input
                  type="email"
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 bg-white"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[var(--uf-blue)] hover:bg-blue-700">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send me a magic link'}
              </Button>
              <p className="text-xs text-white/80 text-center">We’ll email you a secure link to sign in. No password needed.</p>
            </form>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 text-center p-3 rounded-md text-sm bg-red-50 text-red-700">
            {error}
          </div>
        )}
        {info && !error && ( /* Display info only if no error */
          <div className="mt-4 text-center p-3 rounded-md text-sm bg-green-50 text-green-700">
            {info}
          </div>
        )}
      </div>
    </div>
  );
}
