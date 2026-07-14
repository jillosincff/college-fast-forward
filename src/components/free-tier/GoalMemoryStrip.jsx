import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Goal Memory: every session resumes where the student left off.
// One quiet strip of context chips — nothing is repeated unnecessarily.
export default function GoalMemoryStrip({ user }) {
  const [chips, setChips] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    let cancelled = false;
    Promise.all([
      base44.entities.CareerPlan.filter({ user_email: user.email, status: 'active' }, '-created_date', 1).catch(() => []),
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 50).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 10).catch(() => []),
    ]).then(([plans, pipeline, resumes]) => {
      if (cancelled) return;
      const list = [];
      if (plans?.[0]?.goal_summary) list.push(`🎯 Still focused on: ${plans[0].goal_summary}`);
      const interview = (pipeline || []).find(r => r.status === 'interview');
      if (interview) {
        const day = interview.interview_date
          ? new Date(interview.interview_date).toLocaleDateString('en-US', { weekday: 'long' })
          : '';
        list.push(`🎤 Interview${day ? ` ${day}` : ''} — ${interview.company}`);
      }
      const waiting = (pipeline || []).find(r => r.status === 'applied');
      if (waiting) list.push(`👀 Waiting on ${waiting.company}`);
      if ((resumes || []).some(r => r.status === 'completed' && !r.downloaded_at)) list.push('📄 Resume ready');
      setChips(list.slice(0, 4));
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  if (!chips.length) return null;

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {chips.map((c, i) => (
        <span key={i} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#4b5563', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, padding: '7px 14px' }}>
          {c}
        </span>
      ))}
    </div>
  );
}