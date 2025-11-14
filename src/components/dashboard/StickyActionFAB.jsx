import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Briefcase, Plus, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';

// Simple navigation function
const navigate = (page, params = {}) => {
  let hash = `#${page}`;
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    hash += `?${searchParams.toString()}`;
  }
  window.location.hash = hash;
};

export default function StickyActionFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Show FAB after scrolling down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const persona = user?.persona || 'student';

  const getActions = () => {
    switch(persona) {
      case 'alumni':
        return [
          {
            icon: Heart,
            label: 'Help a Gator',
            onClick: () => navigate('Connections'),
            color: 'bg-[var(--uf-blue)] hover:bg-blue-700'
          },
          {
            icon: Briefcase,
            label: 'Find Your Next Role',
            onClick: () => navigate('Connections', { new: 'true' }),
            color: 'bg-[var(--uf-orange)] hover:bg-orange-600'
          }
        ];
      case 'parent':
        return [
          {
            icon: Heart,
            label: 'Help a Gator',
            onClick: () => navigate('Connections'),
            color: 'bg-[var(--uf-blue)] hover:bg-blue-700'
          },
          {
            icon: Home,
            label: 'Post for Student',
            onClick: () => navigate('Roommates', { new: true }),
            color: 'bg-[var(--uf-orange)] hover:bg-orange-600'
          }
        ];
      default:
        return [
          {
            icon: Briefcase,
            label: 'Get Job Help',
            onClick: () => navigate('Connections', { new: 'true' }),
            color: 'bg-[var(--uf-blue)] hover:bg-blue-700'
          }
        ];
    }
  };

  const actions = getActions();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-3 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => {
                    action.onClick();
                    setIsExpanded(false);
                  }}
                  className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-4 py-2 text-sm font-semibold`}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${
            isExpanded ? 'bg-slate-600' : 'bg-[var(--uf-blue)]'
          } hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200`}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
}