
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/components/router/SimpleRouter';

const testimonials = [
  {
    quote: "Thanks to Sarah's intro, I landed my dream job at Microsoft! Her 2-minute LinkedIn message changed my entire career path.",
    student: "Alex M., '24",
    outcome: "Software Engineer at Microsoft",
    mentor: "Sarah K., '18"
  },
  {
    quote: "The marketing director introduction from Jessica opened doors I never knew existed. Now I'm leading campaigns at a Fortune 500!",
    student: "Michael R., '23",
    outcome: "Marketing Manager at Dell",
    mentor: "Jessica P., '15"
  },
  {
    quote: "A simple coffee chat about consulting turned into a full-time offer. Gator alumni really do look out for each other!",
    student: "Maria L., '24",
    outcome: "Analyst at McKinsey",
    mentor: "David T., '12"
  },
  {
    quote: "I was struggling to break into finance until Tom made a warm intro to his former colleague. Three interviews later, I had the job!",
    student: "Jordan S., '23",
    outcome: "Investment Banking Analyst",
    mentor: "Tom R., '16"
  }
];

export default function ImpactTestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { navigate } = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Quote className="w-5 h-5 text-[var(--uf-blue)]" />
              Impact Stories
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={prev} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative h-32 overflow-hidden bg-white/60 rounded-lg p-4 border border-slate-200/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-4"
              >
                <blockquote className="text-slate-700 text-sm leading-relaxed mb-3">
                  "{testimonials[currentIndex].quote}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[var(--uf-blue)] text-sm">
                      {testimonials[currentIndex].student}
                    </p>
                    <p className="text-xs text-slate-600">
                      {testimonials[currentIndex].outcome}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Thanks to {testimonials[currentIndex].mentor}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex justify-center gap-2 flex-1">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex ? 'bg-[var(--uf-blue)] w-4' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('SuccessStories', { action: 'share-story' })}
              className="text-slate-600 hover:text-[var(--uf-blue)] ml-4 bg-white/80 border-slate-300 hover:border-[var(--uf-blue)]"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
