import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

/**
 * Celebration card shown inline after a pipeline status change.
 * type: 'first_reply' | 'reply' | 'first_interview' | 'interview' | 'offer'
 * company: string
 * onAction: (actionPrompt: string) => void
 * onDismiss: () => void
 * autoDismiss: boolean (true for non-offer, false for offer)
 */

const CONFIGS = {
  first_reply: {
    bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    border: '#86EFAC',
    title: '🎉 Your first reply! Warm paths work. FASTIQ helped you get in the door.',
    actions: [{ label: 'Draft a Response →', buildPrompt: (c) => `Help me craft a response to ${c.alumni_name} at ${c.company} — they replied to my outreach` }],
  },
  reply: {
    bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    border: '#86EFAC',
    title: '🎉 Another reply! You\'re building momentum.',
    actions: [{ label: 'Draft a Response →', buildPrompt: (c) => `Help me craft a response to ${c.alumni_name} at ${c.company} — they replied to my outreach` }],
  },
  first_interview: {
    bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
    border: '#FDE68A',
    title: '🎉🎉 Your FIRST interview! This is what warm networking does.',
    actions: [{ label: 'Prep Me for This Interview →', buildPrompt: (c) => `Prepare me for an interview at ${c.company}` }],
  },
  interview: {
    bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
    border: '#FDE68A',
    title: '📅 Interview secured! FASTIQ helped you make this connection. Let me prep you.',
    actions: [{ label: 'Prep Me for This Interview →', buildPrompt: (c) => `Prepare me for an interview at ${c.company}` }],
  },
  offer: {
    bg: 'linear-gradient(135deg, #FEF9C3, #FDE68A)',
    border: '#FBBF24',
    title: null, // dynamically set with company name
    actions: [
      { label: '💰 Help Me Negotiate →', buildPrompt: (c) => `I got an offer from ${c.company}! Help me evaluate and negotiate.` },
      { label: '📩 Thank My Network →', buildPrompt: (c) => `I accepted an offer at ${c.company}. Help me thank everyone who helped me in my job search.` },
    ],
  },
};

export default function PipelineCelebrationCard({ type, contact, onAction, onDismiss }) {
  const cfg = CONFIGS[type];
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 8s for non-offer
  useEffect(() => {
    if (type === 'offer') return;
    const t = setTimeout(() => { setVisible(false); onDismiss?.(); }, 8000);
    return () => clearTimeout(t);
  }, [type]);

  if (!cfg || !visible) return null;

  const title = type === 'offer'
    ? `🎉🎉🎉 CONGRATULATIONS! You got an offer from ${contact?.company || 'them'}! All your hard work — the research, the outreach, the follow-ups — it all paid off.`
    : cfg.title;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl overflow-hidden mb-2"
        style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }}
      >
        <div className="px-4 py-3 relative">
          <button
            onClick={() => { setVisible(false); onDismiss?.(); }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/60 flex items-center justify-center hover:bg-white/80 transition-colors"
            style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
          >
            <X className="w-3 h-3 text-slate-500" />
          </button>
          <p className="text-[13px] font-bold text-slate-900 leading-snug pr-6">{title}</p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            {cfg.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onAction?.(action.buildPrompt(contact))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200 cursor-pointer hover:brightness-95 active:scale-95"
                style={{
                  borderColor: type === 'offer' ? '#D97706' : type.includes('interview') ? '#F59E0B' : '#22C55E',
                  color: 'white',
                  backgroundColor: type === 'offer' ? '#D97706' : type.includes('interview') ? '#F59E0B' : '#22C55E',
                  minHeight: 'auto',
                  minWidth: 'auto',
                }}
              >
                {action.label}
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}