import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FULL_MESSAGE = `Hey Sarah, I'm a UF '27 Marketing major and saw you're a VP Strategy at Google. I loved your work on the Pixel campaign — would love 15 minutes of your time to get your advice as a fellow Gator. No pressure at all.`;
const SIGNATURE = "— Alex, UF '27";
const TYPING_SPEED = 18; // ms per character

export default function TypewriterMessage({ inView }) {
  const [displayed, setDisplayed] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [started, setStarted] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!inView || started) return;
    setStarted(true);
    setDisplayed('');
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= FULL_MESSAGE.length) {
        setDisplayed(FULL_MESSAGE);
        clearInterval(interval);
        setTimeout(() => setShowSignature(true), 300);
        return;
      }
      setDisplayed(FULL_MESSAGE.slice(0, indexRef.current));
    }, TYPING_SPEED);

    return () => clearInterval(interval);
  }, [inView, started]);

  // Reset when scrolled away
  useEffect(() => {
    if (!inView) {
      setStarted(false);
      setDisplayed('');
      setShowSignature(false);
      indexRef.current = 0;
    }
  }, [inView]);

  const isTyping = started && displayed.length < FULL_MESSAGE.length;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-2xl p-6 sm:p-7"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-white text-[15px] sm:text-[16px] leading-[1.7] font-medium text-left min-h-[96px]">
          {displayed}
          {isTyping && (
            <span
              className="inline-block w-[2px] h-[18px] bg-[#FA4616] ml-0.5 align-middle"
              style={{ animation: 'blink 0.6s step-end infinite' }}
            />
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
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}