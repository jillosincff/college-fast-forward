import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Crown, Zap, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { navigate } from '@/components/utils/navigation';
import { getFoundingSpotsLeft } from '@/functions/getFoundingSpotsLeft';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { useToast } from '@/components/ui/use-toast';

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [foundingSpotsLeft, setFoundingSpotsLeft] = useState(965);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const spotsResult = await getFoundingSpotsLeft();
        if (spotsResult?.data?.success) {
          setFoundingSpotsLeft(spotsResult.data.spotsLeft);
        }
      } catch (error) {
        console.warn('Founding spots count unavailable:', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCheckout = async (priceId) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to continue with payment",
        variant: "destructive"
      });
      return;
    }

    setCheckoutLoading(priceId);
    try {
      const appHost = window.location.origin;
      const { data } = await createCheckoutSession({
        priceId,
        successUrl: `${appHost}/#PaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appHost}/#Pricing`
      });

      if (data.url) {
        if (window.top !== window.self) {
          window.top.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "Please try again or contact support",
        variant: "destructive"
      });
      setCheckoutLoading(null);
    }
  };

  const handleFreeClaim = () => {
    if (user) {
      navigate('Dashboard');
    }
    // If not logged in, GoogleAuthButton handles it
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0021A5] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
            First 1,000 Gators (students, parents, alumni) → <strong>FREE Forever</strong><br />
            Full access, no credit card required.
          </p>
        </div>

        {/* Explainer Box */}
        <div className="text-center my-12 p-8 bg-slate-50 rounded-2xl max-w-4xl mx-auto">
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
            The more Gators we have, the more connections and opportunities for everyone.<br />
            That's why early supporters who help us grow get the best deal — forever.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 my-16">
          
          {/* Founding Tier */}
          <div className="relative bg-gradient-to-br from-[#0021A5] to-[#003087] text-white rounded-2xl p-8 shadow-xl flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">Founding Gator</h3>
              <p className="text-base opacity-90 mb-6">First 1,000 total users</p>
              
              <div className="text-5xl md:text-6xl font-black my-4">$0</div>
              <p className="text-lg mb-2">per month <strong>FOREVER</strong></p>
              
              <p className="text-base opacity-90 my-6 flex-1">
                Full access today + every new connection and feature we add
              </p>
              
              <div className="bg-[#FF9F1C] text-black py-2 px-4 rounded-full font-bold inline-block mx-auto mb-6">
                Only {loading ? '...' : foundingSpotsLeft} spots left!
              </div>
              
              {user ? (
                <Button
                  onClick={handleFreeClaim}
                  size="lg"
                  className="w-full bg-[#FF9F1C] hover:bg-[#e8900a] text-black font-bold py-6 text-lg rounded-full"
                >
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <GoogleAuthButton
                  size="lg"
                  className="w-full bg-[#FF9F1C] hover:bg-[#e8900a] text-black font-bold py-6 text-lg rounded-full"
                >
                  Claim Your Free Forever Spot <ArrowRight className="ml-2 w-5 h-5" />
                </GoogleAuthButton>
              )}
            </div>
          </div>

          {/* Early Adopter */}
          <div className="relative bg-white border-[3px] border-[#0021A5] rounded-2xl p-8 shadow-lg flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold text-[#0021A5] mb-2">Early Adopter</h3>
              <p className="text-base text-slate-500 mb-6">Users 1,001 – 4,999</p>
              
              <div className="text-5xl md:text-6xl font-black text-[#0021A5] my-4">$9</div>
              <p className="text-lg text-slate-700 mb-2">per month <strong>FOREVER</strong></p>
              
              <p className="text-base text-slate-600 my-6 flex-1">
                Same full access, locked in before the network explodes
              </p>
              
              {user ? (
                <Button
                  onClick={() => handleCheckout('price_1SUJ2g873TV7WMcTBYvmzGYU')}
                  disabled={checkoutLoading !== null}
                  size="lg"
                  className="w-full bg-[#0021A5] hover:bg-[#001a84] text-white font-bold py-6 text-lg rounded-full"
                >
                  {checkoutLoading === 'price_1SUJ2g873TV7WMcTBYvmzGYU' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Lock In $9 Forever <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              ) : (
                <GoogleAuthButton
                  size="lg"
                  className="w-full bg-[#0021A5] hover:bg-[#001a84] text-white font-bold py-6 text-lg rounded-full"
                >
                  Lock In $9 Forever <ArrowRight className="ml-2 w-5 h-5" />
                </GoogleAuthButton>
              )}
            </div>
          </div>

          {/* Standard */}
          <div className="relative bg-slate-100 rounded-2xl p-8 shadow-md flex flex-col">
            <div className="text-center flex-1 flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Standard</h3>
              <p className="text-base text-slate-500 mb-6">5,000+ users</p>
              
              <div className="text-5xl md:text-6xl font-black text-slate-800 my-4">$19</div>
              <p className="text-lg text-slate-700 mb-2">per month <strong>FOREVER</strong></p>
              
              <p className="text-base text-slate-600 my-6 flex-1">
                Full access to the largest Gator job network
              </p>
              
              {user ? (
                <Button
                  onClick={() => handleCheckout('price_1SUJ7I873TV7WMcT1plkAZpz')}
                  disabled={checkoutLoading !== null}
                  size="lg"
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-6 text-lg rounded-full"
                >
                  {checkoutLoading === 'price_1SUJ7I873TV7WMcT1plkAZpz' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Join at Current Price <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </Button>
              ) : (
                <GoogleAuthButton
                  size="lg"
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-6 text-lg rounded-full"
                >
                  Join at Current Price <ArrowRight className="ml-2 w-5 h-5" />
                </GoogleAuthButton>
              )}
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-16">
          <p className="text-xl font-bold text-[#0021A5]">
            Lock in your price today — it never goes up for you.
          </p>
          <p className="mt-4 text-lg text-slate-600">Go Gators! 🐊</p>
        </div>
      </div>
    </div>
  );
}