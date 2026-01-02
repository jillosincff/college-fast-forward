import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import moment from 'moment';
import { useAuth } from '@/components/auth/AuthContext';
import { HelpRequest } from '@/entities/HelpRequest';
import { deleteJobRequest } from '@/functions/deleteJobRequest';
import { MoreVertical, Pencil, Trash2, MapPin, Calendar, Briefcase, MessageSquare, Users, FileText, BookOpen, GraduationCap } from 'lucide-react';
import EditQuestionModal from './EditQuestionModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { toast } from 'sonner';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career Advice',
  'internship_leads': 'Internship Leads',
  'resume_review': 'Resume Review',
  'interview_prep': 'Interview Prep',
  'industry_insights': 'Industry Insights',
  'networking_intros': 'Networking',
  'informational_interview': 'Info Interviews',
  'job_search': 'Job Search',
  'resume': 'Resume Help',
  'interviews': 'Interview Prep',
  'salary': 'Salary Tips',
  'networking': 'Networking',
  'direction': 'Career Exploration',
  'grad_school': 'Grad School'
};

// Map seeking type to badge config
const SEEKING_TYPE_CONFIG = {
  'fulltime': { label: 'Full-time', icon: '💼', color: 'bg-blue-100 text-blue-800' },
  'internship': { label: 'Internship', icon: '📋', color: 'bg-indigo-100 text-indigo-800' },
  'coop': { label: 'Co-op', icon: '🔄', color: 'bg-purple-100 text-purple-800' },
  'parttime': { label: 'Part-time', icon: '⏰', color: 'bg-slate-100 text-slate-700' },
  'gradschool': { label: 'Grad School', icon: '🎓', color: 'bg-amber-100 text-amber-800' },
  'exploring': { label: 'Exploring', icon: '🧭', color: 'bg-green-100 text-green-800' },
};

