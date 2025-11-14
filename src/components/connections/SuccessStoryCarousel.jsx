import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const SuccessStoryCarousel = ({ stories }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!stories || stories.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % stories.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(timer);
  }, [stories]);

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className="relative h-48 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <Card className="h-full bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div>
                <Badge className="mb-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Star className="w-3 h-3 mr-1" />
                  Gator Success!
                </Badge>
                <p className="text-sm text-slate-700 font-medium leading-snug">
                  "{stories[index].story}"
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                - Real Gator Story
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SuccessStoryCarousel;