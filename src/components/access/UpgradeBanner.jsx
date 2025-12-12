import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Gift, MessageSquare, X, Sparkles } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { generateParentInvite } from '@/functions/generateParentInvite';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

export default function UpgradeBanner({ user, messagesRemaining, onDismiss }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [parentEmail, setParentEmail] = useState('');

  const handleSelfPay = async () => {
    setLoading('self');
    try {
      const appHost = window.location.origin;
      const { data } = await createCheckoutSession({
        priceId: 'price_1SUJ2g873TV7WMcTBYvmzGYU', // $9/month Early Adopter
        successUrl: `${appHost}/#PaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appHost}/#Dashboard`
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
      setLoading(null);
    }
  };

  const handleAskParent = async () => {
    setLoading('parent');
    try {
      const result = await generateParentInvite({ studentUserId: user.id });
      
      if (result.success) {
        toast({
          title: "✅ Parent invite created!",
          description: "Share this code with your parent to unlock full access for the whole family.",
        });
        setShowParentModal(true);
      } else {
        throw new Error(result.error || 'Failed to generate invite');
      }
    } catch (error) {
      console.error('Parent invite error:', error);
      toast({
        title: "Failed to generate invite",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGiftToParent = async () => {
    if (!parentEmail) {
      toast({
        title: "Email required",
        description: "Please enter your parent's email address",
        variant: "destructive"
      });
      return;
    }

    setLoading('gift');
    try {
      // Send email to parent with upgrade link
      await base44.integrations.Core.SendEmail({
        to: parentEmail,
        subject: "🐊 Your Gator wants to unlock full family access!",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0021A5;">Hi from ${user.full_name || 'your Gator'}!</h2>
            
            <p>Your student has been using <strong>College Fast Forward</strong> to connect with alumni and parents for career opportunities.</p>
            
            <p>They've hit the free limit of 3 messages per day and would love to unlock <strong>unlimited access for the whole family!</strong></p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #0021A5;">✨ What You Get:</h3>
              <ul style="color: #334155; line-height: 1.8;">
                <li>Unlimited messaging for your entire family</li>
                <li>Help your student connect with alumni at top companies</li>
                <li>Priority placement in the Gator directory</li>
                <li>Access to exclusive job opportunities</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/#Pricing" 
                 style="background-color: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                Unlock Full Family Access – $9/mo
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              This investment helps your Gator build the connections they need to land their dream job! 🐊💙
            </p>
          </div>
        `
      });

      toast({
        title: "✅ Email sent!",
        description: `Upgrade invitation sent to ${parentEmail}`,
      });
      setShowGiftModal(false);
      setParentEmail('');
    } catch (error) {
      console.error('Gift email error:', error);
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Card className="border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {messagesRemaining === 0 ? '🚫 Daily message limit reached' : '⚡ Unlock unlimited access'}
              </h3>
              <p className="text-sm text-slate-600">
                {messagesRemaining === 0 
                  ? 'You can send 3 more messages tomorrow, or upgrade now for unlimited messaging'
                  : `Only ${messagesRemaining} message${messagesRemaining === 1 ? '' : 's'} left today`
                }
              </p>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h4 className="font-semibold text-slate-900">Unlock Full Access for Your Whole Family</h4>
          </div>
          <p className="text-sm text-slate-600">
            Just <strong>$9/month</strong> gives unlimited messaging to you and your parents. Help build connections that land dream jobs! 🐊
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleSelfPay}
            disabled={loading !== null}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            {loading === 'self' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Crown className="w-4 h-4 mr-2" />
            )}
            I'll Pay
          </Button>

          <Button
            onClick={handleAskParent}
            disabled={loading !== null}
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {loading === 'parent' ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <MessageSquare className="w-4 h-4 mr-2" />
            )}
            Ask Mom/Dad
          </Button>

          <Button
            onClick={() => setShowGiftModal(true)}
            disabled={loading !== null}
            variant="outline"
            className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            <Gift className="w-4 h-4 mr-2" />
            Gift to Parent
          </Button>
        </div>
      </Card>

      {/* Gift Modal */}
      <Dialog open={showGiftModal} onOpenChange={setShowGiftModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Upgrade Link to Parent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="parent-email">Parent's Email Address</Label>
              <Input
                id="parent-email"
                type="email"
                placeholder="parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <p className="text-sm text-slate-600">
              We'll send them a personalized email explaining how upgrading helps the whole family access unlimited connections.
            </p>
            <Button
              onClick={handleGiftToParent}
              disabled={loading === 'gift'}
              className="w-full"
            >
              {loading === 'gift' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>Send Invite</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}