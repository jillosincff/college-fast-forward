import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Users, Sparkles } from 'lucide-react';

export default function ImpactCounter() {
  const [stats, setStats] = useState({
    studentsHelped: 217,
    connectionsMode: 847,
    activeMentors: 156,
    successStories: 94
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        studentsHelped: prev.studentsHelped + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-xl"
    >
      <div className="text-center mb-4">
        <motion.h2 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-6 h-6 text-yellow-300" />
          Your Gator Network is Powerful 💙🧡
        </motion.h2>
        <p className="text-blue-100 text-lg">
          Every connection helps a student's future.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <Trophy className="w-6 h-6 text-yellow-300 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.studentsHelped}</div>
          <div className="text-xs text-blue-100">Students Helped</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <Heart className="w-6 h-6 text-red-300 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.connectionsMode}</div>
          <div className="text-xs text-blue-100">Connections Made</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <Users className="w-6 h-6 text-green-300 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.activeMentors}</div>
          <div className="text-xs text-blue-100">Active Mentors</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
        >
          <Sparkles className="w-6 h-6 text-purple-300 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats.successStories}%</div>
          <div className="text-xs text-blue-100">Success Rate</div>
        </motion.div>
      </div>
    </motion.div>
  );
}