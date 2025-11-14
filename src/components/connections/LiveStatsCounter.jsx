import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Users, Handshake, Zap, TrendingUp } from 'lucide-react';

export default function LiveStatsCounter({ className = "" }) {
  const [stats, setStats] = useState({
    introsToday: 47,
    alumniOnline: 234,
    connectionsMade: 1247,
    successRate: 89
  });
  
  const [recentActivity, setRecentActivity] = useState([
    "Sarah M. just connected with Alex K. 🎉",
    "New intro made: Marketing → Tech transition",
    "Miguel R. landed an interview through a Gator connection!",
    "3 new alumni joined in the last hour"
  ]);
  
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        introsToday: prev.introsToday + (Math.random() > 0.7 ? 1 : 0),
        alumniOnline: prev.alumniOnline + Math.floor(Math.random() * 3) - 1,
        connectionsMade: prev.connectionsMade + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Rotate recent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex(prev => (prev + 1) % recentActivity.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [recentActivity.length]);

  const statItems = [
    {
      icon: Handshake,
      label: "Intros Today",
      value: stats.introsToday,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      label: "Alumni Online",
      value: stats.alumniOnline,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Zap,
      label: "Total Connections",
      value: stats.connectionsMade.toLocaleString(),
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      label: "Success Rate",
      value: `${stats.successRate}%`,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Live Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              ${stat.bgColor} rounded-xl p-4 text-center
              border border-slate-200/50 shadow-sm
            `}
          >
            <div className={`w-8 h-8 ${stat.color} mx-auto mb-2`}>
              <stat.icon className="w-full h-full" />
            </div>
            <motion.div
              key={stat.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-2xl font-bold ${stat.color} mb-1`}
            >
              {stat.value}
            </motion.div>
            <div className="text-xs font-medium text-slate-600">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Activity Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50"
      >
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500 text-white text-xs font-bold px-2 py-1">
            <div className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse" />
            LIVE
          </Badge>
          <div className="flex-1 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentActivityIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-slate-700 truncate"
              >
                {recentActivity[currentActivityIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}