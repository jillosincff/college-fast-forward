import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Confetti particle component
const ConfettiParticle = ({ index, color, onComplete }) => {
  const randomX = Math.random() * 400 - 200; // Random horizontal spread
  const randomRotation = Math.random() * 720 - 360; // Random rotation
  const randomDelay = Math.random() * 0.5; // Staggered timing
  const randomDuration = 2 + Math.random() * 1; // Varying fall speeds

  return (
    <motion.div
      className={`absolute w-3 h-3 ${color} rounded-full`}
      initial={{ 
        x: 0, 
        y: 0, 
        scale: 0, 
        rotate: 0,
        opacity: 1 
      }}
      animate={{ 
        x: randomX,
        y: 400,
        scale: [0, 1, 0.8, 0],
        rotate: randomRotation,
        opacity: [1, 1, 0.7, 0]
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
      style={{
        left: '50%',
        top: '10%',
      }}
    />
  );
};

// Main confetti celebration component
export default function ConfettiCelebration({ isVisible, onComplete, intensity = 'normal' }) {
  const colors = [
    'bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400',
    'bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-indigo-400'
  ];

  const particleCount = intensity === 'high' ? 50 : intensity === 'low' ? 20 : 35;

  useEffect(() => {
    if (isVisible) {
      // Auto-complete after animation duration
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* Burst from center */}
          {Array.from({ length: particleCount }).map((_, index) => (
            <ConfettiParticle
              key={index}
              index={index}
              color={colors[index % colors.length]}
              onComplete={index === particleCount - 1 ? onComplete : undefined}
            />
          ))}
          
          {/* Success message overlay */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-200">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="text-4xl mb-2"
                >
                  🎉
                </motion.div>
                <h3 className="font-bold text-xl text-slate-900 mb-1">Goal Reached!</h3>
                <p className="text-slate-600 text-sm">Another Gator success story in the making!</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}