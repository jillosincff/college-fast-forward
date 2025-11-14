
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createCustomerPortal } from '@/functions/createCustomerPortal';
import { trackEvent } from '@/components/utils/analytics';

export default function ManageSubscription({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    setIsLoading(true);
    trackEvent('manage_subscription_clicked', { user_id: user.id });
    
    try {
      const { data } = await createCustomerPortal();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Could not open subscription management. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { text: 'Active', className: 'bg-green-100 text-green-800' },
      canceled: { text: 'Canceled', className: 'bg-red-100 text-red-800' },
      past_due: { text: 'Past Due', className: 'bg-yellow-100 text-yellow-800' },
      incomplete: { text: 'Incomplete', className: 'bg-gray-100 text-gray-800' },
      trialing: { text: 'Trial', className: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  const hasActiveSubscription = user.pro_subscription_status === 'active';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription Management</span>
          {user.pro_subscription_status && getStatusBadge(user.pro_subscription_status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasActiveSubscription ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              You have an active Pro Plan subscription with 3 boosts per month.
            </p>
            <Button 
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              Manage Subscription
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-xs text-slate-500">
              Update payment method, change plan, or cancel subscription. For refunds, please <a href="/#Contact" className="text-[var(--uf-blue)] hover:underline">contact support</a>.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              You don't have an active subscription. Upgrade to Pro for monthly boosts and discounts.
            </p>
            <Button 
              onClick={() => window.location.hash = '#Boost'}
              className="w-full bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]"
            >
              View Pro Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
