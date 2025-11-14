import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Trophy, Heart, Users, Briefcase, GraduationCap, Star } from 'lucide-react';

const LIVE_MESSAGES = [
  {
    icon: Trophy,
    text: "🎉 Sarah just landed a Finance internship at JPMorgan.",
    highlight: ["Sarah", "Finance internship", "JPMorgan"]
  },
  {
    icon: Users,
    text: "🔥 John connected with 3 alumni this week.",
    highlight: ["John", "3 alumni"]
  },
  {
    icon: Briefcase,
    text: "⭐ Michael ('19) just helped Emma ('24) with resume feedback.",
    highlight: ["Michael ('19)", "Emma ('24)", "resume feedback"]
  },
  {
    icon: Heart,
    text: "💼 A UF Parent shared a Marketing opportunity at Disney.",
    highlight: ["UF Parent", "Marketing opportunity", "Disney"]
  },
  {
    icon: GraduationCap,
    text: "🚀 Jessica got career advice from 2 Tech industry mentors.",
    highlight: ["Jessica", "career advice", "Tech industry"]
  },
  {
    icon: Star,
    text: "🎯 David landed an interview through a Gator connection!",
    highlight: ["David", "interview", "Gator connection"]
  }
];

export default function LiveFeedTicker() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setIndex((i) => (i + 1) % LIVE_MESSAGES.length);
      }, 8000); // 8-10 seconds as requested
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const highlightText = (text, highlights = []) => {
    if (!highlights || highlights.length === 0) return text;

    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<strong class="font-bold text-[var(--uf-blue)]">$1</strong>');
    });

    return highlightedText;
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(6px)'
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 400 : -400,
      opacity: 0,
      scale: 0.9,
      filter: 'blur(6px)'
    }),
  };

  const currentMessage = LIVE_MESSAGES[index];
  const Icon = currentMessage.icon;

  return (
    <div className="mb-8 flex justify-center overflow-hidden px-4">
      <motion.div
        className="relative flex items-center justify-center p-4 sm:p-6 bg-gradient-to-r from-white via-blue-50/50 to-white border-2 border-blue-100 rounded-2xl shadow-xl cursor-pointer max-w-4xl w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(245, 130, 32, 0.1), rgba(59, 130, 246, 0.1))',
            backgroundSize: '200% 100%'
          }}
          animate={{
            backgroundPosition: isPaused ? '0% 0%' : ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{
            duration: 4,
            repeat: isPaused ? 0 : Infinity,
            ease: "linear"
          }}
        />

        {/* LIVE Badge */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10"
        >
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-sm py-2 px-3 flex-shrink-0 shadow-lg">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-bold">LIVE</span>
          </Badge>
        </motion.div>

        {/* Message Content */}
        <div className="flex-grow text-center h-8 flex items-center justify-center ml-20 sm:ml-24 mr-4 sm:mr-8 relative z-10 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                filter: { duration: 0.4 }
              }}
              className="flex items-center gap-3 text-base sm:text-lg text-slate-700 whitespace-nowrap font-medium absolute inset-0 justify-center"
            >
              <motion.div
                initial={{ rotate: -20, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.3, rotate: 15 }}
                className="flex-shrink-0"
              >
                <Icon className="w-6 h-6 text-[var(--uf-blue)]" />
              </motion.div>
              <span
                className="truncate leading-tight max-w-[300px] sm:max-w-[500px] lg:max-w-none"
                dangerouslySetInnerHTML={{
                  __html: highlightText(currentMessage.text, currentMessage.highlight)
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pause indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 15 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 15 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm hidden sm:block bg-white/80 px-3 py-1 rounded-full border"
            >
              ⏸ Paused
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkle effects */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-2 right-8 text-yellow-400 text-lg opacity-60"
        >
          ✨
        </motion.div>
      </motion.div>
    </div>
  );
}