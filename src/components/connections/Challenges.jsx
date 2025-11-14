import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const CHALLENGES_DATA = [
  { id: 1, title: "Help 2 Gators today", progress: 1, goal: 2, reward: "Streak Shield" },
  { id: 2, title: "Make 3 intros this week", progress: 1, goal: 3, reward: "Gold Connector Frame" },
  { id: 3, title: "Refer an alumni", progress: 0, goal: 1, reward: "+50 points" },
];

export default function Challenges() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-purple-600" />
          Daily Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {CHALLENGES_DATA.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-sm font-semibold text-slate-800 mb-2">{challenge.title}</div>
            <div className="flex items-center gap-3">
              <Progress value={(challenge.progress / challenge.goal) * 100} className="flex-1" />
              <div className="text-xs font-bold text-slate-500">
                {challenge.progress}/{challenge.goal}
              </div>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Reward: {challenge.reward}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}