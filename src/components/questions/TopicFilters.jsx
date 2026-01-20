import React, { useState } from 'react';

const TOPICS = [
  { id: 'all', label: 'All Topics', icon: '📋' },
  { id: 'internships', label: 'Internships', icon: '💼' },
  { id: 'resume', label: 'Resume & LinkedIn', icon: '📄' },
  { id: 'interviews', label: 'Interviews', icon: '🎤' },
  { id: 'job_search', label: 'Job Search', icon: '🔍' },
  { id: 'salary', label: 'Salary & Negotiation', icon: '💰' },
  { id: 'networking', label: 'Networking', icon: '🤝' },
  { id: 'career_change', label: 'Career Direction', icon: '🧭' },
  { id: 'grad_school', label: 'Grad School', icon: '🎓' },
  { id: 'tech', label: 'Tech & Engineering', icon: '💻' },
  { id: 'finance', label: 'Finance & Consulting', icon: '📊' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'marketing', label: 'Marketing & Sales', icon: '📢' },
];

// Map help_types to topic IDs for filtering
export const HELP_TYPE_TO_TOPIC = {
  'career_advice': 'career_change',
  'internship_leads': 'internships',
  'resume_review': 'resume',
  'interview_prep': 'interviews',
  'industry_insights': 'job_search',
  'networking_intros': 'networking',
  'informational_interview': 'networking',
  'job_search': 'job_search',
  'resume': 'resume',
  'interviews': 'interviews',
  'salary': 'salary',
  'networking': 'networking',
  'direction': 'career_change',
  'grad_school': 'grad_school',
};

// Map industries to topic IDs
export const INDUSTRY_TO_TOPIC = {
  'Technology & Software': 'tech',
  'Finance & Banking': 'finance',
  'Consulting': 'finance',
  'Healthcare': 'healthcare',
  'Marketing': 'marketing',
  'Engineering': 'tech',
};

export function getQuestionTopics(question) {
  const topics = new Set();
  
  // From help_types
  (question.help_types || []).forEach(ht => {
    const topic = HELP_TYPE_TO_TOPIC[ht];
    if (topic) topics.add(topic);
  });
  
  // From industry
  const industry = question.target_industry || question.industry;
  if (industry && INDUSTRY_TO_TOPIC[industry]) {
    topics.add(INDUSTRY_TO_TOPIC[industry]);
  }
  
  return Array.from(topics);
}

export default function TopicFilters({ activeTopic, onTopicChange }) {
  const [showAll, setShowAll] = useState(false);
  const visibleTopics = showAll ? TOPICS : TOPICS.slice(0, 7);
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {visibleTopics.map(topic => {
        const isActive = activeTopic === topic.id || (topic.id === 'all' && !activeTopic);
        return (
          <button
            key={topic.id}
            onClick={() => onTopicChange(topic.id === 'all' ? null : topic.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-sm'
                : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
            }`}
          >
            <span>{topic.icon}</span>
            <span className="hidden sm:inline">{topic.label}</span>
            <span className="sm:hidden">{topic.label.split(' ')[0]}</span>
          </button>
        );
      })}
      
      {!showAll && TOPICS.length > 7 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2"
        >
          +{TOPICS.length - 7} more
        </button>
      )}
      
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="text-sm text-slate-500 hover:text-slate-700 font-medium px-2"
        >
          Show less
        </button>
      )}
    </div>
  );
}

export { TOPICS };