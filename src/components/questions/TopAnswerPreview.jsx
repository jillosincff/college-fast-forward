import React from 'react';
import { navigate } from '@/components/utils/navigation';
import UserAvatar from '@/components/common/UserAvatar';
import { Linkedin, ChevronUp } from 'lucide-react';

export default function TopAnswerPreview({ answer, questionId, onMessage }) {
  if (!answer) return null;
  
  const authorName = answer.answerer_name || 'Anonymous';
  const firstName = authorName.split(' ')[0];
  const title = answer.answerer_title || answer.answerer_company || '';
  const company = answer.answerer_company || '';
  const persona = answer.answerer_persona || 'parent';
  const yearsExp = answer.answerer_years_experience;
  
  // Truncate answer text
  const MAX_CHARS = 200;
  const text = answer.answer_text || '';
  const displayText = text.length > MAX_CHARS 
    ? text.slice(0, MAX_CHARS).trim() + '...'
    : text;
  
  const handleMessageClick = (e) => {
    e.stopPropagation();
    if (onMessage && answer.answerer_email) {
      onMessage({
        email: answer.answerer_email,
        full_name: authorName,
        job_title: title,
        current_company: company,
        persona: persona
      });
    }
  };
  
  const handleReadMore = (e) => {
    e.stopPropagation();
    navigate('QuestionDetail', { id: questionId });
  };
  
  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
      {/* Top Answer Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
          🏆 TOP ANSWER
        </span>
        {(answer.upvote_count || 0) > 0 && (
          <span className="text-xs text-slate-500 flex items-center gap-0.5">
            <ChevronUp className="w-3 h-3" />
            {answer.upvote_count}
          </span>
        )}
      </div>
      
      {/* Author Info */}
      <div className="flex items-start gap-3">
        <UserAvatar 
          user={{ 
            full_name: authorName,
            email: answer.answerer_email 
          }} 
          className="w-10 h-10 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          {/* Name and title */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm">
              {authorName}
            </span>
            {answer.answerer_linkedin_url && (
              <a
                href={answer.answerer_linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-500 hover:text-blue-700"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          
          {(title || company) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {title}{company && title ? ` at ${company}` : company}
            </p>
          )}
          
          <p className="text-xs text-slate-400 mt-0.5">
            {persona === 'parent' ? 'Gator Parent' : persona === 'alumni' ? 'UF Alumni' : 'Community Member'}
            {yearsExp && ` · ${yearsExp}`}
          </p>
          
          {/* Answer preview */}
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            "{displayText}"
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleReadMore}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Read more →
            </button>
            {answer.answerer_email && (
              <button
                onClick={handleMessageClick}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Message {firstName} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}