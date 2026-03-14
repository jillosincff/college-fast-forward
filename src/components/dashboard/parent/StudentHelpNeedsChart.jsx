import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";

const HELP_TYPE_LABELS = {
  internship_leads: 'Internship Leads',
  career_advice: 'Career Advice',
  networking_intros: 'Networking',
  industry_insights: 'Industry Insights',
  interview_prep: 'Interview Prep',
  resume_review: 'Resume Review',
  informational_interview: 'Informational Interview',
};

export default function StudentHelpNeedsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const [helpReqs, jobReqs] = await Promise.all([
        base44.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 200).catch(() => []),
        base44.entities.JobRequest.filter({ status: 'active' }, '-created_date', 200).catch(() => []),
      ]);
      const counts = {};
      [...(helpReqs || []), ...(jobReqs || [])].forEach(r => {
        (r.help_types || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
      });
      const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
      const sorted = Object.entries(counts)
        .map(([key, count]) => ({ key, label: HELP_TYPE_LABELS[key] || key, count, pct: Math.round((count / total) * 100) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
      setData(sorted);
    })();
  }, []);

  if (data.length === 0) return null;

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14,
      padding: '18px 20px',
    }}>
      <h3 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
        Where students need help most
      </h3>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: '0 0 16px' }}>
        The most common things students in the network are asking for right now.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map(d => (
          <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#1a1a1a', width: 140, flexShrink: 0 }}>{d.label}</span>
            <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${d.pct}%`, background: '#E85D20', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', marginLeft: 8, minWidth: 32, textAlign: 'right' }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}