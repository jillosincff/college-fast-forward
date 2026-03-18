import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import ParentProfileNav from '@/components/profile/parent/ParentProfileNav';
import ParentMessageFilterTabs from './ParentMessageFilterTabs';
import ParentThreadCard from './ParentThreadCard';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

export default function ParentMessagesView({ user }) {
  const [messages, setMessages] = useState([]);
  const [userLookup, setUserLookup] = useState({});
  const [intros, setIntros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!document.getElementById('pmsg-fonts')) {
      const link = document.createElement('link');
      link.id = 'pmsg-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);

    const [allMsgs, users, myIntros] = await Promise.all([
      base44.entities.Message.list('-created_date', 500).catch(() => []),
      base44.entities.User.list('-created_date', 500).catch(() => []),
      base44.entities.Intro.filter({ helper_user_id: user.id }, '-created_date', 100).catch(() => []),
    ]);

    const lookup = {};
    (users || []).forEach(u => { if (u.email) lookup[u.email] = u; });
    setUserLookup(lookup);
    setIntros(myIntros || []);

    const myMsgs = (allMsgs || []).filter(m => m.sender_email === user.email || m.recipient_email === user.email);
    setMessages(myMsgs);
    setLoading(false);
  }, [user?.email, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user?.email, loadData]);

  useEffect(() => {
    const handler = () => loadData();
    document.addEventListener('cff:refresh-messages', handler);
    return () => document.removeEventListener('cff:refresh-messages', handler);
  }, [loadData]);

  // Build intro email sets for identifying intro conversations
  const introEmailSet = useMemo(() => {
    const set = new Set();
    (intros || []).forEach(intro => {
      if (intro.recipient_email) set.add(intro.recipient_email.toLowerCase());
    });
    return set;
  }, [intros]);

  // Build threads
  const threads = useMemo(() => {
    if (!user?.email) return [];
    const threadMap = {};

    messages.forEach(msg => {
      const contactEmail = msg.sender_email === user.email ? msg.recipient_email : msg.sender_email;
      if (!contactEmail) return;

      if (!threadMap[contactEmail]) {
        const contactUser = userLookup[contactEmail];
        // Name resolution: user record > message sender_name > email (NEVER "Unknown")
        let rawName = null;
        if (contactUser?.full_name && !contactUser.full_name.includes('@')) {
          rawName = contactUser.full_name;
        } else if (contactUser?.first_name && contactUser?.last_name) {
          rawName = `${contactUser.first_name} ${contactUser.last_name}`;
        } else if (msg.sender_email !== user.email && msg.sender_name && msg.sender_name !== 'Unknown') {
          rawName = msg.sender_name;
        }
        // If still null, use email as identifier
        if (!rawName) rawName = contactEmail;

        threadMap[contactEmail] = {
          contactEmail,
          contactName: rawName,
          contactData: contactUser || {},
          lastMessage: msg,
          lastMessageAt: msg.created_date,
          unreadCount: 0,
          isSentByMe: msg.sender_email === user.email,
          isIntro: introEmailSet.has(contactEmail.toLowerCase()),
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
  }, [messages, userLookup, user?.email, introEmailSet]);

  // Filter
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      if (filter === 'unread') return t.unreadCount > 0;
      if (filter === 'direct') {
        const persona = t.contactData?.persona || t.contactData?.roles?.[0];
        return (persona === 'gator' || persona === 'student') && !t.isIntro;
      }
      if (filter === 'intros') return t.isIntro;
      return true;
    });
  }, [threads, filter]);

  const totalUnread = threads.filter(t => t.unreadCount > 0).length;

  const handleThreadClick = async (thread) => {
    const unreadMsgs = messages.filter(m =>
      m.recipient_email === user.email && m.sender_email === thread.contactEmail && !m.is_read
    );
    for (const msg of unreadMsgs) {
      base44.entities.Message.update(msg.id, { is_read: true, read_at: new Date().toISOString() }).catch(() => {});
    }
    const cleanName = thread.contactName?.includes('@') ? thread.contactName : thread.contactName;
    navigate('MessageComposer', { to: thread.contactEmail, name: cleanName });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
      <ParentProfileNav user={user} currentPage="MyMessages" />

      <main className="pmsg-main" style={{ flex: 1, maxWidth: 680, margin: '0 auto', width: '100%', padding: '32px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24, animation: 'pmsgFadeUp 0.4s ease both' }}>
          <h1 style={{
            fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff',
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6,
          }}>
            My <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: ORANGE }}>Messages</span>
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
            {totalUnread > 0 ? (
              <><span style={{ color: ORANGE, fontWeight: 500 }}>{totalUnread} unread</span> · {threads.length} conversation{threads.length !== 1 ? 's' : ''}</>
            ) : (
              <>{threads.length} conversation{threads.length !== 1 ? 's' : ''}</>
            )}
          </p>
        </div>

        {/* Filters */}
        <ParentMessageFilterTabs active={filter} onChange={setFilter} />

        {/* Threads */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 32, height: 32, border: `3px solid rgba(232,93,32,0.3)`, borderTopColor: ORANGE, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filteredThreads.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredThreads.map((thread, i) => (
              <ParentThreadCard
                key={thread.contactEmail}
                thread={thread}
                currentUserEmail={user.email}
                index={i}
                onClick={() => handleThreadClick(thread)}
                isIntro={thread.isIntro}
              />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12,
            padding: '48px 32px', textAlign: 'center',
            animation: 'pmsgFadeUp 0.4s ease 0.1s both',
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff', marginBottom: 8 }}>
              No messages yet.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
              When students reach out from the directory or you make an introduction, conversations will appear here.
            </p>
          </div>
        ) : (
          <div style={{
            background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12,
            padding: '48px 32px', textAlign: 'center',
            animation: 'pmsgFadeUp 0.4s ease 0.1s both',
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff', marginBottom: 8 }}>
              No {filter === 'unread' ? 'unread' : filter === 'direct' ? 'direct' : 'intro'} messages.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888' }}>You're all caught up.</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pmsgFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) {
          .pmsg-main { padding: 20px 16px 48px !important; }
        }
      `}</style>
    </div>
  );
}