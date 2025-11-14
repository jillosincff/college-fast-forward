
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { 
  Share2,
  ArrowRight,
  UserPlus,
  Target
} from 'lucide-react';
import { useRouter } from '@/components/router/SimpleRouter';
import { useToast } from '@/components/ui/use-toast';

// Big celebration confetti animation
const MegaCelebrationConfetti = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ['#0021A5', '#FA4616', '#FFD700', '#32CD32', '#FF69B4', '#8A2BE2'][i % 6],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, rotate: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 1, 0],
            rotate: [0, 180, 360, 540],
            y: [0, -300, -600],
            x: [0, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 800],
            opacity: [1, 1, 1, 0]
          }}
          transition={{
            duration: 4,
            ease: "easeOut",
            delay: i * 0.05
          }}
        />
      ))}
      
      {/* Floating emojis */}
      {['🎉', '🐊', '🔥', '⭐', '💙', '🚀', '🏆', '✨'].map((emoji, i) => (
        <motion.div
          key={`emoji-${i}`}
          className="absolute text-4xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, rotate: 0, y: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            rotate: [0, 360],
            y: [0, -200, -400],
            x: [0, (Math.random() - 0.5) * 200]
          }}
          transition={{
            duration: 3,
            ease: "easeOut",
            delay: i * 0.2
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Gator mascot celebration
const GatorCelebration = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 1, delay: 0.5 }}
      className="text-8xl mb-4"
    >
      🐊
    </motion.div>
  );
};

// Impact counter with animation
const ImpactCounter = ({ count, label }) => {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = count;
    const duration = 2000;
    const incrementTime = duration / end;

    const timer = setInterval(() => {
      start += 1;
      setAnimatedCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="text-center"
    >
      <motion.div
        className="text-6xl font-bold bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] bg-clip-text text-transparent"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, delay: 2 }}
      >
        {animatedCount}
      </motion.div>
      <p className="text-lg font-semibold text-slate-700">{label}</p>
    </motion.div>
  );
};

const NextActionButtons = ({ onAction }) => {
  const actions = [
    {
      id: 'help_more',
      title: 'Help Another Gator',
      description: "Keep the momentum going!",
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      primary: true
    },
    {
      id: 'share',
      title: 'Share Your Good Deed',
      description: 'Inspire others to help',
      icon: Share2,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'dashboard',
      title: 'View Dashboard',
      description: 'See your impact',
      icon: UserPlus,
      color: 'from-purple-500 to-violet-600'
    }
  ];

  return (
    <div className="space-y-4">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5 }}
        className="text-xl font-bold text-center text-slate-900 mb-4"
      >
        What's next?
      </motion.h3>
      
      <div className="grid gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.7 + index * 0.1 }}
            onClick={() => onAction(action.id)}
            className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-105 ${
              action.primary 
                ? 'bg-gradient-to-r from-[var(--uf-orange)] to-red-500 text-white shadow-lg hover:shadow-xl' 
                : 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${
                action.primary 
                  ? 'bg-white/20' 
                  : `bg-gradient-to-r ${action.color} text-white`
              }`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{action.title}</h4>
                <p className={`text-sm ${action.primary ? 'text-white/90' : 'text-slate-600'}`}>
                  {action.description}
                </p>
              </div>
              <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                action.primary ? 'text-white/90' : 'text-slate-400'
              }`} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default function ConnectionSuccessModal({ 
  isOpen, 
  onClose, 
  request, 
  poster, 
  helperName = 'Gator' 
}) {
  const { navigate } = useRouter();
  const { toast } = useToast();
  const [helpersCount] = useState(Math.floor(Math.random() * 8) + 3); // Random 3-10 helpers

  const handleNextAction = async (actionId) => {
    switch (actionId) {
      case 'help_more':
        onClose();
        // Stay on the same page to help more
        break;
      case 'share':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'I just helped a fellow Gator!',
              text: `Just connected with ${poster?.full_name?.split(' ')[0]} to help with their ${request?.role} search on College Fast Forward. The Gator Nation is amazing! 🐊`,
              url: window.location.href
            });
          } catch (error) {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast({ title: "Link copied to clipboard!", description: "Share this platform with others!" });
          }
        } else {
          navigator.clipboard.writeText(window.location.href);
          toast({ title: "Link copied to clipboard!", description: "Share this platform with others!" });
        }
        break;
      case 'dashboard':
        onClose();
        navigate('Dashboard');
        break;
    }
  };

  if (!isOpen || !request || !poster) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-0 bg-transparent shadow-none p-0">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <MegaCelebrationConfetti />
          
          <div className="p-8 text-center relative z-10">
            <GatorCelebration />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                You're a Gator Hero! 
              </h1>
              <p className="text-xl text-slate-600 mb-6">
                Thank you for helping <span className="font-semibold text-[var(--uf-blue)]">{poster.full_name?.split(' ')[0]}</span>! 
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-6 mb-8 border border-orange-200"
            >
              <ImpactCounter 
                count={helpersCount} 
                label="Gators making a difference today" 
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="text-lg font-semibold text-slate-700 mt-4"
              >
                You joined {helpersCount - 1} others — Go Gators! 🐊
              </motion.p>
            </motion.div>

            <NextActionButtons onAction={handleNextAction} />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
