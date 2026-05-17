import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const FREE_LIMIT = 5;

const STAGES = [
  { key: 'to_apply', label: 'Opportunities', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', icon: '📋' },
  { key: 'applied', label: 'Applied', color: BLUE, bg: BLUE_LIGHT, border: BLUE_BORDER, icon: '✅' },
  { key: 'interviewing', label: 'Interviewing', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '🎤' },
  { key: 'offer', label: 'Offer', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '🎉' },
];

// Mock school themes - in production, bind to user.schoolThemeColors
const SCHOOL_THEMES = {
  'University of Florida': { primary: '#0021A5', secondary: '#FA4616', name: 'Gators' },
  'USC': { primary: '#990000', secondary: '#FFCC00', name: 'Trojans' },
  'default': { primary: BLUE, secondary: '#16a34a', name: 'Network' },
};

function GhostRiskBadge({ risk, companyName }) {
  if (risk < 40) return null;
  
  const isHigh = risk >= 70;
  const isMedium = risk >= 40 && risk < 70;
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: isHigh ? '#fef2f2' : isMedium ? '#fffbeb' : '#f0fdf4',
      border: `1px solid ${isHigh ? '#fca5a5' : isMedium ? '#fcd34d' : '#86efac'}`,
      borderRadius: 8, padding: '8px 10px', marginTop: 8,
    }}>
      <span style={{ fontSize: 14 }}>{isHigh ? '👻' : isMedium ? '⚠️' : '✅'}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: isHigh ? '#991b1b' : isMedium ? '#92400e' : '#166534', margin: 0 }}>
          {isHigh ? 'HIGH GHOST RISK' : isMedium ? 'MODERATE GHOST RISK' : 'LOW RISK'}
        </p>
        <p style={{ fontFamily: dm, fontSize: 10, color: isHigh ? '#7f1d1d' : isMedium ? '#78350f' : '#14532d', margin: '2px 0 0' }}>
          {risk}% · {isHigh ? 'Recruiter activity paused' : isMedium ? 'Slow response pattern' : 'Recruiter active'}
        </p>
      </div>
      {isHigh && (
        <button style={{
          fontFamily: dm, fontSize: 9, fontWeight: 700,
          color: '#fff', background: '#E85D20', border: 'none',
          borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
          minHeight: 'auto', whiteSpace: 'nowrap',
        }}>
          🎯 Bypass
        </button>
      )}
    </div>
  );
}

function EmailSyncBadge({ synced, date, resumeName }) {
  if (!synced) return null;
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: 8, padding: '6px 8px', marginTop: 6,
    }}>
      <span style={{ fontSize: 12 }}>📩</span>
      <p style={{ fontFamily: dm, fontSize: 9, color: '#64748b', margin: 0 }}>
        Auto-synced {date}
      </p>
      {resumeName && (
        <>
          <span style={{ color: '#cbd5e1', fontSize: 8 }}>·</span>
          <p style={{ fontFamily: dm, fontSize: 9, color: '#475569', margin: 0 }}>
            📄 {resumeName}
          </p>
        </>
      )}
    </div>
  );
}

function SchoolPrideBanner({ schoolName, alumniCount }) {
  const theme = SCHOOL_THEMES[schoolName] || SCHOOL_THEMES.default;
  
  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
      borderRadius: 12, padding: '12px 16px', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: `0 4px 12px ${theme.primary}33`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        🎓
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: dm, fontSize: 11, fontWeight: 700,
          color: 'rgba(255,255,255,0.9)', margin: '0 0 2px',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Active Network
        </p>
        <p style={{
          fontFamily: dm, fontSize: 13, fontWeight: 700,
          color: '#fff', margin: 0,
        }}>
          {schoolName || 'Your School'} · {alumniCount || '0'} Alumni & Parents Synced
        </p>
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: 8, padding: '4px 10px',
      }}>
        <p style={{
          fontFamily: dm, fontSize: 10, fontWeight: 700,
          color: '#fff', margin: 0,
        }}>
          {theme.name}
        </p>
      </div>
    </div>
  );
}

