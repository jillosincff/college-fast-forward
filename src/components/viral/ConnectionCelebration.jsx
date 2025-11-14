import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const GatorCelebration = ({ isVisible, onComplete, type = 'connect' }) => {
  const [showGator, setShowGator] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      setShowGator(true);
      const timer = setTimeout(() => {
        setShowGator(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const getCelebrationMessage = () => {
    switch(type) {
      case 'connect':
        return {
          message: "Connection Made!",
          subtitle: "Go Gators! 🐊",
          emoji: "🤝",
          color: "from-blue-500 to-purple-500"
        };
      case 'refer':
        return {
          message: "Referral Sent!",
          subtitle: "You're making a difference! 🐊",
          emoji: "🔗",
          color: "from-orange-500 to-red-500"
        };
      case 'share':
        return {
          message: "Shared Successfully!",
          subtitle: "Spreading the Gator network! 🐊",
          emoji: "📤",
          color: "from-green-500 to-emerald-500"
        };
      default:
        return {
          message: "Success!",
          subtitle: "Go Gators! 🐊",
          emoji: "🎉",
          color: "from-blue-500 to-purple-500"
        };
    }
  };

  const celebration = getCelebrationMessage();

  return (
    <AnimatePresence>
      {showGator && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, index) => (
              <motion.div
                key={index}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [(Math.random() - 0.5) * 200],
                  y: [(Math.random() - 0.5) * 200],
                }}
                transition={{
                  duration: 2,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
          
          {/* Main celebration content */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15 
            }}
          >
            {/* Glow effect */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${celebration.color} rounded-3xl opacity-20 blur-xl`}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            />
            
            {/* Content card */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-4 border-white">
              {/* Main emoji with bounce */}
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: 2 
                }}
              >
                {celebration.emoji}
              </motion.div>
              
              {/* Message */}
              <motion.h2
                className={`text-3xl font-bold bg-gradient-to-r ${celebration.color} bg-clip-text text-transparent mb-2`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {celebration.message}
              </motion.h2>
              
              {/* Subtitle with Gator branding */}
              <motion.p
                className="text-xl text-slate-600 font-semibold"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {celebration.subtitle}
              </motion.p>
              
              {/* Sparkles decoration */}
              <motion.div
                className="flex justify-center gap-4 mt-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.2,
                      repeat: Infinity
                    }}
                  >
                    <Sparkles className={`w-6 h-6 text-yellow-500`} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GatorCelebration;