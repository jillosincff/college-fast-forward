import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

// Map student help_types to parent ways_to_help
const HELP_TYPE_MAPPING = {
  direction: 'career_guidance',
  salary: 'career_guidance',
  job_search: 'jobs_referrals',
  resume: 'resume_interviews',
  interviews: 'resume_interviews',
  industry_insights: 'industry_insights',
  networking: 'introductions',
  grad_school: 'grad_school'
};

const HELP_TYPE_LABELS = {
  career_guidance: 'Career Guidance',
  jobs_referrals: 'Job Referrals',
  resume_interviews: 'Resume Help',
  industry_insights: 'Industry Insights',
  introductions: 'Networking',
  grad_school: 'Grad School'
};

const INDUSTRY_LABELS = {
  tech: 'Tech',
  finance: 'Finance',
  consulting: 'Consulting',
  healthcare: 'Healthcare',
  marketing: 'Marketing',
  engineering: 'Engineering',
  law: 'Law',
  education: 'Education',
  real_estate: 'Real Estate',
  nonprofit: 'Nonprofit',
  government: 'Government',
  media: 'Media',
  startups: 'Startups'
};

export function getMatchTags(question, parentIndustries, parentWaysToHelp) {
  const tags = [];
  
  // Industry matches
  const studentIndustries = question.target_industries?.length > 0 
    ? question.target_industries 
    : (question.target_industry ? [question.target_industry] : []);
    
  studentIndustries.forEach(ind => {
    if (parentIndustries?.includes(ind)) {
      const label = INDUSTRY_LABELS[ind] || ind;
      if (!tags.includes(label)) tags.push(label);
    }
  });
  
  // Help type matches
  question.help_types?.forEach(ht => {
    const mapped = HELP_TYPE_MAPPING[ht];
    if (mapped && parentWaysToHelp?.includes(mapped)) {
      const label = HELP_TYPE_LABELS[mapped];
      if (label && !tags.includes(label)) tags.push(label);
    }
  });
  
  return tags.slice(0, 3); // Max 3 tags
}

export function getMatchReason(question, parentIndustries, parentWaysToHelp) {
  const tags = getMatchTags(question, parentIndustries, parentWaysToHelp);
  if (tags.length > 0) {
    return tags[0].toLowerCase() + ' background';
  }
  return 'experience';
}

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

export default function MatchContext({ question, parentIndustries, parentWaysToHelp, showMatchTags = true }) {
  const matchTags = getMatchTags(question, parentIndustries, parentWaysToHelp);
  const timeAgo = formatTimeAgo(question.created_date);
  const answerCount = question.answer_count || 0;
  
  return (
    <div className="mt-4 space-y-2 text-sm">
      {/* Why matched - only show if there are tags and showMatchTags is true */}
      {showMatchTags && matchTags.length > 0 && (
        <p className="text-slate-600 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>
            Why you matched: <span className="font-medium text-slate-800">{matchTags.join(' + ')}</span>
          </span>
        </p>
      )}
      
      {/* Urgency context */}
      <p className="text-slate-500 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>
          Asked {timeAgo}
          {answerCount === 0 && ' · Be the first to help'}
          {answerCount > 0 && ` · ${answerCount} answer${answerCount > 1 ? 's' : ''} so far`}
        </span>
      </p>
    </div>
  );
}