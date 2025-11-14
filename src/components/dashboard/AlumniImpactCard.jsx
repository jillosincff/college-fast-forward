
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Briefcase, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/components/router/SimpleRouter';

const successStories = [
  {
    quote: "Landed my dream job at Google, thanks to a Gator intro!",
    author: "Alex, Class of '21"
  },
  {
    quote: "The alumni connection helped me transition into tech—forever grateful!",
    author: "Sarah, Class of '20"
  },
  {
    quote: "One LinkedIn message changed my entire career path. Go Gators!",
    author: "Michael, Class of '22"
  }
];

export default function AlumniImpactCard() {
  const { navigate } = useRouter();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleHelpGator = () => {
    navigate('Connections');
  };

  const handleFindRole = () => {
    navigate('Connections', { new: 'true' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 via-white to-orange-50 border border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          {/* Condensed Impact + Mutual Support Message */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 8 
                }}
                className="text-4xl"
                role="img" 
                aria-label="celebrate"
              >
                🎉
              </motion.div>
              <div className="flex-1">
                <motion.p 
                  className="text-lg font-bold text-slate-900 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Alumni like you helped students land <span className="text-[var(--uf-blue)]">12 new jobs</span> this month!
                </motion.p>
                <p className="text-sm text-slate-600">
                  Need a hand yourself? Post a request and let Gator Nation help you, too.
                </p>
              </div>
            </div>

            {/* Consolidated CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-shrink-0">
              <Button
                onClick={handleHelpGator}
                className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Help a Gator
              </Button>
              <Button
                onClick={handleFindRole}
                variant="outline"
                className="border-2 border-[var(--uf-blue)] text-[var(--uf-blue)] hover:bg-[var(--uf-blue)] hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Find Your Next Role
              </Button>
            </div>
          </div>

          {/* Enhanced Rotating Testimonial with Quote Icon */}
          <div className="mt-4 bg-white/60 rounded-lg p-3 border border-slate-200/50">
            <div className="flex items-start gap-2">
              <Quote className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.blockquote
                    key={currentStoryIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm text-slate-700"
                  >
                    "{successStories[currentStoryIndex].quote}"
                    <br />
                    <span className="font-medium text-[var(--uf-orange)] text-xs">
                      — {successStories[currentStoryIndex].author}
                    </span>
                  </motion.blockquote>
                </AnimatePresence>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('SuccessStories', { action: 'share-story' })}
                className="text-xs text-slate-500 hover:text-[var(--uf-blue)] px-2 py-1 h-auto"
              >
                Share yours?
              </Button>
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-1.5 mt-3">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStoryIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStoryIndex 
                      ? 'bg-[var(--uf-orange)] w-4' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Show testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
