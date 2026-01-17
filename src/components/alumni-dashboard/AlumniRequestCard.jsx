import React from 'react';
import { navigate } from '@/components/utils/navigation';

const REQUEST_TYPE_LABELS = {
  'new_job_search': 'Job Search',
  'career_transition': 'Career Transition',
  'industry_shift': 'Industry Shift',
  'business_advice': 'Business Advice',
  'introduction_request': 'Introduction',
  'general': 'General'
};

function getTimeAgo(dateString) {
  const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AlumniRequestCard({ request }) {
  const initials = request.poster_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';
  const hasNoAnswers = (request.answer_count || 0) === 0;

  return (
    <div 
      className="group bg-gray-50 hover:bg-blue-50 rounded-2xl p-5 cursor-pointer transition-all border-2 border-transparent hover:border-blue-200 hover:shadow-md"
      onClick={() => navigate('QuestionDetail', { id: request.id })}
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
              {request.poster_name || 'An Alumni'}
            </span>
            {request.poster_title && request.poster_company && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {request.poster_title} at {request.poster_company}
                </span>
              </>
            )}
          </div>
          <p className="text-gray-800 font-medium leading-snug line-clamp-2">
            {request.title || request.role}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {request.alumni_help_type && (
              <span 
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(0, 33, 165, 0.1)',
                  color: '#0021A5'
                }}
              >
                {REQUEST_TYPE_LABELS[request.alumni_help_type] || request.alumni_help_type}
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
                🔥 No responses yet
              </span>
            )}
            {!hasNoAnswers && (
              <span className="text-xs text-gray-500">
                💬 {request.answer_count} response{request.answer_count !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <button 
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg"
          style={{ 
            backgroundColor: '#0021A5',
            boxShadow: '0 8px 16px rgba(0, 33, 165, 0.25)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate('QuestionDetail', { id: request.id });
          }}
        >
          Help Out →
        </button>
      </div>
    </div>
  );
}