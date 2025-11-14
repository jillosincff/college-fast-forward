import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';

const GatorMascot = () => (
  <motion.div
    className="relative"
    animate={{ 
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1]
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <div className="text-8xl mb-4">🐊</div>
    <motion.div
      className="absolute -top-2 -right-2"
      animate={{ 
        rotate: [0, 15, -15, 0],
        scale: [1, 1.2, 1]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        delay: 0.5
      }}
    >
      <Sparkles className="w-6 h-6 text-yellow-500" />
    </motion.div>
  </motion.div>
);

const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Floating UF elements */}
    <motion.div
      className="absolute top-10 left-10 text-2xl opacity-20"
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, 10, 0]
      }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      🏛️
    </motion.div>
    <motion.div
      className="absolute top-20 right-20 text-xl opacity-20"
      animate={{ 
        y: [0, 15, 0],
        rotate: [0, -8, 0]
      }}
      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
    >
      🎓
    </motion.div>
    <motion.div
      className="absolute bottom-20 left-20 text-lg opacity-20"
      animate={{ 
        y: [0, -10, 0],
        x: [0, 5, 0]
      }}
      transition={{ duration: 5, repeat: Infinity, delay: 2 }}
    >
      🔗
    </motion.div>
  </div>
);

export default function EmptyState({ 
  title = "No requests yet, Gator!", 
  description = "Be the first to post a request and become a Gator hero! Your fellow Gators are standing by to help you succeed.", 
  primaryAction, 
  secondaryAction,
  type = "requests" // requests, roommates, connections
}) {
  
  const getEmptyStateContent = () => {
    switch(type) {
      case 'roommates':
        return {
          mascot: '🏠',
          title: "No roommate listings yet!",
          description: "Post the first listing and help build the Gator housing community. Your future roommate is waiting!",
          ctaText: "Post First Listing",
          heroText: "Be a Housing Hero! 🦸‍♀️"
        };
      case 'connections':
        return {
          mascot: '🤝',
          title: "Ready to make your first connection?",
          description: "Every great career started with one meaningful connection. Be the first to help a fellow Gator!",
          ctaText: "Make First Connection",
          heroText: "Become a Connection Champion! 🏆"
        };
      default:
        return {
          mascot: '🐊',
          title: title,
          description: description,
          ctaText: "Post First Request",
          heroText: "Be a Gator Hero! 🦸‍♂️"
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative text-center py-20 px-6 max-w-2xl mx-auto"
    >
      <FloatingElements />
      
      {/* Branded Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-orange-50/30 to-blue-50/50 rounded-3xl -z-10" />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Mascot with animations */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.2
          }}
          className="mb-6"
        >
          {type === 'requests' ? <GatorMascot /> : (
            <motion.div
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity 
              }}
            >
              {content.mascot}
            </motion.div>
          )}
        </motion.div>

        {/* Hero Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg"
        >
          <span>✨</span>
          {content.heroText}
          <span>✨</span>
        </motion.div>

        {/* Title with typing effect */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold text-slate-900 mb-4 leading-tight"
        >
          {content.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto"
        >
          {content.description}
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {primaryAction && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={primaryAction.onClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                aria-label={primaryAction.label}
              >
                <Plus className="w-5 h-5 mr-2" />
                {primaryAction.label || content.ctaText}
              </Button>
            </motion.div>
          )}
          
          {secondaryAction && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline"
                onClick={secondaryAction.onClick}
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-6 py-3 rounded-xl transition-all duration-200"
                aria-label={secondaryAction.label}
              >
                {secondaryAction.label}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Motivational footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-sm text-slate-500 font-medium"
        >
          <span className="inline-flex items-center gap-1">
            🐊 <span className="font-bold text-blue-600">Go Gators!</span> • Building careers, one connection at a time
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}