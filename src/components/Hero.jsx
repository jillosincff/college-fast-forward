
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trophy, Star, Users, Plus, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import LiveStatsCounter from './home/LiveStatsCounter';
import { trackEvent } from '@/components/utils/analytics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Enhanced Hero Component with prominent "Post Your Request" CTA
 * Creates a "wow" moment for users entering the Connections page
 */
const Hero = ({
  initialConnectedCount = 3214,
  onStartFree,
  onExplore,
  onPostOpportunity,
  onShareStory,
  onPostRequest
}) => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState(initialConnectedCount);
  const [connectionsToday, setConnectionsToday] = useState(847);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAITeaser, setShowAITeaser] = useState(true);

  // Dynamic stats that update in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
      setConnectionsToday(prev => prev + Math.floor(Math.random() * 2));
      setCurrentTime(new Date());
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Cycle AI teaser messages
  useEffect(() => {
    const messages = [
      "AI-matched Gators waiting to help",
      "Smart connections in your network",
      "Personalized help just a click away"
    ];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setShowAITeaser(false);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % messages.length;
        setShowAITeaser(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Personalized greeting based on time and user data
  const getPersonalizedGreeting = () => {
    const hour = currentTime.getHours();
    const firstName = user?.full_name?.split(' ')[0] || 'Gator';
    
    let timeGreeting = 'Hello';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    const persona = user?.persona;
    let roleContext = '';
    if (persona === 'student') roleContext = ', ready to unlock your future?';
    else if (persona === 'alumni') roleContext = ', ready to help fellow Gators?';
    else if (persona === 'parent') roleContext = ', ready to support our Gator community?';

    return `${timeGreeting}, ${firstName}${roleContext}`;
  };

  // Handle Post Request click
  const handlePostRequest = () => {
    trackEvent('hero_post_request_clicked', { 
      user_persona: user?.persona || 'guest',
      source: 'emerging_gators_hero'
    });
    
    if (onPostRequest) {
      onPostRequest();
    }
  };

  // Floating animation variants
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    })
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        minHeight: '65vh',
        background: 'linear-gradient(135deg, var(--uf-blue) 0%, var(--uf-orange) 100%)'
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute top-40 right-20 w-24 h-24 rounded-full blur-lg"
          variants={floatingVariants}
          animate="animate"
          style={{ 
            backgroundColor: 'rgba(242, 169, 0, 0.2)',
            animationDelay: '2s' 
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/3 w-20 h-20 bg-green-400/20 rounded-full blur-lg"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        {/* Personalized Welcome Badge */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6"
        >
          <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-6 py-2 text-sm font-semibold">
            <Users className="w-4 h-4 mr-2" />
            <LiveStatsCounter targetValue={activeUsers} /> Gators online now
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="ml-2"
            >
              🟢
            </motion.span>
          </Badge>
        </motion.div>

        {/* Enhanced Hero Headlines */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="block text-2xl sm:text-3xl mb-2 font-medium"
            style={{ color: 'var(--uf-yellow)' }}
          >
            {user ? getPersonalizedGreeting() : 'Welcome to the Gator Network!'}
          </motion.span>
          Unlock Your Future with{' '}
          <motion.span
            className="relative"
            style={{ color: 'var(--uf-yellow)' }}
            animate={{ 
              textShadow: [
                '0 0 20px rgba(242, 169, 0, 0.5)',
                '0 0 40px rgba(242, 169, 0, 0.8)',
                '0 0 20px rgba(242, 169, 0, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Gator Connections
          </motion.span>
        </motion.h1>

        {/* Enhanced Subtitle with Village Theme */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 leading-relaxed"
        >
          Post a request for internships, jobs, or advice—fellow Gators are here to help lift you up. 
          <br />
          <motion.span 
            className="font-semibold text-yellow-300"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            It takes a village, and you've got 70,000+ Gators in yours.
          </motion.span>
        </motion.p>

        {/* AI Teaser Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-purple-500/20 backdrop-blur-sm rounded-full border border-purple-300/30">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-purple-300" />
            </motion.div>
            <AnimatePresence mode="wait">
              {showAITeaser && (
                <motion.span
                  key="ai-teaser"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-semibold text-purple-200"
                >
                  AI-matched Gators waiting to help
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Prominent Post Your Request Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-8"
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    onClick={handlePostRequest}
                    size="lg"
                    className="bg-white text-[var(--uf-orange)] hover:bg-orange-50 font-bold px-10 py-5 text-xl rounded-2xl shadow-2xl hover:shadow-xl transform transition-all duration-300 border-2 border-white relative z-20"
                    style={{ 
                      minWidth: '280px', 
                      minHeight: '64px',
                      color: '#FA4616',
                      backgroundColor: 'white'
                    }}
                    aria-label="Post Your Request for Help from Fellow Gators"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="mr-3"
                      style={{ color: '#FA4616' }}
                    >
                      <Plus className="w-6 h-6" />
                    </motion.div>
                    <span style={{ color: '#FA4616' }}>Post Your Request</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="ml-3"
                      style={{ color: '#FA4616' }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white border-slate-700">
                <p className="font-medium">Share your need and get help from the Gator village</p>
                <p className="text-sm text-slate-300">Alumni and parents are waiting to connect</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Secondary CTA below main button */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-white/80 text-sm mt-4 max-w-md mx-auto"
          >
            Join <LiveStatsCounter targetValue={connectionsToday} className="font-bold" style={{ color: 'var(--uf-yellow)' }} /> others who found help today
          </motion.p>
        </motion.div>

        {/* Secondary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onStartFree}
              size="lg"
              className="w-full sm:w-auto bg-white text-blue-700 hover:bg-gray-50 hover:text-blue-800 font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 border border-blue-200"
            >
              <MessageSquare className="w-5 h-5 mr-2 text-blue-700" />
              Browse Requests
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onShareStory}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold px-8 py-4 text-lg rounded-xl transition-all duration-200"
            >
              <Star className="w-5 h-5 mr-2" />
              Share Success Story
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced Live Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:flex md:justify-center gap-6 md:gap-12 text-white/90 max-w-5xl mx-auto"
        >
          {[
            { value: connectionsToday, suffix: '+', label: 'Connections Today', icon: '🤝', delay: 0 },
            { value: activeUsers, suffix: '', label: 'Active Gators', icon: '🐊', delay: 0.1 },
            { value: 94, suffix: '%', label: 'Success Rate', icon: '🎯', delay: 0.2 },
            { value: 24, suffix: 'h', label: 'Avg Response', icon: '⚡', delay: 0.3 }
          ].map((stat, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={statsVariants}
              className="text-center group cursor-default"
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -5 }}
                className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <motion.div
                  className="text-2xl sm:text-3xl font-bold text-white block"
                  whileHover={{ scale: 1.1 }}
                >
                  <LiveStatsCounter 
                    targetValue={stat.value} 
                    suffix={stat.suffix}
                    duration={1500 + index * 200}
                  />
                </motion.div>
                <div className="text-white/80 text-xs sm:text-sm mt-1 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call-to-Action with Village Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-8"
        >
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-white/80 text-sm italic max-w-md mx-auto"
          >
            "Every request strengthens our community. Let's lift each other up! 🐊"
          </motion.p>
        </motion.div>

        {/* Floating Achievement Badge */}
        <AnimatePresence>
          {user && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: 2 }}
              className="absolute bottom-8 right-8 hidden lg:block"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-white/15 backdrop-blur-sm rounded-full p-3 border border-white/20"
              >
                <Trophy className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default Hero;
