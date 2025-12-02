import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Zap, MessageSquare, Star, Eye, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { useAccessControl, hasLinkedParent } from '@/components/access/useAccessControl';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { useToast } from '@/components/ui/use-toast';

const PREMIUM_FEATURES = [
  { icon: MessageSquare, text: 'Unlimited messages (free has only 3/day)' },
  { icon: Star, text: 'Always in the top 10 + 🔥 Featured badge' },
  { icon: Eye, text: "See every parent's email & LinkedIn instantly" }
];

export default function FullAccessUpgradeCard({ user }) {
  const accessInfo = useAccessControl(user);
  const { toast } = useToast();
  const [showSelfPayModal, setShowSelfPayModal] = useState(false);
  const [agreedToSelfPay, setAgreedToSelfPay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show if user has premium or is a parent
  if (accessInfo.isPremium || user?.persona === 'parent') {
    return null;
  }

  // Don't show self-pay option if they have a linked parent
  const hasParent = hasLinkedParent(user);

  const handleAskParent = () => {
    // Could trigger an invite flow or show instructions
    toast({
      title: "Invite sent!",
      description: "We've notified your parent about the upgrade option.",
    });
  };

  const handleSelfPayCheckout = async () => {
    if (!agreedToSelfPay) {
      toast({
        title: "Please confirm",
        description: "Check the box to confirm you'd like to pay for yourself.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await createCheckoutSession({
        priceId: 'price_student_self_pay_9', // $9/month price ID
        successUrl: `${window.location.origin}/#Dashboard?upgrade=success`,
        cancelUrl: `${window.location.origin}/#Dashboard?upgrade=cancelled`,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          subscriptionType: 'student_self_pay'
        }
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-orange-200 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Unlock Full Access — $9/month
              </h3>
              
              <ul className="space-y-2 mb-6">
                {PREMIUM_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleAskParent}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 text-lg shadow-lg"
              >
                Ask your parent to upgrade — $9/month
              </Button>

              {/* Only show self-pay link if no linked parent */}
              {!hasParent && (
                <button
                  onClick={() => setShowSelfPayModal(true)}
                  className="w-full mt-3 text-sm text-slate-500 hover:text-orange-600 underline transition-colors"
                >
                  Pay for yourself instead?
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Pay Modal */}
      <Dialog open={showSelfPayModal} onOpenChange={setShowSelfPayModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Happy to have you upgrade yourself!
            </DialogTitle>
            <DialogDescription className="text-center text-slate-600 mt-2">
              Most parents cover the $9/month for their student. You can unlock the exact same full access yourself at the same $9/month rate.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <Checkbox
                id="self-pay-confirm"
                checked={agreedToSelfPay}
                onCheckedChange={setAgreedToSelfPay}
                className="mt-0.5"
              />
              <label htmlFor="self-pay-confirm" className="text-sm text-slate-600 cursor-pointer">
                I'd like to pay for myself
              </label>
            </div>

            <Button
              onClick={handleSelfPayCheckout}
              disabled={!agreedToSelfPay || isLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-6 text-lg shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade Myself Now — $9/month'
              )}
            </Button>

            <p className="text-xs text-slate-400 text-center">
              If your parent later subscribes, we'll automatically refund your last payment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}