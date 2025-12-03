import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthButton({ 
  action = 'sign-in', 
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  showHint = false,
  redirectUrl = null
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = () => {
    setIsLoading(true);
    console.log('🔐 Initiating OAuth via Base44...');
    // Redirect to login - base44 handles Google/Facebook OAuth
    const callback = redirectUrl || window.location.origin + '/#Dashboard';
    base44.auth.redirectToLogin(callback);
  };

  const buttonText = children || (action === 'sign-up' ? 'Join Now' : 'Sign In');

  return (
    <div className="w-full">
      <Button
        onClick={handleAuth}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className={`${className} flex items-center justify-center gap-3 w-full`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span>🐊</span>
        )}
        {isLoading ? 'Redirecting...' : buttonText}
      </Button>
      {showHint && (
        <p className="text-xs text-slate-600 text-center mt-2">
          💡 <strong>UF Students:</strong> Sign in with your @ufl.edu email for instant access
        </p>
      )}
    </div>
  );
}