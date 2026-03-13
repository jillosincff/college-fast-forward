import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALUMNI = [
  {
    role: 'Marketing at Nike',
    year: "UF '22",
    icon: '👟',
    color: '#FA4616',
    message: "Hey Sarah, I'm a UF '27 Marketing major and saw you're in Marketing at Nike. I loved your campaign work — would love 15 minutes of your time to get your advice as a fellow Gator. No pressure at all.",
    signature: "— Alex, UF '27",
  },
  {
    role: 'Software Engineer at Google',
    year: "UF '21",
    icon: '🔍',
    color: '#4285F4',
    message: "Hey James, I'm a UF '27 CS major and noticed you're a Software Engineer at Google. Your path from UF to Mountain View is exactly what I'm aiming for — would love 15 minutes to learn how you did it. No pressure at all.",
    signature: "— Alex, UF '27",
  },
  {
    role: 'Analyst at Goldman Sachs',
    year: "UF '23",
    icon: '📊',
    color: '#D4A843',
    message: "Hey Maria, I'm a UF '27 Finance major exploring IB roles and noticed your path from UF to Goldman. I'd value 10 minutes to learn from your experience as a fellow Gator. No pressure at all.",
    signature: "— Alex, UF '27",
  },
];

const TYPE_SPEED = 25;
const PAUSE_AFTER_TYPE = 1800;
const HAND_MOVE_DURATION = 600;

