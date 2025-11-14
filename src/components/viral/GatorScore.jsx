import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Heart, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

const achievements = [
  { id: 'swamp_legend', name: 'Swamp Legend', icon: Trophy, threshold: 100, color: 'gold' },
  { id: 'connection_catalyst', name: 'Connection Catalyst', icon: Zap, threshold: 50, color: 'blue' },
  { id: 'gator_guardian', name: 'Gator Guardian', icon: Heart, threshold: 25, color: 'red' },
  { id: 'rising_star', name: 'Rising Star', icon: Star, threshold: 10, color: 'yellow' },
];

export default function GatorScore({ score = 0, showDetailed = false }) {
  const { user } = useAuth();
  const [displayScore, setDisplayScore] = useState(0);
  const [recentGain, setRecentGain] = useState(0);
  const [streak, setStreak] = useState(5);

  useEffect(() => {
    // Animate score counting up
    const interval = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < score) {
          return Math.min(prev + Math.ceil((score - prev) / 10), score);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [score]);

  const getScoreLevel = (score) => {
    if (score >= 500) return { level: 'Swamp Legend', color: 'from-yellow-400 to-yellow-600', icon: Trophy };
    if (score >= 200) return { level: 'Gator Guardian', color: 'from-purple-400 to-purple-600', icon: Heart };
    if (score >= 100) return { level: 'Connection Pro', color: 'from-blue-400 to-blue-600', icon: Zap };
    if (score >= 50) return { level: 'Rising Gator', color: 'from-green-400 to-green-600', icon: Star };
    return { level: 'New Gator', color: 'from-slate-400 to-slate-600', icon: TrendingUp };
  };

  const currentLevel = getScoreLevel(displayScore);
  const nextLevel = getScoreLevel(displayScore + 50);
  const progress = ((displayScore % 50) / 50) * 100;

  const unlockedAchievements = achievements.filter(achievement => displayScore >= achievement.threshold);

  if (!showDetailed) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={`bg-gradient-to-r ${currentLevel.color} text-white font-bold px-3 py-1`}>
          <currentLevel.icon className="w-4 h-4 mr-1" />
          {displayScore} pts
        </Badge>
        {streak > 0 && (
          <Badge variant="outline" className="text-[var(--uf-orange)] border-orange-300">
            {streak} day streak 🔥
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${currentLevel.color} flex items-center justify-center shadow-lg`}
          >
            <currentLevel.icon className="w-8 h-8 text-white" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-1">
            {displayScore.toLocaleString()}
          </h3>
          <p className="text-slate-600 font-medium">{currentLevel.level}</p>
          
          {recentGain > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-green-600 font-bold text-sm mt-2"
            >
              +{recentGain} points earned!
            </motion.div>
          )}
        </div>

        {/* Progress to next level */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progress to {nextLevel.level}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${nextLevel.color} rounded-full`}
            />
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">Achievements Unlocked</h4>
          <div className="grid grid-cols-2 gap-2">
            {unlockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-2 bg-white rounded-lg border"
              >
                <achievement.icon className={`w-4 h-4 text-${achievement.color}-500`} />
                <span className="text-xs font-medium text-slate-700">{achievement.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Streak Counter */}
        {streak > 0 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
              <span className="text-2xl">🔥</span>
              <span className="font-bold text-[var(--uf-orange)]">
                {streak} Day Helping Streak!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}