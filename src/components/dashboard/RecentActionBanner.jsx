import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecentActionBanner() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      layout
    >
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full text-green-600 shadow">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-green-900">
                You made an intro last week!
              </p>
              <p className="text-sm text-green-800">Keep up the great work making an impact.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="text-green-700 hover:text-green-900 p-1 rounded-full hover:bg-black/10 transition-colors flex-shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </CardContent>
      </Card>
    </motion.div>
  );
}