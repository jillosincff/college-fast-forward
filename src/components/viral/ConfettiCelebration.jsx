import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfettiPiece = ({ delay, color, size, duration }) => {
  return (
    <motion.div
      className={`absolute ${color} rounded-full`}
      style={{
        width: size,
        height: size,
        left: `${Math.random() * 100}%`,
        top: '-10px',
      }}
      initial={{ 
        y: -10, 
        opacity: 1, 
        rotate: 0,
        scale: 1
      }}
      animate={{ 
        y: window.innerHeight + 100,
        opacity: 0,
        rotate: Math.random() * 720 - 360,
        scale: 0.5
      }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: "easeOut"
      }}
    />
  );
};

export default function ConfettiCelebration({ trigger, duration = 3000 }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  const colors = [
    'bg-[var(--uf-blue)]',
    'bg-[var(--uf-orange)]',
    'bg-yellow-400',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500'
  ];

  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    duration: Math.random() * 3 + 2
  }));

  return (
    <AnimatePresence>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <ConfettiPiece
              key={piece.id}
              delay={piece.delay}
              color={piece.color}
              size={piece.size}
              duration={piece.duration}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}