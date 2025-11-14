
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Quote, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiCelebration from '@/components/viral/ConfettiCelebration';

const testimonials = [
  {
    id: 1,
    text: "A UF parent's post landed me my first internship at Google!",
    name: "Sarah M.",
    role: "Student '25",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2,
    text: "An alum's listing connected me to my dream job in finance.",
    name: "Michael R.",
    role: "Recent Grad '24",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3,
    text: "Posted an internship that helped 3 Gators get hired. Best feeling ever!",
    name: "Jennifer L.",
    role: "UF Parent",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4,
    text: "Found my co-founder through an opportunity posted here. Building our startup now!",
    name: "David K.",
    role: "Alumni '19",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  }
];

export default function TestimonialsStrip({ onShareStory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  useEffect(() => {
    setShowConfetti(true); // Trigger confetti on slide change
    const timer = setTimeout(() => setShowConfetti(false), 100); // Reset after a short delay
    return () => clearTimeout(timer); // Use clearTimeout for setTimeout
  }, [currentIndex]);
  
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-orange-50 py-16 animated-bg-slow">
      <ConfettiCelebration trigger={showConfetti} duration={1000} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Success Stories from Gator Nation
          </h2>
          <p className="text-lg text-slate-600">
            Real connections, real opportunities, real results
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={prevTestimonial}
              className="absolute left-0 z-10 bg-white/80 hover:bg-white shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 mx-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardContent className="p-8 text-center">
                      <Quote className="w-8 h-8 text-orange-500 mx-auto mb-6" />
                      <blockquote className="text-xl text-slate-700 font-medium mb-6 italic">
                        "{testimonials[currentIndex].text}"
                      </blockquote>
                      <div className="flex items-center justify-center gap-4">
                        <div className="p-1 bg-gradient-to-tr from-orange-500 to-blue-600 rounded-full">
                          <Avatar className="w-12 h-12 border-2 border-white">
                            <AvatarImage 
                              src={testimonials[currentIndex].avatar} 
                              alt={testimonials[currentIndex].name}
                            />
                            <AvatarFallback>
                              {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-slate-900">
                            {testimonials[currentIndex].name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {testimonials[currentIndex].role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={nextTestimonial}
              className="absolute right-0 z-10 bg-white/80 hover:bg-white shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-orange-500 w-8' : 'bg-slate-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={onShareStory}
              variant="outline"
              className="bg-white/80 hover:bg-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Your Success Story
            </Button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes gradientMoveSlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-bg-slow {
          background: linear-gradient(-45deg, #e0f7fa, #fff3e0, #e3f2fd, #ffebee);
          background-size: 400% 400%;
          animation: gradientMoveSlow 20s ease infinite;
        }
      `}</style>
    </div>
  );
}
