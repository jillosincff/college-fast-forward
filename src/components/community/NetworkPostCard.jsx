import React from 'react';
import { navigate } from '@/components/utils/navigation';
import moment from 'moment';
import formatDisplayName, { getInitialsFromUser } from '@/components/utils/formatDisplayName';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const AVATAR_COLORS = ['#E85D20', '#0021A5', '#2e7d32', '#7c3aed', '#c2185b', '#00838f'];

const CATEGORY_LABELS = {
  networking: 'Networking & Outreach',
  career_path: 'Career Path Exploration',
  first_job: 'First Job Advice',
  industry: 'Industry-Specific',
  'career_advice': 'Career Path Exploration',
  'internship_leads': 'First Job Advice',
  'resume_review': 'First Job Advice',
  'networking_intros': 'Networking & Outreach',
  'industry_insights': 'Industry-Specific',
};

function getClassYear(gradYear) {
  if (!gradYear) return null;
  const year = parseInt(gradYear);
  if (isNaN(year)) return null;
  const now = new Date();
  const academicYear = now.getMonth() >= 7 ? now.getFullYear() + 1 : now.getFullYear();
  const diff = year - academicYear;
  if (diff <= 0) return 'Senior';
  if (diff === 1) return 'Junior';
  if (diff === 2) return 'Sophomore';
  if (diff === 3) return 'Freshman';
  return `Class of ${year}`;
}

export default function NetworkPostCard({ question, gator, index, topAnswer, user }) {
  const answerCount = question.answer_count || 0;
  const isUnanswered = answerCount === 0;
  const posterUser = {
    first_name: gator?.first_name || question.poster_first_name,
    last_name: gator?.last_name || question.poster_last_name,
    full_name: gator?.full_name || question.poster_name || question.student_name,
    email: gator?.email || question.created_by,
  };
  const posterName = formatDisplayName(posterUser, 'Student');
  const classYear = getClassYear(question.student_year || gator?.graduation_year);
  const major = question.student_major || gator?.major || question.target_industry || '';
  const minor = question.student_minor || gator?.minor || '';
  const avatarColor = AVATAR_COLORS[(posterName.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const initials = getInitialsFromUser(posterUser, 'S');
  const timeAgo = moment(question.created_date).isAfter(moment()) ? 'just now' : moment(question.created_date).fromNow();

  const category = question.category || (question.help_types?.[0] ? question.help_types[0] : '');
  const categoryLabel = CATEGORY_LABELS[category] || '';

  const description = question.description || '';
  const MAX_LINES = 3;
  const truncated = description.length > 200 ? description.slice(0, 200).trim() + '...' : description;

  const locationPref = question.location_preference || '';
  const timeline = question.start_timing || question.timeline || '';
  const timelineLabels = { immediate: 'ASAP', this_semester: 'This Semester', next_semester: 'Next Semester', summer: 'Summer 2026', this_week: 'This Week', this_month: 'This Month', no_rush: 'No Rush' };

  const isParentOrAlumni = user?.persona === 'parent' || user?.persona === 'alumni';

  const handleClick = () => navigate('QuestionDetail', { id: question.id });

  // Check if question text looks like a statement (not a question)
  const isStatement = description.length > 10 && !description.trim().endsWith('?');

  return (
    <div onClick={handleClick} style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderLeft: isUnanswered ? '3px solid #E85D20' : '3px solid #4CAF50',
      borderRadius: isUnanswered ? '0 16px 16px 0' : '0 16px 16px 0',
      padding: '20px 22px', marginBottom: 10, cursor: 'pointer',
      transition: 'all 0.2s', animation: `atnFadeUp 0.4s ease ${0.13 + (index || 0) * 0.05}s both`,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>{posterName}</div>
            <div style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
              {[classYear, major, minor].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb' }}>{timeAgo}</span>
          {isUnanswered ? (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 100,
              background: 'rgba(232,93,32,0.08)', color: '#E85D20', border: '0.5px solid rgba(232,93,32,0.2)',
            }}>Needs answer</span>
          ) : (
            <span style={{
              fontFamily: dmSans, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 100,
              background: 'rgba(76,175,80,0.08)', color: '#2e7d32', border: '0.5px solid rgba(76,175,80,0.2)',
            }}>{answerCount} answer{answerCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Category label */}
      {categoryLabel && (
        <div style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#E85D20', marginBottom: 6 }}>
          {categoryLabel}
        </div>
      )}

      {/* Question text */}
      <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 17, color: '#1a1a1a', lineHeight: 1.4, letterSpacing: '-0.01em', marginBottom: 8 }}>
        {description.trim().endsWith('?') ? description : `"${description}"`}
      </div>

      {/* Statement tip */}
      {isStatement && question.poster_email === user?.email && (
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', fontStyle: 'italic', marginBottom: 8 }}>
          Tip: Phrasing this as a question gets more responses. <span style={{ color: '#E85D20', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate('QuestionDetail', { id: question.id }); }}>Edit →</span>
        </p>
      )}

      {/* Tags */}
      {(locationPref || timeline) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {locationPref && (
            <span style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 100,
              background: 'rgba(33,150,243,0.06)', color: '#1565c0', border: '0.5px solid rgba(33,150,243,0.15)',
            }}>📍 {locationPref}</span>
          )}
          {timeline && (
            <span style={{
              fontFamily: dmSans, fontSize: 11, fontWeight: 400, padding: '3px 10px', borderRadius: 100,
              background: 'rgba(232,93,32,0.06)', color: '#E85D20', border: '0.5px solid rgba(232,93,32,0.15)',
            }}>☀️ {timelineLabels[timeline] || timeline}</span>
          )}
        </div>
      )}

      {/* Reply preview */}
      {topAnswer && (
        <div style={{
          background: 'rgba(76,175,80,0.03)', border: '0.5px solid rgba(76,175,80,0.12)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 14,
        }}>
          <div style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bbb', marginBottom: 8 }}>Latest reply</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: '#E85D20', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: dmSans, fontSize: 9, fontWeight: 500, color: '#fff',
            }}>{(topAnswer.answerer_name || 'H').charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 3 }}>
                {topAnswer.answerer_name || 'Helper'}{topAnswer.answerer_title ? ` · ${topAnswer.answerer_title}` : ''}{topAnswer.answerer_company ? ` · ${topAnswer.answerer_company}` : ''}
              </div>
              <div style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', lineHeight: 1.55,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>{topAnswer.answer_text || topAnswer.message || ''}</div>
            </div>
          </div>
        </div>
      )}

      {/* Engagement row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, paddingTop: 12,
        borderTop: '0.5px solid rgba(0,0,0,0.05)',
      }}>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          {question.total_upvotes || 0}
        </span>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {answerCount} replies
        </span>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {question.view_count || 0} views
        </span>
        <div style={{ marginLeft: 'auto' }}>
          {isUnanswered ? (
            <button onClick={e => { e.stopPropagation(); handleClick(); }} style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#fff', background: '#E85D20',
              borderRadius: 100, padding: '7px 16px', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'background 0.2s', minHeight: 'auto', width: 'auto',
            }}>
              Answer this
              <span style={{
                fontFamily: dmSans, fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '2px 7px',
              }}>+15</span>
            </button>
          ) : (
            <button onClick={e => { e.stopPropagation(); handleClick(); }} style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 500,
              color: '#2e7d32', background: 'rgba(76,175,80,0.08)',
              border: '0.5px solid rgba(76,175,80,0.2)', borderRadius: 100,
              padding: '7px 16px', cursor: 'pointer', transition: 'background 0.2s', minHeight: 'auto', width: 'auto',
            }}>
              Add your answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}