import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

const CATEGORY_LABELS = {
  'job_search': 'Job Search', 'networking': 'Networking', 'industry_insights': 'Industry Insights',
  'resume': 'Resume Help', 'resume_review': 'Resume Help', 'interviews': 'Interview Prep',
  'interview_prep': 'Interview Prep', 'direction': 'Career Direction', 'career_advice': 'Career Advice',
  'career_path': 'Career Path', 'informational_interview': 'Informational Interview',
  'internship_leads': 'Internship Leads', 'networking_intros': 'Networking Intros',
  'Industry Insights': 'Industry Insights', 'first_job': 'First Job',
};

function formatCategory(raw) {
  if (!raw) return 'Other';
  return CATEGORY_LABELS[raw] || raw.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function ParentHelpNeedsChart() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const questions = await base44.entities.JobRequest.filter({ status: 'active' }, '-created_date', 50);
        const counts = {};
        (questions || []).forEach(q => {
          const cats = q.help_types || [];
          const cat = cats[0] || q.category || q.target_industry || 'other';
          const label = formatCategory(cat);
          counts[label] = (counts[label] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
        setRows(sorted.map(([label, count]) => ({ label, pct: Math.round((count / total) * 100) })));
      } catch {}
    })();
  }, []);

  if (rows.length === 0) return null;

  return (
    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <h2 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 4 }}>
        Where Students Need Help Most
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', marginBottom: 14 }}>
        The most common things students in the network are asking for right now.
      </p>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888', width: 120, flexShrink: 0 }}>{r.label}</span>
          <div style={{ flex: 1, height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${r.pct}%`, background: orange, borderRadius: 3, transition: 'width 0.8s ease' }} />
          </div>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', width: 32, textAlign: 'right' }}>{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}