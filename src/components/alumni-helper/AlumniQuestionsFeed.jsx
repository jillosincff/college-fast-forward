import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const AVATAR_COLORS = [
  '#1a237e', '#004d40', '#4a148c', '#b71c1c', '#0d47a1', '#e65100', '#1b5e20',
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function getDisplayName(fullName) {
  if (!fullName) return 'Student';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]?.charAt(0)}.`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function QuestionCard({ question, index }) {
  const isUnanswered = (question.answer_count || 0) === 0;
  const name = getDisplayName(question.poster_name || question.student_name);
  const major = question.student_major || '';
  const year = question.student_year || '';
  const industry = question.target_industry || '';

  return (
    <div
      onClick={() => navigate('QuestionDetail', { id: question.id })}
      style={{
        background: '#fff', borderRadius: 14, padding: '18px 20px',
        cursor: 'pointer', transition: 'box-shadow 0.2s',
        borderLeft: isUnanswered ? '3px solid #E85D20' : '3px solid transparent',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: AVATAR_COLORS[index % AVATAR_COLORS.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#fff',
        }}>
          {getInitials(question.poster_name || question.student_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#333' }}>
            {name}
          </span>
          {(major || year) && (
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#999' }}>
              {' · '}{[major, year].filter(Boolean).join(' · ')}
            </span>
          )}
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#bbb' }}>
            {' · '}{timeAgo(question.created_date)}
          </span>
        </div>
      </div>

      {/* Question text */}
      <p style={{
        fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#1a1a1a',
        lineHeight: 1.5, marginBottom: 10,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {question.description || question.title || question.role}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {industry && (
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#888',
            background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '3px 10px',
          }}>
            {industry}
          </span>
        )}
        {isUnanswered && (
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#E85D20',
            background: 'rgba(232,93,32,0.08)', borderRadius: 100, padding: '3px 10px',
          }}>
            No answers yet
          </span>
        )}
        {question.matchReason && (
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#888',
            background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '3px 10px',
          }}>
            Matches your background
          </span>
        )}
      </div>
    </div>
  );
}

export default function AlumniQuestionsFeed({ questions, totalCount, needAnswersCount, expertiseArea, pledgeCount }) {
  const displayQuestions = questions.slice(0, 3);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <h2 style={{
          fontFamily: playfair, fontSize: 22, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3,
        }}>
          Students Need Your {expertiseArea || ''} Expertise
        </h2>
        <span style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#E85D20',
          background: 'rgba(232,93,32,0.08)', borderRadius: 100, padding: '5px 12px',
          flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          +15 karma per answer
        </span>
      </div>

      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 6 }}>
        {totalCount} question{totalCount !== 1 ? 's' : ''} match your background — {needAnswersCount} need answers today
      </p>

      {pledgeCount > 0 && (
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 16 }}>
          You pledged to help <span style={{ fontWeight: 600, color: '#555' }}>{pledgeCount}</span> student{pledgeCount !== 1 ? 's' : ''} who could use your expertise this week.
        </p>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {displayQuestions.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} />
        ))}
      </div>

      {/* CTA */}
      {totalCount > 0 && (
        <button
          onClick={() => navigate('Connections')}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 12,
            background: '#1a1a1a', color: '#fff', border: 'none',
            fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#333'}
          onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
        >
          See All {totalCount} Questions — {needAnswersCount} Still Need Answers
        </button>
      )}
    </div>
  );
}