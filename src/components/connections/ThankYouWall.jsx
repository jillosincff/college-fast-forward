import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Enhanced reaction system with animations
const REACTIONS = [
  { emoji: '👍', key: 'thumbsup', label: 'Like', color: 'text-blue-500' },
  { emoji: '🙌', key: 'celebrate', label: 'Celebrate', color: 'text-yellow-500' },
  { emoji: '🔥', key: 'fire', label: 'Fire', color: 'text-red-500' },
  { emoji: '💡', key: 'lightbulb', label: 'Insightful', color: 'text-purple-500' },
  { emoji: '❤️', key: 'heart', label: 'Love', color: 'text-pink-500' },
];

const THANK_YOUS = [
  {
    id: 1,
    from: "Jessica L.",
    year: "'24",
    to: "Maria R. '18",
    text: "Thank you for the incredible interview prep that landed me my dream job at Google! Your mock interviews were exactly what I needed.",
    company: "Google",
    outcome: "Software Engineer Role",
    reactions: { thumbsup: 47, celebrate: 23, fire: 15, heart: 32 },
    timeAgo: "2 hours ago",
    isNew: true
  },
  {
    id: 2,
    from: "Mike C.",
    year: "'23",
    to: "David K. '20",
    text: "Grateful for the intro to Microsoft. The connection you made changed everything - I start as a PM next month!",
    company: "Microsoft",
    outcome: "Product Manager",
    reactions: { thumbsup: 38, celebrate: 19, fire: 12, lightbulb: 8 },
    timeAgo: "1 day ago",
    isNew: false
  },
  {
    id: 3,
    from: "Emily S.",
    year: "'25",
    to: "Sarah W. '21",
    text: "Your mentorship over the past few months has been life-changing. Thank you for believing in me when I didn't believe in myself!",
    company: "Tesla",
    outcome: "Engineering Internship",
    reactions: { heart: 52, celebrate: 28, thumbsup: 41, fire: 9 },
    timeAgo: "3 days ago",
    isNew: false
  }
];

// Confetti burst component
const ConfettiBurst = ({ isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'][index % 5],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: 1.5,
            delay: index * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Enhanced reaction button with animations
const ReactionButton = ({ reaction, count, isActive, onClick, disabled }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    if (!isActive) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    onClick();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.button
      className={`
        relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
        ${isActive 
          ? `bg-blue-100 ${reaction.color} border border-blue-200` 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      animate={isAnimating ? { 
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0]
      } : {}}
      transition={{ duration: 0.3 }}
      aria-label={`${reaction.label} reaction`}
    >
      <motion.span
        className="text-base"
        animate={isAnimating ? { 
          scale: [1, 1.3, 1],
          rotate: [0, 15, 0]
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {reaction.emoji}
      </motion.span>
      <span className="font-semibold">{count || 0}</span>
      
      <ConfettiBurst 
        isVisible={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </motion.button>
  );
};

// Floating reaction animation
const FloatingReaction = ({ emoji, onComplete }) => (
  <motion.div
    className="absolute text-2xl pointer-events-none z-20"
    initial={{ scale: 0, opacity: 0, y: 0 }}
    animate={{
      scale: [0, 1.5, 1],
      opacity: [0, 1, 0],
      y: [-50, -80, -100],
      x: [0, Math.random() * 20 - 10]
    }}
    transition={{ duration: 2, ease: "easeOut" }}
    onAnimationComplete={onComplete}
  >
    {emoji}
  </motion.div>
);

// Enhanced thank you card
const ThankYouCard = ({ thankYou, onReact }) => {
  const [userReactions, setUserReactions] = useState({});
  const [floatingReactions, setFloatingReactions] = useState([]);

  const handleReaction = (reactionKey) => {
    const isCurrentlyActive = userReactions[reactionKey];
    const newUserReactions = {
      ...userReactions,
      [reactionKey]: !isCurrentlyActive
    };
    setUserReactions(newUserReactions);
    
    // Add floating reaction animation
    if (!isCurrentlyActive) {
      const reactionEmoji = REACTIONS.find(r => r.key === reactionKey)?.emoji;
      const newFloating = {
        id: Date.now(),
        emoji: reactionEmoji
      };
      setFloatingReactions(prev => [...prev, newFloating]);
    }
    
    onReact?.(thankYou.id, reactionKey, !isCurrentlyActive);
  };

  const removeFloatingReaction = (id) => {
    setFloatingReactions(prev => prev.filter(r => r.id !== id));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4, 
        transition: { duration: 0.2 } 
      }}
      className="relative"
    >
      <Card className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-lg">
        <CardContent className="p-6">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {thankYou.from.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{thankYou.from}</span>
                  <Badge variant="outline" className="text-xs">
                    {thankYou.year}
                  </Badge>
                  {thankYou.isNew && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Badge className="bg-green-500 text-white text-xs">
                        ✨ New
                      </Badge>
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  to {thankYou.to} • {thankYou.timeAgo}
                </p>
              </div>
            </div>
            
            {/* Outcome badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-right"
            >
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold mb-1">
                🎉 {thankYou.outcome}
              </Badge>
              <p className="text-xs text-slate-500 font-medium">{thankYou.company}</p>
            </motion.div>
          </div>

          {/* Thank you message */}
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
            <p className="text-slate-700 italic leading-relaxed">
              "{thankYou.text}"
            </p>
          </div>

          {/* Enhanced reaction bar */}
          <div className="relative flex flex-wrap gap-2">
            {REACTIONS.map((reaction) => (
              <ReactionButton
                key={reaction.key}
                reaction={reaction}
                count={thankYou.reactions[reaction.key] + (userReactions[reaction.key] ? 1 : 0)}
                isActive={userReactions[reaction.key]}
                onClick={() => handleReaction(reaction.key)}
              />
            ))}
            
            {/* Floating reactions */}
            {floatingReactions.map((floating) => (
              <FloatingReaction
                key={floating.id}
                emoji={floating.emoji}
                onComplete={() => removeFloatingReaction(floating.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced thank you modal
const ThankYouModal = ({ isOpen, onClose, thankYous }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <Heart className="w-6 h-6 text-red-500" />
          Thank You Wall
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.span>
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {thankYous.map((thankYou) => (
          <ThankYouCard key={thankYou.id} thankYou={thankYou} />
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default function ThankYouWall() {
  const [activeTab, setActiveTab] = useState('recent');
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex(prev => (prev + 1) % THANK_YOUS.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  const sortedThanks = [...THANK_YOUS].sort((a, b) => {
    if (activeTab === 'trending') {
      const aTotal = Object.values(a.reactions).reduce((sum, count) => sum + count, 0);
      const bTotal = Object.values(b.reactions).reduce((sum, count) => sum + count, 0);
      return bTotal - aTotal;
    }
    return a.id - b.id; // Recent first
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💙
                </motion.div>
                Thank You Wall
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(true)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
              >
                View All →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence mode="wait">
              <ThankYouCard 
                key={THANK_YOUS[currentStoryIndex].id}
                thankYou={THANK_YOUS[currentStoryIndex]} 
              />
            </AnimatePresence>
            
            {/* Navigation dots */}
            <div className="flex justify-center gap-2 pt-2">
              {THANK_YOUS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentStoryIndex 
                      ? 'bg-purple-500 w-6' 
                      : 'bg-purple-200 hover:bg-purple-300'
                  }`}
                  aria-label={`Go to story ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ThankYouModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        thankYous={sortedThanks}
      />
    </>
  );
}