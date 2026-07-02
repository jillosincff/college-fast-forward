import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Search, Filter, Plus, MapPin, Calendar, Mail } from 'lucide-react';
import AddApplicationModal from '@/components/tracker/AddApplicationModal';
import EmailConnectionModal from '@/components/tracker/EmailConnectionModal';
import FollowUpDraftModal from '@/components/tracker/FollowUpDraftModal';
import FollowUpReminderModal from '@/components/tracker/FollowUpReminderModal';
import ApplicationDetailPanel from '@/components/tracker/ApplicationDetailPanel';
import StatusCheckBanner from '@/components/tracker/StatusCheckBanner';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

// Tracker status key → NetworkingPipeline status (for saving edits back)
const TRACKER_STATUS_TO_PIPELINE = {
  applied: 'identified',
  in_review: 'reached_out',
  interviewing: 'interview',
  offered: 'offer',
  rejected: 'no_response',
};

// Map NetworkingPipeline statuses → tracker statuses
const PIPELINE_STATUS_MAP = {
  identified: 'applied',
  matched: 'applied',
  reached_out: 'in_review',
  messaged: 'in_review',
  replied: 'in_review',
  coffee_chat: 'interviewing',
  intro_made: 'in_review',
  interview: 'interviewing',
  offer: 'offered',
  no_response: 'rejected',
};

// Pull the resume version/label out of the notes field
function extractResumeVersion(notes) {
  if (!notes) return '—';
  const submitted = notes.match(/Resume submitted:\s*(.+)/i);
  if (submitted) return submitted[1].trim().split('\n')[0];
  if (/Resume tailored via CLiFF/i.test(notes)) return 'Tailored via CLiFF';
  return '—';
}

// Derive a suggested next action from status + time since last activity
function computeNextAction(record) {
  const status = PIPELINE_STATUS_MAP[record.status] || 'applied';
  if (status === 'offered') return 'Review offer';
  if (status === 'interviewing') return 'Prep for interview';
  if (status === 'rejected') return '—';
  const lastActivity = new Date(record.status_date || record.updated_date || record.created_date);
  const daysSince = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince >= 7) return 'Send follow-up';
  return 'Wait for response';
}

function pipelineToApp(record) {
  return {
    id: record.id,
    company: record.company || '—',
    logo: (record.company?.[0] || '?').toUpperCase(),
    jobTitle: record.job_title || '—',
    dateApplied: record.created_date,
    resumeVersion: extractResumeVersion(record.notes),
    status: PIPELINE_STATUS_MAP[record.status] || 'applied',
    nextAction: computeNextAction(record),
    notes: record.notes || '',
    location: record.location || '',
    jobUrl: record.job_url || '',
  };
}

const STATUS_COLORS = {
  applied: '#9CA3AF',
  in_review: '#3B82F6',
  interviewing: '#8B5CF6',
  offered: '#10B981',
  rejected: '#EF4444',
};

const STATUS_LABELS = {
  applied: 'Applied',
  in_review: 'In Review',
  interviewing: 'Interviewing',
  offered: 'Offer Received',
  rejected: 'Rejected',
};

