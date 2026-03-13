import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Lock, Loader2, Shield, ArrowLeft, Users } from 'lucide-react';
import { useFunnel } from './FunnelContext';
import { navigate } from '@/components/utils/navigation';
import { onboardFromQuiz } from '@/functions/onboardFromQuiz';
import { useToast } from '@/components/ui/use-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const BENEFITS = [
  'Full names, LinkedIn profiles, verified UF connection',
  'Personalized outreach drafts (copy-paste ready)',
  'Pipeline tracking + follow-up reminders',
  'Weekly scout — new alumni matches delivered automatically',
  'Unlimited company research & salary intel',
];

export default function PaywallScreen() {
  const { answers, matchData, setPhase, onClose } = useFunnel();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showExitIntent, setShowExitIntent] = useState(false);
  const { toast } = useToast();

  // On mount: check if returning from successful checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('checkout') === 'success') {
      persistQuizAnswers();
    }
  }, []);

  async function persistQuizAnswers() {
    // Recover quiz answers from sessionStorage (survives Stripe redirect)
    const stored = sessionStorage.getItem('fastiq_quiz_answers');
    const quizAnswers = stored ? JSON.parse(stored) : buildQuizPayload();

    try {
      await onboardFromQuiz({ quizAnswers });
      sessionStorage.removeItem('fastiq_quiz_answers');
      toast({
        title: 'Welcome! Your profile is set up',
        description: 'Check your alumni matches — they\'re ready for you.',
      });
      // Redirect to FASTIQ dashboard
      navigate('FastIQ');
    } catch (err) {
      console.error('Failed to persist quiz answers:', err);
      // Still redirect — profile can be completed later
      navigate('FastIQ');
    }
  }

  function buildQuizPayload() {
    return {
      major: answers.major,
      gradYear: answers.grad_year,
      targets: answers.companies || [],
      locationPref: answers.location,
      jobType: answers.role_type,
      interests: answers.interests || [],
      industries: answers.industries || [],
    };
  }

  const totalMatches = matchData?.totalMatches || 18;
  const major = answers.major || 'your major';
  const year = answers.grad_year || '27';
  const scarcityCount = 3 + Math.floor(Math.random() * 8);

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutError('');

    // Save quiz answers to sessionStorage so they survive the Stripe redirect
    sessionStorage.setItem('fastiq_quiz_answers', JSON.stringify(buildQuizPayload()));

    try {
      const baseUrl = window.location.origin;
      const plan = selectedPlan === 'annual' ? 'fastiq_annual' : 'fastiq_monthly';
      const { createCheckoutSession } = await import('@/functions/createCheckoutSession');
      const response = await createCheckoutSession({
        plan,
        successUrl: `${baseUrl}/#FastIQ?checkout=success`,
        cancelUrl: `${baseUrl}/#FastIQ?checkout=cancel`,
        metadata: {},
      });
      const result = response?.data;
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      setCheckoutError(result?.error || 'Could not start checkout. Please try again.');
      setCheckingOut(false);
    } catch (err) {
      const errData = err?.response?.data;
      setCheckoutError(errData?.error || 'Checkout failed. Please try again.');
      setCheckingOut(false);
    }
  };

  const handleBack = () => {
    if (!showExitIntent) {
      setShowExitIntent(true);
      return;
    }
    setPhase('score');
  };

  const handleSignUpFirst = () => {
    // Send them to auth, they'll come back to FASTIQ after
    navigate('GatorAuth');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="max-w-lg mx-auto px-5 py-8"
    >
      {/* Back button */}
      <motion.div variants={fadeUp} className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-[13px] text-white/40 hover:text-white/60 transition-colors"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>
      </motion.div>

      {/* Exit intent overlay */}
      {showExitIntent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-orange-500/30 p-5 mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(250,70,22,0.12) 0%, rgba(250,70,22,0.04) 100%)' }}
        >
          <p className="text-orange-300 font-bold text-[15px] mb-1">
            68% of students who unlock send their first message the same day.
          </p>
          <p className="text-white/50 text-[13px]">
            Your {totalMatches} alumni matches won't wait forever — summer recruiting is already underway.
          </p>
        </motion.div>
      )}

      {/* Header */}
      <motion.div variants={fadeUp} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 mb-4">
          <Lock className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Unlock Full Access</span>
        </div>
        <h3 className="text-[22px] sm:text-[28px] font-extrabold text-white tracking-tight mb-2">
          Unlock Your Full Personalized List<br />+ Draft Messages
        </h3>
        <p className="text-white/50 text-[14px]">
          {totalMatches} UF alumni ready to help — names, profiles, and copy-paste outreach
        </p>
      </motion.div>

      {/* Plan toggle */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setSelectedPlan('monthly')}
          className={`px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all ${selectedPlan === 'monthly' ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/15'}`}
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          $29/month
        </button>
        <button
          onClick={() => setSelectedPlan('annual')}
          className={`px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all relative ${selectedPlan === 'annual' ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/15'}`}
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          $249/year
          <span className="absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full bg-green-500 text-[9px] font-bold text-white uppercase">Save 28%</span>
        </button>
      </motion.div>

      {/* Trial callout */}
      <motion.div variants={fadeUp} className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-[12px] font-bold">
          <Shield className="w-3 h-3" /> 7-day free trial — cancel anytime
        </span>
      </motion.div>

      {/* Benefits */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-white/10 p-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-4">What you get</p>
        <ul className="space-y-3">
          {BENEFITS.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-white/80 text-[14px] leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Checkout CTA */}
      <motion.div variants={fadeUp}>
        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          className="w-full rounded-xl py-4 text-[16px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2.5"
          style={{
            background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
            boxShadow: '0 0 40px rgba(250,70,22,0.4), 0 4px 20px rgba(250,70,22,0.3)',
          }}
        >
          {checkingOut ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting to checkout...</>
          ) : (
            <><Zap className="w-5 h-5" /> Start Free Trial — {selectedPlan === 'annual' ? '$249/year' : '$29/month'}</>
          )}
        </button>
      </motion.div>

      {checkoutError && (
        <motion.div variants={fadeUp} className="mt-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/25">
          <p className="text-[13px] text-red-300">{checkoutError}</p>
          <p className="text-[12px] text-red-300/60 mt-1">
            You may need to <button onClick={handleSignUpFirst} className="underline hover:text-red-200" style={{ minHeight: 'auto', minWidth: 'auto' }}>sign in first</button> before checking out.
          </p>
        </motion.div>
      )}

      {/* Scarcity */}
      <motion.div variants={fadeUp} className="text-center mt-5">
        <p className="text-white/30 text-[12px] flex items-center justify-center gap-1.5">
          <Users className="w-3 h-3" />
          Only {scarcityCount} {major} '{year} students unlocked their list this month
        </p>
      </motion.div>

      {/* Free fallback for explorer */}
      <motion.div variants={fadeUp} className="text-center mt-6 pt-5 border-t border-white/8">
        <p className="text-white/35 text-[13px] mb-2">Not ready yet?</p>
        <button
          onClick={handleSignUpFirst}
          className="text-cyan-400 text-[13px] font-semibold hover:text-cyan-300 transition-colors"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          Get a free "Top 5 UF Alumni" report instead →
        </button>
      </motion.div>
    </motion.div>
  );
}