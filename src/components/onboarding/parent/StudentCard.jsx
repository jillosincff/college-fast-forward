import React from 'react';
import { MapPin } from 'lucide-react';

// Aligned with MatchContext labels for consistency
const HELP_TYPE_LABELS = {
  job_search: 'Job Referrals',
  resume: 'Resume Help',
  interviews: 'Resume Help',
  networking: 'Networking',
  direction: 'Career Guidance',
  industry_insights: 'Industry Insights',
  grad_school: 'Grad School',
  salary: 'Career Guidance'
};

export default function StudentCard({ question, studentName, isVisible = true }) {
  const initial = studentName?.charAt(0)?.toUpperCase() || '?';
  const majorDisplay = question.student_major || 'UF Student';
  const yearDisplay = question.student_year ? `'${String(question.student_year).slice(-2)}` : '';
  const location = question.location_city || question.location_state;
  
  return (
    <div className={`
      bg-white rounded-2xl shadow-lg overflow-hidden
      transition-all duration-500 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    `}>
      {/* Header with avatar */}
      <div className="bg-gradient-to-r from-[#0021A5] to-[#001580] p-6">
        <div className="flex items-center gap-4">
          {/* Large avatar */}
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
            {initial}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white">{studentName}</h3>
            <p className="text-blue-200">
              {majorDisplay} {yearDisplay}
            </p>
            {location && (
              <p className="text-blue-300 text-sm flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {location}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Question body */}
      <div className="p-6">
        {/* Question text styled as a quote */}
        <blockquote className="text-slate-700 text-lg leading-relaxed mb-5 italic">
          "{question.description || question.title}"
        </blockquote>
        
        {/* Help type tags */}
        {question.help_types && question.help_types.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.help_types.slice(0, 4).map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {HELP_TYPE_LABELS[tag] || tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}