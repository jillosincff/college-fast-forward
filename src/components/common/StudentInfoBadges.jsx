import React from 'react';
import { MapPin, Calendar, Briefcase, MessageSquare, Users, GraduationCap, FileText, BookOpen } from 'lucide-react';

// Map help types to icons and labels
const HELP_TYPE_CONFIG = {
  'job_search': { icon: Briefcase, label: 'Jobs', color: 'blue' },
  'internship_leads': { icon: Briefcase, label: 'Internship', color: 'blue' },
  'resume': { icon: FileText, label: 'Resume', color: 'purple' },
  'resume_review': { icon: FileText, label: 'Resume', color: 'purple' },
  'interviews': { icon: MessageSquare, label: 'Interview', color: 'green' },
  'interview_prep': { icon: MessageSquare, label: 'Interview', color: 'green' },
  'networking': { icon: Users, label: 'Networking', color: 'orange' },
  'networking_intros': { icon: Users, label: 'Networking', color: 'orange' },
  'industry_insights': { icon: BookOpen, label: 'Insights', color: 'slate' },
  'career_advice': { icon: MessageSquare, label: 'Advice', color: 'green' },
  'informational_interview': { icon: Users, label: 'Info Interview', color: 'blue' },
  'direction': { icon: GraduationCap, label: 'Exploring', color: 'amber' },
  'salary': { icon: Briefcase, label: 'Salary', color: 'green' },
  'grad_school': { icon: GraduationCap, label: 'Grad School', color: 'purple' },
};

// Map seeking types to badges
const SEEKING_CONFIG = {
  'fulltime': { label: 'Full-time', icon: '💼' },
  'internship': { label: 'Internship', icon: '📋' },
  'coop': { label: 'Co-op', icon: '🔄' },
  'parttime': { label: 'Part-time', icon: '⏰' },
  'gradschool': { label: 'Grad School', icon: '🎓' },
  'exploring': { label: 'Exploring', icon: '🧭' },
};

// Convert grad year to class year
function getClassYear(gradYear) {
  if (!gradYear) return null;
  const year = typeof gradYear === 'string' ? parseInt(gradYear) : gradYear;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  // Academic year starts in August
  const academicYear = currentMonth >= 7 ? currentYear + 1 : currentYear;
  const yearsUntilGrad = year - academicYear;
  
  if (yearsUntilGrad <= 0) return 'Senior';
  if (yearsUntilGrad === 1) return 'Junior';
  if (yearsUntilGrad === 2) return 'Sophomore';
  if (yearsUntilGrad === 3) return 'Freshman';
  return `Class of ${year}`;
}

/**
 * StudentInfoLine - Displays student details in one line
 * Format: "Sophomore · Computer Science · Pre-Med"
 */
export function StudentInfoLine({ 
  gradYear, 
  major, 
  minor, 
  preTrack,
  className = ''
}) {
  const parts = [];
  
  const classYear = getClassYear(gradYear);
  if (classYear) parts.push(classYear);
  if (major) parts.push(major);
  if (minor) parts.push(`Minor: ${minor}`);
  if (preTrack) parts.push(preTrack);
  
  if (parts.length === 0) return null;
  
  return (
    <p className={`text-sm text-slate-600 font-medium ${className}`}>
      {parts.join(' · ')}
    </p>
  );
}

/**
 * StudentContextBadges - Displays location, timeline, help type badges
 */
export function StudentContextBadges({
  location,
  timeline,
  helpTypes = [],
  seekingTypes = [],
  compact = false,
  className = ''
}) {
  const badgeClass = compact 
    ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium'
    : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold';

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {/* Location */}
      {location && (
        <span className={`${badgeClass} bg-blue-50 text-blue-700 border border-blue-200`}>
          <MapPin className="w-3 h-3" />
          {location}
        </span>
      )}
      
      {/* Timeline */}
      {timeline && (
        <span className={`${badgeClass} bg-amber-50 text-amber-700 border border-amber-200`}>
          <Calendar className="w-3 h-3" />
          {timeline}
        </span>
      )}
      
      {/* Seeking type badges */}
      {seekingTypes.slice(0, 2).map((type, idx) => {
        const config = SEEKING_CONFIG[type];
        if (!config) return null;
        return (
          <span key={idx} className={`${badgeClass} bg-indigo-50 text-indigo-700 border border-indigo-200`}>
            {config.icon} {config.label}
          </span>
        );
      })}
      
      {/* Help type badges */}
      {helpTypes.slice(0, compact ? 2 : 3).map((type, idx) => {
        const config = HELP_TYPE_CONFIG[type];
        if (!config) return null;
        const Icon = config.icon;
        const colors = {
          blue: 'bg-blue-50 text-blue-700 border-blue-200',
          purple: 'bg-purple-50 text-purple-700 border-purple-200',
          green: 'bg-green-50 text-green-700 border-green-200',
          orange: 'bg-orange-50 text-orange-700 border-orange-200',
          slate: 'bg-slate-100 text-slate-700 border-slate-200',
          amber: 'bg-amber-50 text-amber-700 border-amber-200',
        };
        return (
          <span key={idx} className={`${badgeClass} ${colors[config.color]} border`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        );
      })}
      
      {helpTypes.length > (compact ? 2 : 3) && (
        <span className={`${badgeClass} bg-slate-100 text-slate-600 border border-slate-200`}>
          +{helpTypes.length - (compact ? 2 : 3)}
        </span>
      )}
    </div>
  );
}

/**
 * StudentQuickInfo - Compact popup/tooltip content for student info
 */
export function StudentQuickInfo({
  name,
  gradYear,
  major,
  minor,
  preTrack,
  location,
  industries = [],
  seekingTypes = [],
  helpTypes = [],
  bio
}) {
  const classYear = getClassYear(gradYear);
  
  return (
    <div className="p-4 max-w-xs">
      {/* Name and year */}
      <div className="mb-3">
        <h4 className="font-bold text-slate-900 text-base">{name}</h4>
        <p className="text-sm text-slate-600">
          {[classYear, major].filter(Boolean).join(' · ')}
        </p>
        {minor && (
          <p className="text-xs text-slate-500">Minor: {minor}</p>
        )}
        {preTrack && (
          <p className="text-xs text-blue-600 font-medium">{preTrack}</p>
        )}
      </div>
      
      {/* Industries */}
      {industries.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-slate-500 mb-1">Interested in:</p>
          <p className="text-sm text-slate-700">{industries.slice(0, 3).join(', ')}</p>
        </div>
      )}
      
      {/* Location */}
      {location && (
        <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {location}
        </div>
      )}
      
      {/* Bio snippet */}
      {bio && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
          "{bio}"
        </p>
      )}
    </div>
  );
}

export default {
  StudentInfoLine,
  StudentContextBadges,
  StudentQuickInfo,
  getClassYear
};