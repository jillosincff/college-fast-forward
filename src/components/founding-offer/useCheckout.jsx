import { useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to trigger Stripe checkout for FastIQ plans.
 * Handles founding member, annual, and monthly plans.
 */
export default function useCheckout(user) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startCheckout = async (plan) => {
    setLoading(true);
    setError(null);
    try {
      // Do NOT pass successUrl/cancelUrl — the Base44 webview origin can be null,
      // which produces a bad Stripe success_url. The backend uses APP_BASE_URL.
      const response = await base44.functions.invoke('createCheckoutSession', {
        plan,
        user: {
            id: user?.id,
            email: user?.email,
            persona: user?.persona,
            roles: user?.roles,
            full_name: user?.full_name,
            stripe_customer_id: user?.stripe_customer_id,
            family_id: user?.family_id,
            founding_offer_started_at: user?.founding_offer_started_at,
            student_emails: user?.student_emails,
            pending_student_invite_email: user?.pending_student_invite_email,
          },
      });

      const result = response?.data || response;
      if (result?.url) {
        window.location.href = result.url;
      } else if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setError('Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err?.response?.data?.error || err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return { startCheckout, loading, error };
}