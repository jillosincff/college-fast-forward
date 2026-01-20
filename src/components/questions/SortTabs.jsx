import React from 'react';
import { Flame, Clock, Trophy, MessageCircle, HelpCircle } from 'lucide-react';

const SORTS = [
  { id: 'trending', label: 'Trending', icon: Flame, description: 'Hot right now' },
  { id: 'recent', label: 'Recent', icon: Clock, description: 'Newest first' },
  { id: 'top', label: 'Top', icon: Trophy, description: 'Most upvoted' },
  { id: 'discussed', label: 'Most Discussed', icon: MessageCircle, description: 'Most answers' },
  { id: 'unanswered', label: 'Unanswered', icon: HelpCircle, description: 'Needs help' },
];

export default function SortTabs({ activeSort, onSortChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto scrollbar-hide">
      {SORTS.map(sort => {
        const Icon = sort.icon;
        const isActive = activeSort === sort.id;
        return (
          <button
            key={sort.id}
            onClick={() => onSortChange(sort.id)}
            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
            title={sort.description}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : ''}`} />
            <span className="hidden sm:inline">{sort.label}</span>
            <span className="sm:hidden">{sort.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

// Sorting algorithms
export function getTrendingScore(question) {
  const now = Date.now();
  const ageHours = (now - new Date(question.created_date).getTime()) / (1000 * 60 * 60);
  
  // Engagement signals
  const upvotes = question.total_upvotes || 0;
  const answers = question.answer_count || 0;
  const views = question.view_count || 0;
  
  // Recent activity boost (answers in last 24h would be ideal but we approximate)
  const recentBoost = ageHours < 24 ? 10 : ageHours < 48 ? 5 : 0;
  
  // Weighted engagement score
  const engagement = (upvotes * 3) + (answers * 5) + recentBoost + (views * 0.1);
  
  // Time decay (Reddit-style gravity)
  const gravity = 1.8;
  const decay = Math.pow(ageHours + 2, gravity);
  
  return engagement / decay;
}

export function sortQuestions(questions, sortBy) {
  const sorted = [...questions];
  
  switch (sortBy) {
    case 'trending':
      return sorted.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
    case 'recent':
      return sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    case 'top':
      return sorted.sort((a, b) => (b.total_upvotes || 0) - (a.total_upvotes || 0));
    case 'discussed':
      return sorted.sort((a, b) => (b.answer_count || 0) - (a.answer_count || 0));
    case 'unanswered':
      return sorted
        .filter(q => (q.answer_count || 0) === 0)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    default:
      return sorted;
  }
}