export default function ApplicationTracker() {
  const { user } = useAuth();
  // v2.0
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpApp, setFollowUpApp] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load the user's real tracked applications from their pipeline
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.email) { setLoading(false); return; }
      try {
        const records = await base44.entities.NetworkingPipeline.filter(
          { user_email: user.email }, '-created_date', 200
        );
        if (!cancelled) setApplications(records.map(pipelineToApp));
      } catch {
        if (!cancelled) setApplications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.email]);

  // Filter & search
  let filtered = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Sort
  if (sortBy === 'date') filtered.sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied));
  else if (sortBy === 'company') filtered.sort((a, b) => a.company.localeCompare(b.company));
  else if (sortBy === 'status') filtered.sort((a, b) => a.status.localeCompare(b.status));

  // Stats
  const stats = {
    total: applications.length,
    responseRate: applications.length > 0 ? Math.round((applications.filter(a => ['in_review', 'interviewing', 'offered'].includes(a.status)).length / applications.length) * 100) : 0,
    interviews: applications.filter(a => a.status === 'interviewing').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: dm }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontFamily: pf, fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
            Application Tracker
          </h1>
          <p style={{ fontSize: 15, color: '#666', margin: 0, lineHeight: 1.6 }}>
            Stay organized. Never lose track of where you stand.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ background: '#fff', padding: '24px 20px', borderBottom: '1px solid #E5E5E5', marginBottom: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { label: 'Total Applications', value: stats.total },
            { label: 'Response Rate', value: `${stats.responseRate}%${stats.total > 0 ? ` (${Math.ceil(stats.total * stats.responseRate / 100)} replies)` : ''}` },
            { label: 'Interviews Scheduled', value: stats.interviews },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '16px', background: '#F9F9F9', borderRadius: 12, border: '1px solid #F0F0F0' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#E85D20', margin: 0 }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 20px' }}>
        {/* "Did you hear back?" status check for stale applications */}
        <StatusCheckBanner
          applications={applications}
          onRespond={async (app, newStatus) => {
            await base44.entities.NetworkingPipeline.update(app.id, {
              status: TRACKER_STATUS_TO_PIPELINE[newStatus] || 'identified',
              status_date: new Date().toISOString(),
            });
            setApplications(prev => prev.map(a => a.id === app.id
              ? { ...a, status: newStatus, nextAction: newStatus === 'interviewing' ? 'Prep for interview' : newStatus === 'offered' ? 'Review offer' : newStatus === 'rejected' ? '—' : 'Wait for response' }
              : a));
          }}
        />

        {/* Connect Email Button */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowEmailModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fff5f0', border: '1.5px solid #E85D20',
                color: '#E85D20', padding: '12px 20px', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: dm, minHeight: 'auto',
              }}
            >
              <Mail size={16} />
              Connect Email for Auto-Import
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, color: '#999', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by company or job title"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 8,
                padding: '10px 12px 10px 36px', outline: 'none', fontFamily: dm,
              }}
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 12px',
              outline: 'none', fontFamily: dm, background: '#fff', cursor: 'pointer', minHeight: 'auto',
            }}
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="in_review">In Review</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offer Received</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 12px',
              outline: 'none', fontFamily: dm, background: '#fff', cursor: 'pointer', minHeight: 'auto',
            }}
          >
            <option value="date">Date Applied (Newest)</option>
            <option value="company">Company</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
            <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #F0E5DE', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 14, color: '#888', marginTop: 16 }}>Loading your applications…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : /* Empty State */
        applications.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontFamily: pf, fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              No applications tracked yet
            </h3>
            <p style={{ fontSize: 14, color: '#666', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Once you apply or connect your email, applications will appear here automatically.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setShowAddModal(true)} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto' }}>
                + Add Application Manually
              </button>
              <button onClick={() => setShowEmailModal(true)} style={{ background: '#FFF5F0', color: '#E85D20', border: '1.5px solid #E85D20', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto' }}>
                Connect Email for Auto-Import
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* No results for current search/filter */
          <div style={{ background: '#fff', borderRadius: 12, padding: '48px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
            <h3 style={{ fontFamily: pf, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
              No matching applications
            </h3>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.6 }}>
              Nothing matches your current search or filter.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
              style={{ background: '#FFF5F0', color: '#E85D20', border: '1.5px solid #E85D20', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto' }}
            >
              Clear search & filters
            </button>
          </div>
        ) : isMobile ? (
          /* Mobile Card View */
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map(app => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                style={{
                  background: '#fff', borderRadius: 12, padding: '16px 14px', border: '1px solid #E5E5E5',
                  cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 28, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {app.logo}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.jobTitle}
                    </h4>
                    <p style={{ fontSize: 11, color: '#666', margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {app.company} • {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: '#fff', background: STATUS_COLORS[app.status],
                    padding: '4px 10px', borderRadius: 100, flexShrink: 0,
                  }}>
                    {STATUS_LABELS[app.status]}
                  </span>
                  <p style={{ fontSize: 11, color: '#888', margin: 0, letterSpacing: '-0.01em' }}>
                    {app.resumeVersion}
                  </p>
                </div>
                {app.nextAction === 'Send follow-up' && (
                  <button
                    onClick={e => { e.stopPropagation(); setFollowUpApp(app); setShowFollowUpModal(true); }}
                    style={{ marginTop: 12, width: '100%', background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '10px', borderRadius: 8, fontFamily: dm }}
                  >
                    Send follow-up →
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E5E5', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F9F9F9', borderBottom: '1px solid #E5E5E5' }}>
                  {['Company', 'Job Title', 'Date Applied', 'Resume Version', 'Status', 'Next Action'].map(col => (
                    <th
                      key={col}
                      style={{
                        padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#666',
                        fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    style={{
                      borderBottom: '1px solid #F0F0F0', cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{app.logo}</span>
                      <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{app.company}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{app.jobTitle}</td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>
                      {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#666', fontSize: 12, fontFamily: "'Monaco', monospace" }}>
                        {app.resumeVersion}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: '#fff', background: STATUS_COLORS[app.status],
                        padding: '4px 10px', borderRadius: 100, display: 'inline-block',
                      }}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {app.nextAction === 'Send follow-up' ? (
                        <button
                          onClick={e => { e.stopPropagation(); setFollowUpApp(app); setShowFollowUpModal(true); }}
                          style={{ background: '#FFF5F0', border: '1px solid #E85D20', color: '#E85D20', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '5px 12px', borderRadius: 100, fontFamily: dm, minHeight: 'auto', whiteSpace: 'nowrap' }}
                        >
                          Send follow-up
                        </button>
                      ) : (
                        <span style={{ color: '#888', fontSize: 13 }}>{app.nextAction}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedApp && (
        <ApplicationDetailPanel
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={(updatedApp) => {
            setSelectedApp(updatedApp);
            setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
            // Persist status & notes edits to the database (skip non-DB sample ids)
            if (updatedApp.id && !String(updatedApp.id).startsWith('app-')) {
              base44.entities.NetworkingPipeline.update(updatedApp.id, {
                status: TRACKER_STATUS_TO_PIPELINE[updatedApp.status] || 'identified',
                notes: updatedApp.notes || '',
              }).catch(() => {});
            }
          }}
          onFollowUp={() => setShowFollowUpModal(true)}
          onReminder={() => setShowReminderModal(true)}
        />
      )}

      {/* Floating Action Button */}
      {!isMobile && (
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, borderRadius: '50%',
            background: '#E85D20', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(232, 93, 32, 0.3)', transition: 'all 0.2s', minHeight: 'auto',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          +
        </button>
      )}

      {/* Add Application Modal */}
      <AddApplicationModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={(newApp) => {
          setApplications([newApp, ...applications]);
        }}
      />

      {/* Email Connection Modal */}
      <EmailConnectionModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        onSuccess={() => {
          // Optional: could trigger a success toast or refetch applications here
        }}
      />

      {/* Follow-up Draft Modal */}
      <FollowUpDraftModal 
        isOpen={showFollowUpModal} 
        onClose={() => { setShowFollowUpModal(false); setFollowUpApp(null); }} 
        application={followUpApp || selectedApp}
      />

      {/* Follow-up Reminder Modal */}
      <FollowUpReminderModal 
        isOpen={showReminderModal} 
        onClose={() => setShowReminderModal(false)} 
        application={selectedApp}
      />

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}