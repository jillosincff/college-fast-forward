
import { useState, useEffect, memo } from 'react';
import TestimonialCard from './TestimonialCard';

const LazyTestimonials = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const target = document.getElementById('testimonials-section');
    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      quote: "Within a week, a UF parent connected me with a director at Google. I had an interview lined up by Friday. This platform is a game-changer.",
      name: "Jessica Miller",
      title: "Software Engineer at Google",
      gradYear: "'23",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/336b955c4_testimonial-jessica.jpg"
    },
    {
      quote: "I was looking for a roommate in NYC and found another Gator alum who was also moving for a job. It made the transition so much easier!",
      name: "Jada Henson",
      title: "Marketing Associate at Spotify",
      gradYear: "'22",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d4a572c67_testimonial-david.jpg"
    },
    {
      quote: "An alumnus reviewed my resume and gave me incredible feedback. Their advice directly helped me land my first internship in finance.",
      name: "David Arnold",
      title: "Finance Intern at JP Morgan",
      gradYear: "'24",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d6438a227_testimonial-maria.jpg"
    },
    {
      quote: "As a parent, being able to help my daughter's classmates felt amazing. I made two introductions that turned into summer internships.",
      name: "Sarah Thompson",
      title: "Parent of a '25 Gator",
      gradYear: "Parent",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c13f63c87_testimonial-sarah.jpg"
    }
  ];

  return (
    <section id="testimonials-section" className="py-20 bg-slate-50" aria-labelledby="testimonials-title">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 id="testimonials-title" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-slate-600">
            Hear from Gators who've transformed their careers
          </p>
        </div>
        
        {isVisible ? (
          <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-1 md:gap-8" role="list">
            {testimonials.map((testimonial, index) => {
              // Map new data fields to TestimonialCard's expected props (author, role)
              // and handle the new 'image' prop.
              const roleText = testimonial.gradYear === "Parent"
                ? testimonial.title
                : `${testimonial.title} • ${testimonial.gradYear}`;

              return (
                <div key={index} role="listitem">
                  <TestimonialCard
                    quote={testimonial.quote}
                    author={testimonial.name}
                    role={roleText}
                    image={testimonial.image}
                    // 'staggerClass' is no longer present in the new testimonial data objects.
                    // Passing 'testimonial.staggerClass' will result in 'undefined' for this prop,
                    // preserving the existing prop structure from the original code.
                    staggerClass={testimonial.staggerClass} 
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-8">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-md animate-pulse mx-auto w-3/4">
                <div className="h-6 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-6"></div>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-slate-200 rounded mb-2 w-24"></div>
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

LazyTestimonials.displayName = 'LazyTestimonials';

export default LazyTestimonials;
