import { useState } from 'react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

/**
 * Hook to trigger Stripe checkout for FastIQ plans.
 * Handles founding member, annual, and monthly plans.
 */
export default function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startCheckout = async (plan) => {
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/#ParentHome?payment=success`;
      const cancelUrl = `${origin}/#ParentHome?payment=cancelled`;

      const response = await createCheckoutSession({
        plan,
        successUrl,
        cancelUrl,
      });

      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else if (response?.data?.error) {
        setError(response.data.error);
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