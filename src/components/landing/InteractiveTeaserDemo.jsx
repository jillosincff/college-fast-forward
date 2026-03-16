import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALUMNI = [
  {
    role: 'Marketing at Nike',
    name: 'Sarah Mitchell – Nike',
    year: "UF '22",
    icon: '👟',
    color: '#FA4616',
    message: "Hey Sarah, I'm a UF '27 Marketing major and saw you're in Marketing at Nike. I loved your campaign work — would love 15 minutes of your time to get your advice as a fellow Gator. No pressure at all.",
    signature: "— Alex, UF '27",
  },
  {
    role: 'Software Engineer at Google',
    name: 'James Rivera – Google',
    year: "UF '21",
    icon: '🔍',
    color: '#4285F4',
    message: "Hey Sarah, I'm a UF '27 CS major and noticed you're a Software Engineer at Google. Your path from UF to Mountain View is exactly what I'm aiming for — would love 15 minutes to learn how you did it. No pressure at all.",
    signature: "— Alex, UF '27",
  },
  {
    role: 'Analyst at Goldman Sachs',
    name: 'Maria Chen – Goldman',
    year: "UF '23",
    icon: '📊',
    color: '#D4A843',
    message: "Hey Sarah, I'm a UF '27 Finance major and saw you're an Analyst at Goldman Sachs. I loved your recent deal work — would love 15 minutes of your time to get your advice as a fellow Gator. No pressure at all.",
    signature: "— Alex, UF '27",
  },
];

const TYPE_SPEED = 70;
const DEFAULT_CARD = 1;

const companies = [
  { name: 'Nike', color: '#FA4616' },
  { name: 'Google', color: '#4285F4' },
  { name: 'Goldman', color: '#D4A843' },
];

