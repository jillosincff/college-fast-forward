import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FULL_MESSAGE = `Hey Sarah, I'm a UF '27 Marketing major and saw you're a VP Strategy at Google. I loved your work on the Pixel campaign — would love 15 minutes of your time to get your advice as a fellow Gator. No pressure at all.`;
const SIGNATURE = "— Alex, UF '27";
const TYPING_SPEED = 35;

export default function TypewriterMessage() {
  const [charIndex, setCharIndex] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  // Start typing after a 600ms delay once mounted
  useEffect(() => {
    const delay = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(delay);
  }, []);

  // Typing loop
  useEffect(() => {
    if (!started) return;
    if (charIndex >= FULL_MESSAGE.length) {
      setTimeout(() => setShowSignature(true), 400);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCharIndex(prev => prev + 1);
    }, TYPING_SPEED);
    return () => clearTimeout(timerRef.current);
  }, [started, charIndex]);

  const displayed = FULL_MESSAGE.slice(0, charIndex);
  const isTyping = started && charIndex < FULL_MESSAGE.length;

  return (
    <div className="max-w-lg mx-auto mt-10">
      {/* Label pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl p-6 sm:p-7"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(250,70,22,0.2)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <p
          className="text-left min-h-[96px]"
          style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: 1.7, fontWeight: 500 }}
        >
          {displayed}
          {isTyping && (
            <span
              className="inline-block align-middle ml-0.5"
              style={{
                width: '2px',
                height: '18px',
                background: '#FA4616',
                animation: 'twCursorBlink 0.6s step-end infinite',
              }}
            />
          )}
        </p>

        {showSignature && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-semibold mt-4 text-left"
            style={{ color: '#CBD5E1' }}
          >
            {SIGNATURE}
          </motion.p>
        )}
      </motion.div>

      <style>{`
        @keyframes twCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}