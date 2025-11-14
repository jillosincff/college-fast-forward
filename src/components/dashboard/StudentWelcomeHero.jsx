
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Briefcase, Users } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { getGreeting } from '@/components/utils/greetingLogic';

export default function StudentWelcomeHero() {
  const { user } = useAuth();
  const { greeting, firstName, isFirstTime } = getGreeting(user);

  const handleNavigateToConnections = () => {
    trackEvent('student_hero_find_connections_clicked');
    navigate('Connections');
  };

  const handleNavigateToRoommates = () => {
    trackEvent('student_hero_browse_roommates_clicked');
    navigate('Roommates');
  };

  const welcomePrefix = isFirstTime
    ? `${greeting}, ${firstName}! 🎉`
    : `${greeting}, ${firstName}! 🐊`;

  const getHeroMessage = () => {
    if (isFirstTime) {
      return "You're now connected to thousands of Gators ready to help you succeed. Let's get you started with your first connection.";
    }
    return "Land a summer internship or full-time job—snag a post-college roommate for wherever you go next. Your Gator network is here to help.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-8 text-white mb-8"
      style={{
        background: 'linear-gradient(135deg, var(--uf-blue) 0%, var(--uf-orange) 100%)'
      }}
    >
      <div className="absolute inset-0 bg-black/10" />

      {/* Animated Gator Mascot */}
      <motion.div
        initial={{ opacity: 0, x: 30, scale: isFirstTime ? 0.8 : 1 }}
        animate={{
          opacity: 1,
          x: 0,
          scale: isFirstTime ? [0.8, 1.1, 1] : 1
        }}
        transition={{
          delay: 0.5,
          duration: isFirstTime ? 1.2 : 0.8,
          scale: isFirstTime ? { times: [0, 0.7, 1], duration: 1.2 } : {}
        }}
        className="absolute top-4 right-4 text-6xl"
      >
        🐊
      </motion.div>

      <div className="relative z-10">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`font-bold mb-4 ${
              isFirstTime ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
            }`}
          >
            {welcomePrefix}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl leading-relaxed"
          >
            {getHeroMessage()}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              onClick={handleNavigateToConnections}
              className="font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: 'var(--uf-orange)', color: 'white' }}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              Find Job Connections
            </Button>
            <Button
              onClick={handleNavigateToRoommates}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Browse Roommates
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className={`absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl ${isFirstTime ? 'animate-pulse' : ''}`} />
      <div className="absolute bottom-4 right-16 w-20 h-20 bg-[#0021A5]/20 rounded-full blur-lg" />
      {isFirstTime && (
        <div className="absolute top-1/2 left-4 w-16 h-16 bg-orange-400/20 rounded-full blur-lg animate-pulse" />
      )}
    </motion.div>
  );
}
