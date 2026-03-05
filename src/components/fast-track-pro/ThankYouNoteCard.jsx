import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Pencil, X, Mail, Heart } from 'lucide-react';
import SuggestedActions from './SuggestedActions';
import { toast } from 'sonner';

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
          <input
            value={editedSubject}
            onChange={(e) => setEditedSubject(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Subject..."
          />
          <textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            rows={6}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-y leading-relaxed"
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
            <Button onClick={() => setIsEditing(false)} size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" style={{ minHeight: 'auto' }}>
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

export default function ThankYouNoteCard({ data, onSendMessage }) {
  if (!data) return null;

  const drafts = data.drafts || [];
  const hasSingle = drafts.length <= 1;

  return (
    <Card className="p-4 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 mt-2 mb-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">Post-Interview Thank You</p>
          <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200">
            ✉️ {hasSingle ? '1 Note' : `${drafts.length} Notes`} Ready
          </Badge>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-emerald-100/50 rounded-lg p-2.5 mb-3 border border-emerald-200/50">
        <p className="text-xs text-emerald-800">
          💡 <strong>Pro tip:</strong> Send within 24 hours. Each note should reference something unique from your conversation — it shows you were listening.
        </p>
      </div>

      {/* Drafts */}
      {drafts.length > 0 ? (
        drafts.map((draft, i) => (
          <DraftBlock
            key={i}
            label={drafts.length > 1 ? `✉️ To: ${draft.recipient || `Interviewer ${i + 1}`}${draft.recipient_title ? ` (${draft.recipient_title})` : ''}` : `✉️ Thank-You Email`}
            message={draft.message}
            subject={draft.subject}
          />
        ))
      ) : (
        <DraftBlock
          label="✉️ Thank-You Email"
          message={data.message || data.message_body || ''}
          subject={data.subject || ''}
        />
      )}

      {/* Multiple interviewers prompt */}
      {data.ask_about_others && (
        <div className="mt-3 pt-3 border-t border-emerald-200">
          <button
            onClick={() => onSendMessage?.("I also met with other people during my interview — help me draft individual thank-yous for each")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-emerald-500 text-emerald-500 bg-transparent hover:bg-emerald-500 hover:text-white transition-all duration-200 cursor-pointer"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            ✉️ I met with more people — draft individual thank-yous
          </button>
        </div>
      )}

      {/* Suggested actions */}
      {data.suggested_actions?.length > 0 && (
        <SuggestedActions actions={data.suggested_actions} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-emerald-200" accentColor="#059669" />
      )}
    </Card>
  );
}