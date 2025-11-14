import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Check, Crown, Zap, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { navigate } from '@/components/utils/navigation';
import { getPricingTier } from '@/functions/getPricingTier';
import { getFoundingSpotsLeft } from '@/functions/getFoundingSpotsLeft';

/**
 * PRICING PAGE
 * 
 * IMPORTANT: This page is INFORMATIONAL ONLY for now.
 * No Stripe checkout is active - payment collection will be added later.
 * 
 * PRICING STRUCTURE:
 * - Students: FREE forever
 * - Parents: First 1,000 = FREE (Founding Gators 👑)
 * - Parents: 1,001-4,999 = $9/month (when billing starts)
 * - Parents: 5,000+ = $19/month (when billing starts)
 * - All parents can earn free lifetime via 20 successful invites (2,000 points)
 */

export default function Pricing() {
  const { user } = useAuth();
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foundingSpotsLeft, setFoundingSpotsLeft] = useState(965);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to get founding spots count (works without auth)
        try {
          const spotsResult = await getFoundingSpotsLeft();
          if (spotsResult?.data?.success) {
            setFoundingSpotsLeft(spotsResult.data.spotsLeft);
          }
        } catch (spotsError) {
          // Silently fail and use default value - function might still be deploying
          console.warn('Founding spots count unavailable, using default:', spotsError.message);
        }

        // If user is logged in, get their pricing tier
        if (user) {
          try {
            const { data } = await getPricingTier();
            if (data) {
              setPricingData(data);
            }
          } catch (tierError) {
            // Don't fail the whole page if pricing tier fails
            console.warn('Pricing tier unavailable:', tierError.message);
          }
        }
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleCTAClick = (role) => {
    if (user) {
      if (role === 'student') {
        navigate('Dashboard');
      } else {
        navigate('ParentDashboard');
      }
    }
    // If not logged in, GoogleAuthButton will handle sign-in
  };

  const pricingTiers = [
    {
      name: 'Founding Gator',
      badge: '👑 Limited Spots',
      price: 0,
      priceLabel: 'Free Forever',
      description: 'First 1,000 members get lifetime free access',
      features: [
        'Full platform access',
        'Connect with all Gators',
        'Post unlimited opportunities',
        'Network with parents & alumni',
        'Priority support',
        'Founding member badge',
        'Exclusive founder community'
      ],
      cta: user ? 'Go to Dashboard' : 'Join Now - Free Forever',
      ctaRole: 'parent',
      highlighted: foundingSpotsLeft > 0,
      gradient: 'from-yellow-400 to-orange-500',
      icon: Crown,
      spotsLeft: foundingSpotsLeft
    },
    {
      name: 'Early Adopter',
      badge: '⚡ Best Value',
      price: 9,
      priceLabel: '$9/month',
      description: 'For members 1,001-4,999',
      features: [
        'Full platform access',
        'Connect with all Gators',
        'Post unlimited opportunities',
        'Network with parents & alumni',
        'Standard support',
        'Earn points to unlock free membership'
      ],
      cta: user ? 'Go to Dashboard' : 'Join as Early Adopter',
      ctaRole: 'parent',
      highlighted: false,
      gradient: 'from-purple-400 to-blue-500',
      icon: Zap
    },
    {
      name: 'Standard',
      badge: '🐊 Join Anytime',
      price: 19,
      priceLabel: '$19/month',
      description: 'For members 5,000+',
      features: [
        'Full platform access',
        'Connect with all Gators',
        'Post unlimited opportunities',
        'Network with parents & alumni',
        'Standard support',
        'Earn points to unlock free membership'
      ],
      cta: user ? 'Go to Dashboard' : 'Get Started',
      ctaRole: 'parent',
      highlighted: false,
      gradient: 'from-blue-400 to-indigo-500',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              🎓 <strong>Students:</strong> Always FREE forever. Focus on getting hired!
              <br />
              👨‍👩‍👧 <strong>Parents:</strong> Join early for the best pricing. First 1,000 are FREE!
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-5 h-5 text-green-600" />
                <span>No contracts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-5 h-5 text-green-600" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-5 h-5 text-green-600" />
                <span>Earn free membership</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gradient-to-r from-orange-500 to-blue-500 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="text-4xl font-bold mb-2">🎓 UF Students</div>
                <h3 className="text-3xl font-extrabold mb-2">100% FREE Forever</h3>
                <p className="text-lg text-white/90">
                  No credit card. No hidden fees. Just focus on landing your dream job!
                </p>
              </div>
              <div className="flex-shrink-0">
                {user ? (
                  <Button
                    onClick={() => handleCTAClick('student')}
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-slate-100 font-bold px-8 py-6 text-lg shadow-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <GoogleAuthButton
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-slate-100 font-bold px-8 py-6 text-lg shadow-lg"
                  >
                    Join Free - Students
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </GoogleAuthButton>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Tiers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">
          👨‍👩‍👧 Parent Pricing
        </h2>
        <p className="text-center text-slate-600 mb-12 text-lg">
          The earlier you join, the better the price. First 1,000 members get FREE forever!
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            const isActive = pricingData?.tierName?.includes(tier.name);
            
            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden transition-all duration-300 ${
                  tier.highlighted
                    ? 'ring-4 ring-yellow-400 shadow-2xl scale-105'
                    : isActive
                    ? 'ring-2 ring-blue-400 shadow-xl'
                    : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 font-bold">
                    ⏰ {tier.spotsLeft} spots left!
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 font-bold">
                    ✨ Your Current Plan
                  </div>
                )}

                <CardHeader className={tier.highlighted || isActive ? 'pt-12' : 'pt-6'}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-2">
                    {tier.badge}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-base">{tier.description}</CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-5xl font-extrabold text-slate-900">
                      {tier.price === 0 ? 'FREE' : `$${tier.price}`}
                    </div>
                    <div className="text-slate-600">{tier.price > 0 && '/month'}</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {user ? (
                    <Button
                      onClick={() => handleCTAClick(tier.ctaRole)}
                      className={`w-full py-6 text-lg font-bold ${
                        tier.highlighted
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                          : isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  ) : (
                    <GoogleAuthButton
                      className={`w-full py-6 text-lg font-bold ${
                        tier.highlighted
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {tier.cta}
                    </GoogleAuthButton>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invite System Explainer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  🎉 Earn Free Lifetime Membership!
                </h3>
                <p className="text-slate-700 text-lg mb-4">
                  <strong>Parents:</strong> Invite 20 people to join and get <strong>FREE membership for life</strong> - no matter which tier you're in!
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span>100 points per successful invite</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span>2,000 points = Free lifetime access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span>Help build the Gator network & save money!</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final CTA */}
      {!user && foundingSpotsLeft > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-2xl">
            <CardContent className="p-12 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-white" />
              <h3 className="text-4xl font-extrabold mb-4">
                🚨 Only {foundingSpotsLeft} Founding Member Spots Left!
              </h3>
              <p className="text-xl mb-8 text-white/90">
                Join now and get FREE lifetime access. Once we hit 1,000 members, pricing starts at $9/month.
              </p>
              <GoogleAuthButton
                size="lg"
                className="bg-white text-orange-600 hover:bg-slate-100 font-bold px-12 py-8 text-2xl shadow-2xl"
              >
                Claim Your Founding Member Spot
                <ArrowRight className="ml-3 w-6 h-6" />
              </GoogleAuthButton>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center pb-12 text-slate-500">
        <p className="text-sm">
          Questions? We're here to help. Go Gators! 🐊🧡💙
        </p>
      </div>
    </div>
  );
}