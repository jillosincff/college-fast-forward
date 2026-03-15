import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

function getKarmaLevel(pts) {
  if (pts >= 300) return { level: 'Champion', next: null, needed: 0 };
  if (pts >= 150) return { level: 'Advocate', next: 'Champion', needed: 300 - pts };
  if (pts >= 50) return { level: 'Connector', next: 'Advocate', needed: 150 - pts };
  return { level: 'Newcomer', next: 'Connector', needed: 50 - pts };
}

const DOT_COLORS = {
  answered_question: orange,
  question_answered: orange,
  conversation_had: orange,
  made_introduction: '#4CAF50',
  completed_onboarding: orange,
  linked_student: '#4CAF50',
};

export default function ParentImpactSection({ user, data }) {
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const karma = data.familyKarma || 0;
  const karmaInfo = getKarmaLevel(karma);
  const studentsHelped = data.studentsHelped || 0;

  // Load answers + activity
  const [answersGiven, setAnswersGiven] = useState(0);
  const [intros, setIntros] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const [answers, activity] = await Promise.allSettled([
          base44.entities.Answer.filter({ answerer_email: user.email }),
          base44.entities.ActivityLog.filter({ student_email: user.email }, '-created_date', 10),
        ]);
        if (answers.status === 'fulfilled') setAnswersGiven((answers.value || []).length);
        if (activity.status === 'fulfilled') {
          const acts = (activity.value || []).slice(0, 5);
          setRecentActivity(acts);
          const introCount = (activity.value || []).filter(a => a.type === 'made_introduction' || a.type === 'networking_intros').length;
          setIntros(introCount);
        }
      } catch {}
    })();
  }, [user?.email]);

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '20px', marginBottom: 14 }}>
      <h2 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 14 }}>Your Impact</h2>

      {/* 3 stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { val: studentsHelped, label: 'Students Helped' },
          { val: answersGiven, label: 'Answers Given' },
          { val: intros, label: 'Intros Made' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#f4f2ee', borderRadius: 12, padding: 14, textAlign: 'center' }}>
            <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: orange }}>
              {s.val > 0 ? s.val : '--'}
            </div>
            <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Karma row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '0.5px solid rgba(0,0,0,0.06)',
      }}>
        <div>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
            Family Karma · <span style={{ color: orange, fontWeight: 500 }}>{karmaInfo.level}</span>
          </p>
          {karmaInfo.next && (
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#888', marginTop: 3 }}>
              {karmaInfo.needed} more to reach {karmaInfo.next}
            </p>
          )}
        </div>
        <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: orange }}>
          {karma > 0 ? karma : '--'}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.07em', color: '#bbb', marginBottom: 10,
          }}>Recent Activity</p>
          {recentActivity.slice(0, showAllActivity ? 10 : 5).map((act, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: '0.5px solid rgba(0,0,0,0.04)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: DOT_COLORS[act.type] || orange, flexShrink: 0 }} />
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', flex: 1 }}>
                {act.notes || act.type?.replace(/_/g, ' ')}
              </span>
              <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 300, color: '#bbb', flexShrink: 0 }}>
                {act.created_date ? new Date(act.created_date).toLocaleDateString() : ''}
              </span>
            </div>
          ))}
          {recentActivity.length > 5 && !showAllActivity && (
            <button
              onClick={() => setShowAllActivity(true)}
              style={{
                background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12,
                fontWeight: 400, color: orange, cursor: 'pointer', marginTop: 8, padding: 0, minHeight: 'auto', width: 'auto',
              }}
            >View all activity →</button>
          )}
        </div>
      )}
    </div>
  );
}