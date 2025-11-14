import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Award, Target } from 'lucide-react';

const ranks = [
  { name: 'Rising Star', threshold: 0, icon: Target, color: 'from-blue-400 to-cyan-500' },
  { name: 'Impact Maker', threshold: 50, icon: Star, color: 'from-green-400 to-emerald-500' },
  { name: 'Mentor Elite', threshold: 100, icon: Award, color: 'from-purple-400 to-indigo-500' },
  { name: 'Gator Legend', threshold: 200, icon: Trophy, color: 'from-yellow-400 to-amber-500' }
];

export default function ImpactTrackerWidget({ stats, loading }) {
  const currentRank = ranks.slice().reverse().find(r => stats.impactScore >= r.threshold) || ranks[0];
  const nextRank = ranks.find(r => stats.impactScore < r.threshold);
  
  const progressToNextRank = nextRank
    ? ((stats.impactScore - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100
    : 100;

  const RankIcon = currentRank.icon;
  
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-slate-200 rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-slate-200 rounded-full mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-gray-900 text-white shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${currentRank.color}`}>
              <RankIcon className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <div>
            <div className="text-xl font-bold">Your Gator Legacy</div>
            <div className="text-sm font-normal text-white/70">Your impact on the community</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm text-white/70">Current Rank</p>
          <p className="text-2xl font-bold">{currentRank.name}</p>
        </div>
        
        {nextRank ? (
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-white/70">Progress to {nextRank.name}</span>
              <span className="font-bold text-lg">{stats.impactScore} <span className="text-sm text-white/70">/ {nextRank.threshold}</span></span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-green-400 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextRank}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-white/60 mt-2 text-center">
              {nextRank.threshold - stats.impactScore} more points to reach the next level!
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-bold text-lg text-yellow-300">You've reached the highest rank!</p>
            <p className="text-sm text-white/70">Thank you for your legendary impact.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}