function ScanningAnimation({ onComplete }) {
  const [phase, setPhase] = useState('scanning'); // scanning | revealed

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('revealed');
      onComplete?.();
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative mb-10">
      {/* Scanning text + radar */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative w-5 h-5 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FA4616]"
            animate={{ scale: [1, 2.4], opacity: [0.9, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FA4616]"
            animate={{ scale: [1, 2.4], opacity: [0.9, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FA4616]" style={{ boxShadow: '0 0 10px rgba(250,70,22,0.9)' }} />
        </div>

        <motion.span
          className="text-[#FA4616] text-[12px] sm:text-[13px] font-bold tracking-[0.15em] uppercase"
          animate={{ opacity: phase === 'scanning' ? [0.5, 1, 0.5] : 1 }}
          transition={{ duration: 1.5, repeat: phase === 'scanning' ? Infinity : 0 }}
        >
          {phase === 'scanning' ? 'Scanning UF Alumni Network...' : 'Found 3 alumni at target companies'}
        </motion.span>

        {phase === 'scanning' && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#FA4616]"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Glow line */}
      <div className="relative h-1 max-w-xs mx-auto mb-5 rounded-full overflow-hidden" style={{ background: 'rgba(250,70,22,0.08)' }}>
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: '40%',
            background: 'linear-gradient(90deg, transparent, #FA4616, transparent)',
            boxShadow: '0 0 20px rgba(250,70,22,0.6)',
          }}
          animate={phase === 'scanning' ? { x: ['-40%', '280%'] } : { opacity: 0 }}
          transition={phase === 'scanning' ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      </div>

      {/* Company badges */}
      <div className="flex items-center justify-center gap-4">
        {companies.map((c, i) => (
          <motion.div
            key={c.name}
            className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
            style={{
              color: c.color,
              border: `1px solid ${c.color}33`,
              background: `${c.color}0D`,
            }}
            animate={phase === 'scanning'
              ? { opacity: [0.3, 0.8, 0.3], boxShadow: [`0 0 0px ${c.color}00`, `0 0 16px ${c.color}40`, `0 0 0px ${c.color}00`] }
              : { opacity: 1, boxShadow: `0 0 20px ${c.color}50` }
            }
            transition={phase === 'scanning'
              ? { duration: 2.2, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }
              : { duration: 0.4, delay: i * 0.1 }
            }
          >
            {c.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function InteractiveTeaserDemo() {
  const [scanDone, setScanDone] = useState(false);
  const [activeCard, setActiveCard] = useState(DEFAULT_CARD);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef(null);
  const abortRef = useRef(false);
  const mountedRef = useRef(false);

  // Stable fallback — never show a blank box
  const fullMessage = ALUMNI[activeCard].message + ' ' + ALUMNI[activeCard].signature;
  const displayText = typedText || fullMessage;

  const typeMessage = (msg, sig) => {
    // Abort any running animation
    abortRef.current = true;
    clearTimeout(timerRef.current);

    const combined = msg + ' ' + sig;
    // Reset
    abortRef.current = false;
    setTypedText('');
    setIsTyping(true);

    let idx = 0;
    const tick = () => {
      if (abortRef.current) {
        // On abort, show full message so box is never blank
        setTypedText(combined);
        setIsTyping(false);
        return;
      }
      idx += 1;
      if (idx > combined.length) {
        setTypedText(combined);
        setIsTyping(false);
        return;
      }
      setTypedText(combined.slice(0, idx));
      timerRef.current = setTimeout(tick, TYPE_SPEED);
    };
    // Start immediately — no delay
    timerRef.current = setTimeout(tick, 0);
  };

  // Start typing the default Google message IMMEDIATELY on mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const a = ALUMNI[DEFAULT_CARD];
      typeMessage(a.message, a.signature);
    }
    return () => { abortRef.current = true; clearTimeout(timerRef.current); };
  }, []);

  const handleCardHover = (i) => {
    if (i === activeCard && !isTyping) return; // already showing this card's completed message
    setActiveCard(i);
    const a = ALUMNI[i];
    typeMessage(a.message, a.signature);
  };

  return (
    <div>
      {/* Scanning animation */}
      <ScanningAnimation onComplete={() => setScanDone(true)} />

      {/* Cards — fade in after scan, but message box is always visible */}
      <AnimatePresence>
        {scanDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-stretch justify-center gap-3 sm:gap-5 mb-4">
              {ALUMNI.map((a, i) => {
                const isActive = activeCard === i;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => handleCardHover(i)}
                    onClick={() => handleCardHover(i)}
                    className="flex-1 rounded-2xl px-3 sm:px-5 py-5 sm:py-7 text-center cursor-pointer transition-all duration-300"
                    style={{
                      border: `1px solid ${isActive ? 'rgba(250,70,22,0.5)' : 'rgba(250,70,22,0.15)'}`,
                      background: isActive ? 'rgba(250,70,22,0.12)' : 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      transform: isActive ? 'scale(1.04) translateY(-6px)' : 'scale(1) translateY(0)',
                      boxShadow: isActive
                        ? '0 0 22px 8px rgba(250,70,22,0.22), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                        : '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      className="text-[36px] sm:text-[52px] leading-none mb-3 transition-all duration-500"
                      style={{
                        filter: isActive
                          ? `drop-shadow(0 0 14px ${a.color}80)`
                          : `drop-shadow(0 0 4px ${a.color}30)`,
                      }}
                    >
                      {a.icon}
                    </div>

                    {/* Blurred name reveal */}
                    <div className="h-5 mb-2 overflow-hidden">
                      <p
                        className="text-[11px] sm:text-xs font-semibold transition-all duration-500"
                        style={{
                          color: isActive ? '#FA4616' : 'transparent',
                          filter: isActive ? 'blur(0px)' : 'blur(4px)',
                          opacity: isActive ? 1 : 0.3,
                        }}
                      >
                        {a.name}
                      </p>
                    </div>

                    <p className="text-white text-[13px] sm:text-[17px] font-bold leading-tight">{a.role}</p>
                    <p
                      className="text-xs sm:text-sm mt-2 font-semibold transition-all duration-500"
                      style={{ color: isActive ? '#FA4616' : '#94A3B8' }}
                    >
                      {a.year}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message box — ALWAYS visible, starts typing immediately on mount */}
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
            {displayText}
            {isTyping && (
              <span
                className="inline-block align-middle ml-0.5"
                style={{
                  width: '2px',
                  height: '18px',
                  background: '#FA4616',
                  animation: 'teaserBlink 0.6s step-end infinite',
                }}
              />
            )}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes teaserBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}