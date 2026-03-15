import React from 'react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

function resolveFieldPlaceholder(text) {
  if (!text) return text;
  return text
    .replace(/\[field\]/gi, 'this field')
    .replace(/\[industry\]/gi, 'this industry')
    .replace(/\[role\]/gi, 'this role');
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const ms = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(ms / (1000 * 60 * 60));
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatAuthor(q) {
  const name = q?.poster_name || q?.poster_first_name || q?.student_name || '';
  if (!name) return 'A Student';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  return parts[0];
}

const AVATAR_COLORS = ['#E85D20', '#0821A5', '#6A2A60', '#2e7d32', '#D32737'];

function QuestionRow({ question, index }) {
  const text = resolveFieldPlaceholder(question.title || question.description?.substring(0, 160) || question.role || '');
  const author = formatAuthor(question);
  const major = question.student_major || '';
  const year = question.student_year || '';
  const time = formatTimeAgo(question.created_date);
  const answerCount = question.answer_count || 0;
  const initials = author.charAt(0).toUpperCase();
  const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const isUnanswered = answerCount === 0;

  return (
    <div
      onClick={() => navigate('QuestionDetail', { id: question.id })}
      style={{
        background: '#f4f2ee', borderRadius: 12, padding: '14px 16px', marginBottom: 8,
        borderLeft: `3px solid ${isUnanswered ? orange : 'rgba(0,0,0,0.1)'}`,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.03)'; e.currentTarget.style.borderLeftColor = orange; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#f4f2ee'; e.currentTarget.style.borderLeftColor = isUnanswered ? orange : 'rgba(0,0,0,0.1)'; }}
    >
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', background: bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 9, fontWeight: 500, color: '#fff', flexShrink: 0,
        }}>{initials}</div>
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
          {author}{major ? ` · ${major}` : ''}{year ? ` '${year}` : ''}{time ? ` · ${time}` : ''}
        </span>
      </div>

      {/* Question text */}
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.5, marginBottom: 8 }}>
        {text}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {question.target_industry && (
          <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 400, background: 'rgba(0,0,0,0.05)', color: '#666', borderRadius: 100, padding: '2px 8px' }}>
            {question.target_industry}
          </span>
        )}
        {isUnanswered ? (
          <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 400, background: 'rgba(232,93,32,0.08)', color: orange, border: '0.5px solid rgba(232,93,32,0.2)', borderRadius: 100, padding: '2px 8px' }}>
            No answers yet
          </span>
        ) : (
          <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 400, background: 'rgba(76,175,80,0.08)', color: '#2e7d32', borderRadius: 100, padding: '2px 8px' }}>
            {answerCount} answer{answerCount !== 1 ? 's' : ''}
          </span>
        )}
        {question.isMatch && (
          <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 400, background: 'rgba(76,175,80,0.08)', color: '#2e7d32', border: '0.5px solid rgba(76,175,80,0.2)', borderRadius: 100, padding: '2px 8px' }}>
            Matches your background
          </span>
        )}
      </div>
    </div>
  );
}

export default function ParentQuestionsSection({ data, user }) {
  const industry = data.parentIndustry || 'Your';
  const questions = (data.matchedQuestions || [])
    .filter((q, i, self) => i === self.findIndex(t => t.id === q.id))
    .slice(0, 3);
  const unansweredCount = data.unansweredCount || 0;
  const matchedCount = data.matchedCount || 0;
  const needAnswersToday = questions.filter(q => (q.answer_count || 0) === 0).length;

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 14,
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>
            Students Need Your {industry} Expertise
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
            {matchedCount > 0 ? `${matchedCount} questions match your background` : `${data.allQuestionsCount} questions waiting`} — {needAnswersToday} need answers today
          </p>
        </div>
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: orange,
          background: 'rgba(232,93,32,0.08)', borderRadius: 100, padding: '4px 10px', flexShrink: 0,
        }}>+15 karma per answer</span>
      </div>

      {/* Pledge reminder */}
      <div style={{ padding: '0 20px 12px' }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888' }}>
          You pledged to help. <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{needAnswersToday} students</span> could use your expertise this week.
        </p>
      </div>

      {/* Questions */}
      <div style={{ padding: '0 16px 4px' }}>
        {questions.length > 0 ? questions.map((q, i) => (
          <QuestionRow key={q.id} question={q} index={i} />
        )) : (
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', textAlign: 'center', padding: '24px 0' }}>
            No questions yet. Check back soon!
          </p>
        )}
      </div>

      {/* See All button */}
      <div style={{ padding: '12px 16px 16px' }}>
        <button
          onClick={() => navigate('Connections')}
          style={{
            width: '100%', padding: 11, borderRadius: 100, border: 'none',
            background: '#0d1117', color: '#fff',
            fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = orange; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0d1117'; }}
        >
          See All {data.allQuestionsCount} Questions — {unansweredCount} Still Need Answers
        </button>
      </div>
    </div>
  );
}