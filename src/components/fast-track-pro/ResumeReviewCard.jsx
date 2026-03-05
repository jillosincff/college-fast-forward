import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Tag } from 'lucide-react';
import SuggestedActions from './SuggestedActions';

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) return val.split(/\n|,/).map(s => s.trim()).filter(Boolean);
  return [];
}

function ScoreRing({ score, size = 80 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(score, 100)) / 100;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace", fill: color }}>
        {score}
      </text>
    </svg>
  );
}

export default function ResumeReviewCard({ data, onSendMessage }) {
  if (!data || typeof data !== 'object') return null;
  const score = typeof data.overall_score === 'number' ? data.overall_score : 0;
  const strengths = toArray(data.strengths);
  const improvements = toArray(data.improvements);
  const missingKeywords = toArray(data.missing_keywords);

  return (
    <Card className="p-4 border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📄</span>
        <span className="text-xs font-semibold text-yellow-700 uppercase">Resume Review</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <ScoreRing score={score} />
        <div>
          <p className="text-sm font-bold text-slate-900">
            {score >= 80 ? 'Strong resume!' : score >= 60 ? 'Good foundation' : 'Needs work'}
          </p>
          {data.summary && <p className="text-xs text-slate-600 mt-1">{String(data.summary)}</p>}
        </div>
      </div>

      {strengths.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-green-700 uppercase mb-1.5">✅ Strengths</p>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                {String(s)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-orange-700 uppercase mb-1.5">⚠️ Improvements</p>
          <ul className="space-y-1">
            {improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                {String(s)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-700 uppercase mb-1.5">🏷️ Missing Keywords</p>
          <div className="flex flex-wrap gap-1">
            {missingKeywords.map((k, i) => (
              <Badge key={i} className="bg-red-100 text-red-700 text-[10px] border-0">{String(k)}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Fixed action buttons */}
      {onSendMessage && (
        <div className="mt-3 pt-3 border-t border-yellow-200 flex flex-wrap gap-1.5">
          {improvements.length > 0 && (
            <button
              onClick={() => onSendMessage('Fix the issues you found in my resume and give me an improved version')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-[#F59E0B] text-[#F59E0B] bg-transparent hover:bg-[#F59E0B] hover:text-white transition-all duration-200 cursor-pointer"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              🔧 Fix These Issues →
            </button>
          )}
          <button
            onClick={() => onSendMessage('Tailor my resume for a specific role — I\'ll paste the job description')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-violet-500 text-violet-500 bg-transparent hover:bg-violet-500 hover:text-white transition-all duration-200 cursor-pointer"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            ✨ Tailor for a specific role
          </button>
        </div>
      )}

      <SuggestedActions actions={data.suggested_next_steps || data.next_steps} onSendMessage={onSendMessage} className="mt-2" accentColor="#D97706" />
    </Card>
  );
}