
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Star, Zap, Crown } from 'lucide-react';

const FlameParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-1 h-1 bg-orange-400 rounded-full"
    initial={{ scale: 0, opacity: 0, y: 0 }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      y: [-20, -40, -60],
      x: [0, Math.random() * 10 - 5, Math.random() * 15 - 7.5],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeOut"
    }}
  />
);

const StreakBadge = ({ streak, type = 'daily' }) => {
  const getStreakLevel = () => {
    if (streak >= 30) return { level: 'legendary', color: 'bg-purple-100 text-purple-700', icon: Crown };
    if (streak >= 14) return { level: 'fire', color: 'bg-red-100 text-red-700', icon: Flame };
    if (streak >= 7) return { level: 'hot', color: 'bg-orange-100 text-orange-700', icon: Zap };
    if (streak >= 3) return { level: 'warm', color: 'bg-yellow-100 text-yellow-700', icon: Star };
    return { level: 'starting', color: 'bg-blue-100 text-blue-700', icon: Trophy };
  };

  const { level, color, icon: Icon } = getStreakLevel();
  const isOnFire = streak >= 7;

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Flame particles for hot streaks */}
      {isOnFire && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {Array.from({ length: 8 }).map((_, index) => (
            <FlameParticle key={index} delay={index * 0.2} />
          ))}
        </div>
      )}

      {/* Glow effect for high streaks */}
      {streak >= 14 && (
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${color.replace('bg-', 'from-').replace(' text-', ' to-').replace(/-\d+/, '-500')} rounded-xl opacity-20 blur-sm`}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <Card className={`relative overflow-hidden bg-white border-2 ${color.replace('bg-', 'border-').replace('text-', 'text-').replace(/-\d+/, '-300')} shadow-lg`}>
        <CardContent className="p-4 text-center">
          <motion.div
            animate={isOnFire ? { 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center justify-center mb-2 ${color.replace('bg-', 'text-')}`}
          >
            <Icon className="w-8 h-8 mr-2" />
            <span className="text-3xl font-bold">{streak}</span>
          </motion.div>
          
          <p className={`text-sm font-semibold opacity-90 ${color.replace('bg-', 'text-')}`}>
            {type === 'daily' ? 'Day Streak' : 'Week Streak'}
          </p>
          
          <motion.p 
            className={`text-xs opacity-75 mt-1 capitalize ${color.replace('bg-', 'text-')}`}
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {level} {level === 'legendary' ? '👑' : isOnFire ? '🔥' : '⭐'}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function StreakCounter({ 
  dailyStreak = 5, 
  weeklyStreak = 3,
  lastActivity = new Date(),
  onStreakClick 
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Streak Display */}
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => setShowDetails(!showDetails)} className="cursor-pointer">
          <StreakBadge streak={dailyStreak} type="daily" />
        </div>
        <div onClick={() => setShowDetails(!showDetails)} className="cursor-pointer">
          <StreakBadge streak={weeklyStreak} type="weekly" />
        </div>
      </div>

      {/* Streak Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-slate-50 border border-slate-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Streak resets in:</span>
                  <Badge variant="outline" className="font-mono">
                    {timeUntilReset}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-xs text-slate-500">
                  <p>💡 Keep your streak alive by helping at least one Gator daily!</p>
                  <p>🏆 30-day streak unlocks Legendary status</p>
                  <p>🔥 7+ days gets you on fire with flame effects</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
