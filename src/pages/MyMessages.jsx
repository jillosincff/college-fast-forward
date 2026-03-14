import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import DarkFooter from '@/components/common/DarkFooter';
import ThreadCard from '@/components/messages/ThreadCard';
import MessageFilterTabs from '@/components/messages/MessageFilterTabs';
import FastIQNudgeBar from '@/components/messages/FastIQNudgeBar';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function formatNameClean(raw) {
  if (!raw) return null;
  const s = raw.trim();
  if (s.includes(',')) {
    const [last, rest] = s.split(',').map(p => p.trim());
    const first = rest?.split(/\s+/)[0] || '';
    return `${first} ${last}`.trim();
  }
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export default function MyMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [userLookup, setUserLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [uncontactedMatches, setUncontactedMatches] = useState(0);

  useEffect(() => {
    if (!document.getElementById('msg-fonts')) {
      const link = document.createElement('link');
      link.id = 'msg-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);

    const [allMsgs, users, matches, pipeline] = await Promise.all([
      base44.entities.Message.list('-created_date', 500).catch(() => []),
      base44.entities.User.list('-created_date', 500).catch(() => []),
      base44.entities.Match.filter({ student_email: user.email }, '-match_score', 100).catch(() => []),
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }).catch(() => []),
    ]);

    // Build user lookup
    const lookup = {};
    (users || []).forEach(u => {
      if (u.email) lookup[u.email] = u;
    });
    setUserLookup(lookup);

    // Filter to user's messages only
    const myMsgs = (allMsgs || []).filter(m => m.sender_email === user.email || m.recipient_email === user.email);
    setMessages(myMsgs);

    // FASTIQ nudge: count matched contacts never messaged
    const messagedEmails = new Set();
    myMsgs.forEach(m => {
      if (m.sender_email === user.email) messagedEmails.add(m.recipient_email);
      if (m.recipient_email === user.email) messagedEmails.add(m.sender_email);
    });
    const pipelineEmails = new Set((pipeline || []).map(p => p.alumni_name)); // approx
    const unmessaged = (matches || []).filter(m => {
      const email = m.parent_email || m.peer_email;
      return email && !messagedEmails.has(email);
    });
    setUncontactedMatches(unmessaged.length);

    setLoading(false);
  }, [user?.email]);

  useEffect(() => { loadData(); }, [loadData]);

  // Poll
  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user?.email, loadData]);

  // Listen for refresh events
  useEffect(() => {
    const handler = () => loadData();
    document.addEventListener('cff:refresh-messages', handler);
    return () => document.removeEventListener('cff:refresh-messages', handler);
  }, [loadData]);

  // Build deduplicated threads
  const threads = useMemo(() => {
    if (!user?.email) return [];
    const threadMap = {};

    messages.forEach(msg => {
      const contactEmail = msg.sender_email === user.email ? msg.recipient_email : msg.sender_email;
      if (!contactEmail) return;

      if (!threadMap[contactEmail]) {
        const contactUser = userLookup[contactEmail];
        const rawName = contactUser?.full_name || msg.sender_name || contactEmail.split('@')[0];
        threadMap[contactEmail] = {
          contactEmail,
          contactName: rawName,
          contactData: contactUser || {},
          lastMessage: msg,
          lastMessageAt: msg.created_date,
          unreadCount: 0,
          isSentByMe: msg.sender_email === user.email,
        };
      }

      const thread = threadMap[contactEmail];
      if (new Date(msg.created_date) > new Date(thread.lastMessageAt)) {
        thread.lastMessage = msg;
        thread.lastMessageAt = msg.created_date;
        thread.isSentByMe = msg.sender_email === user.email;
      }
      if (msg.recipient_email === user.email && !msg.is_read) {
        thread.unreadCount++;
      }
    });

    return Object.values(threadMap).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  }, [messages, userLookup, user?.email]);

  // Filter threads
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      if (filter === 'unread') return t.unreadCount > 0;
      if (filter === 'parents') {
        const p = t.contactData?.persona || t.contactData?.roles?.[0];
        return p === 'parent';
      }
      if (filter === 'alumni') {
        const p = t.contactData?.persona || t.contactData?.roles?.[0];
        return p === 'alumni';
      }
      return true;
    });
  }, [threads, filter]);

  const totalUnread = threads.filter(t => t.unreadCount > 0).length;

  const handleThreadClick = async (thread) => {
    // Mark messages as read
    const unreadMsgs = messages.filter(m => m.recipient_email === user.email && m.sender_email === thread.contactEmail && !m.is_read);
    for (const msg of unreadMsgs) {
      base44.entities.Message.update(msg.id, { is_read: true, read_at: new Date().toISOString() }).catch(() => {});
    }
    // Navigate to message composer with this contact
    navigate('MessageComposer', { to: thread.contactEmail, name: formatNameClean(thread.contactName) });
  };

  const filterLabels = { all: 'All', unread: 'unread', parents: 'parent', alumni: 'alumni' };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav user={user} currentPage="MyMessages" />

      <main className="msg-page-main" style={{ flex: 1, maxWidth: 720, margin: '0 auto', width: '100%', padding: '32px 24px 60px' }}>
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
        <div style={{ marginBottom: 24, animation: 'msgFadeUp 0.4s ease both' }}>
          <h1 style={{
            fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a',
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 4,
          }}>
            My <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Messages</span>
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
            {totalUnread > 0 ? (
              <><span style={{ color: '#E85D20', fontWeight: 500 }}>{totalUnread} unread</span> · {threads.length} conversation{threads.length !== 1 ? 's' : ''}</>
            ) : (
              <><span style={{ color: '#2e7d32', fontWeight: 500 }}>All caught up</span> · {threads.length} conversation{threads.length !== 1 ? 's' : ''}</>
            )}
          </p>
        </div>

        {/* Filter tabs */}
        <MessageFilterTabs active={filter} onChange={setFilter} />

        {/* FASTIQ nudge */}
        <FastIQNudgeBar uncontactedCount={uncontactedMatches} />

        {/* Threads */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #E85D20', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filteredThreads.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredThreads.map((thread, i) => (
              <ThreadCard
                key={thread.contactEmail}
                thread={thread}
                currentUserEmail={user.email}
                index={i}
                onClick={() => handleThreadClick(thread)}
              />
            ))}
          </div>
        ) : threads.length === 0 ? (
          /* No conversations at all */
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16,
            padding: '48px 32px', textAlign: 'center',
            animation: 'msgFadeUp 0.4s ease 0.1s both',
          }}>
            <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>No messages yet.</h3>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', lineHeight: 1.6, maxWidth: 360, margin: '0 auto 20px' }}>
              Start a conversation with one of your matches — they've already agreed to help.
            </p>
            <button onClick={() => navigate('MyMatches')} style={{
              background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
              borderRadius: 100, padding: '10px 24px', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', minHeight: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
            >Go to My Matches →</button>
          </div>
        ) : (
          /* No results for filter */
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16,
            padding: '48px 32px', textAlign: 'center',
            animation: 'msgFadeUp 0.4s ease 0.1s both',
          }}>
            <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 8 }}>
              No {filterLabels[filter]} messages.
            </h3>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888' }}>You're all caught up.</p>
          </div>
        )}
      </main>

      <DarkFooter />

      <style>{`
        @keyframes msgFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) {
          .msg-page-main { padding: 20px 16px 48px !important; }
        }
      `}</style>
    </div>
  );
}