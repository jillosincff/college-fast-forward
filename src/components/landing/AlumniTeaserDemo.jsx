import React, { useState, useEffect, useRef } from 'react';
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
const DEFAULT_CARD = 1; // Google

export default function AlumniTeaserDemo() {
  const [activeCard, setActiveCard] = useState(DEFAULT_CARD);
  const [typedText, setTypedText] = useState('');
  const [showSig, setShowSig] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef(null);
  const abortRef = useRef(false);

  const typeMessage = (msg) => {
    // Clear any running animation
    abortRef.current = true;
    clearTimeout(timerRef.current);

    // Reset and start fresh
    abortRef.current = false;
    setTypedText('');
    setShowSig(false);
    setIsTyping(true);

    let idx = 0;
    const tick = () => {
      if (abortRef.current) return;
      idx += 1;
      if (idx > msg.length) {
        setTypedText(msg);
        setIsTyping(false);
        setTimeout(() => { if (!abortRef.current) setShowSig(true); }, 300);
        return;
      }
      setTypedText(msg.slice(0, idx));
      timerRef.current = setTimeout(tick, TYPE_SPEED);
    };
    timerRef.current = setTimeout(tick, 150);
  };

  // Start with default card message on mount
  useEffect(() => {
    typeMessage(ALUMNI[DEFAULT_CARD].message);
    return () => { abortRef.current = true; clearTimeout(timerRef.current); };
  }, []);

  const handleMouseEnter = (i) => {
    setActiveCard(i);
    typeMessage(ALUMNI[i].message);
  };

  const activeAlumni = ALUMNI[activeCard];

  return (
    <div>
      {/* Cards row */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 mb-4">
        {ALUMNI.map((a, i) => {
          const isActive = activeCard === i;
          return (
            <div
              key={i}
              onMouseEnter={() => handleMouseEnter(i)}
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

      {/* Message box */}
      <div className="max-w-lg mx-auto mt-8">
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

        <div
          className="rounded-2xl p-6 sm:p-7"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(250,70,22,0.2)',
            boxShadow: '0 0 30px rgba(250,70,22,0.1), 0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <p
            className="text-left min-h-[96px]"
            style={{ color: '#FFFFFF', fontSize: '18px', lineHeight: 1.6, fontWeight: 500 }}
          >
            {typedText}
            {isTyping && (
              <span
                className="inline-block align-middle ml-0.5"
                style={{
                  width: '2px',
                  height: '20px',
                  background: '#FA4616',
                  animation: 'twBlink 0.6s step-end infinite',
                }}
              />
            )}
          </p>

          <AnimatePresence mode="wait">
            {showSig && (
              <motion.p
                key={activeCard}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="font-semibold mt-4 text-left"
                style={{ color: '#CBD5E1', fontSize: '14px' }}
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