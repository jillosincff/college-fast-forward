import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, ExternalLink, Loader2, Zap, Crown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createCustomerPortal } from '@/functions/createCustomerPortal';
import { getUserTierInfo, isFoundingMember } from '@/components/access/useAccessControl';

export default function ManageSubscription({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const tierInfo = getUserTierInfo(user);
  const founding = isFoundingMember(user);

  const handleManageSubscription = async () => {
    if (!user.stripe_customer_id) {
      toast({ title: 'No billing account', description: 'You don\'t have a billing account yet.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await createCustomerPortal({
        return_url: window.location.href,
      });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({ title: 'Error', description: 'Could not open subscription management.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (founding) return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="w-3 h-3 mr-1" />Founding Member</Badge>;

    const status = user.subscription_status;
    const tier = user.subscription_tier;
    const configs = {
      active: { text: tier === 'fastiq' ? 'CFF + FASTIQ' : tier === 'cff' ? 'CFF' : 'Active', className: 'bg-green-100 text-green-800' },
      trialing: { text: '7-Day Trial', className: 'bg-blue-100 text-blue-800' },
      canceled: { text: 'Canceled', className: 'bg-red-100 text-red-800' },
      past_due: { text: 'Past Due', className: 'bg-yellow-100 text-yellow-800' },
      free_founding: { text: 'Founding Member', className: 'bg-yellow-100 text-yellow-800' },
    };
    const config = configs[status] || { text: 'No Plan', className: 'bg-gray-100 text-gray-800' };
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
        ) : user.subscription_status === 'active' || user.subscription_status === 'trialing' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {user.subscription_tier === 'fastiq'
                ? 'You have CFF + FASTIQ — full access to the AI career center.'
                : 'You have CFF Membership — community, directory, and messaging.'}
            </p>
            {user.subscription_tier === 'cff' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 text-sm">Upgrade to FASTIQ</span>
                </div>
                <p className="text-xs text-blue-700">Get AI-powered company research, alumni finder, and personalized outreach for $29/month.</p>
              </div>
            )}
            <Button onClick={handleManageSubscription} disabled={isLoading} className="w-full" variant="outline">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
              Manage Subscription
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-slate-500">
              Update payment method, change plan, or cancel.
            </p>
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