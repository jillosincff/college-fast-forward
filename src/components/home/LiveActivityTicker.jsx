import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, GraduationCap, Heart } from 'lucide-react';

const WIN_MESSAGES = [
  {
    icon: Briefcase,
    text: "Michael ('19) just helped Sarah ('24) land a full-time job.",
    highlight: ["Michael ('19)", "Sarah ('24)", "full-time job"]
  },
  {
    icon: Briefcase,
    text: "A UF Parent just shared a job opening at JPMorgan Chase.",
    highlight: ["UF Parent", "JPMorgan Chase"]
  },
  {
    icon: Heart,
    text: "Anna just offered resume feedback to Brian ('24).",
    highlight: ["Anna", "Brian ('24)", "resume feedback"]
  },
  {
    icon: Users,
    text: "12 new roommate listings were posted in New York City today.",
    highlight: ["roommate listings", "New York City"]
  },
  {
    icon: GraduationCap,
    text: "David ('22) got career advice from a mentor in the tech industry.",
    highlight: ["David ('22)", "mentor", "tech industry"]
  },
];

export default function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setIndex((i) => (i + 1) % WIN_MESSAGES.length);
      }, 4000);
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
      highlightedText = highlightedText.replace(regex, '<strong class="font-bold text-blue-700">$1</strong>');
    });

    return highlightedText;
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      filter: 'blur(4px)'
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
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      filter: 'blur(4px)'
    }),
  };

  const currentMessage = WIN_MESSAGES[index];
  const Icon = currentMessage.icon;

  return (
    <div className="mt-6 flex justify-center overflow-hidden px-4">
      <motion.div
        className="relative flex items-center justify-center p-3 sm:p-4 bg-white border border-slate-200 rounded-full shadow-lg cursor-pointer max-w-2xl w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
          backgroundColor: "rgba(249,250,251,1)"
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Enhanced Animated background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.05), rgba(59, 130, 246, 0.05), rgba(34, 197, 94, 0.05))',
            backgroundSize: '200% 200%'
          }}
          animate={{
            backgroundPosition: isPaused ? '0% 50%' : ['0% 50%', '100% 50%', '0% 50%'],
            opacity: isPaused ? 0.4 : [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: isPaused ? 0 : Infinity,
            ease: "easeInOut"
          }}
        />

        {/* LIVE Badge with pulse */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10"
        >
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs py-1 px-2 sm:px-2.5 flex-shrink-0 hover:bg-green-200 transition-colors">
            <span className="relative flex h-2 w-2 mr-1 sm:mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="hidden sm:inline font-semibold">LIVE</span>
            <span className="sm:hidden">●</span>
          </Badge>
        </motion.div>

        {/* Enhanced Message Content with Better Contrast */}
        <div className="flex-grow text-center h-6 flex items-center justify-center ml-12 sm:ml-16 mr-2 sm:mr-4 relative z-10 overflow-hidden">
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
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 },
                filter: { duration: 0.3 }
              }}
              className="flex items-center gap-2 text-sm sm:text-base text-slate-700 whitespace-nowrap font-medium absolute inset-0 justify-center"
            >
              <motion.div
                initial={{ rotate: -15, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
              </motion.div>
              <span
                className="truncate sm:whitespace-normal leading-tight max-w-[280px] sm:max-w-none"
                dangerouslySetInnerHTML={{
                  __html: highlightText(currentMessage.text, currentMessage.highlight)
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pause indicator with animation */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 text-xs hidden sm:block bg-slate-100 px-2 py-1 rounded-full"
            >
              ⏸
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile optimization styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .truncate {
            max-width: 200px;
          }
        }
        @media (max-width: 480px) {
          .truncate {
            max-width: 160px;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}