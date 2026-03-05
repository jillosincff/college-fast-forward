import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Real-time pricing counter for homepage
 * Shows current tier, spots remaining, and urgency messaging
 */
export default function LivePricingCounter({ onJoinClick, className = '' }) {
  const [pricingInfo, setPricingInfo] = useState({
    tier: 'founding',
    spotsRemaining: 300,
    memberCount: 700,
    isLoading: true
  });

  useEffect(() => {
    const loadPricingInfo = async () => {
      try {
        const response = await base44.functions.invoke('getPricingTierForSignup', {});
        if (response.data?.success) {
          setPricingInfo({
            tier: response.data.tier,
            spotsRemaining: response.data.spots_remaining,
            memberCount: response.data.current_family_count,
            nextTierPrice: response.data.next_tier_price,
            priceDisplay: response.data.locked_price_display,
            urgencyMessage: response.data.urgency_message,
            badgeType: response.data.badge_type,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Failed to load pricing info:', error);
        setPricingInfo(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadPricingInfo();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadPricingInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  if (pricingInfo.isLoading) {
    return (
      <div className={`animate-pulse bg-white/10 rounded-2xl p-6 ${className}`}>
        <div className="h-8 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-2/3"></div>
      </div>
    );
  }

  const { tier, spotsRemaining, memberCount, nextTierPrice, priceDisplay } = pricingInfo;

  // Different displays based on tier
  if (tier === 'founding') {
    return (
      <div className={`bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-2xl border-2 border-orange-300 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
          <span className="text-yellow-300 font-bold text-lg">LIMITED TIME</span>
        </div>
        
        <h3 className="text-white text-2xl md:text-3xl font-black mb-2">
          Only <span className="text-yellow-300 text-4xl md:text-5xl">{spotsRemaining}</span> FREE Spots Left!
        </h3>
        
        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center text-white">
            <span>Member #{memberCount + 1} of 1,000</span>
            <span className="font-bold text-xl">Your Price: FREE FOREVER</span>
          </div>
          <div className="mt-2 text-white/80 text-sm">
            After 1,000 members: {nextTierPrice}
          </div>
        </div>
        
        <Button 
          onClick={onJoinClick}
          className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-bold text-lg py-6 shadow-xl"
        >
          Claim My FREE Founding Spot →
        </Button>
        
        <p className="text-white/80 text-xs mt-3 text-center">
          👑 Founding Members get FREE access forever + exclusive badge
        </p>
      </div>
    );
  }

  if (tier === 'early_adopter') {
    return (
      <div className={`bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-2xl border-2 border-blue-300 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-6 h-6 text-yellow-300" />
          <span className="text-yellow-300 font-bold text-lg">EARLY ADOPTER PRICING</span>
        </div>
        
        <h3 className="text-white text-2xl md:text-3xl font-black mb-2">
          <span className="text-yellow-300 text-4xl md:text-5xl">{spotsRemaining?.toLocaleString()}</span> Spots Left at $9/month!
        </h3>
        
        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center text-white">
            <span>Member #{memberCount + 1} of 5,000</span>
            <span className="font-bold text-xl">$9/month (locked forever)</span>
          </div>
          <div className="mt-2 text-white/80 text-sm">
            After 5,000 members: {nextTierPrice}
          </div>
        </div>
        
        <Button 
          onClick={onJoinClick}
          className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-bold text-lg py-6 shadow-xl"
        >
          Lock In $9/month Forever →
        </Button>
        
        <p className="text-white/80 text-xs mt-3 text-center">
          ⭐ Early Adopters get $9/month forever + 7-day free trial
        </p>
      </div>
    );
  }

  // Standard tier
  return (
    <div className={`bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 shadow-2xl border-2 border-slate-500 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-6 h-6 text-blue-400" />
        <span className="text-blue-400 font-bold text-lg">JOIN THE NETWORK</span>
      </div>
      
      <h3 className="text-white text-2xl md:text-3xl font-black mb-2">
        Join <span className="text-blue-400">{memberCount?.toLocaleString()}+</span> Gator Families
      </h3>
      
      <div className="bg-white/20 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center text-white">
          <span>Family Plan (up to 4 people)</span>
          <span className="font-bold text-xl">$29/month</span>
        </div>
      </div>
      
      <Button 
        onClick={onJoinClick}
        className="w-full bg-blue-500 text-white hover:bg-blue-400 font-bold text-lg py-6 shadow-xl"
      >
        Start Your 7-Day Free Trial →
      </Button>
      
      <p className="text-white/80 text-xs mt-3 text-center">
        ✓ 7-day free trial • Cancel anytime
      </p>
    </div>
  );
}