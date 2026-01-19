import React, { useMemo } from 'react';

const TESTIMONIALS = [
  {
    quote: "A parent's advice helped me land my internship at Nike. I didn't even know that path existed.",
    name: "Marcus",
    year: "UF '25"
  },
  {
    quote: "I was so lost before a parent took 5 minutes to explain how the industry actually works.",
    name: "Priya", 
    year: "UF '24"
  },
  {
    quote: "The intro a parent made for me turned into my first full-time job offer.",
    name: "James",
    year: "UF '25"
  },
  {
    quote: "One conversation with a UF parent helped me pivot my entire career direction. Forever grateful.",
    name: "Sofia",
    year: "UF '26"
  }
];

export default function Testimonial() {
  const testimonial = useMemo(() => {
    return TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)];
  }, []);
  
  return (
    <div className="text-blue-100">
      <p className="text-lg italic mb-3">"{testimonial.quote}"</p>
      <p className="text-blue-300 text-sm">— {testimonial.name}, {testimonial.year}</p>
    </div>
  );
}