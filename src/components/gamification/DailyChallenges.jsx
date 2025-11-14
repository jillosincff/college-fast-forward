
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Star,
  Calendar,
  CalendarDays,
  Info
} from 'lucide-react';

// Updated challenge data with string icons suitable for direct rendering
const DAILY_CHALLENGES_DATA = [
  {
    id: 'help_two',
    title: 'Help 2 Gators Today',
    description: 'Make connections for two different students',
    progress: 1,
    goal: 2,
    reward: 'Streak Shield 🛡️',
    points: 50,
    icon: '🤝', // Handshake emoji (replaces Users icon)
    difficulty: 'easy',
    timeLeft: '6h 24m'
  },
  {
    id: 'share_story',
    title: 'Share a Success Story',
    description: 'Post about a recent connection success',
    progress: 0,
    goal: 1,
    reward: 'Storyteller Badge 📖',
    points: 30,
    icon: '📣', // Megaphone emoji (replaces Share2 icon)
    difficulty: 'medium',
    timeLeft: '6h 24m'
  },
  {
    id: 'invite_alumni',
    title: 'Invite an Alumni Friend',
    description: 'Refer someone to join the network',
    progress: 0,
    goal: 1,
    reward: '+100 points & Gold Frame 🏅',
    points: 100,
    icon: '🎁', // Gift emoji (replaces Gift icon)
    difficulty: 'hard',
    timeLeft: '6h 24m'
  }
];

const WEEKLY_CHALLENGES_DATA = [
  {
    id: 'week_connections',
    title: 'Make 5 Introductions',
    description: 'Help students connect with your network',
    progress: 3,
    goal: 5,
    reward: 'Master Connector Title',
    points: 200,
    icon: '🎯', // Bullseye emoji (replaces Target icon)
    difficulty: 'medium',
    timeLeft: '3d 6h'
  },
  {
    id: 'mentor_sessions',
    title: 'Host 2 Mentoring Calls',
    description: 'Schedule video calls with students',
    progress: 1,
    goal: 2,
    reward: 'Mentor of the Week 👨‍🏫',
    points: 150,
    icon: '💬', // Speech bubble emoji (replaces MessageSquare icon)
    difficulty: 'hard',
    timeLeft: '3d 6h'
  }
];

