import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

export default function ParentWeeklyCard() {
  const [stats, setStats] = useState({ answered: 0, helped: 0, needHelp: 0 });

  useEffect(() => {
    (async () => {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [answers, questions] = await Promise.allSettled([
          base44.entities.Answer.filter({ answerer_persona: 'parent' }),
          base44.entities.JobRequest.filter({ status: 'active', poster_type: 'student' }),
        ]);

        let answeredThisWeek = 0;
        let helpedStudents = new Set();
        if (answers.status === 'fulfilled') {
          const recent = (answers.value || []).filter(a => a.created_date >= weekAgo);
          answeredThisWeek = recent.length;
          recent.forEach(a => { if (a.question_id) helpedStudents.add(a.question_id); });
        }

        let needHelp = 0;
        if (questions.status === 'fulfilled') {
          needHelp = (questions.value || []).filter(q => (q.answer_count || 0) === 0).length;
        }

        setStats({ answered: answeredThisWeek, helped: helpedStudents.size, needHelp });
      } catch {}
    })();
  }, []);

  return (
    <div style={{
      background: '#0d1117', borderRadius: 16, padding: '20px 22px', marginBottom: 14,
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.07em',
        color: 'rgba(244,240,232,0.5)', marginBottom: 16,
      }}>This Week in the Network</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { val: stats.answered, label: 'Questions answered\nby parents', color: '#f4f0e8' },
          { val: stats.helped, label: 'Students helped\nthis week', color: '#f4f0e8' },
          { val: stats.needHelp, label: 'Students who could\nuse your help', color: orange },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: s.color, marginBottom: 4 }}>
              {s.val > 0 ? s.val : '--'}
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.4)', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}