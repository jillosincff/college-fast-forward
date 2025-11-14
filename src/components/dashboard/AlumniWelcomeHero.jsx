import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Award, Target } from 'lucide-react';

export default function AlumniWelcomeHero({ impactStats }) {
  const { user } = useAuth();
  
  const firstName = user?.full_name?.split(' ')[0] || 'Gator';
  const gradYear = user?.graduation_year ? `'${user.graduation_year.toString().slice(-2)}` : '';
  
  const getRankIcon = (rank) => {
    switch (rank) {
      case 'Gator Legend': return Trophy;
      case 'Mentor Elite': return Award;
      case 'Impact Maker': return Star;
      default: return Target;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Gator Legend': return 'from-yellow-400 to-amber-500';
      case 'Mentor Elite': return 'from-purple-400 to-indigo-500';
      case 'Impact Maker': return 'from-green-400 to-emerald-500';
      default: return 'from-blue-400 to-cyan-500';
    }
  };

  const RankIcon = getRankIcon(impactStats.mentorRank);
  const rankGradient = getRankColor(impactStats.mentorRank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-8 text-white"
      style={{ 
        background: 'linear-gradient(135deg, #0021A5 0%, #3868D8 60%, #FA4616 100%)'
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Animated Gator */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-6 right-6"
      >
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-6xl"
          aria-hidden="true"
        >
          🐊
        </motion.div>
      </motion.div>
      
      <div className="relative z-10 max-w-4xl">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome back, {firstName}!
            </h1>
            {gradYear && (
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-3 py-1">
                Class of {gradYear}
              </Badge>
            )}
          </div>
          
          <p className="text-lg md:text-xl opacity-90 max-w-3xl">
            Your mentorship makes a difference. Here's your impact on the Gator Nation.
          </p>
        </motion.div>

        {/* Rank Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className={`inline-flex items-center gap-3 bg-gradient-to-r ${rankGradient} px-6 py-3 rounded-2xl shadow-lg`}>
            <RankIcon className="w-6 h-6 text-white" />
            <div>
              <div className="text-sm font-medium opacity-90">Your Mentor Rank</div>
              <div className="text-lg font-bold">{impactStats.mentorRank}</div>
            </div>
          </div>
        </motion.div>
        
        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { 
              label: 'Gators Helped', 
              value: impactStats.studentsHelped,
              icon: '🤝',
              description: 'Students mentored'
            },
            { 
              label: 'Connections', 
              value: impactStats.connectionsMAde,
              icon: '🌟',
              description: 'Successful matches'
            },
            { 
              label: 'Stories Shared', 
              value: impactStats.storiesShared,
              icon: '📚',
              description: 'Inspiring journeys'
            },
            { 
              label: 'Impact Score', 
              value: impactStats.impactScore,
              icon: '🏆',
              description: 'Total influence'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {stat.value}
                </motion.span>
              </div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-xs opacity-70">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center"
        >
          <p className="text-white/80 text-sm italic max-w-2xl mx-auto">
            "Every connection you make strengthens the Gator network for future generations."
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}