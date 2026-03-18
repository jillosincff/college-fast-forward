import React, { useState } from 'react';
import { dmSans, CARD_BG, ORANGE, BORDER, MUTED } from './constants';
import { Search } from 'lucide-react';

const PATHS = [
  { role: 'Investment Banking Analyst', industry: 'Finance', salary: '$85K–$110K', progression: 'Analyst → Associate → VP → Managing Director', skills: 'Financial modeling, Valuation, Excel, Communication' },
  { role: 'Marketing Coordinator', industry: 'Marketing', salary: '$45K–$60K', progression: 'Coordinator → Manager → Senior Manager → Director → VP', skills: 'Social media, Analytics, Content creation, Brand strategy' },
  { role: 'Software Engineer', industry: 'Tech', salary: '$80K–$120K', progression: 'Junior → Mid → Senior → Staff → Principal', skills: 'JavaScript, Python, System design, Problem solving' },
  { role: 'Management Consultant', industry: 'Consulting', salary: '$75K–$95K', progression: 'Analyst → Consultant → Manager → Partner', skills: 'Problem solving, Presentations, Data analysis, Strategy' },
  { role: 'Registered Nurse', industry: 'Healthcare', salary: '$55K–$80K', progression: 'Staff Nurse → Charge Nurse → Nurse Manager → Director of Nursing', skills: 'Patient care, Critical thinking, EMR systems, Communication' },
  { role: 'Financial Analyst', industry: 'Finance', salary: '$60K–$85K', progression: 'Analyst → Senior Analyst → Manager → Director', skills: 'Financial modeling, Excel, SQL, Forecasting' },
];

const FILTER_OPTIONS = ['All', 'Finance', 'Marketing', 'Tech', 'Consulting', 'Healthcare', 'Other'];

export default function TabCareerPath() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = PATHS.filter(p => {
    if (search && !p.role.toLowerCase().includes(search.toLowerCase()) && !p.industry.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'All' && p.industry !== filter) return false;
    return true;
  });

  return (
    <div>
      <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Explore where your degree can take you.</h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 24 }}>Real career paths, role breakdowns, and salary ranges.</p>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles or industries..."
          style={{ width: '100%', background: '#111', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px 12px 40px', fontFamily: dmSans, fontSize: 14, color: '#fff', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {FILTER_OPTIONS.map(f => (
          <button key={f} onClick={() => setFilter(f)} data-chip="true"
            style={{ fontFamily: dmSans, fontSize: 13, fontWeight: filter === f ? 600 : 400, color: filter === f ? '#fff' : MUTED, background: filter === f ? 'rgba(232,93,32,0.15)' : 'transparent', border: `1px solid ${filter === f ? 'rgba(232,93,32,0.3)' : BORDER}`, borderRadius: 100, padding: '7px 16px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(p => (
          <div key={p.role} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.role}</p>
            <span style={{ fontFamily: dmSans, fontSize: 12, color: ORANGE, fontWeight: 500 }}>{p.industry}</span>
            <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Starting Salary</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>{p.salary}</p>
              </div>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Career Progression</p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: '#aaa' }}>{p.progression}</p>
              </div>
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Key Skills</p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: '#aaa' }}>{p.skills}</p>
              </div>
            </div>
            <button style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ORANGE, background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto' }}>
              Explore This Path →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}