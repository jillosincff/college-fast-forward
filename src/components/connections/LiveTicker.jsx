import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Heart, Trophy } from 'lucide-react';

const ACTIVITY_MESSAGES = [
  {
    icon: Zap,
    text: "Sarah ('22) just stepped up to help with a software engineering role!",
    color: "text-blue-600"
  },
  {
    icon: Heart,  
    text: "A UF parent shared job openings at JPMorgan Chase.",
    color: "text-green-600"
  },
  {
    icon: Users,
    text: "Michael just made an introduction for a marketing internship.",
    color: "text-purple-600"
  },
  {
    icon: Trophy,
    text: "8 new connections made in the last hour!",
    color: "text-orange-600"
  }
];

export default function LiveTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ACTIVITY_MESSAGES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const currentMessage = ACTIVITY_MESSAGES[currentIndex];
  const Icon = currentMessage.icon;

  return (
    <div className="flex justify-center mb-6">
      <motion.div
        className="relative flex items-center justify-center p-4 bg-white border border-slate-200 rounded-full shadow-sm cursor-pointer max-w-2xl w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
        transition={{ duration: 0.2 }}
      >
        {/* LIVE Badge */}
        <Badge className="absolute left-3 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 border-green-200 text-xs py-1 px-2.5 flex-shrink-0">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          LIVE
        </Badge>

        {/* Message Content with improved alignment */}
        <div className="flex-grow text-center ml-20 mr-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center gap-2 text-sm text-slate-700 font-medium"
            >
              <Icon className={`w-4 h-4 ${currentMessage.color} flex-shrink-0`} />
              <span className="truncate">{currentMessage.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
          {ACTIVITY_MESSAGES.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-blue-500 w-4' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}