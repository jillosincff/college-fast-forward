import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

const FloatingSparkle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: [0, Math.random() * 40 - 20],
      y: [0, Math.random() * 40 - 20],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 3,
    }}
  />
);

const PulseRing = ({ delay = 0, intensity = 1 }) => (
  <motion.div
    className="absolute inset-0 rounded-full border-2 border-orange-400/30"
    initial={{ scale: 1, opacity: 0.7 }}
    animate={{ 
      scale: [1, 1.8 * intensity, 2.2 * intensity], 
      opacity: [0.7, 0.3, 0] 
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: intensity > 1 ? 0.5 : 1,
      ease: "easeOut"
    }}
  />
);

export default function InviteAlumniFAB({ onClick }) {
  const [showButton, setShowButton] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [shouldGlow, setShouldGlow] = useState(false);
  
  useEffect(() => {
    // Animate in after a delay
    const timer = setTimeout(() => setShowButton(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Periodic glow/pulse to encourage engagement
  useEffect(() => {
    const glowInterval = setInterval(() => {
      setShouldGlow(true);
      setTimeout(() => setShouldGlow(false), 3000);
    }, 15000); // Glow every 15 seconds

    return () => clearInterval(glowInterval);
  }, []);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
    setShouldGlow(false); // Stop glowing when clicked
    onClick();
  };

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          className="fixed bottom-6 right-6 z-40"
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Enhanced Tooltip with Viral Copy */}
          <AnimatePresence>
            {(isHovered || shouldGlow) && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl border border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="font-bold">Invite Alumni & Get Rewards!</div>
                    <div className="text-xs text-slate-300">🏆 Earn badges • 🎯 Unlock features</div>
                  </div>
                </div>
                {/* Enhanced tooltip arrow */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB Container */}
          <div className="relative">
            {/* Enhanced pulse rings with glow effect */}
            <PulseRing delay={0} intensity={shouldGlow ? 1.5 : 1} />
            <PulseRing delay={0.5} intensity={shouldGlow ? 1.3 : 1} />
            <PulseRing delay={1} intensity={shouldGlow ? 1.2 : 1} />
            
            {/* Enhanced sparkles during glow */}
            {Array.from({ length: shouldGlow ? 12 : 6 }).map((_, index) => (
              <FloatingSparkle key={index} delay={index * 0.2} />
            ))}
            
            {/* Main button with enhanced animations */}
            <motion.div
              whileHover={{ 
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                transition: { rotate: { duration: 0.5 } }
              }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="relative"
              animate={shouldGlow ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 0 0 rgba(251, 191, 36, 0.4)",
                  "0 0 0 20px rgba(251, 191, 36, 0)",
                  "0 0 0 0 rgba(251, 191, 36, 0)"
                ]
              } : {}}
              transition={shouldGlow ? { duration: 2, repeat: 2 } : {}}
            >
              <Button
                onClick={handleClick}
                size="lg"
                className={`
                  relative h-16 w-16 rounded-full text-white shadow-2xl border-4 border-white overflow-hidden group
                  ${shouldGlow 
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:shadow-yellow-500/25' 
                    : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:shadow-orange-500/25'
                  }
                `}
                aria-label="Invite alumni to join our network"
              >
                {/* Enhanced background shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: shouldGlow ? 1.5 : 2,
                    repeat: Infinity,
                    repeatDelay: shouldGlow ? 1 : 3,
                    ease: "linear",
                  }}
                  style={{
                    transform: 'skewX(-25deg)',
                  }}
                />
                
                {/* Gift icon with enhanced bounce animation */}
                <motion.div
                  animate={shouldGlow ? { 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  } : isHovered ? {
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ 
                    duration: shouldGlow ? 1 : 0.6, 
                    repeat: shouldGlow ? Infinity : 1 
                  }}
                  className="relative z-10"
                >
                  <Gift className="w-7 h-7" />
                </motion.div>

                {/* Click count badge */}
                <AnimatePresence>
                  {clickCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
                    >
                      {clickCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>

          {/* Success message animation */}
          <AnimatePresence>
            {clickCount > 0 && clickCount % 3 === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="absolute bottom-20 right-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
              >
                🎉 You're on fire! Keep inviting!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}