import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, PartyPopper, MessageSquare, Briefcase, Trophy } from 'lucide-react';

const CELEBRATIONS = {
  replied: {
    emoji: '🎉',
    icon: MessageSquare,
    color: '#22C55E',
    bg: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    border: '#BBF7D0',
    title: 'They replied!',
    subtitle: 'Nice work! What did they say?',
    prompt: 'Paste their reply below and I\'ll help you craft the perfect response.',
    ctaText: 'Help me respond →',
    buildPrompt: (name, company, replyText) =>
      `${name} at ${company} replied to my outreach. Here's what they said:\n\n"${replyText}"\n\nHelp me craft the perfect response. Analyze their tone and suggest the best next step.`,
  },
  interview: {
    emoji: '📅',
    icon: Briefcase,
    color: '#F59E0B',
    bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
    border: '#FDE68A',
    title: 'Interview at {company}! That\'s huge.',
    subtitle: 'Want me to prep you for this interview?',
    prompt: 'Tell me a bit about the role or what they mentioned, and I\'ll prep you with company intel, likely questions, and culture notes.',
    ctaText: 'Prep me for this interview →',
    buildPrompt: (name, company, details) =>
      `I have an interview coming up at ${company}${name ? ` (through ${name})` : ''}. ${details ? `Here's what I know: ${details}` : ''} Help me prepare — company intel, likely questions, culture notes, everything.`,
  },
  offer: {
    emoji: '🏆',
    icon: Trophy,
    color: '#EAB308',
    bg: 'linear-gradient(135deg, #FEF9C3, #FDE68A)',
    border: '#FCD34D',
    title: '🎉🎉🎉 CONGRATULATIONS!',
    subtitle: 'You got an offer from {company}! All your hard work paid off.',
    prompt: 'Before you accept, let me help you make sure you\'re getting the best deal. Tell me: role title, base salary, bonus, equity (if any), location, start date, and any other benefits they mentioned.',
    ctaText: 'Help me evaluate this offer →',
    buildPrompt: (name, company, details) =>
      `I just got an offer from ${company}! ${details ? `Details: ${details}` : ''} Help me research the salary range for this role and prepare a negotiation strategy.`,
  },
};

export default function PipelineStatusModal({ newStatus, contact, onClose, onSendMessage }) {
  const [inputText, setInputText] = useState('');
  const cfg = CELEBRATIONS[newStatus];

  if (!cfg) return null;

  const Icon = cfg.icon;

  const handleSubmit = () => {
    const prompt = cfg.buildPrompt(contact.alumni_name, contact.company, inputText.trim());
    onSendMessage(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#fff' }}
      >
        {/* Celebration header */}
        <div style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, padding: '28px 24px', textAlign: 'center', position: 'relative' }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/60 flex items-center justify-center hover:bg-white/80 transition-colors"
            style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>

          {newStatus === 'offer' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.5 }}
              className="mb-3"
            >
              <span style={{ fontSize: 56 }}>{cfg.emoji}</span>
            </motion.div>
          )}
          {newStatus !== 'offer' && (
            <div className="mb-3">
              <span style={{ fontSize: 48 }}>{cfg.emoji}</span>
            </div>
          )}

          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>{cfg.title.replace('{company}', contact?.company || 'the company')}</h2>
          <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>{cfg.subtitle.replace('{company}', contact?.company || 'the company')}</p>
        </div>

        {/* Input area */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 12, lineHeight: 1.5 }}>{cfg.prompt}</p>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              newStatus === 'replied' ? 'Paste their reply here...' :
              newStatus === 'interview' ? 'e.g., "Product Manager role, 2 rounds of interviews..."' :
              'e.g., "$75K base, 10% bonus, remote..."'
            }
            className="mb-4 min-h-[80px] text-sm"
            rows={3}
          />
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              className="flex-1 h-11 font-bold"
              style={{ background: cfg.color, color: '#fff' }}
            >
              <Icon className="w-4 h-4 mr-2" />
              {cfg.ctaText}
            </Button>
          </div>
          <button
            onClick={onClose}
            className="w-full text-center mt-3 text-xs text-slate-400 hover:text-slate-600"
            style={{ minHeight: 'auto' }}
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}