function ChallengesHeader({ activeTab, onTabChange, completedCount, totalChallenges }) {
  return (
    <div className="w-full px-4 pt-4 pb-2">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="text-xl font-bold flex items-center gap-2">
          <motion.span 
            role="img" 
            aria-label="Trophy" 
            className="text-yellow-500 text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            🏆
          </motion.span>
          <span>Challenges</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="ml-1 p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <Info className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white text-slate-800 border shadow-lg max-w-xs">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Why complete challenges?</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• Boost your profile visibility</li>
                    <li>• Earn exclusive badges & titles</li>
                    <li>• Help more Gators succeed</li>
                    <li>• Build your network reputation</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Progress and Tabs row with better spacing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{completedCount}/{totalChallenges} completed</span>
          </div>
          
          {/* Enhanced tabs with icons and better styling */}
          <div className="flex gap-1 bg-slate-100 rounded-full p-1">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1
                ${activeTab === "daily" 
                  ? "bg-white text-slate-900 shadow-sm border-b-2 border-blue-500" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              onClick={() => onTabChange("daily")}
            >
              <Calendar className="w-3 h-3" />
              <span>Daily</span>
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1
                ${activeTab === "weekly" 
                  ? "bg-white text-slate-900 shadow-sm border-b-2 border-blue-500" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              onClick={() => onTabChange("weekly")}
            >
              <CalendarDays className="w-3 h-3" />
              <span>Weekly</span>
            </button>
          </div>
          
        </div>
        
        {/* Time remaining badge */}
        <div className="flex justify-end">
          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
            ⏰ {activeTab === 'daily' ? '6h 24m left' : '3d 6h left'}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function DailyChallenges({ onChallengeComplete }) {
  const [activeTab, setActiveTab] = useState('daily');
  // Initialize challenges with 'claimed' status, as it's a piece of state
  const [dailyChallenges, setDailyChallenges] = useState(
    DAILY_CHALLENGES_DATA.map(c => ({ ...c, claimed: false }))
  );
  const [weeklyChallenges, setWeeklyChallenges] = useState(
    WEEKLY_CHALLENGES_DATA.map(c => ({ ...c, claimed: false }))
  );

  // Helper to get current challenges array and its setter function based on active tab
  const challenges = activeTab === 'daily' ? dailyChallenges : weeklyChallenges;
  const setChallenges = activeTab === 'daily' ? setDailyChallenges : setWeeklyChallenges;

  /**
   * Handles a click on a challenge card. If the challenge is not yet completed,
   * it increments its progress.
   * @param {object} challengeClicked - The challenge object that was clicked.
   */
  const handleChallengeClick = (challengeClicked) => {
    setChallenges(prevChallenges =>
      prevChallenges.map(c =>
        // Increment progress only if it's the clicked challenge and not yet completed
        c.id === challengeClicked.id && c.progress < c.goal
          ? { ...c, progress: c.progress + 1 }
          : c
      )
    );
  };

  /**
   * Handles claiming the reward for a completed challenge.
   * Marks the challenge as claimed and notifies the parent component.
   * @param {object} challengeToClaim - The challenge object for which the reward is being claimed.
   */
  const handleClaimReward = (challengeToClaim) => {
    setChallenges(prevChallenges =>
      prevChallenges.map(c =>
        c.id === challengeToClaim.id ? { ...c, claimed: true } : c
      )
    );
    // Trigger any parent-level completion logic
    onChallengeComplete?.(challengeToClaim);
  };

  /**
   * Renders a single challenge card with enhanced styling and animations.
   * This function replaces the standalone ChallengeCard component.
   * @param {object} challenge - The challenge data.
   * @param {number} index - The index of the challenge in the list for animation delays.
   * @returns {JSX.Element} The rendered challenge card.
   */
  const renderChallenge = (challenge, index) => {
    const isCompleted = challenge.progress >= challenge.goal; // Dynamically determine completion status
    const progressPercentage = (challenge.progress / challenge.goal) * 100;

    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`
          relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
          ${isCompleted
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
          }
        `}
        whileHover={{ scale: 1.02 }}
        onClick={() => !isCompleted && handleChallengeClick(challenge)} // Card is clickable only if not completed
      >
        <div className="flex items-start gap-4">
          {/* Challenge Icon - Enhanced with Animation */}
          <motion.div
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold
              ${isCompleted
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              }
            `}
            animate={isCompleted ? {} : { // Apply animation only if not completed
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            {challenge.icon} {/* Renders the emoji/string icon */}
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900">{challenge.title}</h4>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Badge className="bg-green-500 text-white">
                    ✨ Complete!
                  </Badge>
                </motion.div>
              )}
            </div>

            <p className="text-sm text-slate-600 mb-3">{challenge.description}</p>

            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{challenge.progress}/{challenge.goal}</span>
                <span className="font-semibold text-purple-600">{challenge.reward}</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`
                    h-full rounded-full relative overflow-hidden
                    ${isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }
                  `}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "linear"
                    }}
                    style={{ transform: 'skewX(-25deg)' }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Claim Button */}
            {isCompleted && !challenge.claimed && ( // Show claim button only if completed and not yet claimed
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3"
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent card's onClick from firing
                    handleClaimReward(challenge);
                  }}
                >
                  Claim Reward! 🎉
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const totalChallenges = challenges.length;
  // Count completed challenges based on their current progress vs goal
  const completedCount = challenges.filter(c => c.progress >= c.goal).length;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <ChallengesHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        completedCount={completedCount}
        totalChallenges={totalChallenges}
      />

      <CardContent className="px-4 pb-4">
        {/* AnimatePresence for smooth transitions between tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // Key changes to trigger exit/enter animations on tab switch
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {challenges.map((challenge, index) => (
              // Call the renderChallenge function directly for each challenge
              renderChallenge(challenge, index)
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
