
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Network, Users, Zap, Heart } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';

const featurePreviews = {
  network: {
    title: 'Tap Your Gator Network',
    icon: Network,
    bullets: [
      'Post your internship, full-time, or career-advice request to UF\'s alumni & parents',
      'Get 1:1 referrals, resume reviews, and intro calls',
      'Join a 70,000-strong community ready to help'
    ],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  roommate: {
    title: 'Find Your Next Roommate',
    icon: Users,
    bullets: [
      'Browse verified UF students and alumni looking for housing',
      'Post your own room or search for available spaces',
      'Connect safely through our messaging system'
    ],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  boost: {
    title: 'Give Your Post a Boost',
    icon: Zap,
    bullets: [
      'Get priority placement at the top of feeds for 24 hours',
      'Reach 3-4× more alumni and parents with your request',
      'Increase your chances of getting responses and connections'
    ],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  parent: {
    title: 'Tap Parent Networks',
    icon: Heart,
    bullets: [
      'Connect with UF parents who want to help students succeed',
      'Access unique networking opportunities through parent connections',
      'Get support from families invested in Gator success'
    ],
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
};

export default function FeaturePreviewModal({ featureKey, isOpen, onClose, onGetStarted }) {
  const feature = featurePreviews[featureKey];
  
  React.useEffect(() => {
    if (isOpen) {
      trackEvent('preview_modal_opened', { feature: featureKey });
    }
  }, [isOpen, featureKey]);
  
  if (!feature) return null;

  const handleGetStarted = () => {
    trackEvent('preview_modal_cta_clicked', { feature: featureKey });
    onGetStarted();
  };

  const handleClose = () => {
    trackEvent('preview_modal_closed', { feature: featureKey });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm`}>
            <feature.icon className={`w-8 h-8 ${feature.color}`} />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {feature.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ul className="space-y-3">
            {feature.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-700">
                <div className="w-2 h-2 bg-[var(--uf-blue)] rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={handleGetStarted}
            className="flex-1 bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white font-semibold py-3 rounded-xl"
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
