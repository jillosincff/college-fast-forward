import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { JobRequest } from '@/entities/JobRequest';
import { HelpRequest } from '@/entities/HelpRequest';
import { Answer } from '@/entities/Answer';
import { JobAnswer } from '@/entities/JobAnswer';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import DarkFooter from '@/components/common/DarkFooter';
import AskBox from '@/components/community/AskBox';
import PostQuestionModal from '@/components/community/PostQuestionModal';
import NetworkPostCard from '@/components/community/NetworkPostCard';
import NetworkSidebar from '@/components/community/NetworkSidebar';


const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'needs_answer', label: 'Needs Answer' },
  { id: 'networking', label: 'Networking' },
  { id: 'career_path', label: 'Career Path' },
  { id: 'first_job', label: 'First Job' },
  { id: 'industry', label: 'Industry' },
];

const CATEGORY_MAP = {
  networking: ['networking_intros', 'networking', 'informational_interview'],
  career_path: ['career_advice', 'direction', 'career_path'],
  first_job: ['internship_leads', 'resume_review', 'interview_prep', 'first_job', 'job_search', 'resume', 'interviews'],
  industry: ['industry_insights', 'industry'],
};

export default function ConnectionsPage() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [posting, setPosting] = useState(false);
  const [topAnswers, setTopAnswers] = useState({});
  const [stats, setStats] = useState({ totalQuestions: 0, totalAnswers: 0, needsAnswer: 0, membersHelping: 0 });

  useEffect(() => {
    if (!document.getElementById('atn-fonts')) {
      const link = document.createElement('link');
      link.id = 'atn-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [jobRequests, helpRequests, directoryResponse] = await Promise.all([
      JobRequest.filter({ status: 'active' }, '-created_date', 200).catch(() => []),
      HelpRequest.filter({ status: 'active' }, '-created_date', 200).catch(() => []),
      base44.entities.User.filter({ onboarding_completed: true }, '-created_date', 300).then(users => ({ data: { data: users || [] } })).catch(() => ({ data: { data: [] } })),
    ]);

    const normalized = (helpRequests || []).map(hr => ({
      ...hr, role: hr.help_types?.join(', ') || 'Career Help',
      target_industry: hr.industry, poster_name: hr.student_name,
      poster_type: hr.poster_type || 'student', created_by: hr.student_email || hr.created_by, _source: 'HelpRequest',
    }));
    const all = [
      ...(jobRequests || []).map(jr => ({ ...jr, _source: 'JobRequest' })),
      ...normalized,
    ].filter(r => {
      const d = r.description?.toLowerCase() || '';
      return !d.includes('test request') && !d.includes('notification testing') && !d.includes('demo');
    }).map(r => ({
      ...r, answer_count: r.answer_count || 0, total_upvotes: r.total_upvotes || 0,
      view_count: r.view_count || r.views_count || 0,
    }));
    all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    setRequests(all);
    setAllUsers(directoryResponse?.data?.data || []);

    const totalAnswers = all.reduce((s, r) => s + (r.answer_count || 0), 0);
    const needsAnswer = all.filter(r => (r.answer_count || 0) === 0).length;
    setStats({ totalQuestions: all.length, totalAnswers, needsAnswer, membersHelping: Math.min(all.length, 50) });
    setLoading(false);

    // Load top answers for first 20
    loadTopAnswers(all.slice(0, 20));
  }, []);

  const loadTopAnswers = async (reqs) => {
    const map = {};
    await Promise.all(reqs.map(async (r) => {
      try {
        const [a1, a2] = await Promise.all([
          Answer.filter({ question_id: r.id }, '-upvote_count', 1).catch(() => []),
          JobAnswer.filter({ job_request_id: r.id }, '-upvote_count', 1).catch(() => []),
        ]);
        const norm = (a2 || []).map(ja => ({ ...ja, answerer_name: ja.responder_name, answerer_title: ja.responder_title, answerer_company: ja.responder_company, answer_text: ja.message }));
        const best = [...(a1 || []), ...norm].sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0))[0];
        if (best) map[r.id] = best;
      } catch (e) { /* skip */ }
    }));
    setTopAnswers(map);
  };

  useEffect(() => { loadData(); }, [loadData]);

  const handleOpenModal = (cat) => {
    setModalCategory(cat || '');
    setShowModal(true);
  };

  const handlePostQuestion = async (data) => {
    if (!user) return;
    setPosting(true);
    const nameParts = (user.full_name || 'Student').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Student';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    await JobRequest.create({
      role: 'Student Question',
      title: data.question,
      description: data.question + (data.context ? '\n\n' + data.context : ''),
      category: data.category,
      target_industry: user?.industries_interested?.[0] || 'Other',
      poster_type: user?.persona === 'parent' ? 'parent' : user?.persona === 'alumni' ? 'alumni' : 'student',
      poster_email: user.email,
      poster_name: user.full_name || 'Student',
      poster_first_name: firstName,
      poster_last_name: lastName,
      student_year: user.graduation_year || '',
      student_major: user.major || '',
      student_minor: user.minor || '',
      status: 'active',
      role_type: 'full_time',
      help_types: data.category ? [data.category] : [],
      start_timing: data.timeline || '',
      location_preference: data.location || '',
    });
    setPosting(false);
    setShowModal(false);
    loadData(true);
  };

  const filteredRequests = useMemo(() => {
    let filtered = [...requests];
    // Hide alumni career from students
    const isStudent = user?.persona === 'gator' || user?.email?.endsWith('@ufl.edu');
    if (isStudent) filtered = filtered.filter(r => !r.is_alumni_career_request);

    if (filter === 'needs_answer') filtered = filtered.filter(r => (r.answer_count || 0) === 0);
    else if (filter !== 'all' && CATEGORY_MAP[filter]) {
      const cats = CATEGORY_MAP[filter];
      filtered = filtered.filter(r => {
        const rCat = r.category || '';
        const rTypes = r.help_types || [];
        return cats.includes(rCat) || rTypes.some(t => cats.includes(t));
      });
    }

    if (sortBy === 'views') filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    else if (sortBy === 'unanswered') filtered.sort((a, b) => (a.answer_count || 0) - (b.answer_count || 0));

    return filtered;
  }, [requests, filter, sortBy, user]);

  const displayed = filteredRequests.slice(0, visibleCount);

  const handleFilterForParents = () => {
    setFilter('needs_answer');
    setTimeout(() => {
      const feed = document.querySelector('.atn-grid');
      if (feed) feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav user={user} currentPage="Ask the Network" />

        <main style={{ flex: 1, maxWidth: 1040, margin: '0 auto', width: '100%', padding: '32px 24px 60px' }}>
          {/* Header */}
          <div style={{ marginBottom: 28, animation: 'atnFadeUp 0.4s ease both' }}>
            <h1 style={{
              fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 32, color: '#E85D20',
              letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8,
            }}>Ask the Network</h1>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', lineHeight: 1.6, maxWidth: 580, margin: 0 }}>
              Real questions. Real answers. Parents and alumni in this network have been where you're going — ask them anything about careers, networking, and figuring it all out.
            </p>
          </div>

          {/* Ask box */}
          <AskBox onOpenModal={handleOpenModal} selectedCategory={modalCategory} onCategorySelect={setModalCategory} />

          {/* Grid layout */}
          <div className="atn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>
            {/* Main feed */}
            <div>
              {/* Filter row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, animation: 'atnFadeUp 0.4s ease 0.1s both', flexWrap: 'wrap', gap: 8 }}>
                <div className="atn-filter-tabs" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {FILTER_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
                      fontFamily: dmSans, fontSize: 12, fontWeight: filter === tab.id ? 500 : 400,
                      color: filter === tab.id ? '#fff' : '#888',
                      background: filter === tab.id ? '#E85D20' : '#fff',
                      border: `0.5px solid ${filter === tab.id ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
                      borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
                      transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
                    }}
                      onMouseEnter={e => { if (filter !== tab.id) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.color = '#E85D20'; }}}
                      onMouseLeave={e => { if (filter !== tab.id) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#888'; }}}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                  fontFamily: dmSans, fontSize: 12, color: '#888', background: '#fff',
                  border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: '5px 10px',
                  outline: 'none', cursor: 'pointer',
                }}>
                  <option value="newest">Newest first</option>
                  <option value="views">Most views</option>
                  <option value="unanswered">Unanswered</option>
                </select>
              </div>

              {/* Posts */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ width: 32, height: 32, border: '3px solid #E85D20', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                </div>
              ) : displayed.length > 0 ? (
                <>
                  {displayed.map((req, i) => {
                    const gator = allUsers.find(u => u.email === req.created_by) || {};
                    return (
                      <NetworkPostCard
                        key={req.id}
                        question={req}
                        gator={gator}
                        index={i}
                        topAnswer={topAnswers[req.id]}
                        user={user}
                      />
                    );
                  })}
                  {filteredRequests.length > visibleCount && (
                    <button onClick={() => setVisibleCount(v => v + 20)} style={{
                      width: '100%', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                      color: '#888', background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                      borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all 0.2s', marginTop: 8,
                    }}>
                      Load More Questions
                    </button>
                  )}
                </>
              ) : (
                <div style={{
                  background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16,
                  padding: '48px 32px', textAlign: 'center',
                }}>
                  <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>No questions yet.</h3>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888' }}>Be the first to ask!</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="atn-sidebar">
              <NetworkSidebar stats={stats} user={user} onFilterForParents={handleFilterForParents} />
            </div>
          </div>
        </main>
        <DarkFooter />

      <PostQuestionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        initialCategory={modalCategory}
        onSubmit={handlePostQuestion}
        loading={posting}
      />

      <style>{`
        @keyframes atnFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) {
          .atn-grid { grid-template-columns: 1fr !important; }
          .atn-sidebar { order: 2; }
          .atn-filter-tabs { overflow-x: auto; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .atn-filter-tabs::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}