import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, Crown, Zap } from 'lucide-react';

const inviteRewards = [
  { threshold: 1, reward: "First Invite Badge", icon: Star, color: "text-blue-500", bgColor: "bg-blue-100" },
  { threshold: 3, reward: "Network Builder", icon: Trophy, color: "text-yellow-500", bgColor: "bg-yellow-100" },
  { threshold: 5, reward: "Gator Ambassador", icon: Award, color: "text-purple-500", bgColor: "bg-purple-100" },
  { threshold: 10, reward: "Elite Connector", icon: Crown, color: "text-orange-500", bgColor: "bg-orange-100" },
  { threshold: 25, reward: "Legendary Gator", icon: Zap, color: "text-red-500", bgColor: "bg-red-100" }
];

export default function InviteProgressTracker({ invitesSent = 0 }) {
  const nextReward = inviteRewards.find(reward => invitesSent < reward.threshold);
  const lastEarnedReward = inviteRewards.filter(reward => invitesSent >= reward.threshold).pop();
  
  const progress = nextReward 
    ? (invitesSent / nextReward.threshold) * 100 
    : 100;

  const invitesNeeded = nextReward ? nextReward.threshold - invitesSent : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Current Achievement */}
      {lastEarnedReward && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center gap-2 mb-3"
        >
          <div className={`p-2 rounded-full ${lastEarnedReward.bgColor}`}>
            <lastEarnedReward.icon className={`w-4 h-4 ${lastEarnedReward.color}`} />
          </div>
          <Badge className={`${lastEarnedReward.bgColor} ${lastEarnedReward.color} border-0 font-semibold`}>
            ✨ {lastEarnedReward.reward}
          </Badge>
        </motion.div>
      )}

      {/* Progress to Next Reward */}
      {nextReward && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress to next reward:</span>
            <span className="font-semibold text-slate-900">{invitesSent}/{nextReward.threshold}</span>
          </div>
          
          <div className="relative">
            <Progress value={progress} className="h-3 bg-slate-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] h-3 rounded-full opacity-20" />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className={`p-1.5 rounded-full ${nextReward.bgColor}`}>
              <nextReward.icon className={`w-3 h-3 ${nextReward.color}`} />
            </div>
            <span className="text-slate-600">
              <span className="font-semibold text-[var(--uf-orange)]">{invitesNeeded} more invite{invitesNeeded !== 1 ? 's' : ''}</span> to unlock <strong>{nextReward.reward}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Maxed Out */}
      {!nextReward && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-0 font-bold">
              🏆 All Rewards Unlocked!
            </Badge>
          </div>
          <p className="text-sm text-slate-600">You're a true Gator legend! Keep inviting to grow our community.</p>
        </div>
      )}
    </div>
  );
}