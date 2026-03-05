import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Pencil, X, Users, Heart } from 'lucide-react';
import SuggestedActions from './SuggestedActions';
import { toast } from 'sonner';

function ContactDraft({ contact, index }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(contact.message || '');

  const currentMessage = isEditing ? editedMessage : (contact.message || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    toast.success(`Copied message to ${contact.name}!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg p-3 border border-pink-200/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center text-[10px] font-bold text-pink-700 flex-shrink-0">
          {contact.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{contact.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{contact.company}{contact.status ? ` · ${contact.status}` : ''}</p>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedMessage}
          onChange={(e) => setEditedMessage(e.target.value)}
          rows={4}
          className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 resize-y leading-relaxed mb-2"
        />
      ) : (
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-2">{currentMessage}</p>
      )}

      <div className="flex items-center gap-2">
        <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5 flex-1 text-xs" style={{ minHeight: 'auto' }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        {isEditing ? (
          <Button onClick={() => setIsEditing(false)} size="sm" className="gap-1 bg-pink-600 hover:bg-pink-700 text-white text-xs" style={{ minHeight: 'auto' }}>
            <Check className="w-3 h-3" /> Save
          </Button>
        ) : (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-1 text-xs" style={{ minHeight: 'auto' }}>
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NetworkThankYouCard({ data, onSendMessage }) {
  if (!data) return null;

  const contacts = data.contacts || [];
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyAll = () => {
    const allText = contacts.map(c =>
      `To: ${c.name} at ${c.company}\n\n${c.message}\n\n---`
    ).join('\n\n');
    navigator.clipboard.writeText(allText);
    setAllCopied(true);
    toast.success(`All ${contacts.length} messages copied!`);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <Card className="p-4 border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 mt-2 mb-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 text-pink-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">Thank Your Network</p>
          <Badge className="text-[10px] bg-pink-100 text-pink-700 border border-pink-200">
            🤝 {contacts.length} Message{contacts.length !== 1 ? 's' : ''} Ready
          </Badge>
        </div>
      </div>

      {/* Context */}
      <div className="bg-pink-100/50 rounded-lg p-2.5 mb-3 border border-pink-200/50">
        <p className="text-xs text-pink-800">
          ❤️ <strong>This matters:</strong> Thanking the people who helped you strengthens the Gator network and creates goodwill. These alumni will remember you for future opportunities.
        </p>
      </div>

      {/* Copy All button */}
      {contacts.length > 1 && (
        <Button
          onClick={handleCopyAll}
          className="w-full mb-3 gap-2 bg-pink-600 hover:bg-pink-700 text-white"
          size="sm"
          style={{ minHeight: 'auto' }}
        >
          {allCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {allCopied ? 'All Copied!' : `Copy All ${contacts.length} Messages`}
        </Button>
      )}

      {/* Individual drafts */}
      <div className="space-y-3">
        {contacts.map((contact, i) => (
          <ContactDraft key={i} contact={contact} index={i} />
        ))}
      </div>

      {/* Suggested actions */}
      {data.suggested_actions?.length > 0 && (
        <SuggestedActions actions={data.suggested_actions} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-pink-200" accentColor="#DB2777" label="What's Next" />
      )}
    </Card>
  );
}