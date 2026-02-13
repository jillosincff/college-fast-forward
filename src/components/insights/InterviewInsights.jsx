import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, ThumbsUp, Building2, ChevronDown, ChevronUp } from 'lucide-react';

const TYPE_LABELS = {
  behavioral: 'Behavioral',
  case: 'Case',
  technical: 'Technical',
  product: 'Product',
  system_design: 'System Design',
  other: 'Other',
};

const LEVEL_LABELS = {
  intern: 'Intern',
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior',
};

export default function InterviewInsights({ interviewQuestions = [] }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const visible = interviewQuestions.filter(q => q.is_visible !== false);

  // By company
  const byCompany = {};
  visible.forEach(q => {
    const key = (q.company || 'Unknown').toLowerCase().trim();
    if (!byCompany[key]) byCompany[key] = { name: q.company || 'Unknown', questions: [] };
    byCompany[key].questions.push(q);
  });

  const topCompanies = Object.values(byCompany)
    .sort((a, b) => b.questions.length - a.questions.length)
    .slice(0, 8);

  // By type
  const byType = {};
  visible.forEach(q => {
    const t = q.question_type || 'other';
    byType[t] = (byType[t] || 0) + 1;
  });

  const filteredQuestions = filter === 'all'
    ? visible
    : visible.filter(q => q.question_type === filter);

  if (visible.length === 0) {
    return (
      <Card className="border-2 border-purple-100 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Mic className="w-5 h-5 text-purple-600" />
            🎤 Interview Insights
          </h2>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
            <p className="text-slate-600 mb-2">No interview questions submitted yet.</p>
            <p className="text-sm text-slate-500">Share your interview experience to help fellow Gators prepare!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-100 shadow-lg rounded-2xl">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
          <Mic className="w-5 h-5 text-purple-600" />
          🎤 Interview Insights
        </h2>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-700">{visible.length}</p>
            <p className="text-xs text-purple-600">Questions</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-700">{topCompanies.length}</p>
            <p className="text-xs text-purple-600">Companies</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-700">{Object.keys(byType).length}</p>
            <p className="text-xs text-purple-600">Question Types</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-700">
              {visible.reduce((s, q) => s + (q.confirmation_count || 0), 0)}
            </p>
            <p className="text-xs text-purple-600">Confirmations</p>
          </div>
        </div>

        {/* Top companies */}
        {topCompanies.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Top Companies</h3>
            <div className="flex flex-wrap gap-2">
              {topCompanies.map((c, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {c.name} ({c.questions.length})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Type filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            All ({visible.length})
          </Button>
          {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <Button
              key={type}
              size="sm"
              variant={filter === type ? 'default' : 'outline'}
              onClick={() => setFilter(type)}
              className={filter === type ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {TYPE_LABELS[type] || type} ({count})
            </Button>
          ))}
        </div>

        {/* Questions list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredQuestions.slice(0, 15).map((q) => (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-purple-200 transition-colors"
            >
              <button
                className="w-full text-left p-4 flex items-start justify-between gap-3"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {q.company}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                      {TYPE_LABELS[q.question_type] || q.question_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      {LEVEL_LABELS[q.experience_level] || q.experience_level}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">{q.question_text}</p>
                </div>
                {expanded === q.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                )}
              </button>
              {expanded === q.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Role:</strong> {q.role}
                  </p>
                  {q.answer_tips && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">💡 Tips</p>
                      <p className="text-sm text-green-800">{q.answer_tips}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    {q.interview_date && <span>📅 {q.interview_date}</span>}
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {q.upvote_count || 0} helpful
                    </span>
                    {q.confirmation_count > 0 && (
                      <span>✅ {q.confirmation_count} confirmed</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}