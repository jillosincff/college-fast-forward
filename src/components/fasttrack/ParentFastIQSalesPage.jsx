import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Building2, Search, Mail, RefreshCw, BarChart3, Loader2, Sparkles, X, Check, Zap } from 'lucide-react';
// Checkout uses dynamic import of createCheckoutSession

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function AnimatedSection({ children, className, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── SECTION 1: THE HOOK ──
function HookSection() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 60%, #001872 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 80%, rgba(250,70,22,0.08) 0%, transparent 60%)' }} />
      <AnimatedSection className="relative z-10 max-w-3xl mx-auto px-5 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25 mb-6">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">FASTIQ™ by CFF</span>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="text-[28px] sm:text-[42px] font-extrabold text-white mb-5 tracking-tight"
          style={{ lineHeight: 1.1 }}
        >
          Your student is applying to jobs{' '}
          <span className="text-orange-400">the wrong way.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-[15px] sm:text-[17px] text-white/60 max-w-xl mx-auto leading-relaxed">
          Every year, millions of students send hundreds of cold applications and hear nothing back. Meanwhile,{' '}
          <span className="text-white font-semibold">80% of jobs are filled through networking and warm introductions.</span>{' '}
          FASTIQ makes sure your student never applies cold again.
        </motion.p>
      </AnimatedSection>
    </div>
  );
}

// ── SECTION 2: WHAT FASTIQ DOES ──
const FEATURES = [
  {
    icon: Building2,
    emoji: '🏢',
    title: 'Researches Target Companies',
    desc: "FASTIQ monitors hiring trends at your student's dream companies. It tracks who's hiring, what roles are open, salary ranges, and interview processes — so your student always knows where the opportunities are.",
  },
  {
    icon: Search,
    emoji: '🔍',
    title: 'Finds UF Alumni Who Can Help',
    desc: "This is the game-changer. FASTIQ searches the entire internet — not just CFF — to find UF alumni at target companies. Real people, real roles, real connections your student would never find on their own.",
  },
  {
    icon: Mail,
    emoji: '✉️',
    title: 'Drafts Personalized Outreach',
    desc: "FASTIQ writes personalized messages for your student to send to alumni — referencing their shared UF connection, the alumni's role, and your student's goals. No more staring at a blank screen wondering what to say.",
  },
  {
    icon: RefreshCw,
    emoji: '🔄',
    title: 'Follows Up and Keeps Them On Track',
    desc: "FASTIQ doesn't just find opportunities — it follows up. It prompts your student to send follow-up messages, tracks their networking activity, and gives them a weekly action plan so nothing falls through the cracks.",
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Tracks Everything So You Can See Progress',
    desc: "You'll see exactly how your student is using FASTIQ: how many companies they've researched, alumni they've connected with, and messages they've sent. No more wondering if they're actually working on their job search.",
  },
];

function FeaturesSection() {
  return (
    <div style={{ background: '#FFFFFF' }}>
      <AnimatedSection className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <motion.p variants={fadeUp} className="text-center text-[11px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-2">How It Works</motion.p>
        <motion.h2 variants={fadeUp} className="text-center text-[24px] sm:text-[32px] font-extrabold text-slate-900 mb-3 tracking-tight">
          FASTIQ works for your student 24/7.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-center text-[15px] text-slate-500 mb-12 max-w-lg mx-auto">Here's what it does while they sleep, study, and stress about the future.</motion.p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 bg-white"
            >
              <span className="text-3xl mb-4 block">{f.emoji}</span>
              <h3 className="text-[15px] font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>
    </div>
  );
}

// ── SECTION 3: COMPARISON ──
const WITHOUT = [
  'Sends 200 cold applications',
  'Hears back from maybe 3',
  'No idea who works where',
  "Stares at LinkedIn not knowing what to say",
  'No follow-up system',
  'You ask "how\'s the job search?" and get "fine"',
];

const WITH = [
  'Targets companies that are actually hiring',
  'Finds UF alumni who can open doors',
  'Gets a personalized intro message written for them',
  'Follows up at the right time',
  'Has a weekly action plan',
  'You can see their progress in real-time',
];

function ComparisonSection() {
  return (
    <div style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1A1F35 100%)' }}>
      <AnimatedSection className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <motion.h2 variants={fadeUp} className="text-center text-[24px] sm:text-[32px] font-extrabold text-white mb-10 tracking-tight">
          Without FASTIQ <span className="text-white/40">vs.</span> With FASTIQ
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Without */}
          <motion.div variants={fadeUp} className="rounded-2xl p-6 border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center">
                <X className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Without FASTIQ</p>
            </div>
            <ul className="space-y-3">
              {WITHOUT.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-red-400/60 mt-0.5 flex-shrink-0" />
                  <span className="text-[14px] text-slate-400 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          {/* With */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl p-6 border"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(250,70,22,0.08) 100%)', borderColor: 'rgba(34,197,94,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
                <Check className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-[13px] font-bold text-green-400 uppercase tracking-wider">With FASTIQ</p>
            </div>
            <ul className="space-y-3">
              {WITH.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[14px] text-white/80 leading-snug font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </AnimatedSection>
    </div>
  );
}

