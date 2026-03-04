import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CoverLetterCard({ data }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data?.letter_text || '');

  if (!data || typeof data !== 'object') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Cover letter copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📝</span>
        <span className="text-xs font-semibold text-indigo-700 uppercase">Cover Letter</span>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {data.company && <Badge variant="outline" className="text-xs">To: {String(data.company)}</Badge>}
        {data.role && <Badge variant="outline" className="text-xs">Role: {String(data.role)}</Badge>}
      </div>

      {editing ? (
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={12}
          className="w-full text-sm border border-indigo-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y leading-relaxed mb-3"
        />
      ) : (
        <div className="bg-white rounded-lg p-4 border border-indigo-200 mb-3">
          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{text}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button onClick={handleCopy} variant="outline" size="sm"
          className="flex-1 gap-2 border-indigo-300 hover:bg-indigo-100 text-indigo-700"
          style={{ minHeight: 'auto' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        {editing ? (
          <Button onClick={() => setEditing(false)} size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            style={{ minHeight: 'auto' }}>
            <Check className="w-3.5 h-3.5" /> Done
          </Button>
        ) : (
          <Button onClick={() => setEditing(true)} variant="outline" size="sm"
            className="gap-1.5 border-slate-300 hover:bg-slate-100 text-slate-600"
            style={{ minHeight: 'auto' }}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        )}
      </div>
    </Card>
  );
}