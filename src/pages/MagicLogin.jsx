import { useEffect } from 'react';
import { navigate, useParams } from '@/components/utils/navigation';
import { Loader2 } from 'lucide-react';

export default function MagicLogin() {
  const params = useParams();

  useEffect(() => {
    // Ensure token moves to PreAuth where verification is handled
    const tokenFromParams = params?.token;
    let token = tokenFromParams;

    if (!token) {
      // Fallback parse from hash if needed
      const hash = window.location.hash.split('?')[1] || '';
      const urlParams = new URLSearchParams(hash);
      token = urlParams.get('token') || '';
    }

    if (token) {
      navigate('PreAuth', { token });
    } else {
      navigate('PreAuth');
    }
  }, [params]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-orange-500 flex items-center justify-center">
      <div className="flex items-center gap-3 text-white/90">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Redirecting to secure sign-in…</span>
      </div>
    </div>
  );
}

// Public redirector page (token passthrough)
MagicLogin.isPublic = true;