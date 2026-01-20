import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import moment from 'moment';
import { useAuth } from '@/components/auth/AuthContext';
import { Answer } from '@/entities/Answer';
import { MoreVertical, Pencil, Trash2, MapPin, Calendar, Eye, Bookmark, MessageSquare } from 'lucide-react';
import VoteButtons from './VoteButtons';
import ActivityBadge from './ActivityBadge';
import TopAnswerPreview from './TopAnswerPreview';
import UserAvatar from '@/components/common/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career Advice',
  'internship_leads': 'Internships',
  'resume_review': 'Resume',
  'interview_prep': 'Interviews',
  'industry_insights': 'Industry',
  'networking_intros': 'Networking',
  'informational_interview': 'Info Interviews',
  'job_search': 'Job Search',
  'resume': 'Resume',
  'interviews': 'Interviews',
  'salary': 'Salary',
  'networking': 'Networking',
  'direction': 'Career',
  'grad_school': 'Grad School'
};

function formatStudentName(fullName, firstName, lastName, email) {
  if (firstName && lastName && !firstName.includes(',')) {
    return `${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()} ${lastName.charAt(0).toUpperCase()}.`;
  }
  
  if (fullName && fullName.includes(' ') && !fullName.includes('@')) {
    const parts = fullName.trim().split(/\s+/);
    if (parts[0].endsWith(',')) {
      const last = parts[0].replace(',', '');
      const first = parts[1] || '';
      if (first) return `${first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()} ${last.charAt(0).toUpperCase()}.`;
    }
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase()} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
  }
  
  if (fullName && !fullName.includes('@')) {
    return fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
  }
  
  return 'A UF Student';
}

function getClassYear(gradYear) {
  if (!gradYear) return null;
  const year = typeof gradYear === 'string' ? parseInt(gradYear) : gradYear;
  if (isNaN(year) || year < 1900 || year > 2100) return null;
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const academicYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
  const yearsUntilGrad = year - academicYear;
  
  if (yearsUntilGrad <= 0) return 'Senior';
  if (yearsUntilGrad === 1) return 'Junior';
  if (yearsUntilGrad === 2) return 'Sophomore';
  if (yearsUntilGrad === 3) return 'Freshman';
  return `Class of ${year}`;
}

export default function EnhancedQuestionCard({ question, gator, onVote, onMessage, onDelete, onEdit }) {
  const { user } = useAuth();
  const [topAnswer, setTopAnswer] = useState(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  
  // Load top answer for this question
  useEffect(() => {
    const loadTopAnswer = async () => {
      if ((question.answer_count || 0) === 0) return;
      
      setLoadingAnswer(true);
      try {
        const answers = await Answer.filter({ question_id: question.id }, '-upvote_count', 1);
        if (answers.length > 0) {
          setTopAnswer(answers[0]);
        }
      } catch (err) {
        console.log('Could not load top answer:', err);
      }
      setLoadingAnswer(false);
    };
    
    loadTopAnswer();
  }, [question.id, question.answer_count]);
  
  const isOwner = user && (
    (question.created_by && question.created_by !== 'anonymous' && question.created_by === user.email) ||
    question.poster_email === user.email ||
    question.student_email === user.email
  );
  
  const posterType = question.poster_type || 'student';
  const isAnonymous = question.is_anonymous && posterType === 'parent';
  
  const posterName = isAnonymous 
    ? 'Anonymous Parent'
    : formatStudentName(
        gator?.full_name || question.poster_name || question.student_name,
        gator?.first_name || question.poster_first_name,
        gator?.last_name || question.poster_last_name,
        gator?.email || question.created_by
      );
  
  const gradYear = question.student_year || gator?.graduation_year || '';
  const classYear = getClassYear(gradYear);
  const major = question.student_major || gator?.major || question.target_industry || '';
  
  const createdMoment = moment(question.created_date);
  const timeAgo = createdMoment.isAfter(moment()) ? 'just now' : createdMoment.fromNow();
  
  const MAX_CHARS = 200;
  const description = question.description || '';
  const shouldTruncate = description.length > MAX_CHARS;
  const displayText = shouldTruncate 
    ? description.slice(0, MAX_CHARS).trim() + '...'
    : description;
  
  const handleClick = () => {
    navigate('QuestionDetail', { id: question.id });
  };
  
  return (
    <div 
      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex-shrink-0">
          <VoteButtons
            item={question}
            itemType="question"
            onVote={onVote}
            orientation="vertical"
          />
        </div>
        
        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Activity Badge */}
            <ActivityBadge question={question} />
            
            {/* Poster Type */}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              posterType === 'student' ? 'bg-blue-100 text-blue-700' :
              posterType === 'parent' ? 'bg-purple-100 text-purple-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {posterType === 'student' ? '🎓 Student' : posterType === 'parent' ? '👨‍👩‍👧 Parent' : '🎯 Alumni'}
            </span>
            
            {/* Help Types */}
            {question.help_types?.slice(0, 2).map((type, idx) => (
              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {HELP_TYPE_LABELS[type] || type}
              </span>
            ))}
          </div>
          
          {/* Question Title */}
          <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors mb-2 leading-snug">
            "{displayText}"
          </h3>
          
          {/* Author Info */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span className="font-medium text-slate-700">{posterName}</span>
            {classYear && <><span>·</span><span>{classYear}</span></>}
            {major && <><span>·</span><span>{major}</span></>}
            <span>·</span>
            <span>{timeAgo}</span>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {question.answer_count || 0} {(question.answer_count || 0) === 1 ? 'answer' : 'answers'}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {question.view_count || 0} views
            </span>
            {question.has_best_answer && (
              <span className="text-green-600 font-medium">✅ Best Answer</span>
            )}
          </div>
          
          {/* Top Answer Preview */}
          {topAnswer && (
            <TopAnswerPreview 
              answer={topAnswer} 
              questionId={question.id}
              onMessage={onMessage}
            />
          )}
          
          {/* No Answers Yet */}
          {(question.answer_count || 0) === 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <span>💡</span>
                No answers yet — be the first to help!
              </p>
            </div>
          )}
        </div>
        
        {/* Owner Actions */}
        {isOwner && (
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(question)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(question)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}