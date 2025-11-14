import { useEffect, useRef, useState } from "react";

export default function CountUp({ end, duration = 1200, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { 
      setVal(end); 
      return; 
    }
    
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
        setVal(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.4 });
    
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [end, duration]);
  
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}