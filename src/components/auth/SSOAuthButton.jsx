import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthContext';
import { Building2, Loader2 } from 'lucide-react';

export default function SSOAuthButton({ 
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false 
}) {
  const { loginWithSSO } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSSOAuth = async () => {
    setIsLoading(true);
    try {
      await loginWithSSO();
    } catch (error) {
      console.error('SSO auth error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSSOAuth}
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={`${className} flex items-center justify-center gap-3`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Building2 className="w-5 h-5" />
      )}
      Continue with College Fast Forward SSO
    </Button>
  );
}