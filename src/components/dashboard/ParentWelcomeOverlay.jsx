import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import confetti from 'canvas-confetti';

export default function ParentWelcomeOverlay({ onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fire confetti
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ['#0021A5', '#FA4616', '#FF6B35', '#004E98'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: colors,
        startVelocity: 45,
        gravity: 0.8,
        drift: 0.1,
        ticks: 150
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: colors,
        startVelocity: 45,
        gravity: 0.8,
        drift: -0.1,
        ticks: 150
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Center burst
    confetti({
      particleCount: 150,
      spread: 360,
      origin: { x: 0.5, y: 0.5 },
      colors: colors,
      startVelocity: 40,
      gravity: 1.2,
      ticks: 200
    });

    frame();

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleCTA = () => {
    onDismiss();
    navigate('Connections');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={handleDismiss}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="relative z-10 text-center max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Big Alligator Emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-8xl mb-6"
            >
              🐊
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            >
              Thanks for stepping up to help our Gators!
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-[#FA4616] font-semibold mb-8"
            >
              Your experience could change a student's life. Let's get started.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleCTA}
                size="lg"
                className="bg-[#FA4616] hover:bg-[#D23D0F] text-[#0021A5] font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
              >
                View Student Requests
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/60 text-sm mt-6"
            >
              Click anywhere to dismiss
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}