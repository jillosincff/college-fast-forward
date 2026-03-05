import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import PipelineStatusModal from '@/components/fastiq/PipelineStatusModal';
import CSSConfetti from '@/components/fastiq/CSSConfetti';
import PipelineCelebrationCard from '@/components/fastiq/PipelineCelebrationCard';

const STATUS_CONFIG = {
  identified:   { emoji: '🔍', label: 'Identified',   color: '#64748B', bg: '#F1F5F9', next: 'reached_out' },
  reached_out:  { emoji: '📧', label: 'Reached Out',  color: '#3B82F6', bg: '#EFF6FF', next: 'replied' },
  replied:      { emoji: '✅', label: 'Replied',       color: '#22C55E', bg: '#F0FDF4', next: 'interview' },
  interview:    { emoji: '📅', label: 'Interview',     color: '#F59E0B', bg: '#FFFBEB', next: 'offer' },
  offer:        { emoji: '🎉', label: 'Offer',         color: '#EAB308', bg: '#FEF9C3', next: null },
};

const ACTION_CONFIG = {
  identified:   { label: 'Draft Message →', prompt: (name, company) => `Draft a LinkedIn message to ${name} at ${company}` },
  reached_out:  { label: 'Follow Up →', prompt: (name, company) => `Draft a follow-up message to ${name} at ${company} — I reached out but haven't heard back` },
  replied:      { label: 'Reply Help →', prompt: (name, company) => `Help me craft a response to ${name} at ${company} — they replied to my outreach` },
  interview:    { label: 'Prep Me →', prompt: (name, company) => `Help me prepare for my interview at ${company}` },
  offer:        { label: 'Negotiate →', prompt: (name, company) => `Help me evaluate and negotiate an offer from ${company}` },
};

function HiringBadge({ score }) {
  if (!score && score !== 0) return null;
  const isHot = score >= 80;
  const isWarm = score >= 50 && score < 80;
  if (isHot) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700">🔥 Hot</span>;
  if (isWarm) return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700">🟡 Warm</span>;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">❄️ Cool</span>;
}

function StatusBadge({ status, onClick }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.identified;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:brightness-95 active:scale-95"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`, minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
      title={cfg.next ? `Advance to ${STATUS_CONFIG[cfg.next]?.label}` : 'Final stage'}
    >
      {cfg.emoji} {cfg.label}
    </button>
  );
}

