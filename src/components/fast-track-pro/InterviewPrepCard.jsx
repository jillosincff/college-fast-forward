import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SuggestedActions from './SuggestedActions';

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) return val.split(/\n/).map(s => s.trim()).filter(Boolean);
  return [];
}

function QuestionItem({ q }) {
  const [open, setOpen] = useState(false);
  const question = typeof q === 'string' ? q : q?.question || '';
  const lookFor = typeof q === 'object' ? q?.what_they_look_for : '';
  const approach = typeof q === 'object' ? q?.approach : '';

  return (
    <div className="bg-white rounded-lg border border-red-100 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left"
        style={{ minHeight: 'auto' }}>
        <span className="text-sm font-semibold text-slate-900 flex-1">{String(question)}</span>
        {(lookFor || approach) && (
          open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && (lookFor || approach) && (
        <div className="px-3 pb-3 space-y-2 border-t border-red-50">
          {lookFor && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">What they look for</p>
              <p className="text-xs text-slate-600">{String(lookFor)}</p>
            </div>
          )}
          {approach && (
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Your approach</p>
              <p className="text-xs text-slate-700 font-medium">{String(approach)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPrepCard({ data, onSendMessage }) {
  if (!data || typeof data !== 'object') return null;

  const questions = toArray(data.likely_questions);
  const tips = toArray(data.tips);

  return (
    <Card className="p-4 border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💼</span>
        <span className="text-xs font-semibold text-red-700 uppercase">Interview Prep</span>
      </div>

      {(data.company_name || data.role) && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-slate-900">{data.company_name}</span>
          {data.role && <Badge variant="outline" className="text-xs">{String(data.role)}</Badge>}
        </div>
      )}

      {data.interview_format && (
        <Badge className="bg-red-100 text-red-700 text-xs border-0 mb-3">{String(data.interview_format)}</Badge>
      )}

      {questions.length > 0 && (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase">Likely Questions</p>
          {questions.map((q, i) => <QuestionItem key={i} q={q} />)}
        </div>
      )}

      {data.culture_notes && (
        <div className="bg-white rounded-lg p-3 border border-red-100 mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Culture Notes</p>
          <p className="text-xs text-slate-700">{String(data.culture_notes)}</p>
        </div>
      )}

      {tips.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Tips</p>
          <ul className="space-y-1">
            {tips.map((t, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                {String(t)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <SuggestedActions actions={data.suggested_next_steps || data.next_steps} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-red-200" />
    </Card>
  );
}