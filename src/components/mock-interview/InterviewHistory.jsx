import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const TYPE_LABELS = { behavioral: 'Behavioral', technical: 'Technical', case: 'Case', mixed: 'Mixed', company_specific: 'Company' };

export default function InterviewHistory({ userId, userEmail, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.MockInterviewSession.filter({ user_email: userEmail, status: 'complete' }, '-completed_at', 50)
      .then(s => setSessions(s || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userEmail]);

  const chartData = sessions.slice().reverse().slice(-10).map((s, i) => ({
    name: `#${i + 1}`,
    score: s.overall_score || 0,
  }));

  const hasChart = chartData.length >= 3;
  const improvement = chartData.length >= 2 ? chartData[chartData.length - 1].score - chartData[0].score : 0;

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 80px' }}>
        <button onClick={onBack} style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16,
          minHeight: 'auto', width: 'auto',
        }}>
          <ArrowLeft className="w-4 h-4" /> Back to setup
        </button>

        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
          My Interviews
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 24 }}>
          {sessions.length} completed interview{sessions.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Loader2 style={{ width: 24, height: 24, color: orange }} className="animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888' }}>No interviews yet. Start practicing!</p>
          </div>
        ) : (
          <>
            {/* Score trend chart */}
            {hasChart && (
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '20px 16px', marginBottom: 20 }}>
                <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 4 }}>Score Trend</p>
                {improvement !== 0 && (
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: improvement > 0 ? '#4CAF50' : '#e53935', marginBottom: 12 }}>
                    {improvement > 0 ? `↑ You've improved ${improvement} points` : `↓ ${Math.abs(improvement)} points lower`} across {chartData.length} sessions
                  </p>
                )}
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip contentStyle={{ fontFamily: dmSans, fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke={orange} strokeWidth={2} dot={{ r: 4, fill: orange }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Session list */}
            {sessions.map(s => {
              const scoreColor = (s.overall_score || 0) >= 70 ? '#4CAF50' : (s.overall_score || 0) >= 50 ? '#FFA726' : '#e53935';
              const date = s.completed_at ? new Date(s.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
              return (
                <div key={s.id} style={{
                  background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 12, padding: '14px 18px', marginBottom: 8,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.company_name || TYPE_LABELS[s.interview_type] || 'Mock'} Interview
                    </p>
                    <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', margin: 0 }}>
                      {TYPE_LABELS[s.interview_type] || s.interview_type} · {s.difficulty} · {date}
                    </p>
                  </div>
                  <span style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 700, color: scoreColor, flexShrink: 0, marginLeft: 12 }}>
                    {s.overall_score || 0}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}