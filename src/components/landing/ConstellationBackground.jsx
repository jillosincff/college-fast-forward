import React, { useEffect, useRef } from 'react';

/**
 * Faint glowing constellation dots + connecting lines behind hero.
 * Canvas-based, almost invisible but adds premium depth.
 */
const DOTS = 40;
const MAX_DIST = 140;
const DOT_ALPHA = 0.25;
const LINE_ALPHA = 0.06;

export default function ConstellationBackground() {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const seed = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      dotsRef.current = Array.from({ length: DOTS }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.4 + 0.6,
      }));
    };

    resize();
    seed();

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const dots = dotsRef.current;

      // move
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
      }

      // lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = LINE_ALPHA * (1 - dist / MAX_DIST);
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(232,93,32,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // dots
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${DOT_ALPHA * (d.r / 2)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => { resize(); seed(); };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  );
}