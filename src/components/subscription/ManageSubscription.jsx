import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, ExternalLink, Loader2, Zap, Crown, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createCustomerPortal } from '@/functions/createCustomerPortal';
import { getUserTierInfo, isFoundingMember } from '@/components/access/useAccessControl';

export default function ManageSubscription({ user, family }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const tierInfo = getUserTierInfo(user, family);
  const founding = isFoundingMember(user, family);
  const isBillingOwner = !family?.billing_owner_id || family?.billing_owner_id === user.id;
  const effectiveStatus = family?.subscription_status || user.subscription_status;
  const effectiveTier = family?.subscription_tier || user.subscription_tier;

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data } = await createCustomerPortal({
        return_url: window.location.href,
      });
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error === 'not_billing_owner') {
        toast({
          title: 'Managed by ' + (data.billing_owner_name || 'a family member'),
          description: data.message,
        });
      }
    } catch (error) {
      const errData = error?.response?.data;
      if (errData?.error === 'not_billing_owner') {
        toast({
          title: 'Managed by ' + (errData.billing_owner_name || 'a family member'),
          description: errData.message,
        });
      } else {
        console.error('Error opening customer portal:', error);
        toast({ title: 'Error', description: 'Could not open subscription management.', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (founding) return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="w-3 h-3 mr-1" />Founding Member</Badge>;

    const configs = {
      active: { text: effectiveTier === 'fastiq' ? 'CFF + FASTIQ' : effectiveTier === 'cff' ? 'CFF' : 'Active', className: 'bg-green-100 text-green-800' },
      trialing: { text: '7-Day Trial', className: 'bg-blue-100 text-blue-800' },
      canceled: { text: 'Canceled', className: 'bg-red-100 text-red-800' },
      past_due: { text: 'Past Due', className: 'bg-yellow-100 text-yellow-800' },
      free_founding: { text: 'Founding Member', className: 'bg-yellow-100 text-yellow-800' },
    };
    const config = configs[effectiveStatus] || { text: 'No Plan', className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {founding ? (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-800 text-sm">Founding Member #{tierInfo?.memberNumber}</span>
              </div>
              <p className="text-xs text-amber-700">
                You have full access to CFF + FASTIQ for free — forever. Thank you for being an early supporter!
              </p>
            </div>
          </div>
        ) : (effectiveStatus === 'active' || effectiveStatus === 'trialing') ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {effectiveTier === 'fastiq'
                ? 'Your family has CFF + FASTIQ — full access to the AI career center.'
                : 'Your family has CFF Membership — community, directory, and messaging.'}
            </p>

            {/* Show who manages billing */}
            {!isBillingOwner && family?.billing_owner_name && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-blue-800 text-sm">Managed by {family.billing_owner_name}</span>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Your family's subscription is paid for by {family.billing_owner_name}. Contact them to make changes.
                  </p>
                </div>
              </div>
            )}

            {effectiveTier === 'cff' && isBillingOwner && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 text-sm">Upgrade to FASTIQ</span>
                </div>
                <p className="text-xs text-blue-700">Get AI-powered company research, alumni finder, and personalized outreach for $29/month.</p>
              </div>
            )}

            {isBillingOwner && (
              <>
                <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full" variant="outline">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
                  Manage Subscription
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-slate-500">
                  Update payment method, change plan, or cancel.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              You don't have an active subscription.
            </p>
            <Button onClick={() => { window.location.hash = '#FastIQ'; }} className="w-full bg-[#0021A5] hover:bg-blue-800">
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}