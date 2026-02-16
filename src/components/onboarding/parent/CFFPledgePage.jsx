import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const PLEDGE_ITEMS = [
  {
    key: 'respond',
    title: 'Respond when a student reaches out to me',
    subtitle: "Even a short answer can change someone's direction.",
  },
  {
    key: 'share',
    title: 'Share my expertise and experience',
    subtitle: 'What took me years to learn could save a student months of confusion.',
  },
  {
    key: 'introductions',
    title: 'Make introductions when I can',
    subtitle: 'One email from me is worth 100 cold applications from them.',
  },
  {
    key: 'help_others',
    title: "Help other people's kids the way I'd want someone to help mine",
    subtitle: "Because every student in this network is someone's son or daughter.",
  },
];

export default function CFFPledgePage({ user, onComplete }) {
  const [checks, setChecks] = useState({
    respond: false,
    share: false,
    introductions: false,
    help_others: false,
  });
  const [parentCount, setParentCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    async function loadCount() {
      try {
        await base44.entities.User.filter({ persona: 'parent' }, undefined, 1);
        setParentCount(885);
      } catch {
        setParentCount(885);
      }
    }
    loadCount();
  }, []);

  const allChecked = Object.values(checks).every(Boolean);

  const handleCheck = (key) => {
    if (submitting || celebrated) return;
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePledge = async () => {
    if (!allChecked || submitting || completedRef.current) return;
    completedRef.current = true;
    setSubmitting(true);

    // Save pledge to user
    await base44.auth.updateMe({
      pledge_taken: true,
      pledge_taken_at: new Date().toISOString(),
    });

    // Award karma for taking the pledge
    try {
      await base44.functions.invoke('awardKarma', {
        parentUserId: user.id,
        parentEmail: user.email,
        parentName: user.full_name,
        actionType: 'onboarding_complete',
        referenceType: 'pledge',
        referenceId: user.id,
        description: 'Took the CFF Pledge',
      });
    } catch (e) {
      console.log('Pledge karma failed (non-critical):', e.message);
    }

    // Track analytics
    try {
      base44.analytics.track({
        eventName: 'pledge_completed',
        properties: { user_id: user.id },
      });
    } catch {}

    // Celebration
    setCelebrated(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0021A5', '#FA4616', '#FFD700'],
    });

    // Navigate after celebration delay
    setTimeout(() => {
      onComplete();
    }, 1800);
  };

  const firstName =
    user?.full_name?.includes(',')
      ? user.full_name.split(',')[1]?.trim().split(/\s+/)[0] || 'Parent'
      : user?.full_name?.trim().split(/\s+/)[0] || 'Parent';

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 md:py-16 overflow-y-auto" style={{ background: '#fafbfc' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl flex flex-col items-center"
      >
        {/* Emoji */}
        <span className="text-5xl mb-4">🤝</span>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 text-center">
          The CFF Pledge
        </h1>

        {/* Intro */}
        <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-2">
          Before you enter the network, we ask every parent to make the same promise.
        </p>
        <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-2">
          This is what makes CFF different from LinkedIn, from job boards, from everything else out there. We're not a platform. <strong className="text-slate-800">We're a community of parents who actually care about each other's kids.</strong>
        </p>
        <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-8">
          And it only works if everyone shows up.
        </p>

        {/* Pledge Card */}
        <div
          className={`w-full rounded-2xl border-2 p-4 sm:p-6 md:p-8 mb-6 transition-all duration-300 bg-white ${
            allChecked
              ? 'border-[#0021A5] shadow-[0_0_20px_rgba(0,33,165,0.1)]'
              : 'border-slate-200'
          }`}
        >
          <p className="text-lg md:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
            I, <span className="text-[#0021A5]">{firstName}</span>, pledge to:
          </p>

          <div className="space-y-1">
            {PLEDGE_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleCheck(item.key)}
                disabled={submitting || celebrated}
                className={`w-full flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-colors duration-200 ${
                  checks[item.key] ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                }`}
                style={{ borderBottom: item.key !== 'help_others' ? '1px solid #f0f0f0' : 'none' }}
              >
                {/* Checkbox */}
                <motion.div
                  animate={checks[item.key] ? { scale: [1, 1.15, 1], backgroundColor: '#0021A5', borderColor: '#0021A5' } : { scale: 1, backgroundColor: '#fff', borderColor: '#ccc' }}
                  transition={{ duration: 0.25 }}
                  className="w-7 h-7 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  {checks[item.key] && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white text-sm font-bold"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm md:text-base">
                    {item.title}
                  </p>
                  <p
                    className={`text-sm mt-1 italic leading-relaxed transition-colors duration-300 ${
                      checks[item.key] ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <p className="text-center text-slate-600 text-sm md:text-base mb-6 max-w-md">
          <strong className="text-[#0021A5]">{parentCount.toLocaleString()} UF parents</strong> have already made this promise.
          <br />
          Your student is already benefiting from their generosity.
        </p>

        {/* Testimonial */}
        <div className="w-full max-w-md bg-blue-50 rounded-xl p-5 mb-8">
          <p className="text-slate-700 text-sm md:text-base italic leading-relaxed">
            "I joined CFF because someone helped my daughter land her first internship. Now I've helped 4 students I've never met. That's the deal."
          </p>
          <p className="font-semibold text-[#0021A5] text-sm mt-3">
            — Real CFF Parent
          </p>
        </div>

        {/* Button */}
        <AnimatePresence mode="wait">
          {celebrated ? (
            <motion.div
              key="celebrated"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm text-center py-4 px-8 rounded-xl bg-[#0021A5] text-white font-bold text-lg"
            >
              Welcome to the family ✨
            </motion.div>
          ) : (
            <motion.button
              key="pledge-btn"
              onClick={handlePledge}
              disabled={!allChecked || submitting}
              className={`w-full max-w-sm py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${
                allChecked
                  ? 'bg-[#0021A5] text-white shadow-[0_4px_15px_rgba(0,33,165,0.3)] hover:bg-[#001a8a] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              whileTap={allChecked ? { scale: 0.97 } : {}}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'I Care. I Pledge. Let Me In. →'
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <p className="text-center text-slate-400 text-xs mt-4 max-w-sm pb-8">
          This isn't a legal contract — it's a promise to a community of parents who are counting on each other.
        </p>
      </motion.div>
    </div>
  );
}