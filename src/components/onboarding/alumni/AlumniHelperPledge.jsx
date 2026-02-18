import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const HELPER_PLEDGE_ITEMS = [
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

const SEEKER_PLEDGE_ITEMS = [
  {
    key: 'respond',
    title: 'Respond when a student reaches out to me',
    subtitle: "Even a quick reply can make a difference.",
  },
  {
    key: 'share_learned',
    title: "Share what I've learned — salary data, interview tips, career advice",
    subtitle: "My experience is exactly what students need to hear.",
  },
  {
    key: 'introductions',
    title: 'Make introductions when I can',
    subtitle: "One intro from me could open a door they can't reach alone.",
  },
  {
    key: 'pay_it_forward',
    title: "Pay it forward — This network is about to help me. I'll help someone else the same way.",
    subtitle: "That's what makes this community work.",
  },
];

export default function AlumniPledge({ user, intent, onComplete }) {
  const isSeeker = intent === 'seeking_help';
  const pledgeItems = isSeeker ? SEEKER_PLEDGE_ITEMS : HELPER_PLEDGE_ITEMS;

  const initialChecks = {};
  pledgeItems.forEach(item => { initialChecks[item.key] = false; });

  const [checks, setChecks] = useState(initialChecks);
  const [submitting, setSubmitting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const completedRef = useRef(false);

  const allChecked = Object.values(checks).every(Boolean);

  const handleCheck = (key) => {
    if (submitting || celebrated) return;
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePledge = async () => {
    if (!allChecked || submitting || completedRef.current) return;
    completedRef.current = true;
    setSubmitting(true);

    await base44.auth.updateMe({
      pledge_taken: true,
      pledge_taken_at: new Date().toISOString(),
    });

    try {
      base44.analytics.track({
        eventName: 'alumni_pledge_completed',
        properties: { user_id: user?.id, intent },
      });
    } catch {}

    setCelebrated(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0021A5', '#FA4616', '#FFD700'],
    });

    setTimeout(() => {
      onComplete();
    }, 1800);
  };

  const firstName =
    user?.full_name?.includes(',')
      ? user.full_name.split(',')[1]?.trim().split(/\s+/)[0] || 'Gator'
      : user?.full_name?.trim().split(/\s+/)[0] || 'Gator';

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 md:py-16 overflow-y-auto" style={{ background: '#fafbfc' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl flex flex-col items-center"
      >
        <span className="text-5xl mb-4">🤝</span>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 text-center">
          {isSeeker ? 'The Pay-It-Forward Pledge' : 'The CFF Pledge'}
        </h1>

        {isSeeker ? (
          <>
            <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-2">
              Inside CFF, parents and alumni are going to go out of their way to help you — with intros, advice, and opportunities you can't find anywhere else.
            </p>
            <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-8">
              All we ask is that you <strong className="text-slate-800">pay it forward</strong>.
            </p>
          </>
        ) : (
          <>
            <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-2">
              Before you enter the network, we ask every member to make the same promise.
            </p>
            <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-2">
              This is what makes CFF different. <strong className="text-slate-800">We're a community that actually shows up for each other.</strong>
            </p>
            <p className="text-center text-slate-600 text-base md:text-lg leading-relaxed max-w-lg mb-8">
              And it only works if everyone shows up.
            </p>
          </>
        )}

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
            {pledgeItems.map((item, idx) => (
              <button
                key={item.key}
                onClick={() => handleCheck(item.key)}
                disabled={submitting || celebrated}
                className={`w-full flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-colors duration-200 ${
                  checks[item.key] ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                }`}
                style={{ borderBottom: idx < pledgeItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}
              >
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

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm md:text-base">
                    {item.title}
                  </p>
                  <p className={`text-sm mt-1 italic leading-relaxed transition-colors duration-300 ${
                    checks[item.key] ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
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
              {isSeeker ? "Let's get you connected ✨" : 'Welcome to the family ✨'}
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
              ) : isSeeker ? (
                'I Pledge. Let Me In. →'
              ) : (
                'I Care. I Pledge. Let Me In. →'
              )}
            </motion.button>
          )}
        </AnimatePresence>

        <p className="text-center text-slate-400 text-xs mt-4 max-w-sm pb-8">
          This isn't a legal contract — it's a promise to a community that's counting on each other.
        </p>
      </motion.div>
    </div>
  );
}