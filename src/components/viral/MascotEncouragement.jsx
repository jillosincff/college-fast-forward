import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';

const MascotEncouragement = ({ trigger, message, type = 'success' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => setIsVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  const messages = {
    success: [
      "Chomp chomp! You just made a Gator's day! 🐊",
      "Way to go, Gator! Your help means everything! 🎉",
      "Albert would be proud! You're making UF family stronger! 💪",
      "That's the Gator spirit! Keep spreading the orange and blue love! 🧡💙"
    ],
    empty_state: [
      "Hey there, future Gator hero! 🐊",
      "Ready to make some magic happen?",
      "Every great connection starts with one introduction!",
      "Your network is someone's next big break!"
    ],
    milestone: [
      "CHOMP CHOMP! You've reached Gator greatness! 🏆",
      "Albert's doing the Gator chomp for you right now! 🐊",
      "You're officially a Gator networking legend! ⭐",
      "The swamp is proud of you, Gator! 🌟"
    ]
  };

  const mascotEmoji = type === 'milestone' ? '🏆🐊' : type === 'success' ? '🐊💙' : '🐊✨';
  const displayMessage = message || messages[type][Math.floor(Math.random() * messages[type].length)];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
        role="alert"
        aria-live="polite"
      >
        <Card className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 w-6 h-6 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Dismiss mascot message"
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-2xl"
                aria-hidden="true"
              >
                {mascotEmoji}
              </motion.div>
              
              <div className="flex-1 text-white">
                <p className="font-semibold text-sm leading-relaxed">
                  {displayMessage}
                </p>
                
                {type === 'milestone' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="flex items-center gap-1 mt-2 text-xs opacity-90"
                  >
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    <span>Achievement Unlocked!</span>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-8 h-8 bg-[var(--uf-orange)]/20 rounded-full blur-lg" aria-hidden="true" />
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default MascotEncouragement;