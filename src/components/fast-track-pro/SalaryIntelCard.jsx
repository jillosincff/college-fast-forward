import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import SuggestedActions from './SuggestedActions';

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) return val.split(/\n/).map(s => s.trim()).filter(Boolean);
  return [];
}

export default function SalaryIntelCard({ data, onSendMessage }) {
  const [copied, setCopied] = useState(false);
  if (!data || typeof data !== 'object') return null;

  const tips = toArray(data.negotiation_tips);
  const script = data.sample_script || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success('Script copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💰</span>
        <span className="text-xs font-semibold text-green-700 uppercase">Salary Intel</span>
      </div>

      {(data.role || data.location) && (
        <div className="flex items-center gap-2 mb-3">
          {data.role && <span className="text-sm font-bold text-slate-900">{String(data.role)}</span>}
          {data.location && <Badge variant="outline" className="text-xs">{String(data.location)}</Badge>}
        </div>
      )}

      {data.salary_range && (
        <div className="bg-white rounded-xl p-4 border border-green-200 mb-3 text-center">
          <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Space Mono', monospace" }}>
            {String(data.salary_range)}
          </p>
          {data.median_salary && (
            <p className="text-xs text-green-600 font-semibold mt-1">Median: {String(data.median_salary)}</p>
          )}
        </div>
      )}

      {tips.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Negotiation Tips</p>
          <ol className="space-y-1">
            {tips.map((t, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="font-bold text-green-600 flex-shrink-0">{i + 1}.</span>
                {String(t)}
              </li>
            ))}
          </ol>
        </div>
      )}

      {script && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Sample Script</p>
          <div className="bg-slate-900 text-green-300 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed relative">
            {script}
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      )}

      <SuggestedActions actions={data.suggested_next_steps || data.next_steps} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-green-200" />
    </Card>
  );
}