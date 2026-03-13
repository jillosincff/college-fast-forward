import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FULL_MESSAGE = `Hey Sarah, I'm a UF '27 Marketing major and saw you're a VP Strategy at Google. I loved your work on the Pixel campaign — would love 15 minutes of your time to get your advice as a fellow Gator. No pressure at all.`;
const SIGNATURE = "— Alex, UF '27";
const TYPING_SPEED = 35;

export default function TypewriterMessage() {
  const [displayed, setDisplayed] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || hasPlayed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setHasPlayed(true);
          observer.disconnect();
          // Start typing
          let idx = 0;
          intervalRef.current = setInterval(() => {
            idx += 1;
            if (idx >= FULL_MESSAGE.length) {
              setDisplayed(FULL_MESSAGE);
              clearInterval(intervalRef.current);
              setTimeout(() => setShowSignature(true), 400);
              return;
            }
            setDisplayed(FULL_MESSAGE.slice(0, idx));
          }, TYPING_SPEED);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasPlayed]);

  const isTyping = hasPlayed && displayed.length < FULL_MESSAGE.length;
  const isDone = displayed.length >= FULL_MESSAGE.length;

  return (
    <div ref={containerRef} className="max-w-lg mx-auto mt-10">
      {/* Label pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={hasPlayed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3 }}
        className="text-center mb-4"
      >
        <span
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
          style={{
            color: '#FA4616',
            background: 'rgba(250,70,22,0.1)',
            border: '1px solid rgba(250,70,22,0.25)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FA4616] animate-pulse" />
          FASTIQ just wrote this for you…
        </span>
      </motion.div>

      {/* Message box */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={hasPlayed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl p-6 sm:p-7"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(250,70,22,0.2)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-white text-[16px] leading-[1.7] font-medium text-left min-h-[96px]">
          {displayed}
          {(isTyping || !isDone) && (
            <span className="typewriter-cursor" />
          )}
        </p>

        {showSignature && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-[#CBD5E1] text-sm font-semibold mt-4 text-left"
          >
            {SIGNATURE}
          </motion.p>
        )}
      </motion.div>

      <style>{`
        .typewriter-cursor {
          display: inline-block;
          width: 2px;
          height: 18px;
          background: #FA4616;
          margin-left: 2px;
          vertical-align: middle;
          animation: cursorBlink 0.6s step-end infinite;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}