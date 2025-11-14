import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Chrome, Loader2 } from 'lucide-react';

export default function GoogleAuthButton({ 
  action = 'sign-in', 
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  showHint = false
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 Initiating Google OAuth via Base44...');
      // Use Base44's built-in redirectToLogin which handles Google SSO
      await base44.auth.redirectToLogin(window.location.href);
    } catch (error) {
      console.error('❌ Google auth error:', error);
      setIsLoading(false);
    }
  };

  const buttonText = children || (action === 'sign-up' ? 'Continue with Google' : 'Sign in with Google');

  return (
    <div className="w-full">
      <Button
        onClick={handleGoogleAuth}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className={`${className} flex items-center justify-center gap-3 w-full`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Chrome className="w-5 h-5" />
        )}
        {buttonText}
      </Button>
      {showHint && (
        <p className="text-xs text-slate-600 text-center mt-2">
          💡 <strong>UF Students:</strong> For instant access, sign in with your @ufl.edu email address
        </p>
      )}
    </div>
  );
}