export default function AlumniTeaserDemo() {
  const [demoActive, setDemoActive] = useState(true);
  const [demoCardIdx, setDemoCardIdx] = useState(-1);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [typedText, setTypedText] = useState('');
  const [showSig, setShowSig] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [handPos, setHandPos] = useState({ x: 0, y: -40 });
  const cardRefs = useRef([]);
  const containerRef = useRef(null);
  const abortRef = useRef(false);

  // Get card center position relative to container
  const getCardCenter = useCallback((idx) => {
    const card = cardRefs.current[idx];
    const container = containerRef.current;
    if (!card || !container) return { x: 0, y: 0 };
    const cRect = container.getBoundingClientRect();
    const kRect = card.getBoundingClientRect();
    return {
      x: kRect.left - cRect.left + kRect.width / 2 - 12,
      y: kRect.top - cRect.top + kRect.height / 2 - 12,
    };
  }, []);

  // Type a message character by character
  const typeMessage = useCallback((msg, onDone) => {
    let idx = 0;
    setTypedText('');
    setShowSig(false);
    const tick = () => {
      if (abortRef.current) return;
      idx += 1;
      if (idx > msg.length) {
        setTypedText(msg);
        setTimeout(() => {
          if (!abortRef.current) setShowSig(true);
          setTimeout(() => { if (!abortRef.current) onDone(); }, PAUSE_AFTER_TYPE);
        }, 300);
        return;
      }
      setTypedText(msg.slice(0, idx));
      setTimeout(tick, TYPE_SPEED);
    };
    setTimeout(tick, 200);
  }, []);

  // Run the demo sequence
  useEffect(() => {
    abortRef.current = false;
    let cancelled = false;

    const sleep = (ms) => new Promise(r => {
      const t = setTimeout(r, ms);
      // No cleanup needed, abortRef handles it
    });

    const runDemo = async () => {
      await sleep(800);
      if (abortRef.current) return;

      for (let i = 0; i < ALUMNI.length; i++) {
        if (abortRef.current) return;
        // Move hand to card
        const pos = getCardCenter(i);
        setHandPos(pos);
        setDemoCardIdx(i);
        await sleep(HAND_MOVE_DURATION + 200);
        if (abortRef.current) return;

        // Type the message
        await new Promise((resolve) => {
          typeMessage(ALUMNI[i].message, resolve);
        });
        if (abortRef.current) return;
      }

      // Demo complete
      if (!abortRef.current) {
        setDemoActive(false);
        setDemoCardIdx(-1);
        setShowInstruction(false);
      }
    };

    runDemo();

    return () => { abortRef.current = true; };
  }, [getCardCenter, typeMessage]);

  // Active card = demo card or hovered card
  const activeCard = demoActive ? demoCardIdx : hoveredCard;
  const activeAlumni = activeCard !== null && activeCard >= 0 ? ALUMNI[activeCard] : null;
  const isTyping = activeAlumni && typedText.length < activeAlumni.message.length;

  // When user hovers after demo, show that card's message instantly
  const handleMouseEnter = (i) => {
    if (demoActive) return;
    setHoveredCard(i);
    setTypedText(ALUMNI[i].message);
    setShowSig(true);
  };

  const handleMouseLeave = () => {
    if (demoActive) return;
    setHoveredCard(null);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Instruction text */}
      <AnimatePresence>
        {showInstruction && demoActive && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center text-white/40 text-sm mb-5 italic"
          >
            Watch how FASTIQ writes the message for you…
          </motion.p>
        )}
      </AnimatePresence>

      {/* Cards row */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 mb-4">
        {ALUMNI.map((a, i) => {
          const isActive = activeCard === i;
          return (
            <div
              key={i}
              ref={el => cardRefs.current[i] = el}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={handleMouseLeave}
              className="flex-1 rounded-2xl px-3 sm:px-5 py-5 sm:py-7 text-center cursor-default transition-all duration-300"
              style={{
                border: `1px solid ${isActive ? 'rgba(250,70,22,0.5)' : 'rgba(250,70,22,0.35)'}`,
                background: isActive ? 'rgba(250,70,22,0.15)' : 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                transform: isActive ? 'scale(1.06) translateY(-6px)' : 'scale(1) translateY(0)',
                boxShadow: isActive
                  ? '0 0 22px 10px rgba(250,70,22,0.7), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                  : '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="text-[40px] sm:text-[60px] leading-none mb-3 transition-all duration-500"
                style={{
                  filter: isActive
                    ? `drop-shadow(0 0 12px ${a.color}80)`
                    : `drop-shadow(0 0 6px ${a.color}40)`,
                }}
              >
                {a.icon}
              </div>
              <div
                className="w-14 sm:w-20 h-2 sm:h-2.5 rounded-full mx-auto mb-3 transition-all duration-500"
                style={{
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.25))'
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.2)' : 'none',
                }}
              />
              <p className="text-white text-[14px] sm:text-[21px] font-bold leading-tight">{a.role}</p>
              <p
                className="text-xs sm:text-sm mt-2 font-semibold transition-all duration-500"
                style={{ color: isActive ? '#FA4616' : '#CBD5E1' }}
              >
                {a.year}
              </p>
            </div>
          );
        })}
      </div>

      {/* Animated hand cursor */}
      <AnimatePresence>
        {demoActive && demoCardIdx >= 0 && (
          <motion.div
            initial={{ opacity: 0, x: handPos.x, y: handPos.y }}
            animate={{ opacity: 1, x: handPos.x, y: handPos.y }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
            className="absolute pointer-events-none z-20"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(250,70,22,0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
            }}
          >
            <span className="text-[28px] block" style={{ transform: 'rotate(-15deg)' }}>👆</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message box */}
      <div className="max-w-lg mx-auto mt-8">
        {/* Pill label */}
        <div className="text-center mb-4">
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
        </div>

        {/* Glass message box */}
        <div
          className="rounded-2xl p-6 sm:p-7 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(250,70,22,0.2)',
            boxShadow: activeCard !== null && activeCard >= 0
              ? '0 0 30px rgba(250,70,22,0.15), 0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <p
            className="text-left min-h-[96px]"
            style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: 1.7, fontWeight: 500 }}
          >
            {typedText || (
              <span className="text-white/30 italic">Hover a card to see the message…</span>
            )}
            {isTyping && demoActive && (
              <span
                className="inline-block align-middle ml-0.5"
                style={{
                  width: '2px',
                  height: '18px',
                  background: '#FA4616',
                  animation: 'twBlink 0.6s step-end infinite',
                }}
              />
            )}
          </p>

          <AnimatePresence>
            {showSig && activeAlumni && (
              <motion.p
                key={activeCard}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-semibold mt-4 text-left"
                style={{ color: '#CBD5E1' }}
              >
                {activeAlumni.signature}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes twBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}