import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { addPipelineEntry } from '@/functions/addPipelineEntry';
import { useAuth } from '@/lib/AuthContext';
import { getColumnForStatus, COLUMN_TO_STATUS } from '@/components/pipeline/pipelineStatusMap';

const dm = "'DM Sans', system-ui, sans-serif";
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const FREE_LIMIT = 5;

// Stage keys map 1:1 to shared pipeline columns (single source of truth)
const STAGE_TO_COLUMN = {
  to_apply:     'opportunities',
  applied:      'reached_out',
  interviewing: 'interviews',
  offer:        'offers',
};
const COLUMN_TO_STAGE = {
  opportunities: 'to_apply',
  reached_out:   'applied',
  interviews:    'interviewing',
  offers:        'offer',
};
const STAGE_TO_STATUS = {
  to_apply:    COLUMN_TO_STATUS.opportunities,
  applied:     COLUMN_TO_STATUS.reached_out,
  interviewing:COLUMN_TO_STATUS.interviews,
  offer:       COLUMN_TO_STATUS.offers,
};
const statusToStage = (status) => COLUMN_TO_STAGE[getColumnForStatus(status)];

const STAGES = [
  { key: 'to_apply', label: 'Opportunities', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', icon: '📋' },
  { key: 'applied', label: 'Reached Out', color: BLUE, bg: BLUE_LIGHT, border: BLUE_BORDER, icon: '📩' },
  { key: 'interviewing', label: 'Interviewing', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '🎤' },
  { key: 'offer', label: 'Offer', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '🎉' },
];

// Mock school themes - in production, bind to user.schoolThemeColors
const SCHOOL_THEMES = {
  'University of Florida': { primary: '#0021A5', secondary: '#FA4616', name: 'Gators' },
  'USC': { primary: '#990000', secondary: '#FFCC00', name: 'Trojans' },
  'default': { primary: BLUE, secondary: '#16a34a', name: 'Network' },
};

function ParentNetworkBanner({ isMobile }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
      border: '1.5px solid #6ee7b7',
      borderRadius: 12, padding: '12px 14px', marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#d1fae5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>
        🤝
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontFamily: dm, fontSize: 11, fontWeight: 800,
          color: '#065f46', margin: '0 0 2px',
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          Parent Network
        </p>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#059669', margin: 0, fontWeight: 500 }}>
          Connected · Check for connections at your target companies
        </p>
      </div>
      <button
        onClick={() => window.location.hash = '#FreeTierDashboard?tab=network'}
        style={{
          fontFamily: dm, fontSize: isMobile ? 10 : 11, fontWeight: 700,
          color: '#065f46', background: '#a7f3d0',
          border: '1.5px solid #6ee7b7',
          borderRadius: 8, padding: '6px 10px',
          cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap', flexShrink: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#6ee7b7'}
        onMouseLeave={e => e.currentTarget.style.background = '#a7f3d0'}
      >
        Find Connections →
      </button>
    </div>
  );
}

function PipelineCard({ job, onMove, onRemove, onBypassGhost, isPulsing, isMobile }) {
  // Show "💬 Contacted" badge if the job has an outreach activity tag
  const contactedBadge = job.outreachContact ? (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: '#eff6ff', border: '1px solid #bfdbfe',
      borderRadius: 6, padding: '3px 8px', marginBottom: 6,
    }}>
      <span style={{ fontSize: 10 }}>💬</span>
      <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>
        Contacted: {job.outreachContact}
      </p>
    </div>
  ) : null;
  const [showActions, setShowActions] = useState(false);
  const [pulseActive, setPulseActive] = useState(isPulsing || false);

  useEffect(() => {
    if (isPulsing) {
      setPulseActive(true);
      // Pulse for 2 seconds then fade
      const timer = setTimeout(() => setPulseActive(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPulsing]);
  
  
  return (
    <div
      style={{
        background: '#fff',
        border: pulseActive ? '2px solid #f59e0b' : '1px solid #f3f4f6',
        borderRadius: isMobile ? 12 : 14,
        padding: isMobile ? '12px' : '14px 16px',
        marginBottom: isMobile ? 10 : 12,
        transition: 'all 0.2s',
        position: 'relative',
        boxShadow: pulseActive ? '0 0 0 4px rgba(245, 158, 11, 0.2), 0 4px 12px rgba(0,0,0,0.08)' : isMobile ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.04)',
        animation: pulseActive ? 'cardPulse 0.8s ease-in-out' : 'none',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <style>{`
        @keyframes cardPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.1); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>
      {/* Header - Optimized for mobile readability */}
      <div style={{ display: 'flex', gap: isMobile ? 8 : 10, marginBottom: isMobile ? 8 : 8 }}>
        <div style={{
          width: isMobile ? 36 : 40, height: isMobile ? 36 : 40, borderRadius: isMobile ? 8 : 10,
          background: '#f1f5f9', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMobile ? 16 : 18,
        }}>
          🏢
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingRight: isMobile ? 24 : 0 }}>
          <p style={{ 
            fontFamily: dm, 
            fontSize: isMobile ? 13 : 14, 
            fontWeight: 800, 
            color: '#1e293b', 
            margin: '0 0 2px', 
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}>
            {job.company}
          </p>
          {job.title && (
            <p style={{ 
              fontFamily: dm, 
              fontSize: isMobile ? 10 : 11, 
              color: '#64748b', 
              margin: '0 0 1px',
              wordBreak: 'break-word',
            }}>
              {job.title}{job.location && ` · ${job.location}`}
            </p>
          )}
          {job.contact && (
            <p style={{ 
              fontFamily: dm, 
              fontSize: isMobile ? 9 : 10, 
              color: '#94a3b8', 
              margin: 0,
              wordBreak: 'break-word',
            }}>
              Contact: {job.contact}
            </p>
          )}
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
      
      {/* Outreach activity badge */}
      {contactedBadge}

      {/* Reached-out date (real data from pipeline record) */}
      {job.stage === 'applied' && job.appliedDate && (
        <p style={{ fontFamily: dm, fontSize: isMobile ? 9 : 10, color: '#64748b', margin: '6px 0 0' }}>
          📩 Reached out {job.appliedDate}
        </p>
      )}

      {/* Resume version submitted */}
      {job.resumeVersion && (
        <p style={{ fontFamily: dm, fontSize: isMobile ? 9 : 10, color: '#7c3aed', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          📄 Resume: <span style={{ fontWeight: 600 }}>{job.resumeVersion}</span>
        </p>
      )}

      {/* Stage Actions - Move to next stage only */}
      <div style={{ 
        display: 'flex', 
        gap: 6, 
        flexWrap: 'wrap', 
        marginTop: isMobile ? 8 : 10, 
        paddingTop: isMobile ? 8 : 10, 
        borderTop: '1px solid #f1f5f9',
        width: '100%',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: dm, fontSize: 9, color: '#9ca3af', fontWeight: 500, marginRight: 2 }}>Move to →</span>
        {STAGES.filter(s => s.key !== job.stage).map(s => (
          <button
            key={s.key}
            onClick={() => onMove(job.id, s.key)}
            style={{
              fontFamily: dm, fontSize: isMobile ? 9 : 9, fontWeight: 600,
              color: s.color, background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 6, padding: isMobile ? '5px 8px' : '4px 8px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.15s',
              textAlign: 'center',
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

export default function ApplicationPipeline({ onUpgrade, userSchool = 'University of Florida', alumniCount = 0, isPremium = false }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('to_apply');
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load from NetworkingPipeline entity
  const loadPipeline = () => {
    if (!user?.email) { setLoading(false); return; }
    base44.entities.NetworkingPipeline.list('-created_date', 200)
      .then(records => {
        const mapped = (records || []).map(r => ({
          id: r.id,
          title: r.job_title || r.alumni_role || '',
          company: r.company || r.alumni_name || 'Unknown',
          contact: r.alumni_name || null,
          stage: statusToStage(r.status),
          location: r.location || '',
          appliedDate: r.reached_out_date ? new Date(r.reached_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
          resumeVersion: (() => {
            const notes = r.notes || '';
            const match = notes.match(/Resume submitted: (.+)/);
            return match ? match[1] : null;
          })(),
          _pipelineId: r.id,
          _status: r.status,
        }));
        setJobs(mapped);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPipeline();
  }, [user?.email]);

  // Re-fetch when returning from OutreachDrafts (outreach_sent=1 param) or tab becomes visible
  useEffect(() => {
    // Check URL param on mount
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('outreach_sent') === '1' || hashParams.get('outreach_sent') === '1') {
      loadPipeline();
    }

    // Re-fetch when tab regains focus
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadPipeline();
    };
    document.addEventListener('visibilitychange', onVisible);

    // Re-fetch on custom event from OutreachDrafts / other sources
    const onRefresh = () => loadPipeline();
    window.addEventListener('cliff:pipeline-refresh', onRefresh);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('cliff:pipeline-refresh', onRefresh);
    };
  }, [user?.email]);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) setShowSidebar(false);
  }, [isMobile]);

  // Auto-progress pipeline when user copies an outreach draft from the modal
  useEffect(() => {
    const handleOutreachCopied = async (e) => {
      const { company, role, contactFirstName } = e.detail || {};
      if (!company || !user?.email) return;
      const now = new Date().toISOString();
      const displayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const exists = jobs.find(j => j.company?.toLowerCase().includes(company.toLowerCase()));
      if (exists) {
        moveStage(exists.id, 'applied');
        setJobs(prev => prev.map(j => j.id === exists.id ? { ...j, outreachContact: `${contactFirstName} (Alumni)` } : j));
      } else {
        try {
          const res = await addPipelineEntry({
              alumni_name: contactFirstName || company,
              alumni_role: role || '',
              company: company,
              status: 'reached_out',
              status_date: now,
              reached_out_date: now,
              alumni_source: 'manual',
            });
            if (res.data?.error === 'free_limit_reached') { return; }
            const record = res.data?.record;
          setJobs(prev => [...prev, {
            id: record.id,
            title: role || '',
            company: company,
            contact: contactFirstName || null,
            stage: 'applied',
            location: '',
            appliedDate: displayDate,
            resumeVersion: null,
            outreachContact: `${contactFirstName} (Alumni)`,
            _pipelineId: record.id,
            _status: 'reached_out',
          }]);
        } catch (e) {
          console.error('Failed to auto-create pipeline entry:', e);
        }
      }
      setActiveTab('applied');
    };

    window.addEventListener('cliff:outreach-copied', handleOutreachCopied);
    return () => window.removeEventListener('cliff:outreach-copied', handleOutreachCopied);
  }, [user?.email, jobs]);

  const totalJobs = jobs.length;
  const atLimit = !isPremium && totalJobs >= FREE_LIMIT;
  const activeTabJobs = jobs.filter(j => j.stage === activeTab);
  const activeStage = STAGES.find(s => s.key === activeTab);

  const addJob = async () => {
    if (!newTitle.trim() || !user?.email) return;
    const now = new Date().toISOString();
    try {
      const res = await addPipelineEntry({
        alumni_name: '',
        alumni_role: newTitle,
        company: newCompany || '',
        status: 'identified',
        status_date: now,
        alumni_source: 'manual',
      });
      if (res.data?.error === 'free_limit_reached') {
        alert('You\'ve reached the 5-entry free limit. Upgrade to CLiFF Premium for unlimited tracking.');
        return;
      }
      const record = res.data?.record;
      setJobs(prev => [...prev, {
        id: record.id,
        title: newTitle,
        company: newCompany || newTitle,
        contact: null,
        stage: 'to_apply',
        location: newLocation,
        appliedDate: null,
        resumeVersion: null,
        _pipelineId: record.id,
        _status: 'identified',
      }]);
    } catch (e) {
      console.error('Failed to add job:', e);
    }
    setNewTitle(''); setNewCompany(''); setNewUrl(''); setNewLocation('');
    setShowAdd(false);
  };

  const moveStage = async (id, stageKey) => {
    const now = new Date().toISOString();
    const newStatus = STAGE_TO_STATUS[stageKey] || 'identified';
    setJobs(prev => prev.map(j => j.id === id ? {
      ...j,
      stage: stageKey,
      _status: newStatus,
      appliedDate: stageKey === 'applied' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : j.appliedDate,
    } : j));
    try {
      await base44.entities.NetworkingPipeline.update(id, {
        status: newStatus,
        status_date: now,
        ...(stageKey === 'applied' ? { reached_out_date: now } : {}),
        ...(stageKey === 'interviewing' ? { interview_date: now } : {}),
        ...(stageKey === 'offer' ? { offer_date: now } : {}),
      });
    } catch (e) {
      console.error('Failed to update stage:', e);
    }
  };

  const removeJob = async (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    try {
      await base44.entities.NetworkingPipeline.delete(id);
    } catch (e) {
      console.error('Failed to delete job:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, padding: '40px', textAlign: 'center' }}>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#94a3b8' }}>Loading your pipeline...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #e5e7eb', 
      borderRadius: isMobile ? 16 : 20, 
      overflow: 'hidden', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Mobile-first CSS resets */}
      <style>{`
        @media (max-width: 767px) {
          * {
            box-sizing: border-box;
          }
          body, html {
            overflow-x: hidden;
            width: 100%;
          }
        }
      `}</style>
      {/* School Pride Banner - Mobile Optimized */}
      <div style={{ padding: isMobile ? '12px 16px' : '16px 22px', background: '#f8fafc' }}>
        <ParentNetworkBanner isMobile={isMobile} />
        
        {/* Pipeline Header - Stacks on mobile */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 12 : 0, marginBottom: isMobile ? 12 : 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: dm, fontSize: isMobile ? 14 : 15, fontWeight: 800, color: '#111827', margin: 0 }}>
              My Application Pipeline
            </p>

            {!isPremium && (
              <p style={{ fontFamily: dm, fontSize: isMobile ? 9 : 10, color: '#6b7280', margin: '3px 0 0' }}>
                {totalJobs}/{FREE_LIMIT} jobs ·{' '}
                {atLimit
                  ? <span style={{ color: '#ef4444', fontWeight: 600 }}>Limit reached</span>
                  : <span style={{ color: '#16a34a' }}>{FREE_LIMIT - totalJobs} slots left</span>
                }
              </p>
            )}
            {isPremium && (
              <p style={{ fontFamily: dm, fontSize: isMobile ? 9 : 10, color: '#16a34a', margin: '3px 0 0', fontWeight: 600 }}>
                ✓ Unlimited Tracking Active
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('cff:open-pipeline-modal'))}
              style={{
                fontFamily: dm, fontSize: isMobile ? 11 : 12, fontWeight: 700,
                color: '#fff',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: 'none',
                borderRadius: 10, padding: isMobile ? '8px 14px' : '9px 16px',
                cursor: 'pointer', minHeight: 'auto',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                width: isMobile ? '100%' : 'auto',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              📊 View Kanban
            </button>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                fontFamily: dm, fontSize: isMobile ? 12 : 13, fontWeight: 700,
                color: BLUE,
                background: BLUE_LIGHT,
                border: `1px solid ${BLUE_BORDER}`,
                borderRadius: 10, padding: isMobile ? '8px 14px' : '9px 16px',
                cursor: 'pointer', minHeight: 'auto',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              + Add Job
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Mobile: Compact Top Tabs, Desktop: Full Width */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #f3f4f6',
        overflowX: 'hidden',
        flexWrap: 'nowrap',
        justifyContent: isMobile ? 'space-between' : 'stretch',
      }}>
        {STAGES.map((stage) => {
          const count = jobs.filter(j => j.stage === stage.key).length;
          const isActive = activeTab === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => setActiveTab(stage.key)}
              style={{
                flex: 1,
                padding: isMobile ? '10px 4px' : '12px 16px',
                background: isActive ? stage.bg : '#fff',
                borderBottom: `2px solid ${isActive ? stage.color : 'transparent'}`,
                border: 'none',
                cursor: 'pointer',
                minHeight: 'auto',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                minWidth: isMobile ? '70px' : 'auto',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: isMobile ? 12 : 13 }}>{stage.icon}</span>
                  <p style={{
                    fontFamily: dm, fontSize: isMobile ? 9 : 11, fontWeight: isActive ? 700 : 500,
                    color: isActive ? stage.color : '#6b7280',
                    margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {isMobile ? (stage.key === 'applied' ? 'RCVD' : stage.label.substring(0, 3).toUpperCase()) : stage.label}
                  </p>
                </div>
                <span style={{
                  fontFamily: dm, fontSize: isMobile ? 8 : 9, fontWeight: 700,
                  color: isActive ? stage.color : '#9ca3af',
                  background: isActive ? 'rgba(255,255,255,0.8)' : '#f3f4f6',
                  borderRadius: '50%', width: isMobile ? 16 : 18, height: isMobile ? 16 : 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Add Job Form - Mobile: Stacked inputs, Desktop: Inline */}
      {showAdd && (
        <div style={{ padding: isMobile ? '12px 16px' : '16px 22px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 10, marginBottom: 10 }}>
            <input
              placeholder="Position / Role *"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{ 
                flex: isMobile ? '1 1 100%' : '1 1 160px', 
                fontFamily: dm, 
                fontSize: isMobile ? 14 : 13, 
                color: '#111827', 
                background: '#fff', 
                border: '1px solid #d1d5db', 
                borderRadius: 8, 
                padding: isMobile ? '10px 12px' : '9px 12px', 
                outline: 'none',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            />
            <input
              placeholder="Company"
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              style={{ 
                flex: isMobile ? '1 1 100%' : '1 1 130px', 
                fontFamily: dm, 
                fontSize: isMobile ? 14 : 13, 
                color: '#111827', 
                background: '#fff', 
                border: '1px solid #d1d5db', 
                borderRadius: 8, 
                padding: isMobile ? '10px 12px' : '9px 12px', 
                outline: 'none',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            />
            <input
              placeholder="Location"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              style={{ 
                flex: isMobile ? '1 1 100%' : '1 1 120px', 
                fontFamily: dm, 
                fontSize: isMobile ? 14 : 13, 
                color: '#111827', 
                background: '#fff', 
                border: '1px solid #d1d5db', 
                borderRadius: 8, 
                padding: isMobile ? '10px 12px' : '9px 12px', 
                outline: 'none',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            />
            <input
              placeholder="Job URL (optional)"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              style={{ 
                flex: isMobile ? '1 1 100%' : '2 1 200px', 
                fontFamily: dm, 
                fontSize: isMobile ? 14 : 13, 
                color: '#111827', 
                background: '#fff', 
                border: '1px solid #d1d5db', 
                borderRadius: 8, 
                padding: isMobile ? '10px 12px' : '9px 12px', 
                outline: 'none',
                width: isMobile ? '100%' : 'auto',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row' }}>
            <button onClick={addJob} style={{ 
              fontFamily: dm, fontSize: isMobile ? 13 : 13, fontWeight: 700, 
              color: '#fff', background: BLUE, border: 'none', 
              borderRadius: 8, padding: isMobile ? '10px 18px' : '9px 18px', 
              cursor: 'pointer', minHeight: 'auto',
              flex: isMobile ? '1 1 100%' : 'none',
            }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ 
              fontFamily: dm, fontSize: isMobile ? 13 : 13, 
              color: '#6b7280', background: 'none', border: 'none', 
              cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline',
              flex: isMobile ? '1 1 100%' : 'none',
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Job Cards Feed - True Single Column on Mobile */}
      <div style={{ 
        padding: isMobile ? '12px 16px' : '16px 22px', 
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 10 : 12,
      }}>
        {activeTabJobs.length > 0 ? (
          activeTabJobs.map(job => (
            <PipelineCard
              key={job.id}
              job={job}
              onMove={moveStage}
              onRemove={removeJob}
              onBypassGhost={(jobId) => console.log('Bypass ghost for', jobId)}
              isMobile={isMobile}
            />
          ))
        ) : (
          <div style={{
            textAlign: 'center', padding: isMobile ? '30px 16px' : '40px 20px',
            background: '#f8fafc', borderRadius: isMobile ? 10 : 12,
            border: '2px dashed #e2e8f0',
          }}>
            <p style={{ fontFamily: dm, fontSize: isMobile ? 12 : 14, fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>
              No {activeStage?.label.toLowerCase()} yet
            </p>
            <p style={{ fontFamily: dm, fontSize: isMobile ? 10 : 11, color: '#94a3b8', margin: 0 }}>
              {activeTab === 'to_apply' ? 'Jobs you mark will appear here' : 'Move jobs here as you progress'}
            </p>
          </div>
        )}
      </div>

      {/* Limit nudge banner - only show for free tier users */}
      {!isPremium && atLimit && (
        <div
          onClick={() => onUpgrade('Unlimited Tracking')}
          style={{
            background: 'linear-gradient(135deg, #fef2f2, #eff6ff)',
            borderTop: '2px solid #fca5a5', padding: isMobile ? '12px 16px' : '16px 22px',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2, #dbeafe)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2, #eff6ff)'}
        >
          <p style={{ fontFamily: dm, fontSize: isMobile ? 11 : 13, fontWeight: 700, color: '#991b1b', margin: '0 0 4px' }}>
            🚫 You've hit the manual limit.
          </p>
          <p style={{ fontFamily: dm, fontSize: isMobile ? 10 : 12, color: '#374151', margin: '0 0 10px', lineHeight: 1.5 }}>
            Stop tracking jobs by hand. Let our automated crawler track unlimited roles and find hidden listings before they hit job boards.
          </p>
          <span style={{
            fontFamily: dm, fontSize: isMobile ? 11 : 13, fontWeight: 700,
            color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            borderRadius: 8, padding: isMobile ? '6px 14px' : '8px 18px', display: 'inline-block',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            ⚡ Automate for $4.99/wk →
          </span>
        </div>
      )}

      {/* Mobile Sidebar Toggle - Only visible on mobile */}
      {isMobile && (
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '12px 16px',
          background: '#f8fafc',
        }}>
          <button
            onClick={() => setShowSidebar(true)}
            style={{
              fontFamily: dm, fontSize: 12, fontWeight: 700,
              color: BLUE, background: BLUE_LIGHT,
              border: `1px solid ${BLUE_BORDER}`,
              borderRadius: 8, padding: '10px 16px',
              cursor: 'pointer', minHeight: 'auto',
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            📄 View Career Assets &amp; Tools
          </button>
        </div>
      )}

      {/* Mobile Bottom Sheet for Sidebar Widgets */}
      {isMobile && showSidebar && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '85vh',
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease-out',
        }}>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          
          {/* Handle bar */}
          <div style={{
            padding: '12px',
            display: 'flex',
            justifyContent: 'center',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: 40, height: 4,
              background: '#cbd5e1',
              borderRadius: 2,
            }} />
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowSidebar(false)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              fontSize: 20,
              color: '#64748b',
            }}
          >
            ✕
          </button>

          {/* Sidebar content placeholder - in production, render actual widgets here */}
          <div style={{ padding: '20px 16px 80px' }}>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              Career Tools
            </p>
            <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', marginBottom: 16 }}>
              My Career Assets · Alumni Outreach · Hiring Chat
            </p>
            
            {/* Widget placeholders */}
            {[
              { icon: '📄', title: 'My Career Assets', desc: 'ATS Score, Ghost Monitor, Resumes' },
              { icon: '🎓', title: 'Alumni Outreach', desc: 'Generate personalized scripts' },
              { icon: '💬', title: 'Hiring Experts Chat', desc: 'Get instant career advice' },
            ].map((widget, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => onUpgrade(widget.title)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{widget.icon}</span>
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      {widget.title}
                    </p>
                    <p style={{ fontFamily: dm, fontSize: 10, color: '#64748b', margin: '4px 0 0' }}>
                      {widget.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}