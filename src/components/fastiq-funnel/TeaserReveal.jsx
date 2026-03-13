import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Users } from 'lucide-react';
import { useFunnel } from './FunnelContext';
import { alumniTeaser } from '@/functions/alumniTeaser';
import { base44 } from '@/api/base44Client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function SkeletonCards() {
  return (
    <div className="max-w-xl mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-orange-400/30 border-t-orange-400 mx-auto mb-6"
        />
        <p className="text-white font-semibold text-[16px] mb-2">Scanning UF alumni network...</p>
        <p className="text-white/40 text-[13px]">Checking LinkedIn, company directories, and CFF database</p>
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-2xl border border-white/10 p-5 mb-3 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-1/2 bg-white/8 rounded" />
              <div className="h-3 w-2/3 bg-white/5 rounded filter blur-[3px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeaserReveal() {
  const { answers, setPhase, setStep, setMatchData, path } = useFunnel();
  const [teasers, setTeasers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    base44.analytics.track({ eventName: 'teaser_reveal_viewed', properties: { path: path || 'unknown' } });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchTeasers() {
      try {
        const res = await alumniTeaser({ answers });
        if (cancelled) return;
        const data = res.data;
        setTeasers(data);
        setMatchData(data);
      } catch (err) {
        console.error('Teaser fetch failed:', err);
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Small delay for UX drama
    const timer = setTimeout(fetchTeasers, 800);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const handleContinue = () => {
    if (path === 'known') {
      setStep(4);
    } else {
      setStep(3);
    }
    setPhase('quiz');
  };

  if (loading) return <SkeletonCards />;

  // Fallback if API fails — show generic teaser
  if (error || !teasers) {
    return (
      <div className="max-w-xl mx-auto px-5 py-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-green-400" />
          <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider">Matches Found!</span>
        </div>
        <h3 className="text-[22px] font-extrabold text-white mb-2">
          We found <span className="text-orange-400">15+ UF alumni</span> matches
        </h3>
        <p className="text-white/50 text-[14px] mb-8">Finish the quiz to unlock your full list.</p>
        <button onClick={handleContinue} className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white hover:brightness-110" style={{ background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)' }}>
          Continue Quiz to Unlock →
        </button>
      </div>
    );
  }

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
      {teasers.type === 'known' && teasers.teasers?.map((card, i) => (
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
              <p className="text-white font-semibold text-[14px]">{card.roleTitle}</p>
              <p className="text-white/50 text-[13px]">at {card.company} · UF {card.gradYear}</p>
              <p className="text-[12px] text-white/40 mt-1">{card.matchReason}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[12px] text-white/30 italic filter blur-[3px] select-none">{card.blurredName} · linkedin.com/in/</span>
                <Lock className="w-3 h-3 text-white/20" />
              </div>
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-2">
            <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-wider">Suggested Path</p>
            {p.count && <span className="text-[11px] text-orange-400 font-bold">{p.count} alumni</span>}
          </div>
          <p className="text-white font-bold text-[16px] mb-1">{p.path}</p>
          <div className="flex items-start gap-3 mt-3 pl-2 border-l-2 border-white/10">
            <div>
              <p className="text-white/70 text-[13px] font-medium">{p.roleTitle} at {p.company}</p>
              <p className="text-white/40 text-[12px]">UF {p.gradYear}</p>
              <span className="text-[11px] text-white/25 italic filter blur-[3px] select-none mt-1 block">{p.blurredName} · linkedin.com/in/...</span>
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