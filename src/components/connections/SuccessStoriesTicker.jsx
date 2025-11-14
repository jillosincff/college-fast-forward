import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function SocialProofTicker({ stories }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!stories || stories.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % stories.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [stories]);

  if (!stories || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div
        className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #2d32b8 20%, #ffba4a 100%)',
          boxShadow: '0 4px 16px 0 rgba(40,40,60,0.08)'
        }}
      >
        <Avatar className="w-12 h-12 border-2 border-white/50 flex-shrink-0">
          <AvatarImage src={currentStory.img} alt="User story avatar" />
          <AvatarFallback>{currentStory.icon || '🎉'}</AvatarFallback>
        </Avatar>
        
        <div className="relative flex-1 min-h-[1.5em] h-12 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute text-white text-base md:text-lg font-medium leading-relaxed"
            >
              <span className="mr-2">{currentStory.icon}</span>
              {currentStory.story}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}