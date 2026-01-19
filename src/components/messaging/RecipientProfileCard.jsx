import React from 'react';
import { Linkedin } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career advice',
  'internship_leads': 'Internship leads',
  'resume_review': 'Resume review',
  'interview_prep': 'Interview prep',
  'industry_insights': 'Industry insights',
  'networking_intros': 'Networking',
  'informational_interview': 'Informational interviews',
  'finding_jobs': 'Job search',
  'resume_help': 'Resume help',
  'salary_negotiation': 'Salary negotiation',
  'figuring_out': 'Career direction',
  'grad_school': 'Grad school advice'
};

function formatHelpTypes(helpTypes = []) {
  return helpTypes
    .slice(0, 3)
    .map(h => HELP_TYPE_LABELS[h] || h.replace(/_/g, ' '))
    .join(', ');
}

export default function RecipientProfileCard({ recipient }) {
  const hasJobInfo = recipient.job_title || recipient.current_company;
  const helpTypes = recipient.help_types || [];
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-4">
          <UserAvatar 
            user={recipient} 
            className="w-14 h-14 md:w-16 md:h-16 text-lg"
          />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">
              {recipient.full_name || 'UF Professional'}
            </h2>
            {/* Title + Company */}
            {hasJobInfo && (
              <p className="text-slate-600 text-sm md:text-base">
                {recipient.job_title}
                {recipient.job_title && recipient.current_company && ' at '}
                {recipient.current_company}
              </p>
            )}
            {/* Role + Experience */}
            <p className="text-sm text-slate-500">
              {recipient.persona === 'alumni' ? 'Gator Alumni' : 'Gator Parent'}
              {recipient.years_experience && ` · ${recipient.years_experience} years`}
            </p>
          </div>
        </div>
        
        {/* Right: LinkedIn */}
        {recipient.linkedin_url && (
          <a
            href={recipient.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            <Linkedin className="w-4 h-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        )}
      </div>
      
      {/* Match context */}
      {(helpTypes.length > 0 || recipient.is_fast_responder) && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
          {/* Help types */}
          {helpTypes.length > 0 && (
            <p className="text-sm text-slate-600 flex items-center gap-1.5">
              <span>✨</span>
              <span>Can help with: {formatHelpTypes(helpTypes)}</span>
            </p>
          )}
          
          {/* Response time */}
          {recipient.is_fast_responder && (
            <p className="text-sm text-emerald-600 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Fast responder — typically within 24 hours</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}