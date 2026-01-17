import React from 'react';
import { navigate } from '@/components/utils/navigation';

function getTimeAgo(dateString) {
  const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function AlumniQuestionCard({ question }) {
  const hasNoAnswers = (question.answer_count || 0) === 0;

  return (
    <div 
      className="group bg-gray-50 hover:bg-orange-50 rounded-2xl p-5 cursor-pointer transition-all border-2 border-transparent hover:border-orange-200 hover:shadow-md"
      onClick={() => navigate('QuestionDetail', { id: question.id })}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)' }}
        >
          {question.poster_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900">
              {question.poster_name || 'A Student'}
            </span>
            {question.student_major && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">{question.student_major}</span>
              </>
            )}
            {question.student_year && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-400">{question.student_year}</span>
              </>
            )}
          </div>
          <p className="text-gray-800 font-medium leading-snug line-clamp-2">
            {question.title || question.role}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {question.target_industry && (
              <span 
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(0, 33, 165, 0.1)',
                  color: '#0021A5'
                }}
              >
                {question.target_industry}
              </span>
            )}
            {hasNoAnswers && (
              <span 
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(250, 70, 22, 0.15)',
                  color: '#FA4616'
                }}
              >
                🔥 No answers yet
              </span>
            )}
            {question.matchReason && (
              <span 
                className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700"
              >
                ✓ {question.matchReason}
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              {getTimeAgo(question.created_date)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button 
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg"
          style={{ 
            backgroundColor: '#FA4616',
            boxShadow: '0 8px 16px rgba(250, 70, 22, 0.25)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate('QuestionDetail', { id: question.id });
          }}
        >
          Help Out →
        </button>
      </div>
    </div>
  );
}