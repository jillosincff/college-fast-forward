import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ConstellationBackground from '@/components/landing/ConstellationBackground';
import CTAButton from './CTAButton';
import { playfair, dmSans } from './LandingConstants';

const PROMPTS = [
  "I'm a sophomore interested in marketing but I don't know where to start.",
  "I want to work at Nike or Spotify. What should I do next?",
  "I've sent out 100 resumes and heard nothing back. What am I doing wrong?",
  "I have no idea what jobs fit my major.",
];

function TypingBox() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const prompt = PROMPTS[promptIdx];
    let idx = 0;
    setTyped('');
    setIsTyping(true);

    const tick = () => {
      idx++;
      if (idx > prompt.length) {
        setIsTyping(false);
        timerRef.current = setTimeout(() => {
          setPromptIdx((prev) => (prev + 1) % PROMPTS.length);
        }, 2800);
        return;
      }
      setTyped(prompt.slice(0, idx));
      timerRef.current = setTimeout(tick, 50);
    };
    timerRef.current = setTimeout(tick, 400);
    return () => clearTimeout(timerRef.current);
  }, [promptIdx]);

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 text-left"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" /></svg>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#E85D20', letterSpacing: '0.04em' }}>FASTIQ</span>
        </div>
        <div className="flex-1" />
        <span style={{ fontFamily: dmSans, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Try it — type anything</span>
      </div>

      {/* Typing area */}
      <p className="min-h-[52px]" style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 400, color: '#FFFFFF', lineHeight: 1.6 }}>
        {typed}
        {isTyping && (
          <span className="inline-block align-middle ml-0.5" style={{ width: 2, height: 18, background: '#E85D20', animation: 'heroBlink 0.6s step-end infinite' }} />
        )}
      </p>
    </div>
  );
}

export default function V3Hero({ onCTA, onHowItWorks }) {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0d1117 0%, #0a1a6e 30%, #0821A5 65%, #0d1117 100%)', minHeight: '100vh' }}>
      <ConstellationBackground />
      <div aria-hidden className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse, rgba(232,93,32,0.07), transparent 70%)' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center px-5 pt-28 sm:pt-40 pb-20">
        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20' }}>
            College Fast Forward · Exclusively for UF Families
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(30px, 5.5vw, 62px)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 22, padding: '0 4px', color: '#fff' }}
        >
          Your student doesn't need to send more resumes.{' '}
          <span style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #FA4616, #FF8A5C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            They need a plan.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          style={{ fontFamily: dmSans, fontWeight: 400, fontSize: 'clamp(16px, 2.2vw, 20px)', color: '#FFFFFF', lineHeight: 1.65, maxWidth: 620, margin: '0 auto 40px' }}
        >
          FastIQ gives your student clear direction, daily actions, and real outreach — so they stop guessing and start moving.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>College Fast Forward adds a network advantage when it matters.</span>
        </motion.p>

        {/* Product typing box */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-10"
        >
          <TypingBox />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5"
        >
          <CTAButton text="Start Free 7-Day Trial" onClick={onCTA} />
          <CTAButton text="See How It Works" onClick={onHowItWorks} variant="ghost" />
        </motion.div>

        {/* Micro-text */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
          style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}
        >
          No credit card required. Cancel anytime.
        </motion.p>
      </div>

      <style>{`@keyframes heroBlink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </section>
  );
}