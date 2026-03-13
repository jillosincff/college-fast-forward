import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Users } from 'lucide-react';
import { useFunnel } from './FunnelContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Generate fake but realistic-looking teaser cards
function generateTeasers(answers) {
  const companies = answers.companies || [];
  const isExplorer = !companies.length;

  const TEASER_POOL = {
    'Amazon': [
      { title: 'Senior Product Manager', year: "'19" },
      { title: 'Software Dev Engineer II', year: "'20" },
      { title: 'Marketing Manager', year: "'17" },
      { title: 'Operations Lead', year: "'21" },
    ],
    'Google': [
      { title: 'UX Design Lead', year: "'18" },
      { title: 'Staff Engineer', year: "'16" },
      { title: 'Product Marketing Manager', year: "'20" },
    ],
    'Goldman Sachs': [
      { title: 'VP, Investment Banking', year: "'15" },
      { title: 'Analyst, Asset Management', year: "'22" },
    ],
    'McKinsey': [
      { title: 'Engagement Manager', year: "'18" },
      { title: 'Associate', year: "'21" },
    ],
    'default': [
      { title: 'Senior Manager', year: "'19" },
      { title: 'Director of Operations', year: "'17" },
      { title: 'Product Lead', year: "'20" },
    ],
  };

  const EXPLORER_PATHS = {
    tech_ai: { path: 'Tech Product Management', company: 'Google', role: 'Product Manager', year: "'20" },
    creative: { path: 'Creative Design / UX', company: 'Apple', role: 'UX Design Lead', year: "'19" },
    high_pay: { path: 'Investment Banking', company: 'Goldman Sachs', role: 'VP, Investment Banking', year: "'16" },
    helping: { path: 'Healthcare Strategy', company: 'UnitedHealth', role: 'Strategy Director', year: "'18" },
    travel: { path: 'Management Consulting', company: 'McKinsey', role: 'Engagement Manager', year: "'17" },
    startups: { path: 'Startup Operations', company: 'Stripe', role: 'Head of Ops', year: "'21" },
    not_sure: { path: 'Business Development', company: 'Salesforce', role: 'Account Executive', year: "'20" },
  };

  if (isExplorer) {
    const interests = answers.interests || ['not_sure'];
    return {
      type: 'explorer',
      totalMatches: 12 + Math.floor(Math.random() * 20),
      paths: interests.slice(0, 3).map(i => EXPLORER_PATHS[i] || EXPLORER_PATHS.not_sure),
    };
  }

  const companyCounts = {};
  let totalMatches = 0;
  companies.forEach(c => {
    const count = 2 + Math.floor(Math.random() * 6);
    companyCounts[c] = count;
    totalMatches += count;
  });

  const teaserCards = companies.slice(0, 2).map(c => {
    const pool = TEASER_POOL[c] || TEASER_POOL.default;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { company: c, ...pick };
  });

  return { type: 'known', totalMatches, companyCounts, teaserCards };
}

export default function TeaserReveal() {
  const { answers, setPhase, setStep, setMatchData } = useFunnel();
  const [teasers, setTeasers] = useState(null);
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    // Fake "searching" delay for drama
    const timer = setTimeout(() => {
      const data = generateTeasers(answers);
      setTeasers(data);
      setMatchData(data);
      setAnimating(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // For known path: advance step to 4 (index) to show Q5 of 6
    // For explorer path: advance step to 3 (index) to show Q4 of 4
    const { path } = useFunnel();
    setPhase('quiz');
  };

  if (animating) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-orange-400/30 border-t-orange-400 mx-auto mb-6"
        />
        <p className="text-white font-semibold text-[16px] mb-2">Scanning UF alumni network...</p>
        <p className="text-white/40 text-[13px]">Checking LinkedIn, company directories, and CFF database</p>
      </div>
    );
  }

  if (!teasers) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      className="max-w-xl mx-auto px-5 py-10"
    >
      <motion.div variants={fadeUp} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Matches Found!</span>
        </div>
        <h3 className="text-[22px] sm:text-[28px] font-extrabold text-white tracking-tight mb-2">
          We found <span className="text-orange-400">{teasers.totalMatches} UF alumni</span> matches
        </h3>
        <p className="text-white/50 text-[14px]">Here's a preview — finish the quiz to see your full results.</p>
      </motion.div>

      {/* Company counts (known path) */}
      {teasers.type === 'known' && teasers.companyCounts && (
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-6">
          {Object.entries(teasers.companyCounts).map(([company, count]) => (
            <span key={company} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10 text-[13px]">
              <span className="text-white font-semibold">{company}:</span>
              <span className="text-orange-400 font-bold">{count}</span>
            </span>
          ))}
        </motion.div>
      )}

      {/* Teaser cards — known path */}
      {teasers.type === 'known' && teasers.teaserCards?.map((card, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          className="rounded-2xl border border-white/10 p-5 mb-3 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white/30" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-[14px]">{card.title}</p>
              <p className="text-white/50 text-[13px]">at {card.company} · UF {card.year}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[12px] text-white/30 italic filter blur-[3px] select-none">Sarah K. · linkedin.com/in/</span>
                <Lock className="w-3 h-3 text-white/20" />
              </div>
            </div>
          </div>
          {/* Blur overlay */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0f172a] to-transparent" />
        </motion.div>
      ))}

      {/* Explorer path — career path teasers */}
      {teasers.type === 'explorer' && teasers.paths?.map((p, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          className="rounded-2xl border border-white/10 p-5 mb-3 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-2">Suggested Path</p>
          <p className="text-white font-bold text-[16px] mb-1">{p.path}</p>
          <div className="flex items-start gap-3 mt-3 pl-2 border-l-2 border-white/10">
            <div>
              <p className="text-white/70 text-[13px] font-medium">{p.role} at {p.company}</p>
              <p className="text-white/40 text-[12px]">UF {p.year}</p>
              <span className="text-[11px] text-white/25 italic filter blur-[3px] select-none mt-1 block">Michael R. · linkedin.com/in/...</span>
            </div>
          </div>
        </motion.div>
      ))}

      <motion.button
        variants={fadeUp}
        onClick={handleContinue}
        className="mt-6 w-full rounded-xl py-3.5 text-[15px] font-bold text-white transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)' }}
      >
        Continue Quiz to Unlock Full List →
      </motion.button>
    </motion.div>
  );
}