import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const FREE_LIMIT = 5;

const STAGES = [
  { key: 'to_apply', label: 'Opportunities', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  { key: 'applied', label: 'Applied', color: BLUE, bg: BLUE_LIGHT, border: BLUE_BORDER },
  { key: 'interviewing', label: 'Interviewing', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: 'offer', label: 'Offer 🎉', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
];

export default function ApplicationPipeline({ onUpgrade }) {
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Marketing Coordinator', company: 'TechCorp', stage: 'to_apply', url: '' },
    { id: 2, title: 'Growth Analyst Intern', company: 'Startup Co', stage: 'applied', url: '' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const totalJobs = jobs.length;
  const atLimit = totalJobs >= FREE_LIMIT;

  const addJob = () => {
    if (!newTitle.trim()) return;
    setJobs(prev => [...prev, { id: Date.now(), title: newTitle, company: newCompany, stage: 'to_apply', url: newUrl }]);
    setNewTitle(''); setNewCompany(''); setNewUrl('');
    setShowAdd(false);
  };

  const moveStage = (id, stageKey) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, stage: stageKey } : j));
  };

  const removeJob = (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '18px 22px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>My Application Pipeline</p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
            {totalJobs}/{FREE_LIMIT} jobs tracked ·{' '}
            {atLimit
              ? <span style={{ color: '#ef4444', fontWeight: 600 }}>Limit reached</span>
              : <span style={{ color: '#16a34a' }}>{FREE_LIMIT - totalJobs} slots left</span>
            }
          </p>
        </div>
        <button
          onClick={() => {
            if (atLimit) {
              onUpgrade('Unlimited Tracking');
            } else {
              setShowAdd(true);
            }
          }}
          style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: atLimit ? '#fff' : BLUE, background: atLimit ? 'linear-gradient(135deg, #ef4444, #dc2626)' : BLUE_LIGHT, border: `1px solid ${atLimit ? '#dc2626' : BLUE_BORDER}`, borderRadius: 10, padding: '9px 16px', cursor: 'pointer', minHeight: 'auto', boxShadow: atLimit ? '0 4px 12px rgba(239,68,68,0.3)' : 'none' }}
        >
          {atLimit ? '⚡ Unlock Unlimited' : '+ Add Job'}
        </button>
      </div>

      {/* Add Job Form */}
      {showAdd && (
        <div style={{ padding: '16px 22px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <input
              placeholder="Job title *"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{ flex: '1 1 160px', fontFamily: dm, fontSize: 13, color: '#111827', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', outline: 'none' }}
            />
            <input
              placeholder="Company"
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              style={{ flex: '1 1 130px', fontFamily: dm, fontSize: 13, color: '#111827', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', outline: 'none' }}
            />
            <input
              placeholder="Job URL (optional)"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              style={{ flex: '2 1 200px', fontFamily: dm, fontSize: 13, color: '#111827', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addJob} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: BLUE, border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto' }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, padding: 0 }}>
        {STAGES.map((stage, si) => {
          const stageJobs = jobs.filter(j => j.stage === stage.key);
          return (
            <div key={stage.key} style={{ borderRight: si < 3 ? '1px solid #f3f4f6' : 'none', padding: '16px 14px', minHeight: 200 }}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: stage.color, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage.label}</p>
                <span style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{stageJobs.length}</span>
              </div>

              {/* Job Cards */}
              {stageJobs.map(job => (
                <div key={job.id} style={{ background: stage.bg, border: `1px solid ${stage.border}`, borderRadius: 12, padding: '10px 12px', marginBottom: 8, position: 'relative' }}>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: '0 0 2px', paddingRight: 20 }}>{job.title}</p>
                  {job.company && <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '0 0 8px' }}>{job.company}</p>}
                  {/* Move stage */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {STAGES.filter(s => s.key !== stage.key).map(s => (
                      <button
                        key={s.key}
                        onClick={() => moveStage(job.id, s.key)}
                        style={{ fontFamily: dm, fontSize: 9, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: '2px 7px', cursor: 'pointer', minHeight: 'auto' }}
                      >→ {s.label.replace(' 🎉','')}</button>
                    ))}
                  </div>
                  <button
                    onClick={() => removeJob(job.id)}
                    style={{ position: 'absolute', top: 8, right: 8, fontSize: 11, color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, lineHeight: 1 }}
                  >✕</button>
                </div>
              ))}

              {stageJobs.length === 0 && (
                <p style={{ fontFamily: dm, fontSize: 11, color: '#d1d5db', textAlign: 'center', marginTop: 20 }}>Empty</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Limit nudge banner */}
      {atLimit && (
        <div
          onClick={() => onUpgrade('Unlimited Tracking')}
          style={{ background: 'linear-gradient(135deg, #fef2f2, #eff6ff)', borderTop: '2px solid #fca5a5', padding: '16px 22px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2, #dbeafe)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2, #eff6ff)'}
        >
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>
            🚫 You've hit the manual limit.
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 10px', lineHeight: 1.5 }}>
            Stop tracking jobs by hand. Let our automated crawler track unlimited roles and find hidden listings before they hit job boards.
          </p>
          <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: 8, padding: '8px 18px', display: 'inline-block', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
            ⚡ Automate for $4.99/wk →
          </span>
        </div>
      )}
    </div>
  );
}