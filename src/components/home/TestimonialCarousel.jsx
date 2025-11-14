
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/99bf20d25_hannah-busing-ahrrLDtnuNU-unsplash1.jpg',
    name: 'Emily J.',
    role: "Class of '23",
    quote: '"Within 48 hours, I was introduced to an alum at Google—I got my summer internship!"'
  },
  {
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9528eb42c_linkedin-sales-solutions-pAtA8xe_iVM-unsplash.jpg',
    name: 'Michael R.',
    role: 'Parent',
    quote: `"I connected my daughter with a UF alum who's now a hedge fund analyst—she landed an interview the very next week."`
  },
  {
    img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/542b0822d_alex-starnes-PK_t0Lrh7MM-unsplash.jpg',
    name: 'Tara L.',
    role: "Alum, Class of '20",
    quote: '"Giving back felt amazing. My intro led to a great entry-level job for a recent grad."'
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [testimonials.length]); // Added testimonials.length to useCallback dependencies for completeness

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(nextSlide, 6000);
      return () => clearInterval(timer);
    }
  }, [isPaused, nextSlide]);

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label="Success Stories Carousel"
    >
      <div className="relative h-64 overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${currentIndex + 1} of ${testimonials.length}`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-full p-6 text-center sm:text-left">
              <img 
                src={testimonials[currentIndex].img} 
                alt={`Portrait of ${testimonials[currentIndex].name}`}
                className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full object-cover flex-shrink-0 border-4 border-white shadow-lg"
              />
              <div className="flex-grow">
                <blockquote className="text-slate-800 font-medium text-lg italic max-w-lg mx-auto sm:mx-0">
                  {testimonials[currentIndex].quote}
                </blockquote>
                <footer className="mt-3 text-sm font-semibold text-slate-600">
                  — {testimonials[currentIndex].name}{' '}
                  <Badge variant="outline" className="ml-1 bg-white">{testimonials[currentIndex].role}</Badge>
                </footer>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-0 sm:-left-4 transform -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-slate-600 shadow-md transition-all duration-200 hidden sm:block"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-0 sm:-right-4 transform -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white text-slate-600 shadow-md transition-all duration-200 hidden sm:block"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 p-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-slate-700 scale-125' : 'bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
