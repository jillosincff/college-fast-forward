import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import AddApplicationModal from '@/components/tracker/AddApplicationModal';
import FollowUpDraftModal from '@/components/tracker/FollowUpDraftModal';
import FollowUpReminderModal from '@/components/tracker/FollowUpReminderModal';
import ApplicationDetailPanel from '@/components/tracker/ApplicationDetailPanel';
import MissionStats from '@/components/tracker/mission/MissionStats';
import AttentionBanner from '@/components/tracker/mission/AttentionBanner';
import MissionAppCard from '@/components/tracker/mission/MissionAppCard';
import { deriveInsight, FILTERS } from '@/components/tracker/mission/trackerLogic';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

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

function pipelineToApp(record) {
  return {
    id: record.id,
    company: record.company || '—',
    logo: (record.company?.[0] || '?').toUpperCase(),
    jobTitle: record.job_title || '—',
    dateApplied: record.created_date,
    statusDate: record.status_date || record.updated_date || record.created_date,
    followUpCount: record.follow_up_count || 0,
    resumeVersion: extractResumeVersion(record.notes),
    status: PIPELINE_STATUS_MAP[record.status] || 'applied',
    notes: record.notes || '',
    location: record.location || '',
    jobUrl: record.job_url || '',
  };
}

// Today's Mission → Tracker sync: ?highlight=Company auto-highlights that card
function readHighlightParam() {
  try {
    return (new URLSearchParams(window.location.hash.split('?')[1] || '').get('highlight') || '').toLowerCase();
  } catch { return ''; }
}

export default function ApplicationTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('attention'); // students see work first
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpApp, setFollowUpApp] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [highlight] = useState(readHighlightParam);

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

  // Every application gets a health + recommendation — never a blank Next Action
  const items = applications.map(app => ({ app, insight: deriveInsight(app) }));

  const isHighlighted = (item) => highlight && item.app.company.toLowerCase().includes(highlight);

  // Highest-priority application for the attention banner
  const topAttention = items
    .filter(i => i.insight.group === 'attention' && i.insight.action?.type !== 'none')
    .sort((a, b) => (isHighlighted(b) ? 1000 : b.insight.priority) - (isHighlighted(a) ? 1000 : a.insight.priority))[0] || null;

  const attentionCount = items.filter(i => i.insight.group === 'attention').length;
  const reassurance = items.length === 0
    ? "Track your first application and I'll take it from there."
    : attentionCount === 0
      ? 'Everything important is under control.'
      : "You're making good progress — a couple of things need your attention.";

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.id] = items.filter(i => i.insight.group === f.id).length;
    return acc;
  }, {});

  const visible = items
    .filter(i => i.insight.group === filter)
    .sort((a, b) => (isHighlighted(b) ? 1000 : b.insight.priority) - (isHighlighted(a) ? 1000 : a.insight.priority));

  // Dispatch a card's next action
  const handleAction = (item) => {
    const type = item.insight.action?.type;
    if (type === 'followup') { setFollowUpApp(item.app); setShowFollowUpModal(true); }
    else if (type === 'practice') navigate('MockInterview');
    else if (type === 'detail') setSelectedApp(item.app);
  };

  // Contextual chat — CLIFF arrives already knowing this application
  const handleAskCliff = (item) => {
    navigate('cliff-chat', {
      company: item.app.company,
      role: item.app.jobTitle !== '—' ? item.app.jobTitle : '',
      stage: item.insight.stage,
      context: 'application',
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: dm }}>
      {/* Hero */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <button
            onClick={() => navigate('FreeTierDashboard')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#666', fontSize: 14, fontWeight: 600, fontFamily: dm, cursor: 'pointer', padding: 0, marginBottom: 12, minHeight: 'auto', minWidth: 'auto' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 style={{ fontFamily: dm, fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
            Your Applications
          </h1>
          <p style={{ fontSize: 14.5, color: '#4b5563', margin: '0 0 6px', lineHeight: 1.6, maxWidth: 560 }}>
            CLIFF is actively tracking every opportunity and will tell you exactly what needs attention next.
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', margin: 0 }}>
            {reassurance}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 20px 80px' }}>
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
            <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #ede9fe', borderTopColor: '#6d28d9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 14, color: '#888', marginTop: 16 }}>CLIFF is checking your applications…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontFamily: dm, fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              No applications tracked yet
            </h3>
            <p style={{ fontSize: 14, color: '#666', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Track your first application and CLIFF will watch it, remind you at the right moments, and tell you exactly what to do next.
            </p>
            <button onClick={() => setShowAddModal(true)} style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: dm, minHeight: 'auto', boxShadow: '0 8px 24px rgba(109,40,217,0.30)' }}>
              + Add Application
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <MissionStats items={items} />
            </div>

            <AttentionBanner item={topAttention} onAction={handleAction} />

            {/* Filter pills — work first */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {FILTERS.map(f => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    style={{
                      fontFamily: dm, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 40,
                      color: active ? '#fff' : '#4b5563',
                      background: active ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
                      border: active ? 'none' : '1px solid #e5e7eb',
                      borderRadius: 100, padding: '8px 16px',
                    }}
                  >
                    {f.label}{counts[f.id] > 0 ? ` · ${counts[f.id]}` : ''}
                  </button>
                );
              })}
            </div>

            {visible.length === 0 ? (
              filter === 'attention' ? (
                <div style={{ background: '#fff', borderRadius: 14, padding: '48px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
                  <h3 style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
                    Everything is under control.
                  </h3>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
                    Nothing requires your attention today. CLIFF is monitoring your applications — come back tomorrow.
                  </p>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, padding: '36px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
                  <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Nothing here right now.</p>
                </div>
              )
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {visible.map(item => (
                  <MissionAppCard
                    key={item.app.id}
                    item={item}
                    highlighted={isHighlighted(item)}
                    onAction={handleAction}
                    onAskCliff={handleAskCliff}
                    onOpen={setSelectedApp}
                  />
                ))}
              </div>
            )}
          </>
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
            if (updatedApp.id && !String(updatedApp.id).startsWith('app-')) {
              base44.entities.NetworkingPipeline.update(updatedApp.id, {
                status: TRACKER_STATUS_TO_PIPELINE[updatedApp.status] || 'identified',
                status_date: new Date().toISOString(),
                notes: updatedApp.notes || '',
              }).catch(() => {});
            }
          }}
          onFollowUp={() => setShowFollowUpModal(true)}
          onReminder={() => setShowReminderModal(true)}
        />
      )}

      {/* Floating add button */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(109,40,217,0.35)', minHeight: 'auto', zIndex: 50,
        }}
      >
        +
      </button>

      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(newApp) => setApplications([newApp, ...applications])}
      />

      <FollowUpDraftModal
        isOpen={showFollowUpModal}
        onClose={() => { setShowFollowUpModal(false); setFollowUpApp(null); }}
        application={followUpApp || selectedApp}
      />

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