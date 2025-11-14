
import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Search, Users, Zap, X, HandHeart, Home } from 'lucide-react';

const parentTourSteps = [
  {
    icon: Search,
    title: "Find a Gator to Help",
    description: "Browse student requests for internships, jobs, and career advice. Your experience can make a huge difference.",
    imgSrc: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d6ccb27da_tour-step-1.png"
  },
  {
    icon: HandHeart,
    title: "Offer Connections & Advice",
    description: "Directly offer help, make an introduction from your network, or share valuable advice.",
    imgSrc: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/parent_tour_2.png"
  },
  {
    icon: Home,
    title: "Post on Behalf of Your Student",
    description: "You can also post roommate or housing listings to expand their reach in the Gator network.",
    imgSrc: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/parent_tour_3.png"
  },
];

const defaultTourSteps = [
  {
    icon: Search,
    title: "Find Your Opportunity",
    description: "Use the filters and search bar to find requests for jobs, internships, or roommate openings.",
    imgSrc: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d6ccb27da_tour-step-1.png"
  },
  {
    icon: Users,
    title: "Connect with Gators",
    description: "Offer help directly to students, or post your own requests and let the network come to you.",
    imgSrc: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a038d8f77_tour-step-2.png"
  },
  {
    icon: Zap,
    title: "Boost Your Reach",
    description: "Use boosts to get your requests seen by more alumni and parents, increasing your chances of success.",
    imgSrc: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9ac131100_tour-step-3.png"
  },
];

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function DashboardTour({ isOpen, onClose, user }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const tourSteps = useMemo(() => {
    return user?.persona === 'parent' ? parentTourSteps : defaultTourSteps;
  }, [user?.persona]);
  
  useEffect(() => {
    setStep(0);
  }, [tourSteps]);

  // Listen for custom event to open tour
  useEffect(() => {
    const handleOpenTour = () => {
      setStep(0);
      setDirection(0);
    };
    
    window.addEventListener('openDashboardTour', handleOpenTour);
    return () => window.removeEventListener('openDashboardTour', handleOpenTour);
  }, []);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setStep((prev) => Math.max(0, Math.min(prev + newDirection, tourSteps.length - 1)));
  };

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      paginate(1);
    } else {
      // Mark tour as seen
      if (typeof window !== 'undefined') {
        localStorage.setItem('cff:seenDashboardTour', '1');
      }
      onClose();
    }
  };

  const handleSkip = () => {
    // Mark tour as seen even if skipped
    if (typeof window !== 'undefined') {
      localStorage.setItem('cff:seenDashboardTour', '1');
    }
    onClose();
  };

  const currentStepData = tourSteps[step];
  if (!currentStepData) return null;

  // No longer needed since currentStepData directly holds the icon
  // const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={step}
                src={currentStepData.imgSrc}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                alt={currentStepData.title}
                className="absolute inset-0 w-full h-full object-contain p-8"
              />
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-white rounded-full"
              onClick={handleSkip}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-8 text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === step ? 'w-4 bg-[var(--uf-blue)]' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
            
            <motion.h2
              key={`title-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-slate-900 mb-2"
            >
              {currentStepData.title}
            </motion.h2>
            <motion.p 
              key={`desc-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 mb-8 min-h-[40px]"
            >
              {currentStepData.description}
            </motion.p>

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleSkip} className="text-slate-500">
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                className="bg-[var(--uf-blue)] hover:bg-blue-700 min-w-[120px]"
              >
                {step === tourSteps.length - 1 ? (
                  <>
                    Get Started <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
