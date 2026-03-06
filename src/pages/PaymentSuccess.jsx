import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Crown, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const familyId = urlParams.get('family_id');

  useEffect(() => {
    try {
      const { base44 } = require('@/api/base44Client');
      base44.analytics.track({ eventName: 'payment_success_viewed', properties: { family_id: familyId } });
    } catch (e) { /* non-critical */ }
  }, [familyId]);

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

        <h1 className="text-3xl font-bold text-slate-900 mb-3">You're All Set!</h1>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Subscription Activated</span>
          </div>
          <p className="text-sm text-blue-700">
            Your 7-day free trial has started. You won't be charged until it ends.
          </p>
        </div>

        <p className="text-slate-600 mb-8">
          You now have full access. Start exploring your career opportunities!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => { window.location.hash = '#FastIQ'; }} size="lg" className="bg-[#FA4616] hover:bg-orange-600">
            <Zap className="w-4 h-4 mr-2" />
            Open FASTIQ
          </Button>
          <Button onClick={() => { window.location.hash = '#Dashboard'; }} variant="outline" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}