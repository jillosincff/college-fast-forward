import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const AVATAR_COLORS = ['#E85D20', '#0021A5', '#2e7d32', '#7c3aed', '#c2185b', '#00838f'];

function formatHelperName(name) {
  if (!name) return 'Helper';
  if (name.includes(',')) {
    const [last, rest] = name.split(',').map(s => s.trim());
    const first = rest?.split(/\s+/)[0] || '';
    return first ? `${first} ${last.charAt(0)}.` : name;
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  return name;
}

export default function NetworkSidebar({ stats, user, onFilterForParents }) {
  const [topHelpers, setTopHelpers] = useState([]);

  useEffect(() => {
    loadTopHelpers();
  }, []);

  const loadTopHelpers = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const [answers, jobAnswers] = await Promise.all([
        base44.entities.Answer.filter({}, '-created_date', 200).catch(() => []),
        base44.entities.JobAnswer.filter({}, '-created_date', 200).catch(() => []),
      ]);
      const allAnswers = [
        ...(answers || []).map(a => ({ name: a.answerer_name, email: a.answerer_email, title: a.answerer_title, date: a.created_date })),
        ...(jobAnswers || []).map(a => ({ name: a.responder_name, email: a.responder_email, title: a.responder_title, date: a.created_date })),
      ].filter(a => a.date >= startOfMonth);

      const counts = {};
      allAnswers.forEach(a => {
        const key = a.email || a.name || 'unknown';
        if (!counts[key]) counts[key] = { name: a.name || 'Helper', title: a.title || '', count: 0 };
        counts[key].count++;
      });
      const sorted = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3);
      setTopHelpers(sorted);
    } catch (e) {
      console.log('Top helpers load failed:', e);
    }
  };

  const isParentOrAlumni = user?.persona === 'parent' || user?.persona === 'alumni';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'atnFadeUp 0.4s ease 0.14s both' }}>
      {/* Parent nudge */}
      {isParentOrAlumni && (
        <div style={{
          background: 'rgba(232,93,32,0.05)', border: '0.5px solid rgba(232,93,32,0.15)',
          borderRadius: 12, padding: 14,
        }}>
          <div style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 6 }}>
            You can answer these.
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', lineHeight: 1.6, marginBottom: 10, margin: '0 0 10px' }}>
            You don't need to know their industry. Every question about networking, first jobs, and career decisions is one you have real answers to — because you've lived it.
          </p>
          <button onClick={onFilterForParents} style={{
            width: '100%', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
            color: '#fff', background: '#E85D20', borderRadius: 100, padding: 9,
            border: 'none', cursor: 'pointer', transition: 'background 0.2s', minHeight: 'auto',
          }}>
            Browse questions I can answer →
          </button>
        </div>
      )}

      {/* Network Activity */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 18 }}>
        <div style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>Network Activity</div>
        {[
          { label: 'Questions posted', value: stats.totalQuestions },
          { label: 'Answers given', value: stats.totalAnswers },
          { label: 'Needs answer', value: stats.needsAnswer || 0 },
          { label: 'Members helping', value: stats.membersHelping || 0 },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0',
            borderBottom: i < 3 ? '0.5px solid rgba(0,0,0,0.05)' : 'none',
          }}>
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>{row.label}</span>
            <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 16, color: '#E85D20' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Most Helpful This Month */}
      {topHelpers.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 18 }}>
          <div style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>Most Helpful This Month</div>
          {topHelpers.map((helper, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: i < topHelpers.length - 1 ? '0.5px solid rgba(0,0,0,0.05)' : 'none',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#fff', flexShrink: 0,
              }}>{(helper.name || 'H').charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatHelperName(helper.name)}
                </div>
                <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {helper.title || 'Community Member'}
                </div>
              </div>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#E85D20', flexShrink: 0 }}>
                {helper.count} answers
              </span>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 18 }}>
        <div style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', marginBottom: 8 }}>How it works</div>
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', lineHeight: 1.7, margin: 0 }}>
          Students post questions. Parents and alumni answer from real experience. The more specific the question, the better the answer.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', fontStyle: 'italic', marginTop: 8, margin: '8px 0 0' }}>
          Every answer earns karma points.
        </p>
      </div>
    </div>
  );
}