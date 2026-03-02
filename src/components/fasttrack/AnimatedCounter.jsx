import { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value, duration = 450 }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !value) return;
    started.current = true;
    const target = Number(value) || 0;
    if (target === 0) { setDisplay(0); return; }
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{display}</span>;
}