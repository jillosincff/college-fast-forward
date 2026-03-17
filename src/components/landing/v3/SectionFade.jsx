import React, { useRef, useState, useEffect } from 'react';

export function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

export function fadeStyle(vis, delay = 0) {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  };
}