function PipelineCard({ job, onMove, onRemove, onBypassGhost }) {
  const [showActions, setShowActions] = useState(false);
  
  // Mock data - in production, calculate from email sync & activity
  const ghostRisk = job.stage === 'applied' ? Math.floor(Math.random() * 100) : 0;
  const emailSynced = job.stage === 'applied' || job.stage === 'interviewing';
  const alumniOnTeam = Math.floor(Math.random() * 5);
  
  return (
    <div
      style={{
        background: '#fff', border: '2px solid #e2e8f0',
        borderRadius: 14, padding: '14px 16px', marginBottom: 12,
        transition: 'all 0.2s', position: 'relative',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: '#f1f5f9', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          🏢
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '0 0 2px', lineHeight: 1.3 }}>
            {job.title}
          </p>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', margin: 0 }}>
            {job.company} {job.location && `· ${job.location}`}
          </p>
        </div>
        <button
          onClick={() => onRemove(job.id)}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 24, height: 24, borderRadius: '50%',
            background: 'transparent', border: 'none',
            color: '#cbd5e1', cursor: 'pointer',
            display: showActions ? 'flex' : 'none',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 14, minHeight: 'auto',
          }}
        >
          ✕
        </button>
      </div>
      
      {/* Network & Sync Indicators */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`,
          borderRadius: 6, padding: '3px 8px', flexShrink: 0,
        }}>
          <span style={{ fontSize: 10 }}>🎓</span>
          <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 600, color: BLUE, margin: 0 }}>
            {alumniOnTeam} {alumniOnTeam === 1 ? 'Alumni' : 'Alumni'} on Team
          </p>
        </div>
        {emailSynced && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#f0fdf4', border: '1px solid #86efac',
            borderRadius: 6, padding: '3px 8px', flexShrink: 0,
          }}>
            <span style={{ fontSize: 10 }}>📩</span>
            <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 600, color: '#166534', margin: 0 }}>
              Auto-Tracked
            </p>
          </div>
        )}
      </div>
      
      {/* Email Sync Details */}
      <EmailSyncBadge
        synced={emailSynced}
        date={job.appliedDate || 'recently'}
        resumeName={job.resumeVersion}
      />
      
      {/* Ghost Risk */}
      {job.stage === 'applied' && (
        <GhostRiskBadge risk={ghostRisk} companyName={job.company} />
      )}
      
      {/* Stage Actions */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
        {STAGES.filter(s => s.key !== job.stage).map(s => (
          <button
            key={s.key}
            onClick={() => onMove(job.id, s.key)}
            style={{
              fontFamily: dm, fontSize: 9, fontWeight: 600,
              color: s.color, background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 6, padding: '4px 8px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = s.color;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = s.bg;
              e.currentTarget.style.color = s.color;
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ApplicationPipeline({ onUpgrade, userSchool = 'University of Florida', alumniCount = 847 }) {
  const [activeTab, setActiveTab] = useState('to_apply');
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Marketing Coordinator', company: 'TechCorp', stage: 'to_apply', url: '', location: 'Austin, TX', appliedDate: 'May 15', resumeVersion: 'Master_v2.pdf' },
    { id: 2, title: 'Growth Analyst Intern', company: 'Startup Co', stage: 'applied', url: '', location: 'Remote', appliedDate: 'May 12', resumeVersion: 'Startup_Tailored.pdf' },
    { id: 3, title: 'Product Manager', company: 'BigTech', stage: 'interviewing', url: '', location: 'San Francisco, CA', appliedDate: 'May 8', resumeVersion: 'PM_Master.pdf' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const totalJobs = jobs.length;
  const atLimit = totalJobs >= FREE_LIMIT;
  const activeTabJobs = jobs.filter(j => j.stage === activeTab);
  const activeStage = STAGES.find(s => s.key === activeTab);

  const addJob = () => {
    if (!newTitle.trim()) return;
    setJobs(prev => [...prev, { 
      id: Date.now(), 
      title: newTitle, 
      company: newCompany, 
      stage: 'to_apply', 
      url: newUrl,
      location: newLocation,
      appliedDate: null,
      resumeVersion: null,
    }]);
    setNewTitle(''); setNewCompany(''); setNewUrl(''); setNewLocation('');
    setShowAdd(false);
  };

  const moveStage = (id, stageKey) => {
    setJobs(prev => prev.map(j => j.id === id ? { 
      ...j, 
      stage: stageKey,
      appliedDate: stageKey === 'applied' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : j.appliedDate,
    } : j));
  };

  const removeJob = (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* School Pride Banner */}
      <div style={{ padding: '16px 22px', background: '#f8fafc' }}>
        <SchoolPrideBanner schoolName={userSchool} alumniCount={alumniCount} />
        
        {/* Pipeline Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>
              My Application Pipeline
            </p>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
              {totalJobs}/{FREE_LIMIT} jobs ·{' '}
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
            style={{
              fontFamily: dm, fontSize: 13, fontWeight: 700,
              color: atLimit ? '#fff' : BLUE,
              background: atLimit ? 'linear-gradient(135deg, #ef4444, #dc2626)' : BLUE_LIGHT,
              border: `1px solid ${atLimit ? '#dc2626' : BLUE_BORDER}`,
              borderRadius: 10, padding: '9px 16px',
              cursor: 'pointer', minHeight: 'auto',
              boxShadow: atLimit ? '0 4px 12px rgba(239,68,68,0.3)' : 'none',
            }}
          >
            {atLimit ? '⚡ Unlock Unlimited' : '+ Add Job'}
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb',
        overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {STAGES.map((stage) => {
          const count = jobs.filter(j => j.stage === stage.key).length;
          const isActive = activeTab === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => setActiveTab(stage.key)}
              style={{
                flex: '0 0 auto',
                padding: '12px 16px',
                background: isActive ? stage.bg : '#fff',
                borderBottom: `2px solid ${isActive ? stage.color : 'transparent'}`,
                border: 'none',
                cursor: 'pointer',
                minHeight: 'auto',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12 }}>{stage.icon}</span>
                <p style={{
                  fontFamily: dm, fontSize: 11, fontWeight: isActive ? 700 : 500,
                  color: isActive ? stage.color : '#6b7280',
                  margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {stage.label}
                </p>
                <span style={{
                  fontFamily: dm, fontSize: 9, fontWeight: 700,
                  color: isActive ? stage.color : '#9ca3af',
                  background: isActive ? 'rgba(255,255,255,0.6)' : '#f3f4f6',
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
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
              placeholder="Location"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              style={{ flex: '1 1 120px', fontFamily: dm, fontSize: 13, color: '#111827', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', outline: 'none' }}
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

      {/* Job Cards Feed */}
      <div style={{ padding: '16px 22px', minHeight: 200 }}>
        {activeTabJobs.length > 0 ? (
          activeTabJobs.map(job => (
            <PipelineCard
              key={job.id}
              job={job}
              onMove={moveStage}
              onRemove={removeJob}
              onBypassGhost={(jobId) => console.log('Bypass ghost for', jobId)}
            />
          ))
        ) : (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: '#f8fafc', borderRadius: 12,
            border: '2px dashed #e2e8f0',
          }}>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>
              No {activeStage?.label.toLowerCase()} yet
            </p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#94a3b8', margin: 0 }}>
              {activeTab === 'to_apply' ? 'Jobs you mark will appear here' : 'Move jobs here as you progress'}
            </p>
          </div>
        )}
      </div>

      {/* Limit nudge banner */}
      {atLimit && (
        <div
          onClick={() => onUpgrade('Unlimited Tracking')}
          style={{
            background: 'linear-gradient(135deg, #fef2f2, #eff6ff)',
            borderTop: '2px solid #fca5a5', padding: '16px 22px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2, #dbeafe)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2, #eff6ff)'}
        >
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>
            🚫 You've hit the manual limit.
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 10px', lineHeight: 1.5 }}>
            Stop tracking jobs by hand. Let our automated crawler track unlimited roles and find hidden listings before they hit job boards.
          </p>
          <span style={{
            fontFamily: dm, fontSize: 13, fontWeight: 700,
            color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: 8, padding: '8px 18px', display: 'inline-block',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            ⚡ Automate for $4.99/wk →
          </span>
        </div>
      )}
    </div>
  );
}