// ── SECTION 3.5: COST COMPARISON TABLE ──
const COST_ROWS = [
  { service: 'Career coaching', typical: '$200–400/session', fastiq: 'Unlimited' },
  { service: 'Resume review', typical: '$100–250 per review', fastiq: 'Unlimited + job-tailored' },
  { service: 'Interview prep', typical: '$150–300/session', fastiq: 'Unlimited + company-specific' },
  { service: 'LinkedIn optimization', typical: '$200–500 one-time', fastiq: 'Continuous' },
  { service: 'Job search CRM', typical: '$15–30/month', fastiq: 'Built in' },
  { service: 'Salary research', typical: '$30/month', fastiq: 'Built in' },
  { service: 'Alumni network access', typical: 'Priceless', fastiq: 'Entire web + CFF network' },
];

function CostComparisonSection() {
  return (
    <div style={{ background: '#F8FAFC' }}>
      <AnimatedSection className="max-w-3xl mx-auto px-5 py-16 sm:py-20">
        <motion.p variants={fadeUp} className="text-center text-[11px] font-bold text-blue-600 uppercase tracking-[0.15em] mb-2">Value</motion.p>
        <motion.h2 variants={fadeUp} className="text-center text-[24px] sm:text-[32px] font-extrabold text-slate-900 mb-10 tracking-tight">
          What $29/month replaces
        </motion.h2>
        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
          {/* Header */}
          <div className="grid grid-cols-3 gap-0 bg-slate-50 border-b border-slate-200 px-5 py-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Service</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Typical Cost</span>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider text-center">With FASTIQ</span>
          </div>
          {/* Rows */}
          {COST_ROWS.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 gap-0 px-5 py-3.5 items-center ${i < COST_ROWS.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <span className="text-[13px] text-slate-800 font-medium">{row.service}</span>
              <span className="text-[13px] text-slate-500 text-center">{row.typical}</span>
              <span className="text-[13px] text-green-700 font-semibold text-center flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" /> {row.fastiq}
              </span>
            </div>
          ))}
          {/* Total row */}
          <div className="grid grid-cols-3 gap-0 px-5 py-4 bg-slate-50 border-t border-slate-200">
            <span className="text-[14px] text-slate-900 font-bold">Total if separate</span>
            <span className="text-[14px] text-red-600 font-bold text-center">$1,000+/month</span>
            <span className="text-[14px] text-green-700 font-extrabold text-center">$29/month</span>
          </div>
        </motion.div>
        <motion.p variants={fadeUp} className="text-center text-[14px] text-slate-600 mt-6 max-w-lg mx-auto leading-relaxed font-medium">
          Your student's tuition already paid for the degree. FASTIQ makes sure they actually use it.
        </motion.p>
      </AnimatedSection>
    </div>
  );
}

// ── SECTION 4: THE ASK ──
function CTASection({ user, studentName, familyId }) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const baseUrl = window.location.origin;
      const plan = selectedPlan === 'annual' ? 'fastiq_annual' : 'fastiq_monthly';
      const { createCheckoutSession } = await import('@/functions/createCheckoutSession');
      const { data } = await createCheckoutSession({
        plan,
        successUrl: `${baseUrl}/#FastIQ?checkout=success`,
        cancelUrl: `${baseUrl}/#FastIQ?checkout=cancel`,
        metadata: { family_id: familyId || '' },
      });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setCheckingOut(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 60%, #001352 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(250,70,22,0.1) 0%, transparent 60%)' }} />
      <AnimatedSection className="relative z-10 max-w-2xl mx-auto px-5 py-16 sm:py-24 text-center">
        <motion.h2
          variants={fadeUp}
          className="text-[24px] sm:text-[34px] font-extrabold text-white mb-4 tracking-tight"
          style={{ lineHeight: 1.15 }}
        >
          You're already paying for their education.{' '}
          <span className="text-orange-400">This is how they use it.</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-[15px] sm:text-[17px] text-white/55 max-w-lg mx-auto leading-relaxed mb-8">
          For less than the cost of one textbook, FASTIQ gives your student a personal career agent that works around the clock to find them opportunities and warm introductions.
        </motion.p>

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

        <motion.div variants={fadeUp}>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="inline-flex items-center gap-2.5 rounded-xl text-[16px] font-bold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #FA4616 0%, #E03A0F 100%)',
              boxShadow: '0 0 40px rgba(250,70,22,0.4), 0 4px 20px rgba(250,70,22,0.3)',
              minHeight: 'auto',
              padding: '18px 40px',
            }}
          >
            {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {checkingOut
              ? 'Redirecting to checkout...'
              : selectedPlan === 'annual'
                ? 'Activate FASTIQ for Your Family — $249/year'
                : 'Activate FASTIQ for Your Family — $29/month'}
          </button>
        </motion.div>
        <motion.p variants={fadeUp} className="text-[13px] text-white/40 mt-4">
          7-day free trial &bull; Cancel anytime &bull; Covers your entire family on CFF
        </motion.p>
        <motion.p variants={fadeUp} className="text-[14px] text-white/25 mt-6 italic font-medium">
          Because applying isn't a strategy.
        </motion.p>
      </AnimatedSection>
    </div>
  );
}

// ── MAIN EXPORT ──
export default function ParentFastIQSalesPage({ user, studentName, familyId }) {
  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>
      <HookSection />
      <FeaturesSection />
      <ComparisonSection />
      <CostComparisonSection />
      <CTASection user={user} studentName={studentName} familyId={familyId} />
    </div>
  );
}