import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Pencil, X, MessageCircle, UserPlus, Calendar, Lightbulb, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';

const CLASSIFICATION_CONFIG = {
  positive: {
    emoji: '🎉',
    label: 'Positive — Meeting Offered',
    color: 'bg-green-100 text-green-700 border-green-200',
    cardBg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    icon: Calendar,
  },
  warm: {
    emoji: '👍',
    label: 'Warm — Open But Vague',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cardBg: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    icon: Lightbulb,
  },
  referral: {
    emoji: '🔗',
    label: 'Referral — Warm Introduction',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    cardBg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    icon: UserPlus,
  },
  advice: {
    emoji: '💡',
    label: 'Advice Given',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    cardBg: 'from-purple-50 to-fuchsia-50',
    border: 'border-purple-200',
    icon: MessageCircle,
  },
  declined: {
    emoji: '🚪',
    label: 'Declined — Door Left Open',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    cardBg: 'from-slate-50 to-gray-50',
    border: 'border-slate-200',
    icon: DoorOpen,
  },
};

function DraftBlock({ label, message, subject }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message || '');
  const [editedSubject, setEditedSubject] = useState(subject || '');

  const currentMessage = isEditing ? editedMessage : (message || '');
  const currentSubject = isEditing ? editedSubject : (subject || '');

  const handleCopy = () => {
    const fullText = currentSubject ? `Subject: ${currentSubject}\n\n${currentMessage}` : currentMessage;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-3">
      {label && <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</p>}
      {isEditing ? (
        <div className="space-y-2 mb-2">
          {subject && (
            <input
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Subject..."
            />
          )}
          <textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            rows={6}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y leading-relaxed"
          />
        </div>
      ) : (
        <>
          {currentSubject && <p className="text-xs text-slate-500 mb-1 font-medium">Subject: {currentSubject}</p>}
          <div className="bg-white rounded-lg p-3 border border-slate-200 mb-2">
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{currentMessage}</p>
          </div>
        </>
      )}
      <div className="flex items-center gap-2">
        <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5 flex-1" style={{ minHeight: 'auto' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        {isEditing ? (
          <>
            <Button onClick={() => setIsEditing(false)} size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white" style={{ minHeight: 'auto' }}>
              <Check className="w-3.5 h-3.5" /> Save
            </Button>
            <Button onClick={() => { setEditedMessage(message || ''); setEditedSubject(subject || ''); setIsEditing(false); }} variant="ghost" size="sm" className="gap-1 text-slate-500" style={{ minHeight: 'auto' }}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-1.5" style={{ minHeight: 'auto' }}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ReplyResponseCard({ data, onSendMessage }) {
  if (!data) return null;

  const classification = data.reply_classification || 'warm';
  const config = CLASSIFICATION_CONFIG[classification] || CLASSIFICATION_CONFIG.warm;
  const Icon = config.icon;

  return (
    <Card className={`p-4 border-2 ${config.border} bg-gradient-to-br ${config.cardBg} mt-2 mb-1`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
          <Icon className="w-4 h-4 text-slate-700" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">Reply Analysis</p>
          <Badge className={`text-[10px] ${config.color} border`}>{config.emoji} {config.label}</Badge>
        </div>
      </div>

      {/* Primary response draft */}
      <DraftBlock
        label={data.referral_draft ? '✉️ Response to Original Contact' : '✉️ Your Response'}
        message={data.reply_draft}
        subject={data.reply_subject}
      />

      {/* Referral: second draft to the referred person */}
      {data.referral_draft && (
        <DraftBlock
          label={`✉️ Message to ${data.referred_person_name || 'Referred Person'}`}
          message={data.referral_draft}
          subject={data.referral_subject}
        />
      )}

      {/* Suggested next actions */}
      {data.suggested_actions?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Suggested Next Steps</p>
          {data.suggested_actions.map((action, i) => {
            const text = String(action).replace(/^→\s*/, '').trim();
            return (
              <button
                key={i}
                onClick={() => onSendMessage?.(text)}
                className="w-full flex items-start gap-2 bg-white/80 rounded-lg px-3 py-2 border border-slate-200 text-left cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                <span className="text-[#0021A5] mt-0.5 flex-shrink-0 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                <span className="text-xs text-slate-700 font-medium group-hover:text-[#0021A5]">{text}</span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}