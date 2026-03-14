import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import DarkFooter from '@/components/common/DarkFooter';
import RequestCard from '@/components/requests/RequestCard';
import RequestModal from '@/components/requests/RequestModal';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function MyRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  useEffect(() => {
    if (!document.getElementById('requests-fonts')) {
      const link = document.createElement('link');
      link.id = 'requests-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    const [jobByCreator, jobByPoster, helpByCreator, helpByStudent] = await Promise.all([
      base44.entities.JobRequest.filter({ created_by: user.email }, '-created_date').catch(() => []),
      base44.entities.JobRequest.filter({ poster_email: user.email }, '-created_date').catch(() => []),
      base44.entities.HelpRequest.filter({ created_by: user.email }, '-created_date').catch(() => []),
      base44.entities.HelpRequest.filter({ student_email: user.email }, '-created_date').catch(() => []),
    ]);
    const allJob = [...(jobByCreator || []), ...(jobByPoster || [])];
    const allHelp = [...(helpByCreator || []), ...(helpByStudent || [])];
    const uniqueJob = Array.from(new Map(allJob.map(r => [r.id, { ...r, _type: 'job' }])).values());
    const uniqueHelp = Array.from(new Map(allHelp.map(r => [r.id, { ...r, _type: 'help' }])).values());
    const all = [...uniqueJob, ...uniqueHelp].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    setRequests(all);
    setLoading(false);
  }, [user?.email]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleSubmit = async (data, existingRequest) => {
    if (existingRequest) {
      const entity = existingRequest._type === 'help' ? base44.entities.HelpRequest : base44.entities.JobRequest;
      await entity.update(existingRequest.id, data);
    } else {
      await base44.entities.HelpRequest.create({
        ...data,
        student_id: user.id,
        student_email: user.email,
        student_name: user.full_name,
        help_types: ['career_advice'],
        timeline: 'no_rush',
        status: 'active',
      });
    }
    await loadRequests();
  };

  const handleDelete = async (id, request) => {
    const entity = request._type === 'help' ? base44.entities.HelpRequest : base44.entities.JobRequest;
    await entity.delete(id);
    setTimeout(() => setRequests(prev => prev.filter(r => r.id !== id)), 300);
  };

  const handleRenew = async (request) => {
    const entity = request._type === 'help' ? base44.entities.HelpRequest : base44.entities.JobRequest;
    await entity.update(request.id, { status: 'active' });
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'active' } : r));
  };

  const handleViewResponses = (request) => {
    navigate('QuestionDetail', { id: request.id });
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setShowModal(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav user={user} currentPage="MyRequests" />

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%', padding: '32px 24px 60px' }}>
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

        {/* Header */}
        <div className="req-page-header" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28,
          animation: 'pipelineFadeUp 0.4s ease both',
        }}>
          <div>
            <h1 style={{
              fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a',
              letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6,
            }}>
              My <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Help Requests</span>
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.5, margin: 0 }}>
              Questions you've posted to the CFF network. Parents and alumni respond directly.
            </p>
          </div>
          <button onClick={() => { setEditingRequest(null); setShowModal(true); }} className="req-post-btn" style={{
            background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
            borderRadius: 100, padding: '10px 20px', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            whiteSpace: 'nowrap', minHeight: 'auto', width: 'auto', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; e.currentTarget.style.transform = 'none'; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg>
            Post a New Request →
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E85D20', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : requests.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map((req, i) => (
              <RequestCard
                key={req.id}
                request={req}
                index={i}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRenew={handleRenew}
                onViewResponses={handleViewResponses}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16,
            padding: '48px 32px', textAlign: 'center',
            animation: 'pipelineFadeUp 0.4s ease 0.08s both',
          }}>
            <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>
              You haven't asked for help yet.
            </h3>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 20px' }}>
              Post a question to the CFF network and parents or alumni in your field will respond directly. Most questions get a reply within 48 hours.
            </p>
            <button onClick={() => { setEditingRequest(null); setShowModal(true); }} style={{
              background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
              borderRadius: 100, padding: '10px 24px', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', minHeight: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
            >
              Post Your First Request →
            </button>
          </div>
        )}
      </main>

      <DarkFooter />
      {showModal && (
        <RequestModal
          request={editingRequest}
          onClose={() => { setShowModal(false); setEditingRequest(null); }}
          onSubmit={handleSubmit}
        />
      )}

      <style>{`
        @keyframes pipelineFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) {
          .req-page-header { flex-direction: column !important; gap: 16px !important; }
          .req-post-btn { width: 100% !important; justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}