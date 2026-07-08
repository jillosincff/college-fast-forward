import { useEffect, useRef, useState } from 'react';

// Scroll-reveal with hard guarantees: content can NEVER stay hidden.
// Previous framer-motion `whileInView` version left entire sections at
// opacity 0 on some browsers, making the page look cut off / unscrollable.
export default function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) { setShown(true); return; }

    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setShown(true);
      cleanup();
    };

    const check = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40 && rect.bottom > 0) show();
    };

    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) show();
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
      io.observe(el);
    }

    // Belt-and-braces: plain scroll/resize checks in case the observer
    // never fires (iframes, older Safari, unusual zoom levels).
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    // Reveal anything already in the viewport on mount.
    check();
    // Final fail-safe: after 4s, force-show if it's anywhere near view.
    const failSafe = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.5) show();
    }, 4000);

    function cleanup() {
      if (io) io.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      clearTimeout(failSafe);
    }
    return cleanup;
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}