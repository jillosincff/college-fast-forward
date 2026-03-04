import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) return val.split(/\n/).map(s => s.trim()).filter(Boolean);
  return [];
}

function ScoreRing({ score, size = 70 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(score, 100)) / 100;
  const color = score >= 80 ? '#0077B5' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace", fill: color }}>
        {score}
      </text>
    </svg>
  );
}

export default function LinkedInReviewCard({ data }) {
  if (!data || typeof data !== 'object') return null;

  const score = typeof data.overall_score === 'number' ? data.overall_score : 0;
  const improvements = toArray(data.improvements);

  return (
    <Card className="p-4 border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔗</span>
        <span className="text-xs font-semibold uppercase" style={{ color: '#0077B5' }}>LinkedIn Review</span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <ScoreRing score={score} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">Profile Score</p>
          <p className="text-xs text-slate-500">
            {score >= 80 ? 'Your profile is strong!' : score >= 60 ? 'Good start, room to improve' : 'Needs attention'}
          </p>
        </div>
      </div>

      {data.headline_suggestion && (
        <div className="bg-white rounded-lg p-3 border border-sky-200 mb-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Headline Suggestion</p>
          <p className="text-sm text-slate-800 font-medium">{String(data.headline_suggestion)}</p>
        </div>
      )}

      {data.summary_suggestion && (
        <div className="bg-white rounded-lg p-3 border border-sky-200 mb-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Summary Suggestion</p>
          <p className="text-xs text-slate-700">{String(data.summary_suggestion)}</p>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1.5">Improvements</p>
          <div className="space-y-2">
            {improvements.map((imp, i) => {
              const section = typeof imp === 'object' ? imp.section : '';
              const issue = typeof imp === 'object' ? imp.issue : '';
              const suggestion = typeof imp === 'object' ? imp.suggestion : String(imp);
              return (
                <div key={i} className="bg-white rounded-lg p-2 border border-sky-100">
                  {section && <Badge variant="outline" className="text-[10px] mb-1">{String(section)}</Badge>}
                  {issue && <p className="text-xs text-red-600 mb-0.5">{String(issue)}</p>}
                  <p className="text-xs text-slate-700">{String(suggestion)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}