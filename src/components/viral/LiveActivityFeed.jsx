import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Handshake, Star, Zap } from 'lucide-react';

const mockActivities = [
  { id: 1, type: 'connection', user1: 'Sarah M.', user2: 'John D.', role: 'Software Engineer', time: '2m' },
  { id: 2, type: 'success', user: 'Mike R.', achievement: 'landed an internship at Google', time: '5m' },
  { id: 3, type: 'help', user: 'Lisa K.', action: 'offered mentorship to 3 students', time: '8m' },
  { id: 4, type: 'milestone', user: 'David P.', milestone: 'reached 100 connections', time: '12m' },
  { id: 5, type: 'connection', user1: 'Anna T.', user2: 'Robert L.', role: 'Marketing Manager', time: '15m' },
];

const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'connection': return <Handshake className="w-4 h-4 text-blue-500" />;
    case 'success': return <Star className="w-4 h-4 text-yellow-500" />;
    case 'help': return <Heart className="w-4 h-4 text-red-500" />;
    case 'milestone': return <Zap className="w-4 h-4 text-purple-500" />;
    default: return <Heart className="w-4 h-4 text-gray-500" />;
  }
};

export default function LiveActivityFeed({ isVisible = true }) {
  const [activities, setActivities] = useState(mockActivities);
  const [currentActivity, setCurrentActivity] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentActivity(prev => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, activities.length]);

  if (!isVisible) return null;

  const activity = activities[currentActivity];

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'connection':
        return `${activity.user1} connected with ${activity.user2} for ${activity.role}`;
      case 'success':
        return `${activity.user} ${activity.achievement}!`;
      case 'help':
        return `${activity.user} ${activity.action}`;
      case 'milestone':
        return `${activity.user} ${activity.milestone}!`;
      default:
        return 'Something awesome happened!';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-20 right-4 z-30 max-w-sm"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentActivity}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-full">
              <ActivityIcon type={activity.type} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 leading-snug">
                {getActivityText(activity)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{activity.time} ago</p>
            </div>
          </div>
          
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4, ease: 'linear' }}
            className="h-1 bg-[var(--uf-orange)] rounded-full mt-3"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}