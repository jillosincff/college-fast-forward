import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { navigate, useParams } from '@/components/utils/navigation';
import { motion } from 'framer-motion';
import { trackEvent } from '@/components/utils/analytics';

export default function PaymentCancel() {
  const params = useParams();

  useEffect(() => {
    trackEvent('payment_canceled', { 
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
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Cancelled</h1>
        
        <p className="text-slate-600 mb-6">
          Your payment was not completed. No charges were made to your account.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Common Issues & Solutions:</h3>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>• Check that your card details are correct</li>
            <li>• Ensure your card has sufficient funds</li>
            <li>• Try a different payment method</li>
            <li>• Contact your bank if the card was declined</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <Button onClick={() => navigate('Boost')} size="lg" className="bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={() => navigate('Contact')} variant="outline" size="lg">
            <MessageCircle className="w-4 h-4 mr-2" />
            Get Help
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Still having trouble? Our <button className="text-[var(--uf-blue)] hover:underline" onClick={() => navigate('Contact')}>support team</button> is here to help.
          </p>
        </div>
      </motion.div>
    </div>
  );
}