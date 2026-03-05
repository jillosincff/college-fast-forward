import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, Building2, FileText, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const NUDGE_OPTIONS = [
  {
    key: 'follow_up',
    icon: RefreshCw,
    label: 'Remind to follow up on stale outreach',
    getMessage: (name) => `Hey ${name}! 👋 Just checking in — have you followed up on any of your outreach messages lately? Sometimes a quick follow-up is all it takes to get a response. You've got this! 💪`,
  },
  {
    key: 'research',
    icon: Building2,
    label: 'Encourage more company research',
    getMessage: (name) => `Hey ${name}! 🔍 Your FASTIQ is ready to help you research more companies and find UF alumni connections. Even 10 minutes today could uncover your next opportunity. Go explore! 🚀`,
  },
  {
    key: 'resume',
    icon: FileText,
    label: 'Suggest updating their resume',
    getMessage: (name) => `Hey ${name}! 📄 When's the last time you updated your resume? FASTIQ can help tailor it for specific roles — keeping it fresh makes a big difference when opportunities come knocking! ✨`,
  },
];

export default function ParentNudgeButton({ studentName, studentEmail, parentUser }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(null);
  const [sent, setSent] = useState(null);

  const handleSend = async (option) => {
    if (!studentEmail || !parentUser?.email) return;
    setSending(option.key);
    try {
      await base44.entities.Message.create({
        sender_email: parentUser.email,
        sender_name: parentUser.full_name || 'Your Parent',
        recipient_email: studentEmail,
        subject: '💡 A little FASTIQ nudge from your family',
        body: option.getMessage(studentName || 'there'),
        is_read: false,
      });
      setSent(option.key);
      setTimeout(() => { setSent(null); setOpen(false); }, 2000);
    } catch (err) {
      console.error('Failed to send nudge:', err);
    } finally {
      setSending(null);
    }
  };

  return (
    <div>
      <Button
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl text-white font-bold h-12"
        style={{ background: '#FA4616', minHeight: 'auto' }}
      >
        <Send className="w-4 h-4 mr-2" />
        Send {studentName || 'them'} a Reminder
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3 space-y-2"
          >
            {NUDGE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSending = sending === opt.key;
              const isSent = sent === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSend(opt)}
                  disabled={!!sending}
                  className="w-full rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', minHeight: 'auto' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    {isSent ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : isSending ? (
                      <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <span className="text-[13px] text-white font-medium">
                    {isSent ? 'Sent! ✓' : opt.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}