// Convert grad year to class year
function getClassYear(gradYear) {
  if (!gradYear) return null;
  const year = typeof gradYear === 'string' ? parseInt(gradYear) : gradYear;
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

// Helper function to format student name as "First L." for privacy
function formatStudentName(fullName, firstName, lastName, email) {
  // Clean up malformed first names (e.g., "Sawmiller," -> use full name instead)
  const cleanFirstName = firstName && !firstName.includes(',') ? firstName : null;
  const cleanLastName = lastName && !lastName.includes(',') ? lastName : null;
  
  // Priority 1: Use first_name and last_name if available and clean
  if (cleanFirstName && cleanLastName) {
    const capitalizedFirst = cleanFirstName.charAt(0).toUpperCase() + cleanFirstName.slice(1).toLowerCase();
    const lastInitial = cleanLastName.charAt(0).toUpperCase() + '.';
    return `${capitalizedFirst} ${lastInitial}`;
  }
  
  // Priority 2: If we have a proper full name with space (and not an email)
  if (fullName && fullName.includes(' ') && !fullName.includes('@')) {
    const parts = fullName.trim().split(/\s+/);
    // Handle "Last, First" format (e.g., "Sawmiller, Alyssa J.")
    if (parts[0].endsWith(',')) {
      const lastName = parts[0].replace(',', '');
      const firstName = parts[1] || '';
      if (firstName) {
        const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase().replace(/[^a-z]/gi, '');
        const lastInitial = lastName.charAt(0).toUpperCase() + '.';
        return `${capitalizedFirst} ${lastInitial}`;
      }
    }
    // Handle "First Last" format
    const first = parts[0];
    const last = parts[parts.length - 1];
    const capitalizedFirst = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    const lastInitial = last.charAt(0).toUpperCase() + '.';
    return `${capitalizedFirst} ${lastInitial}`;
  }
  
  // Priority 3: If we have just a full name without space but it's a real name
  if (fullName && !fullName.includes('@') && fullName.length > 1) {
    // Single word name - just return it capitalized
    return fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
  }
  
  // Priority 4: Try to parse from email (only if email is valid, not 'anonymous')
  if (email && email !== 'anonymous' && email.includes('@')) {
    const emailName = email.split('@')[0];
    
    // If email has dot separator like "lindsey.smith@email.com"
    if (emailName.includes('.')) {
      const parts = emailName.split('.');
      const first = parts[0].replace(/[0-9]/g, '');
      const last = parts[parts.length - 1].replace(/[0-9]/g, '');
      if (first && last && first.length > 1) {
        const capitalizedFirst = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
        const lastInitial = last.charAt(0).toUpperCase() + '.';
        return `${capitalizedFirst} ${lastInitial}`;
      }
    }
    
    // Try to detect common first names in concatenated usernames
    const cleanName = emailName.replace(/[0-9]/g, '').toLowerCase();
    const commonFirstNames = ['lindsey', 'gordon', 'sarah', 'john', 'michael', 'david', 'james', 'robert', 'jennifer', 'jessica', 'ashley', 'emily', 'daniel', 'matthew', 'andrew', 'joshua', 'christopher', 'anthony', 'mark', 'steven', 'brian', 'kevin', 'jason', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'stephen', 'jonathan', 'larry', 'scott', 'frank', 'raymond', 'gregory', 'samuel', 'patrick', 'alexander', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'henry', 'douglas', 'peter', 'adam', 'nathan', 'zachary', 'walter', 'kyle', 'harold', 'carl', 'arthur', 'gerald', 'roger', 'keith', 'jeremy', 'lawrence', 'terry', 'sean', 'austin', 'christian', 'albert', 'joe', 'willie', 'billy', 'bruce', 'ralph', 'roy', 'eugene', 'randy', 'russell', 'bobby', 'harry', 'vincent', 'louis', 'philip', 'mary', 'patricia', 'elizabeth', 'barbara', 'susan', 'margaret', 'dorothy', 'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle', 'laura', 'kimberly', 'deborah', 'stephanie', 'cynthia', 'amy', 'angela', 'melissa', 'brenda', 'anna', 'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debra', 'amanda', 'catherine', 'christine', 'marie', 'janet', 'frances', 'ann', 'joyce', 'diane', 'alice', 'julie', 'heather', 'teresa', 'gloria', 'evelyn', 'jean', 'cheryl', 'mildred', 'katherine', 'joan', 'judith', 'rose', 'janice', 'kelly', 'nicole', 'judy', 'christina', 'rachel', 'victoria', 'lauren', 'samantha', 'emma', 'olivia', 'ava', 'sophia', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'yash', 'priya', 'raj', 'neha', 'amit', 'ankit', 'pooja', 'ravi', 'arun', 'deepak', 'vikram', 'sanjay', 'suresh', 'krishna', 'lakshmi', 'gita', 'maya', 'leela', 'uma', 'devi'];
    
    for (const firstName of commonFirstNames) {
      if (cleanName.startsWith(firstName) && cleanName.length > firstName.length) {
        const rest = cleanName.slice(firstName.length);
        const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        const lastInitial = rest.charAt(0).toUpperCase() + '.';
        return `${capitalizedFirst} ${lastInitial}`;
      }
    }
  }
  
  // Fallback: "A UF Student" (better than "A Gator" for clarity)
  return 'A UF Student';
}

export default function QuestionCard({ question, gator, onDeleted, onUpdated }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  
  // Check if current user owns this question
  // Note: Some questions have created_by: 'anonymous' but store real email in poster_email
  const isOwner = user && (
    (question.created_by && question.created_by !== 'anonymous' && question.created_by === user.email) ||
    question.poster_email === user.email ||
    question.student_email === user.email
  );
  
  const handleClick = () => {
    navigate('QuestionDetail', { id: question.id });
  };
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      // Try HelpRequest first if it's a help request, otherwise use backend function for JobRequest
      if (question.entity_name === 'HelpRequest' || question.student_id || question._source === 'HelpRequest') {
        await HelpRequest.delete(question.id);
      } else {
        // Use backend function to bypass RLS issues with anonymous created_by
        const result = await deleteJobRequest({ id: question.id });
        if (result.data?.error) {
          throw new Error(result.data.error);
        }
      }
      toast.success('Question deleted successfully');
      if (onDeleted) onDeleted(question.id);
    } catch (error) {
      console.error('Failed to delete question:', error);
      if (error.message?.includes('Permission denied')) {
        toast.error('You can only delete your own questions');
      } else {
        toast.error('Failed to delete question');
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Get poster info
  const posterType = question.poster_type || 'student';
  const isAnonymous = question.is_anonymous && posterType === 'parent';
  
  // Get name - use formatStudentName with all available data
  const posterName = isAnonymous 
    ? 'Anonymous Parent'
    : formatStudentName(
        gator?.full_name || question.poster_name || question.student_name,
        gator?.first_name || question.poster_first_name,
        gator?.last_name || question.poster_last_name,
        gator?.email || question.created_by
      );
  
  // Get student info - enhanced with onboarding data
  // Pull from question's stored student data first (most reliable), then fallback to gator profile
  const gradYear = question.student_year || gator?.graduation_year || '';
  const classYear = getClassYear(gradYear);
  const major = question.student_major || gator?.major || question.target_industry || '';
  const minor = question.student_minor || gator?.minor || '';
  const preTrack = question.student_pre_track || gator?.pre_professional_track || '';
  const bio = gator?.bio || '';
  
  // Location and timeline
  const locationPref = question.location_preference || gator?.location || '';
  const timeline = question.start_timing || question.timeline || '';
  const timelineLabel = timeline === 'immediate' ? 'ASAP' 
    : timeline === 'this_semester' ? 'This Semester'
    : timeline === 'next_semester' ? 'Next Semester'
    : timeline === 'summer' ? 'Summer 2026'
    : timeline;
  
  // Seeking and help types
  const seekingTypes = gator?.seeking_type || [];
  const helpTypes = question.help_types || gator?.help_needed || [];
  const industries = gator?.industries_interested || [];
  
  // Format time - ensure it always shows "ago" (handles timezone edge cases)
  const createdMoment = moment(question.created_date);
  const timeAgo = createdMoment.isAfter(moment()) 
    ? 'just now' 
    : createdMoment.fromNow();
  
  // Truncate description
  const MAX_CHARS = 180;
  const description = question.description || '';
  const shouldTruncate = description.length > MAX_CHARS;
  const displayText = shouldTruncate && !isExpanded 
    ? description.slice(0, MAX_CHARS).trim() + '...'
    : description;
  
  // Check if needs attention (no answers)
  const needsAttention = (question.answer_count || 0) === 0;

  return (
    <>
    <div className={`question-card ${needsAttention ? 'needs-attention' : ''}`} onClick={handleClick}>
      {/* Owner Actions Menu */}
      {isOwner && (
        <div className="owner-actions" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="menu-trigger">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {/* Tags Row - Above content */}
      <div className="tags-row">
        {/* Poster Type Badge */}
        {posterType !== 'student' && (
          <span className={`poster-badge ${posterType}`}>
            {posterType === 'parent' ? '👨‍👩‍👧 Parent' : '🎯 Alumni'}
          </span>
        )}
        {posterType === 'student' && (
          <span className="poster-badge student">🎓 UF Student</span>
        )}
        
        {/* Help type tags - smaller */}
        {question.help_types?.slice(0, 2).map((type, idx) => (
          <span key={idx} className="help-tag">{HELP_TYPE_LABELS[type] || type}</span>
        ))}
        {question.help_types?.length > 2 && (
          <span className="help-tag more">+{question.help_types.length - 2}</span>
        )}
        
        {/* Answered badge */}
        {(question.answer_count || 0) > 0 && (
          <span className="answered-badge">✓ Answered</span>
        )}
      </div>

      {/* Student Info Header - Enhanced */}
      <div className="student-header">
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="student-name-link">{posterName}</span>
          </HoverCardTrigger>
          <HoverCardContent className="w-72 p-0" side="top">
            <div className="p-4">
              <h4 className="font-bold text-slate-900 text-base mb-1">{posterName}</h4>
              <p className="text-sm text-slate-600 mb-2">
                {[classYear, major].filter(Boolean).join(' · ')}
              </p>
              {minor && <p className="text-xs text-slate-500 mb-1">Minor: {minor}</p>}
              {preTrack && <p className="text-xs text-blue-600 font-medium mb-2">{preTrack}</p>}
              {industries.length > 0 && (
                <p className="text-xs text-slate-500">Interested in: {industries.slice(0, 3).join(', ')}</p>
              )}
              {locationPref && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {locationPref}
                </p>
              )}
              {bio && <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">"{bio}"</p>}
            </div>
          </HoverCardContent>
        </HoverCard>
        <span className="posted-time-inline">{timeAgo}</span>
      </div>
      
      {/* Student Details Line - High Contrast */}
      {posterType === 'student' && (classYear || major || preTrack) && (
        <div className="student-details-line">
          {classYear && <span>{classYear}</span>}
          {major && <><span className="detail-sep">·</span><span>{major}</span></>}
          {minor && <><span className="detail-sep">·</span><span className="minor-text">Minor: {minor}</span></>}
          {preTrack && <><span className="detail-sep">·</span><span className="pre-track">{preTrack}</span></>}
        </div>
      )}

      {/* Question text - truncated */}
      <div className="question-text">
        "{displayText}"
        {shouldTruncate && !isExpanded && (
          <button 
            className="read-more-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          >
            Read more
          </button>
        )}
      </div>

      {/* Needs help indicator - more subtle */}
      {needsAttention && (
        <div className="needs-help-indicator">
          <span className="pulse-dot"></span>
          Needs first answer
        </div>
      )}

      {/* Context Badges Row - Location, Timeline, Help Types */}
      {(locationPref || timelineLabel || seekingTypes.length > 0 || helpTypes.length > 0) && (
        <div className="context-badges-row">
          {locationPref && (
            <span className="context-badge location">
              <MapPin className="w-3 h-3" />
              {locationPref}
            </span>
          )}
          {timelineLabel && (
            <span className="context-badge timeline">
              <Calendar className="w-3 h-3" />
              {timelineLabel}
            </span>
          )}
          {seekingTypes.slice(0, 1).map((type, idx) => {
            const config = SEEKING_TYPE_CONFIG[type];
            if (!config) return null;
            return (
              <span key={idx} className={`context-badge ${config.color}`}>
                {config.icon} {config.label}
              </span>
            );
          })}
          {helpTypes.slice(0, 2).map((type, idx) => (
            <span key={idx} className="context-badge help-type">
              {type === 'networking' || type === 'networking_intros' ? <Users className="w-3 h-3" /> :
               type === 'resume' || type === 'resume_review' ? <FileText className="w-3 h-3" /> :
               type === 'interviews' || type === 'interview_prep' ? <MessageSquare className="w-3 h-3" /> :
               <Briefcase className="w-3 h-3" />}
              {HELP_TYPE_LABELS[type] || type}
            </span>
          ))}
        </div>
      )}

      {/* Karma Boost Badge - only show if not expired */}
      {question.karma_boost > 0 && (!question.boosted_until || new Date(question.boosted_until) > new Date()) && (
        <div className={`karma-boost-badge level-${question.karma_boost}`}>
          ⚡ {question.karma_boost >= 3 ? 'Platinum' : question.karma_boost >= 2 ? 'Gold' : 'Silver'} Family Boost — Pinned to Top
        </div>
      )}

      {/* Stats - Compact with icons */}
      <div className="question-stats">
        <span className="stat">💬 {question.answer_count || 0}</span>
        <span className="stat">⬆️ {question.total_upvotes || 0}</span>
        <span className="stat">👁️ {question.view_count || 0}</span>
        {question.has_best_answer && <span className="best-badge">✅ Best</span>}
      </div>

      {/* Action button - different style based on answered status */}
      {needsAttention && (
        <p className="offer-help-hint">Even 2–3 sentences help — no need to have the "right" answer.</p>
      )}
      <button className={`card-action-button ${needsAttention ? 'primary' : 'secondary'}`}>
        {needsAttention ? 'Share what you\'ve seen →' : 'View Answers →'}
      </button>
      {needsAttention && (
        <p className="no-expertise-hint">No expertise required</p>
      )}

      <style jsx>{`
        .question-card {
          position: relative;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .question-card:hover {
          border-color: #0021A5;
          box-shadow: 0 8px 24px rgba(0, 33, 165, 0.12);
          transform: translateY(-2px);
        }

        .question-card.needs-attention {
          border-left: 4px solid #F59E0B;
          background: linear-gradient(to right, #FFFBEB 0%, white 8%);
        }

        /* Tags Row */
        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
          align-items: center;
        }

        .poster-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .poster-badge.student {
          background: #DBEAFE;
          color: #1E40AF;
        }

        .poster-badge.parent {
          background: #E0E7FF;
          color: #4338CA;
        }

        .poster-badge.alumni {
          background: #FEF3C7;
          color: #92400E;
        }

        .help-tag {
          background: #F3F4F6;
          color: #4B5563;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 500;
        }

        .help-tag.more {
          background: #E5E7EB;
          color: #6B7280;
        }

        .answered-badge {
          background: #D1FAE5;
          color: #065F46;
          padding: 3px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .student-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .student-name-link {
          font-weight: 700;
          font-size: 15px;
          color: #111827;
          cursor: pointer;
          transition: color 0.15s;
        }

        .student-name-link:hover {
          color: #0021A5;
          text-decoration: underline;
        }

        .posted-time-inline {
          font-size: 12px;
          color: #9CA3AF;
        }

        .student-details-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 10px;
        }

        .detail-sep {
          color: #9CA3AF;
        }

        .minor-text {
          color: #6B7280;
        }

        .pre-track {
          color: #0021A5;
          font-weight: 600;
        }

        .context-badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .context-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .context-badge.location {
          background: #DBEAFE;
          color: #1E40AF;
        }

        .context-badge.timeline {
          background: #FEF3C7;
          color: #92400E;
        }

        .context-badge.help-type {
          background: #F3F4F6;
          color: #374151;
        }

        .question-metadata {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .student-name {
          font-weight: 600;
          color: #1F2937;
        }

        .separator {
          color: #D1D5DB;
        }

        .student-info {
          color: #6B7280;
        }

        .posted-time {
          color: #9CA3AF;
          font-size: 12px;
        }

        .question-text {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.5;
          color: #111827;
          margin-bottom: 12px;
        }

        .question-card:hover .question-text {
          color: #0021A5;
        }

        .read-more-btn {
          background: none;
          border: none;
          color: #0021A5;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
        }

        .read-more-btn:hover {
          text-decoration: underline;
        }

        .needs-help-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #D97706;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #F59E0B;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        /* Removed old location-preference - now using context-badges-row */

        .karma-boost-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 12px;
          margin-bottom: 10px;
          animation: glow 2s ease-in-out infinite;
        }

        .karma-boost-badge.level-1 {
          background: linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 100%);
          color: #374151;
          border: 1px solid #9CA3AF;
        }

        .karma-boost-badge.level-2 {
          background: linear-gradient(90deg, #FEF9C3 0%, #FDE047 100%);
          color: #92400E;
          border: 1px solid #F59E0B;
        }

        .karma-boost-badge.level-3 {
          background: linear-gradient(90deg, #E9D5FF 0%, #C084FC 100%);
          color: #581C87;
          border: 1px solid #A855F7;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 4px rgba(250, 204, 21, 0.4); }
          50% { box-shadow: 0 0 8px rgba(250, 204, 21, 0.6); }
        }

        .question-stats {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 14px;
          font-size: 13px;
          color: #6B7280;
        }

        .stat {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .best-badge {
          color: #10B981;
          font-weight: 500;
        }

        .card-action-button {
          width: 100%;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .card-action-button.primary {
          background: #10B981;
          color: white;
          border: none;
        }

        .card-action-button.primary:hover {
          background: #059669;
        }

        .card-action-button.secondary {
          background: white;
          color: #0021A5;
          border: 2px solid #E5E7EB;
        }

        .card-action-button.secondary:hover {
          border-color: #0021A5;
          background: #F9FAFB;
        }

        .offer-help-hint {
          text-align: center;
          font-size: 13px;
          color: #9CA3AF;
          margin: 0 0 10px 0;
        }

        .no-expertise-hint {
          text-align: center;
          font-size: 11px;
          color: #9CA3AF;
          margin: 6px 0 0 0;
        }

        @media (max-width: 768px) {
          .question-card {
            padding: 16px;
            margin-bottom: 0;
            border-radius: 0;
            border-left: none;
            border-right: none;
            border-top: none;
          }

          .question-card.needs-attention {
            border-left: 3px solid #F59E0B;
          }

          .tags-row {
            gap: 4px;
            margin-bottom: 8px;
          }

          .poster-badge, .help-tag, .answered-badge {
            font-size: 10px;
            padding: 2px 8px;
          }
          
          .question-text {
            font-size: 15px;
            line-height: 1.4;
            margin-bottom: 10px;
          }
          
          .card-action-button {
            padding: 14px 20px;
            min-height: 48px;
            font-size: 15px;
          }

          .student-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .student-details-line {
            font-size: 12px;
          }

          .context-badges-row {
            gap: 4px;
            margin-bottom: 10px;
          }

          .context-badge {
            padding: 3px 8px;
            font-size: 10px;
          }

          .question-metadata {
            font-size: 12px;
            margin-bottom: 6px;
          }

          .question-stats {
            font-size: 12px;
            margin-bottom: 12px;
            gap: 12px;
          }

          .karma-boost-badge {
            font-size: 10px;
            padding: 3px 8px;
            margin-bottom: 8px;
          }

          .needs-help-indicator {
            font-size: 11px;
          }
        }

        .owner-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
        }

        .menu-trigger {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: white;
          border: 1px solid #E5E7EB;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .menu-trigger:hover {
          background: #F3F4F6;
          color: #374151;
          border-color: #D1D5DB;
        }
      `}</style>
    </div>
    
    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Question?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your question and all its answers. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    {/* Edit Question Modal */}
    <EditQuestionModal
      question={question}
      open={showEditModal}
      onOpenChange={setShowEditModal}
      onUpdated={onUpdated}
    />
    </>
  );
}