export default function PipelineCompanyRow({ company, contacts, hiringScore, onOpenChat, onContactsChange }) {
  const [expanded, setExpanded] = useState(false);
  const [celebrationModal, setCelebrationModal] = useState(null); // { newStatus, contact }
  const [confettiVariant, setConfettiVariant] = useState(null); // 'normal' | 'big' | null
  const [celebrationCard, setCelebrationCard] = useState(null); // { type, contact }
  const [glowContactId, setGlowContactId] = useState(null); // for green glow pulse on repeat replies

  const alumniFound = contacts.length;
  const contacted = contacts.filter(c => ['reached_out', 'replied', 'interview', 'offer'].includes(c.status)).length;
  const replies = contacts.filter(c => ['replied', 'interview', 'offer'].includes(c.status)).length;

  const lastActivity = contacts.reduce((latest, c) => {
    const d = new Date(c.status_date || c.created_date);
    return d > latest ? d : latest;
  }, new Date(0));

  const lastActivityText = lastActivity.getTime() > 0
    ? `Last action: ${formatDistanceToNow(lastActivity, { addSuffix: true })}`
    : '';

  const advanceStatus = async (contact) => {
    const cfg = STATUS_CONFIG[contact.status];
    if (!cfg?.next) return;
    const now = new Date().toISOString();
    const dateField = `${cfg.next}_date`;
    await base44.entities.NetworkingPipeline.update(contact.id, {
      status: cfg.next,
      status_date: now,
      [dateField]: now,
    });
    const newStatus = cfg.next;
    const updatedContact = { ...contact, status: newStatus, company };

    // Show celebration modal for replied, interview, offer
    if (['replied', 'interview', 'offer'].includes(newStatus)) {
      setCelebrationModal({ newStatus, contact: updatedContact });
      fireCelebration(newStatus, updatedContact);
    }
    if (onContactsChange) onContactsChange();
  };

  // Determine celebration type and fire confetti + card
  const fireCelebration = async (newStatus, updatedContact) => {
    // Load milestone flags from profile
    let profile = null;
    try {
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: updatedContact.user_email || '' });
      profile = profiles?.[0];
    } catch(e) {}

    const milestones = {};
    try {
      if (profile?.roadmap_completed_items) {
        const parsed = JSON.parse(profile.roadmap_completed_items);
        if (parsed._milestones) Object.assign(milestones, parsed._milestones);
      }
    } catch(e) {}

    let cardType = '';
    let useConfetti = false;
    let confettiSize = 'normal';

    if (newStatus === 'replied') {
      if (!milestones.first_reply_celebrated) {
        cardType = 'first_reply';
        useConfetti = true;
        milestones.first_reply_celebrated = true;
      } else {
        cardType = 'reply';
        // Green glow pulse instead of confetti
        setGlowContactId(updatedContact.id);
        setTimeout(() => setGlowContactId(null), 3000);
      }
    } else if (newStatus === 'interview') {
      if (!milestones.first_interview_celebrated) {
        cardType = 'first_interview';
        useConfetti = true;
        milestones.first_interview_celebrated = true;
      } else {
        cardType = 'interview';
        useConfetti = true;
      }
    } else if (newStatus === 'offer') {
      cardType = 'offer';
      useConfetti = true;
      confettiSize = 'big';
    }

    if (useConfetti) setConfettiVariant(confettiSize);
    if (cardType) setCelebrationCard({ type: cardType, contact: updatedContact });

    // Save milestone flags back to profile
    if (profile?.id) {
      try {
        let completed = {};
        try { completed = JSON.parse(profile.roadmap_completed_items || '{}'); } catch(e) {}
        completed._milestones = milestones;
        await base44.entities.FastTrackProProfile.update(profile.id, {
          roadmap_completed_items: JSON.stringify(completed),
        });
      } catch(e) {}
    }

    // Log milestone to ProActivityLog
    const actionMap = { first_reply: 'Received first reply', reply: 'Received reply', first_interview: 'Secured first interview', interview: 'Secured interview', offer: 'Received offer' };
    try {
      await base44.entities.ProActivityLog.create({
        user_email: updatedContact.user_email || '',
        action_type: 'alumni_view',
        target_name: `${actionMap[cardType] || newStatus} from ${updatedContact.alumni_name} at ${updatedContact.company}`,
        timestamp: new Date().toISOString(),
      });
    } catch(e) {}
  };

  const handleAction = (contact) => {
    const cfg = ACTION_CONFIG[contact.status];
    if (cfg) {
      onOpenChat(cfg.prompt(contact.alumni_name, company));
    }
  };

  return (
    <div className="rounded-xl overflow-hidden transition-all bg-white border border-slate-200">
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 4px rgba(34,197,94,0.2); }
          50% { box-shadow: 0 0 16px rgba(34,197,94,0.5); }
        }
      `}</style>
      {/* Confetti */}
      {confettiVariant && (
        <CSSConfetti variant={confettiVariant} onDone={() => setConfettiVariant(null)} />
      )}
      {/* Celebration card */}
      {celebrationCard && (
        <PipelineCelebrationCard
          type={celebrationCard.type}
          contact={celebrationCard.contact}
          onAction={(prompt) => { setCelebrationCard(null); onOpenChat(prompt); }}
          onDismiss={() => setCelebrationCard(null)}
        />
      )}
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
        style={{ minHeight: 'auto' }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900 text-sm">{company}</span>
              <HiringBadge score={hiringScore} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-slate-500">
                {alumniFound} alumni found{contacted > 0 ? ` • ${contacted} contacted` : ''}{replies > 0 ? ` • ${replies} ${replies === 1 ? 'reply' : 'replies'}` : ''}
              </span>
              {lastActivityText && <span className="text-[10px] text-slate-400">• {lastActivityText}</span>}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded: contacts table */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-0" style={{ borderTop: '1px solid #E2E8F0' }}>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 py-2.5 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                <div className="col-span-4">Alumni</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3 text-right">Action</div>
              </div>

              {contacts.map((contact, idx) => {
                const statusCfg = STATUS_CONFIG[contact.status] || STATUS_CONFIG.identified;
                const actionCfg = ACTION_CONFIG[contact.status];
                const dateStr = contact.status_date
                  ? new Date(contact.status_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—';
                const isEven = idx % 2 === 0;

                const isGlowing = glowContactId === contact.id;

                return (
                  <div
                    key={contact.id}
                    className={`grid grid-cols-12 gap-2 items-center py-2.5 rounded-md px-1 transition-colors ${isEven ? 'bg-slate-50' : 'bg-white'} hover:bg-slate-100`}
                    style={isGlowing ? {
                      animation: 'glow-pulse 1s ease-in-out 3',
                      boxShadow: '0 0 12px rgba(34,197,94,0.4)',
                      background: 'rgba(34,197,94,0.08)',
                    } : {}}
                  >
                    <div className="col-span-4 min-w-0">
                      <p className="text-[12px] text-slate-900 font-medium truncate">{contact.alumni_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{contact.alumni_role || '—'}</p>
                    </div>
                    <div className="col-span-3">
                      <StatusBadge status={contact.status} onClick={() => advanceStatus(contact)} />
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500">{dateStr}</span>
                      {contact.status === 'reached_out' && contact.reached_out_date && (() => {
                        const days = Math.round((Date.now() - new Date(contact.reached_out_date).getTime()) / (1000*60*60*24));
                        return days >= 4 ? (
                          <div className="text-[9px] text-orange-600 font-semibold mt-0.5">⏰ {days}d ago</div>
                        ) : null;
                      })()}
                    </div>
                    <div className="col-span-3 text-right">
                      {actionCfg && (
                        <button
                          onClick={() => handleAction(contact)}
                          className="text-[10px] font-semibold transition-colors hover:brightness-90"
                          style={{ color: statusCfg.color, minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                        >
                          {actionCfg.label}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {contacts.length === 0 && (
                <p className="text-[11px] text-slate-400 py-3 text-center">No contacts tracked yet at this company.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Celebration modal */}
      {celebrationModal && (
        <PipelineStatusModal
          newStatus={celebrationModal.newStatus}
          contact={celebrationModal.contact}
          onClose={() => setCelebrationModal(null)}
          onSendMessage={(msg) => {
            setCelebrationModal(null);
            onOpenChat(msg);
          }}
        />
      )}
    </div>
  );
}