import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Plus } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import AddApplicationModal from '@/components/tracker/AddApplicationModal';
import TrackerAppCard from '@/components/tracker/simple/TrackerAppCard';
import { TABS, getStatusGroup } from '@/lib/simpleTracker';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const EMPTY_MESSAGES = {
  applied: 'No applications in progress yet.',
  waiting: 'Nothing waiting on you right now.',
  interviews: 'No interviews scheduled yet.',
  offers: "No offers yet — they're coming.",
  done: 'Nothing here yet.',
};

export default function ApplicationTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('applied');
  const [showAddModal, setShowAddModal] = useState(false);

  const loadApps = (email) => {
    base44.entities.NetworkingPipeline.filter({ user_email: email }, '-created_date', 200)
      .then(records => setApplications(records))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    loadApps(user.email);
  }, [user?.email]);

  const counts = TABS.reduce((acc, t) => {
    acc[t.id] = applications.filter(a => getStatusGroup(a.status) === t.id).length;
    return acc;
  }, {});

  const visible = applications
    .filter(a => getStatusGroup(a.status) === filter)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  // Status moves from user actions — each button maps to a concrete pipeline status
  const handleTransition = (app, targetStatus) => {
    const updates = { status: targetStatus, status_date: new Date().toISOString() };
    if (targetStatus === 'interview') updates.interview_date = new Date().toISOString();
    if (targetStatus === 'offer') updates.offer_date = new Date().toISOString();
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, ...updates } : a));
    if (!String(app.id).startsWith('app-')) {
      base44.entities.NetworkingPipeline.update(app.id, updates).catch(() => {});
    }
  };

  // Follow-up sent: stay in Applied, just log the date so the nudge retires
  const handleLogFollowUp = (app) => {
    const now = new Date().toISOString();
    const updates = { reached_out_date: now, follow_up_count: (app.follow_up_count || 0) + 1 };
    setApplications(prev => prev.map(a => a.id === app.id ? { ...a, ...updates } : a));
    if (!String(app.id).startsWith('app-')) {
      base44.entities.NetworkingPipeline.update(app.id, updates).catch(() => {});
    }
  };

  const handleDelete = (app) => {
    if (!app?.id) return;
    const label = `${app.company}${app.job_title ? ` · ${app.job_title}` : ''}`;
    if (!window.confirm(`Remove "${label}" from your tracker?`)) return;
    setApplications(prev => prev.filter(a => a.id !== app.id));
    if (!String(app.id).startsWith('app-')) {
      base44.entities.NetworkingPipeline.delete(app.id).catch(() => {});
    }
  };

  const reassurance = applications.length === 0
    ? "Add an application you've submitted and I'll help you track what's next."
    : "Track your applications and I'll suggest the next small step.";

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
          <p style={{ fontSize: 14.5, fontWeight: 600, color: '#4b5563', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
            {reassurance}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 20px 80px' }}>
        {loading ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
            <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #ede9fe', borderTopColor: '#6d28d9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: 14, color: '#888', marginTop: 16 }}>Loading your applications…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontFamily: dm, fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              No applications tracked yet
            </h3>
            <p style={{ fontSize: 14, color: '#666', maxWidth: 380, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Add an application you've already submitted and CLIFF will help you track what's next.
            </p>
            <button onClick={() => setShowAddModal(true)} style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: dm, minHeight: 'auto', boxShadow: '0 8px 24px rgba(109,40,217,0.30)' }}>
              + Add Application
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {TABS.map(t => {
                const active = filter === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    style={{
                      fontFamily: dm, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 40,
                      color: active ? '#fff' : '#4b5563',
                      background: active ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#fff',
                      border: active ? 'none' : '1px solid #e5e7eb',
                      borderRadius: 100, padding: '8px 16px',
                    }}
                  >
                    {t.label}{counts[t.id] > 0 ? ` · ${counts[t.id]}` : ''}
                  </button>
                );
              })}
            </div>

            {visible.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: '48px 32px', textAlign: 'center', border: '1px solid #E5E5E5' }}>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{EMPTY_MESSAGES[filter]}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560, margin: '0 auto' }}>
                {visible.map(app => (
                  <TrackerAppCard
                    key={app.id}
                    app={app}
                    user={user}
                    onTransition={handleTransition}
                    onLogFollowUp={handleLogFollowUp}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating add button */}
      {applications.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom))', right: 20, width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', color: '#fff', border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(109,40,217,0.35)', minHeight: 'auto', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Plus size={24} />
        </button>
      )}

      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { if (user?.email) loadApps(user.email); }}
      />
    </div>
  );
}