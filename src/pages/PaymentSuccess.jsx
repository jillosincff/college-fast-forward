import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Crown } from 'lucide-react';
import { navigate, useParams } from '@/components/utils/navigation';
import { motion } from 'framer-motion';
import { trackEvent } from '@/components/utils/analytics';

export default function PaymentSuccess() {
  const params = useParams();

  useEffect(() => {
    trackEvent('payment_success_viewed', { 
      session_id: params.session_id,
      source: 'stripe_redirect'
    });
  }, [params.session_id]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center max-w-lg w-full"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h1>
        
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Welcome to Pro!</span>
          </div>
          <p className="text-sm text-amber-700">
            Your boosts have been added to your account and are ready to use.
          </p>
        </div>
        
        <p className="text-slate-600 mb-8">
          Thank you for your purchase. You can now boost your requests for maximum visibility.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('SixDegrees')} size="lg" className="bg-[var(--uf-orange)] hover:bg-orange-600">
            <Zap className="w-4 h-4 mr-2" />
            Use a Boost
          </Button>
          <Button onClick={() => navigate('Dashboard')} variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Need help? Check out our <button className="text-[var(--uf-blue)] hover:underline" onClick={() => navigate('HelpCenter')}>Help Center</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}