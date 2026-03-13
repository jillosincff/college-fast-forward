import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, Users, Share2, Download, Clock } from 'lucide-react';
import { useFunnel } from './FunnelContext';
import { alumniTeaser } from '@/functions/alumniTeaser';
import { base44 } from '@/api/base44Client';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

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
        <p className="text-white font-semibold text-[16px] mb-2">Checking who's actually out there for you...</p>
        <p className="text-white/40 text-[13px]">Scanning LinkedIn, company directories, CFF database</p>
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

function TeaserCard({ card, index }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-white/10 p-5 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-white/30" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[14px]">{card.roleTitle}</p>
          <p className="text-white/50 text-[13px]">at {card.company} — UF {card.gradYear}</p>
          {card.matchReason && (
            <p className="text-[12px] text-white/40 mt-1">{card.matchReason}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[12px] text-white/30 italic filter blur-[3px] select-none">
              {card.blurredName} · linkedin.com/in/
            </span>
            <Lock className="w-3 h-3 text-white/20" />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0f172a] to-transparent" />
    </motion.div>
  );
}

export default function TeaserReveal() {
  const { answers, setPhase, setStep, setMatchData, path } = useFunnel();
  const [teasers, setTeasers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef(null);

  useEffect(() => {
    base44.analytics.track({ eventName: 'teaser_reveal_viewed', properties: { path: path || 'unknown' } });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchTeasers() {
      try {
        const res = await alumniTeaser({ answers });
        if (cancelled) return;
        setTeasers(res.data);
        setMatchData(res.data);
      } catch (err) {
        console.error('Teaser fetch failed:', err);
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const timer = setTimeout(fetchTeasers, 800);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  const handleContinue = () => {
    setStep(path === 'known' ? 4 : 3);
    setPhase('quiz');
  };

  const handleShare = async () => {
    if (!shareRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: '#0A1628',
        scale: 2,
        useCORS: true,
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], 'fastiq.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'I might actually not be screwed',
          text: 'Found UF alumni who can help me land summer plans via FASTIQ',
          files: [new File([blob], 'fastiq-results.png', { type: 'image/png' })],
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fastiq-results.png';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Screenshot saved! Share it with your group chat 🎉');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        toast.error('Could not generate screenshot');
      }
    } finally {
      setSharing(false);
    }
  };

  if (loading) return <SkeletonCards />;

  const totalMatches = teasers?.totalMatches || 15;
  const isKnown = teasers?.type === 'known';
  const cards = isKnown ? (teasers?.teasers || []) : (teasers?.paths || []);

  // Fallback if API fails
  if (error || !teasers) {
    return (
      <div className="max-w-xl mx-auto px-5 py-10 text-center">
        <h3 className="text-[22px] font-extrabold text-white mb-2">
          Okay wait — we found <span className="text-orange-400">15+ real people</span>
        </h3>
        <p className="text-white/50 text-[14px] mb-8">Finish a couple more questions to see who they are.</p>
        <button onClick={handleContinue} className="w-full rounded-xl py-3.5 text-[15px] font-bold text-white hover:brightness-110" style={{ background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)' }}>
          Keep Going →
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="max-w-xl mx-auto px-5 py-10"
    >
      {/* Headline */}
      <motion.div variants={fadeUp} className="text-center mb-3">
        <h3
          className="text-[22px] sm:text-[28px] font-extrabold text-white tracking-tight"
          style={{ lineHeight: 1.15 }}
        >
          You're not as screwed as you feel right now.
        </h3>
      </motion.div>

      {/* Body */}
      <motion.p variants={fadeUp} className="text-center text-white/50 text-[14px] sm:text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
        We just looked for real UF grads already inside the places kids in your major are stressing about.
        Here's what's actually waiting if you message them before summer closes:
      </motion.p>

      {/* Big number overlay */}
      <motion.div variants={fadeUp} className="flex justify-center mb-6">
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FA4616 0%, #F97316 100%)',
            boxShadow: '0 0 50px rgba(250,70,22,0.35)',
          }}
        >
          <span className="text-[32px] font-extrabold text-white leading-none">{totalMatches}</span>
          <span className="text-[9px] font-bold text-white/70 uppercase tracking-wider">real people</span>
        </div>
      </motion.div>
      <motion.p variants={fadeUp} className="text-center text-white/40 text-[13px] mb-6">
        real UF grads you could message <span className="text-white/60 font-semibold">today</span>
      </motion.p>

      {/* Company counts (known path) */}
      {isKnown && teasers.companyCounts && (
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mb-6">
          {Object.entries(teasers.companyCounts).map(([company, count]) => (
            <span key={company} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/10 text-[13px]">
              <span className="text-white font-semibold">{company}:</span>
              <span className="text-orange-400 font-bold">{count}</span>
            </span>
          ))}
        </motion.div>
      )}

      {/* Shareable area */}
      <div ref={shareRef} className="space-y-3 mb-6">
        {/* Teaser cards */}
        {isKnown && cards.map((card, i) => (
          <TeaserCard key={i} card={card} index={i} />
        ))}

        {/* Explorer path cards */}
        {!isKnown && cards.map((p, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="rounded-2xl border border-white/10 p-5 relative overflow-hidden"
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

        {/* Watermark for screenshot */}
        <div className="text-center pt-2 hidden" data-html2canvas-ignore="false">
          <p className="text-white/20 text-[10px]">FASTIQ™ by College Fast Forward</p>
        </div>
      </div>

      {/* Urgency pill */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl p-4 border border-red-500/25 mb-6"
        style={{ background: 'linear-gradient(135deg, rgba(250,70,22,0.12) 0%, rgba(239,68,68,0.08) 100%)' }}
      >
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <p className="text-white/80 text-[13px] sm:text-[14px] leading-snug">
            <span className="font-bold text-white">Summer postings are disappearing fast</span> — most close in 3–6 weeks.
            Send something before you're officially too late.
          </p>
        </div>
      </motion.div>

      {/* Continue CTA */}
      <motion.button
        variants={fadeUp}
        onClick={handleContinue}
        className="w-full rounded-xl py-4 text-[15px] sm:text-[16px] font-bold text-white transition-all hover:brightness-110 mb-4"
        style={{
          background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
          boxShadow: '0 0 30px rgba(250,70,22,0.3)',
        }}
      >
        Continue Quiz to Unlock Full List →
      </motion.button>

      {/* Share button */}
      <motion.button
        variants={fadeUp}
        onClick={handleShare}
        disabled={sharing}
        className="w-full rounded-xl py-3 text-[14px] font-semibold text-white/70 transition-all hover:text-white hover:bg-white/10 border-2 border-white/15 hover:border-white/25 flex items-center justify-center gap-2"
        style={{ minHeight: 'auto' }}
      >
        {sharing ? (
          <>Generating screenshot...</>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            Send this to the group chat: "Bro I might actually not be screwed"
          </>
        )}
      </motion.button>
    </motion.div>
  );
}