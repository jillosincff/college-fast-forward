import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import DarkFooter from '@/components/common/DarkFooter';
import PipelineStatsRow from '@/components/pipeline/PipelineStatsRow';
import PipelineFilterRow from '@/components/pipeline/PipelineFilterRow';
import PipelineCard from '@/components/pipeline/PipelineCard';
import AddConnectionModal from '@/components/pipeline/AddConnectionModal';
import { daysSince } from '@/components/pipeline/PipelineConstants';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const STAGE_ORDER = ['matched', 'messaged', 'replied', 'coffee_chat', 'intro_made', 'offer'];

function needsAction(conn) {
  if (conn.status === 'matched' && !conn.reached_out_date) return true;
  if (conn.status === 'messaged' && daysSince(conn.status_date) >= 7) return true;
  if (conn.status === 'replied' && daysSince(conn.replied_date) >= 7) return true;
  if (conn.status === 'coffee_chat') return true;
  return false;
}

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statsFilter, setStatsFilter] = useState(null);
  const [tab, setTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (!document.getElementById('pipeline-fonts')) {
      const link = document.createElement('link');
      link.id = 'pipeline-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    loadConnections();
  }, [user?.email]);

  const loadConnections = async () => {
    setLoading(true);
    const data = await base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-status_date');
    setConnections(data || []);
    setLoading(false);
  };

  const handleAddConnection = async (data) => {
    const created = await base44.entities.NetworkingPipeline.create({ ...data, user_email: user.email });
    setConnections(prev => [created, ...prev]);
  };

  const handleUpdateStage = async (id, newStage) => {
    const updates = { status: newStage, status_date: new Date().toISOString() };
    if (newStage === 'messaged') updates.reached_out_date = new Date().toISOString();
    if (newStage === 'replied') updates.replied_date = new Date().toISOString();
    if (newStage === 'coffee_chat') updates.interview_date = new Date().toISOString();
    if (newStage === 'offer') updates.offer_date = new Date().toISOString();

    await base44.entities.NetworkingPipeline.update(id, updates);
    setConnections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Filter + sort
  let filtered = [...connections];

  // Stats filter (by stage)
  if (statsFilter && statsFilter !== 'all') {
    filtered = filtered.filter(c => c.status === statsFilter);
  }

  // Tab filter
  if (tab === 'needs_action') filtered = filtered.filter(needsAction);
  else if (tab === 'matched') filtered = filtered.filter(c => c.status === 'matched');
  else if (tab === 'in_progress') filtered = filtered.filter(c => ['messaged', 'replied', 'coffee_chat'].includes(c.status));
  else if (tab === 'won') filtered = filtered.filter(c => ['intro_made', 'offer'].includes(c.status));

  // Sort
  if (sortBy === 'stage') filtered.sort((a, b) => STAGE_ORDER.indexOf(a.status) - STAGE_ORDER.indexOf(b.status));
  else if (sortBy === 'name') filtered.sort((a, b) => (a.alumni_name || '').localeCompare(b.alumni_name || ''));
  else filtered.sort((a, b) => new Date(b.status_date || b.created_date) - new Date(a.status_date || a.created_date));

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav user={user} currentPage="Pipeline" />

      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '32px 24px 60px' }}>
        {/* Back link */}
        <button onClick={() => navigate('Dashboard')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888',
          transition: 'color 0.2s', minHeight: 'auto', width: 'auto', padding: 0,
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E85D20'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#888'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back to Dashboard
        </button>

        {/* Page header */}
        <div className="pipeline-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28,
          animation: 'pipelineFadeUp 0.4s ease both',
        }}>
          <div>
            <h1 style={{
              fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a',
              letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6,
            }}>
              My <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Connection Pipeline</span>
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.5, margin: 0 }}>
              Track every warm connection — from first message to offer. This is how careers actually start.
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="pipeline-add-btn" style={{
            background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            borderRadius: 100, padding: '10px 20px', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            whiteSpace: 'nowrap', minHeight: 'auto', width: 'auto', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; e.currentTarget.style.transform = 'none'; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
            Add Connection
          </button>
        </div>

        {/* Stats */}
        <div style={{ animation: 'pipelineFadeUp 0.4s ease 0.06s both' }}>
          <PipelineStatsRow connections={connections} activeFilter={statsFilter} onFilter={setStatsFilter} />
        </div>

        {/* Filters */}
        <div style={{ animation: 'pipelineFadeUp 0.4s ease 0.1s both' }}>
          <PipelineFilterRow activeTab={tab} onTabChange={setTab} sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E85D20', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((conn, i) => (
            <div key={conn.id} style={{ animation: `pipelineFadeUp 0.4s ease ${0.14 + i * 0.04}s both` }}>
              <PipelineCard conn={conn} index={i} onUpdateStage={handleUpdateStage} />
            </div>
          ))
        ) : connections.length === 0 ? (
          /* Empty state */
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16,
            padding: '48px 32px', textAlign: 'center',
          }}>
            <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>Your pipeline is empty.</h3>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', lineHeight: 1.6, marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
              Every warm intro starts with a first message. Go to your matches and start a conversation — it'll show up here automatically.
            </p>
            <button onClick={() => navigate('MyMatches')} style={{
              background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
              borderRadius: 100, padding: '10px 24px', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', minHeight: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
            >
              Go to My Matches →
            </button>
          </div>
        ) : (
          /* Filter returned no results */
          <div style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888' }}>No connections match this filter.</p>
          </div>
        )}
      </main>

      <DarkFooter />
      {showModal && <AddConnectionModal onClose={() => setShowModal(false)} onSubmit={handleAddConnection} />}

      <style>{`
        @keyframes pipelineFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) {
          .pipeline-header { flex-direction: column !important; gap: 16px !important; }
          .pipeline-add-btn { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}