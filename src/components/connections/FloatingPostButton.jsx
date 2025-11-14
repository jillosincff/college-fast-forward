import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Users, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';

export default function FloatingPostButton({ onClick }) {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);

  const handleMainClick = () => {
    if (!user) {
      navigate('LandingPage');
      return;
    }

    if (onClick) {
      onClick();
    } else {
      // Default action - navigate to roommates since that's the main secondary action
      navigate('Roommates');
    }
  };

  // Simplified options - removed "Post Request" since it's already in the hero
  const options = [
    {
      id: 'roommate',
      label: 'Find Roommate',
      icon: Users,
      action: () => navigate('Roommates'),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'help_someone',
      label: 'Browse Requests',
      icon: Heart,
      action: () => {
        // Scroll to the requests section since we're already on the connections page
        document.querySelector('.requests-section')?.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setShowOptions(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Option Buttons */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {options.map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: 50, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      y: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    exit={{ opacity: 0, x: 50, y: 10 }}
                    className="flex items-center gap-3"
                  >
                    <span className="bg-white px-3 py-2 rounded-full shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap">
                      {option.label}
                    </span>
                    <Button
                      size="lg"
                      onClick={() => {
                        option.action();
                        setShowOptions(false);
                      }}
                      className={`w-14 h-14 rounded-full shadow-lg ${option.color} text-white hover:scale-110 transition-all duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={user ? () => setShowOptions(!showOptions) : handleMainClick}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300"
            aria-label={user ? "Quick actions menu" : "Get started"}
          >
            <motion.div
              animate={{ rotate: showOptions ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {user ? <Plus className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
            </motion.div>
          </Button>
        </motion.div>

        {/* Pulse Animation for Non-Users */}
        {!user && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-ping opacity-20"></div>
        )}
      </div>
    </>
  );
}