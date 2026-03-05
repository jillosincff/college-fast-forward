import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Check, CreditCard, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PricingTierBadge from './PricingTierBadge';

/**
 * Billing section for user settings/profile
 * Shows subscription info and management options
 */
export default function BillingSection({ user }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const tier = user.price_tier || (user.is_founding_member || user.is_founding_gator ? 'founding' : 'standard');
  const memberNumber = user.member_number || user.founding_gator_number || user.signup_order;
  const subscriptionStatus = user.subscription_status;

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('createCustomerPortal', {
        returnUrl: window.location.href
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Founding Member - Free Forever
  if (tier === 'founding') {
    return (
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            Billing & Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PricingTierBadge user={user} />
          
          <div className="bg-white rounded-xl p-6 border border-yellow-200">
            <h3 className="font-bold text-lg text-slate-900 mb-2">Your Subscription</h3>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-green-100 text-green-800">Active</Badge>
              <span className="text-2xl font-black text-green-600">FREE FOREVER</span>
            </div>
            
            <p className="text-slate-600">
              As a Founding Member #{memberNumber}, you have lifetime free access to all premium features.
              You will <strong>never be charged</strong>.
            </p>
            
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">👑 Founding Member Benefits:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✓ All premium features forever</li>
                <li>✓ Exclusive Founding Member badge</li>
                <li>✓ Priority support</li>
                <li>✓ Early access to new features</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Paid Tiers (Early Adopter or Standard)
  const priceDisplay = tier === 'early_adopter' ? '$9' : '$29';
  const tierLabel = tier === 'early_adopter' ? 'Early Adopter' : 'Standard';
  const TierIcon = tier === 'early_adopter' ? Star : Check;

  return (
    <Card className={`border-2 ${tier === 'early_adopter' ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50' : 'border-slate-300'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-slate-600" />
          Billing & Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PricingTierBadge user={user} />
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-bold text-lg text-slate-900 mb-2">Your Subscription</h3>
          
          <div className="flex items-center gap-3 mb-4">
            <Badge className={subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 
                            subscriptionStatus === 'past_due' ? 'bg-red-100 text-red-800' :
                            subscriptionStatus === 'trialing' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'}>
              {subscriptionStatus === 'active' ? 'Active' : 
               subscriptionStatus === 'past_due' ? 'Past Due' :
               subscriptionStatus === 'trialing' ? 'Trial' :
               subscriptionStatus === 'cancelled' ? 'Cancelled' : 'Inactive'}
            </Badge>
            <span className="text-2xl font-black text-slate-900">{priceDisplay}/month</span>
          </div>
          
          <p className="text-slate-600 mb-4">
            {tier === 'early_adopter' ? (
              <>As an Early Adopter (Member #{memberNumber}), your price is <strong>locked at $9/month forever</strong> — it will never increase.</>
            ) : (
              <>Your subscription is ${priceDisplay}/month. Family plan includes up to 2 students and 2 parents.</>
            )}
          </p>

          {subscriptionStatus === 'past_due' && (
            <div className="p-4 bg-red-100 rounded-lg mb-4">
              <p className="text-red-800 font-semibold">⚠️ Payment failed. Please update your payment method.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          </div>
          
          {tier === 'early_adopter' && (
            <div className="mt-4 p-4 bg-blue-100 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">⭐ Early Adopter Benefits:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ $9/month locked forever (never increases)</li>
                <li>✓ All premium features</li>
                <li>✓ Early Adopter badge</li>
                <li>✓ Priority feature requests</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}