import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const quickTestimonials = [
  {
    text: "I got my first internship thanks to a Gator parent!",
    author: "Sarah K., '25"
  },
  {
    text: "Connected with an alum who became my career mentor.",
    author: "Mike R., '24"
  },
  {
    text: "Found my post-grad roommate through the platform!",
    author: "Emma L., '23"
  },
  {
    text: "A UF parent introduced me to my dream company.",
    author: "Alex C., '25"
  }
];

export default function TestimonialScrollingBand() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quickTestimonials.length);
    }, 3500);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-16 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Quote className="w-4 h-4 text-[var(--uf-blue)] opacity-60" />
            <span className="text-sm sm:text-base italic font-medium">
              "{quickTestimonials[currentIndex].text}"
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold">
            —{quickTestimonials[currentIndex].author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}