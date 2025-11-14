import { useEffect, useRef, useState } from "react";

export default function LiveTicker({
  items = [
    "Erica ('26) got referred to Deloitte",
    "Marcus ('25) matched with a Marketing alum",
    "Priya ('24) landed an interview at Nike",
    "2 parents just offered intros in Finance",
  ],
}) {
  const track = [...items, ...items, ...items]; // Repeat content for smooth looping
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let x = 0;
    let rafId;

    const tick = () => {
      if (!paused) {
        x = (x + 0.5) % (el.scrollWidth / 3); // Divide by number of repetitions
        el.style.transform = `translateX(-${x}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [paused]);

  return (
    <div
      className="mt-8 overflow-hidden rounded-[25px] bg-[rgba(0,33,165,0.05)] py-3 fade-in-up delay-6"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-live="polite"
    >
      <div ref={ref} className="flex whitespace-nowrap will-change-transform">
        {track.map((t, i) => (
          <span key={i} className="text-[0.9rem] text-slate-500 flex items-center px-12">
            <span className="pulse-dot"></span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}