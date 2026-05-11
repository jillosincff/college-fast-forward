import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Search, Filter, Plus, MapPin, Calendar, Mail } from 'lucide-react';
import AddApplicationModal from '@/components/tracker/AddApplicationModal';
import EmailConnectionModal from '@/components/tracker/EmailConnectionModal';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

// Fake data for now
const SAMPLE_APPS = [
  { id: 1, company: 'Disney', logo: '🏰', jobTitle: 'Marketing Intern', dateApplied: '2025-03-12', resumeVersion: 'v2.1', status: 'interviewing', nextAction: 'Prepare for Interview' },
  { id: 2, company: 'Google', logo: '🔵', jobTitle: 'Software Engineer Intern', dateApplied: '2025-03-10', resumeVersion: 'v3.0', status: 'applied', nextAction: '—' },
  { id: 3, company: 'JPMorgan', logo: '💼', jobTitle: 'Finance Analyst', dateApplied: '2025-03-05', resumeVersion: 'v1.8', status: 'rejected', nextAction: '—' },
  { id: 4, company: 'Microsoft', logo: '⚪', jobTitle: 'Product Manager Intern', dateApplied: '2025-03-01', resumeVersion: 'v2.1', status: 'in_review', nextAction: 'Follow up' },
  { id: 5, company: 'Amazon', logo: '🔶', jobTitle: 'Data Scientist Intern', dateApplied: '2025-02-28', resumeVersion: 'v3.0', status: 'offered', nextAction: 'Decide by April 1' },
];

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
  const [applications, setApplications] = useState(SAMPLE_APPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        {/* Connect Email Button */}
        <div style={{ marginBottom: 20 }}>
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

        {/* Empty State */}
        {applications.length === 0 ? (
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
        ) : isMobile ? (
          /* Mobile Card View */
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map(app => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                style={{
                  background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #E5E5E5',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 28, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {app.logo}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px', fontSize: 14 }}>
                      {app.jobTitle}
                    </h4>
                    <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                      {app.company} • {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: '#fff', background: STATUS_COLORS[app.status],
                    padding: '4px 10px', borderRadius: 100,
                  }}>
                    {STATUS_LABELS[app.status]}
                  </span>
                  <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                    {app.resumeVersion}
                  </p>
                </div>
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
                      <button style={{ background: 'none', border: 'none', color: '#0021A5', fontSize: 12, fontFamily: "'Monaco', monospace", cursor: 'pointer', textDecoration: 'underline', padding: 0, minHeight: 'auto' }}>
                        {app.resumeVersion}
                      </button>
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
                      {app.nextAction === '—' ? (
                        <span style={{ color: '#888' }}>—</span>
                      ) : (
                        <button style={{ background: 'none', border: 'none', color: '#E85D20', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0, minHeight: 'auto' }}>
                          {app.nextAction}
                        </button>
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
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 100, display: 'flex', alignItems: 'flex-end',
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            style={{
              width: '100%', maxWidth: 400, background: '#fff', borderRadius: '20px 20px 0 0',
              padding: 24, maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 36 }}>{selectedApp.logo}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px', fontSize: 16 }}>
                  {selectedApp.jobTitle}
                </h3>
                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{selectedApp.company}</p>
              </div>
            </div>

            {/* Info */}
            <div style={{ background: '#F9F9F9', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.05em' }}>
                  Date Applied
                </p>
                <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0 }}>
                  {new Date(selectedApp.dateApplied).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.05em' }}>
                  Resume Version
                </p>
                <p style={{ fontSize: 14, color: '#1A1A1A', margin: 0 }}>
                  {selectedApp.resumeVersion} <button style={{ background: 'none', border: 'none', color: '#E85D20', cursor: 'pointer', fontSize: 12, padding: 0, minHeight: 'auto' }}>
                    (View)
                  </button>
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.05em' }}>
                  Status
                </p>
                <select style={{
                  fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 6, padding: '8px 10px',
                  width: '100%', outline: 'none', fontFamily: dm, cursor: 'pointer', minHeight: 'auto',
                }}>
                  <option>{STATUS_LABELS[selectedApp.status]}</option>
                  <option>Applied</option>
                  <option>In Review</option>
                  <option>Interviewing</option>
                  <option>Offer Received</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>
                Notes
              </p>
              <textarea
                placeholder="Add notes about this application..."
                style={{
                  width: '100%', minHeight: 80, fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 8,
                  padding: 10, outline: 'none', fontFamily: dm, resize: 'vertical',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gap: 10 }}>
              <button style={{
                background: '#E85D20', color: '#fff', border: 'none', borderRadius: 8, padding: '12px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
              }}>
                Let the Agent Draft a Follow-up
              </button>
              <button style={{
                background: '#FFF5F0', color: '#E85D20', border: '1px solid #E85D20', borderRadius: 8,
                padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
              }}>
                Add Follow-up Reminder
              </button>
              <button style={{
                background: '#F9F9F9', color: '#666', border: '1px solid #E0E0E0', borderRadius: 8,
                padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
              }}>
                Link to Job Posting
              </button>
            </div>

            <button
              onClick={() => setSelectedApp(null)}
              style={{
                width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#888',
                fontSize: 13, cursor: 'pointer', fontFamily: dm, minHeight: 'auto', padding: 8,
              }}
            >
              Close
            </button>
          </div>
        </div>
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

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}