import React from 'react';
import { navigate } from '@/components/utils/navigation';
import moment from 'moment';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career Advice',
  'internship_leads': 'Internship Leads',
  'resume_review': 'Resume Review',
  'interview_prep': 'Interview Prep',
  'industry_insights': 'Industry Insights',
  'networking_intros': 'Networking',
  'informational_interview': 'Info Interviews'
};

// Helper function to format student name (first name + last initial)
function formatStudentName(fullName) {
  if (!fullName || fullName === 'A Gator') return 'A Gator';
  
  let name = fullName.trim();
  
  // Check if it looks like an email username (no spaces, all lowercase, or contains numbers mixed with letters)
  const looksLikeUsername = !name.includes(' ') && (
    name === name.toLowerCase() || 
    /^[a-z]+[0-9]+$/.test(name) ||
    /^[a-z]{2,}[a-z]$/.test(name)
  );
  
  if (looksLikeUsername) {
    // Try to extract first name from username patterns like "lindseyosinoff", "gordonkatherine"
    // Common pattern: firstname + lastname concatenated
    // Use common first names to split, or just capitalize and show first part
    
    // Try to find a natural split point (where a capital might have been)
    // For now, just take first 6-8 chars and capitalize as a first name
    const possibleFirstName = name.slice(0, Math.min(name.length, 8));
    const capitalized = possibleFirstName.charAt(0).toUpperCase() + possibleFirstName.slice(1);
    
    // If it's very short, might be initials like "ypatel" -> "Y."
    if (name.length <= 6) {
      return capitalized.charAt(0).toUpperCase() + '.';
    }
    
    // Try to detect common name patterns
    const commonFirstNames = ['lindsey', 'gordon', 'sarah', 'john', 'michael', 'david', 'james', 'robert', 'jennifer', 'jessica', 'ashley', 'emily', 'daniel', 'matthew', 'andrew', 'joshua', 'christopher', 'anthony', 'mark', 'steven', 'brian', 'kevin', 'jason', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'stephen', 'jonathan', 'larry', 'scott', 'frank', 'raymond', 'gregory', 'samuel', 'patrick', 'alexander', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'henry', 'douglas', 'peter', 'adam', 'nathan', 'zachary', 'walter', 'kyle', 'harold', 'carl', 'arthur', 'gerald', 'roger', 'keith', 'jeremy', 'lawrence', 'terry', 'sean', 'austin', 'christian', 'albert', 'joe', 'willie', 'billy', 'bruce', 'ralph', 'roy', 'eugene', 'randy', 'russell', 'bobby', 'harry', 'vincent', 'louis', 'philip', 'mary', 'patricia', 'elizabeth', 'barbara', 'susan', 'margaret', 'dorothy', 'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle', 'laura', 'kimberly', 'deborah', 'stephanie', 'cynthia', 'amy', 'angela', 'melissa', 'brenda', 'anna', 'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debra', 'amanda', 'catherine', 'christine', 'marie', 'janet', 'frances', 'ann', 'joyce', 'diane', 'alice', 'julie', 'heather', 'teresa', 'gloria', 'evelyn', 'jean', 'cheryl', 'mildred', 'katherine', 'joan', 'ashley', 'judith', 'rose', 'janice', 'kelly', 'nicole', 'judy', 'christina', 'rachel', 'victoria', 'lauren', 'samantha', 'emma', 'olivia', 'ava', 'sophia', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn'];
    
    for (const firstName of commonFirstNames) {
      if (name.toLowerCase().startsWith(firstName)) {
        const rest = name.slice(firstName.length);
        if (rest.length > 0) {
          return firstName.charAt(0).toUpperCase() + firstName.slice(1) + ' ' + rest.charAt(0).toUpperCase() + '.';
        }
        return firstName.charAt(0).toUpperCase() + firstName.slice(1);
      }
    }
    
    // Fallback: just show "A Gator" for unrecognizable usernames
    return 'A Gator';
  }
  
  // Normal name with spaces
  const parts = name.split(/\s+/);
  if (parts.length === 0) return 'A Gator';
  
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() + '.' : '';
  
  // Capitalize first name properly
  const capitalizedFirst = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  
  return `${capitalizedFirst} ${lastInitial}`.trim();
}

export default function QuestionCard({ question, gator }) {
  const handleClick = () => {
    navigate('QuestionDetail', { id: question.id });
  };

  // Get poster info
  const posterType = question.poster_type || 'student';
  const isAnonymous = question.is_anonymous && posterType === 'parent';
  
  // Get name - prefer gator data, fallback to question data
  const rawPosterName = isAnonymous 
    ? 'Anonymous Parent'
    : gator?.full_name || gator?.first_name || question.poster_name || question.student_name || 'A Gator';
  const posterName = isAnonymous ? rawPosterName : formatStudentName(rawPosterName);
  
  // Get student info
  const year = gator?.graduation_year || question.student_year || '';
  const major = gator?.major || question.target_industry || question.student_major || '';
  
  // Format time
  const timeAgo = moment(question.created_date).fromNow();

  return (
    <div className="question-card" onClick={handleClick}>
      {/* Poster Type Badge - only for non-students */}
      {posterType !== 'student' && (
        <div className={`poster-type-badge ${posterType}`}>
          {posterType === 'parent' ? '👨‍👩‍👧 Parent Question' : '🎯 Alumni Question'}
        </div>
      )}

      {/* Top metadata line */}
      <div className="question-metadata">
        <span className="student-name">{posterName}</span>
        {(year || major) && (
          <>
            <span className="separator">•</span>
            <span className="student-info">
              {year && `${year}`}
              {year && major && ', '}
              {major}
            </span>
          </>
        )}
        <span className="separator">•</span>
        <span className="posted-time">Posted {timeAgo}</span>
      </div>

      {/* Question text - THE HERO */}
      <div className="question-text">
        "{question.description}"
      </div>

      {/* Needs help badge */}
      {(question.answer_count || 0) === 0 && (
        <div className="needs-help-badge">
          🆘 No answers yet - be the first to help!
        </div>
      )}

      {/* Topic tags */}
      <div className="topic-tags">
        {question.help_types?.slice(0, 3).map((type, idx) => (
          <span key={idx} className="tag">{HELP_TYPE_LABELS[type] || type}</span>
        ))}
        {question.timeline === 'this_week' && (
          <span className="tag tag-urgent">ASAP</span>
        )}
      </div>

      {/* Stats */}
      <div className="question-stats">
        <span className="stat">
          <span className="stat-icon">💬</span>
          <span className="stat-number">{question.answer_count || 0}</span>
          <span className="stat-label">{(question.answer_count || 0) === 1 ? 'answer' : 'answers'}</span>
        </span>
        
        <span className="stat-separator">•</span>
        
        <span className="stat">
          <span className="stat-icon">⬆️</span>
          <span className="stat-number">{question.total_upvotes || 0}</span>
          <span className="stat-label">upvotes</span>
        </span>
        
        <span className="stat-separator">•</span>
        
        <span className="stat">
          <span className="stat-icon">👁️</span>
          <span className="stat-number">{question.view_count || 0}</span>
          <span className="stat-label">views</span>
        </span>
        
        {question.has_best_answer && (
          <>
            <span className="stat-separator">•</span>
            <span className="best-answer-indicator">✅ Best answer</span>
          </>
        )}
      </div>

      {/* Single action button */}
      <button className="card-action-button">
        {(question.answer_count || 0) === 0 ? 'Be the First to Answer →' : 'View Question & Answers →'}
      </button>

      <style jsx>{`
        .question-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .question-card:hover {
          border-color: #0021A5;
          box-shadow: 0 8px 24px rgba(0, 33, 165, 0.12);
          transform: translateY(-4px);
        }

        .question-card:hover .question-text {
          color: #0021A5;
        }

        .poster-type-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .poster-type-badge.parent {
          background: #E0E7FF;
          color: #4338CA;
        }

        .poster-type-badge.alumni {
          background: #FEF3C7;
          color: #92400E;
        }

        .question-metadata {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 12px;
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
        }

        .question-text {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.5;
          color: #111827;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .needs-help-badge {
          background: #FEF3C7;
          color: #D97706;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
          display: inline-block;
        }

        .topic-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tag {
          background: #FEF3C7;
          color: #D97706;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .tag-urgent {
          background: #FEE2E2;
          color: #DC2626;
        }

        .question-stats {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .stat {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .stat-icon {
          font-size: 16px;
        }

        .stat-number {
          font-weight: 600;
          color: #111827;
        }

        .stat-label {
          color: #6B7280;
        }

        .stat-separator {
          color: #D1D5DB;
        }

        .best-answer-indicator {
          color: #10B981;
          font-weight: 500;
        }

        .card-action-button {
          width: 100%;
          background: white;
          color: #0021A5;
          border: 2px solid #0021A5;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .card-action-button:hover {
          background: #0021A5;
          color: white;
        }

        @media (max-width: 768px) {
          .question-card {
            padding: 16px;
          }
          
          .question-text {
            font-size: 16px;
          }
          
          .card-action-button {
            padding: 14px 20px;
          }

          .question-metadata {
            font-size: 13px;
          }

          .question-stats {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}