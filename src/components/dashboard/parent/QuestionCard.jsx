import React from 'react';
import { navigate } from '@/components/utils/navigation';

export default function QuestionCard({ question, showMatchIndicator = true }) {
  const initials = (question.poster_name || question.poster_first_name || 'S')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const hasNoAnswers = (question.answer_count || 0) === 0;
  const matchReason = question.matchReasons?.[0];

  return (
    <div 
      className="group bg-gray-50 hover:bg-blue-50 rounded-2xl p-5 cursor-pointer transition-all border-2 border-transparent hover:border-blue-200 hover:shadow-md"
      onClick={() => navigate(`QuestionDetail?id=${question.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg" 
          style={{ background: 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)' }}
        >
          {initials}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900">
              {question.poster_first_name || question.poster_name?.split(' ')[0] || 'Student'}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{question.student_major || 'Undeclared'}</span>
            {question.created_date && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-400">
                  {getTimeAgo(question.created_date)}
                </span>
              </>
            )}
          </div>
          
          <p className="text-gray-800 font-medium leading-snug line-clamp-2">
            {question.title || question.role || question.description?.slice(0, 120)}
          </p>
          
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
              {question.target_industry || 'General'}
            </span>
            
            {hasNoAnswers && (
              <span 
                className="text-xs font-semibold px-3 py-1 rounded-full" 
                style={{ backgroundColor: 'rgba(250, 70, 22, 0.15)', color: '#FA4616' }}
              >
                🔥 No answers yet
              </span>
            )}
            
            {showMatchIndicator && matchReason && (
              <span 
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(0, 33, 165, 0.1)', color: '#0021A5' }}
              >
                🎯 {matchReason}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <button 
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg"
          style={{ backgroundColor: '#0021A5', boxShadow: '0 8px 16px rgba(0, 33, 165, 0.25)' }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`QuestionDetail?id=${question.id}`);
          }}
        >
          Help Out →
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}