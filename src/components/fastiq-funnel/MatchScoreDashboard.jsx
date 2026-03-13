import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, MessageSquare, Clock, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { useFunnel } from './FunnelContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function computeScore(answers, matchData) {
  // If we have real match data, derive score from actual count
  if (matchData?.totalMatches) {
    const count = matchData.totalMatches;
    // Scale: 1-5 matches = 70-75, 6-15 = 75-82, 16-30 = 82-88, 30+ = 88-94
    if (count <= 5) return 70 + count;
    if (count <= 15) return 75 + Math.floor((count - 5) * 0.7);
    if (count <= 30) return 82 + Math.floor((count - 15) * 0.4);
    return Math.min(88 + Math.floor((count - 30) * 0.2), 94);
  }
  // Fallback to answer-based heuristic
  let score = 45;
  if (answers.major) score += 8;
  if (answers.grad_year) score += 5;
  if ((answers.companies || []).length > 0) score += 12;
  if ((answers.companies || []).length >= 3) score += 5;
  if (answers.location) score += 4;
  if (answers.timeline === 'asap' || answers.timeline === 'this_semester') score += 8;
  if ((answers.interests || []).length > 0) score += 6;
  if ((answers.industries || []).length > 0) score += 7;
  return Math.min(score, 94);
}

export default function MatchScoreDashboard() {
  const { answers, matchData, setPhase, path } = useFunnel();
  const [displayScore, setDisplayScore] = useState(0);
  const targetScore = computeScore(answers, matchData);
  const totalMatches = matchData?.totalMatches || 15;
  const warmIntros = Math.floor(totalMatches * 0.6);

  // Animate score counting up
  useEffect(() => {
    let frame;
    let current = 0;
    const step = () => {
      current += 1;
      if (current <= targetScore) {
        setDisplayScore(current);
        frame = requestAnimationFrame(step);
      }
    };
    const timer = setTimeout(() => { frame = requestAnimationFrame(step); }, 600);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [targetScore]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="max-w-xl mx-auto px-5 py-10"
    >
      {/* Score ring */}
      <motion.div variants={fadeUp} className="text-center mb-8">
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(displayScore / 100) * 327} 327`}
              className="transition-all duration-100"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FA4616" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[36px] font-extrabold text-white">{displayScore}%</span>
            <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Match Score</span>
          </div>
        </div>
        <h3 className="text-[20px] sm:text-[24px] font-extrabold text-white tracking-tight mb-1">
          Your FASTIQ Match Score
        </h3>
        <p className="text-white/50 text-[14px]">Based on your profile and our alumni database</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-4 text-center border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Users className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
          <p className="text-[20px] font-extrabold text-white">{totalMatches}</p>
          <p className="text-[11px] text-white/40">Alumni Matches</p>
        </div>
        <div className="rounded-xl p-4 text-center border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <MessageSquare className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
          <p className="text-[20px] font-extrabold text-white">{warmIntros}</p>
          <p className="text-[11px] text-white/40">Warm Intros</p>
        </div>
        <div className="rounded-xl p-4 text-center border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1.5" />
          <p className="text-[20px] font-extrabold text-white">3.2×</p>
          <p className="text-[11px] text-white/40">More Replies</p>
        </div>
      </motion.div>

      {/* Urgency */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl p-4 border border-orange-500/20 mb-6"
        style={{ background: 'rgba(250,70,22,0.08)' }}
      >
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold text-[14px] mb-0.5">
              {warmIntros} warm intros waiting — summer roles close in 4–6 weeks
            </p>
            <p className="text-white/45 text-[12px]">
              Students who unlock send 3.2× more messages and get 2.8× more replies
            </p>
          </div>
        </div>
      </motion.div>

      {/* Locked preview */}
      <motion.div variants={fadeUp} className="rounded-xl border border-white/10 p-5 mb-6 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="filter blur-[6px] select-none pointer-events-none">
          {(matchData?.teasers || []).slice(0, 2).map((t, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <p className="text-white text-[14px] font-semibold">{t.blurredName || 'UF Alum'} — {t.roleTitle} at {t.company}</p>
                <p className="text-white/50 text-[12px]">UF {t.gradYear || "'20"} · {t.matchReason || 'Alumni match'}</p>
              </div>
            </div>
          ))}
          {(!matchData?.teasers || matchData.teasers.length === 0) && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div>
                  <p className="text-white text-[14px] font-semibold">UF Alum — Senior PM at Amazon</p>
                  <p className="text-white/50 text-[12px]">UF '19 · Open to coffee chats</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div>
                  <p className="text-white text-[14px] font-semibold">UF Alum — Analyst at Goldman Sachs</p>
                  <p className="text-white/50 text-[12px]">UF '21 · Can refer interns</p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.6)' }}>
          <div className="text-center">
            <Lock className="w-6 h-6 text-white/40 mx-auto mb-2" />
            <p className="text-white font-semibold text-[14px]">Unlock to see full profiles</p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        variants={fadeUp}
        onClick={() => setPhase('paywall')}
        className="w-full rounded-xl py-4 text-[16px] font-bold text-white transition-all hover:brightness-110 flex items-center justify-center gap-2"
        style={{
          background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
          boxShadow: '0 0 30px rgba(250,70,22,0.35)',
        }}
      >
        <Zap className="w-5 h-5" />
        Unlock My Full Alumni List
        <ArrowRight className="w-4 h-4" />
      </motion.button>

      <motion.p variants={fadeUp} className="text-center text-[12px] text-white/30 mt-3">
        7-day free trial · Cancel anytime
      </motion.p>
    </motion.div>
  );
}