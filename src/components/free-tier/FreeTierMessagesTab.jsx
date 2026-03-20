import React, { useState, useEffect } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FILTERS = ['All', 'Unread', 'From Parents', 'From FastIQ'];

function maskName(fullName) {
  if (!fullName) return 'Parent';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function getInitials(name) {
  if (!name) return 'P';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function FreeTierMessagesTab({ user }) {
  const [filter, setFilter] = useState('All');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        // Get all messages where user is recipient or sender
        const [received, sent] = await Promise.all([
          base44.entities.Message.filter({ recipient_email: user.email }),
          base44.entities.Message.filter({ sender_email: user.email }),
        ]);
        // Group into conversations by conversation_id
        const allMsgs = [...(received || []), ...(sent || [])];
        const convMap = {};
        allMsgs.forEach(msg => {
          const id = msg.conversation_id || msg.id;
          if (!convMap[id] || new Date(msg.created_date) > new Date(convMap[id].latest.created_date)) {
            if (!convMap[id]) convMap[id] = { messages: [], latest: msg };
            else convMap[id].latest = msg;
            convMap[id].messages.push(msg);
          }
        });
        // Build conversation list
        const convList = Object.values(convMap).map(c => {
          const latest = c.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
          const isFromParent = ['directory_initial', 'directory_followup'].includes(latest.message_type) ||
            (latest.sender_email !== user.email && latest.message_type !== 'fastiq');
          const otherEmail = latest.sender_email === user.email ? latest.recipient_email : latest.sender_email;
          const otherName = latest.sender_email === user.email ? (latest.recipient_name || latest.subject?.replace('Re: ', '') || otherEmail) : (latest.sender_name || otherEmail);
          const unread = c.messages.some(m => m.recipient_email === user.email && !m.is_read);
          return { id: latest.conversation_id || latest.id, latest, otherEmail, otherName, unread, isFromParent };
        });
        convList.sort((a, b) => new Date(b.latest.created_date) - new Date(a.latest.created_date));
        setConversations(convList);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [user?.email]);

  const filtered = conversations.filter(c => {
    if (filter === 'Unread') return c.unread;
    if (filter === 'From Parents') return c.isFromParent;
    if (filter === 'From FastIQ') return c.latest.message_type === 'fastiq' || (c.latest.sender_email || '').includes('fastiq');
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        MESSAGES
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 20 }}>
        Your Conversations
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-[#E85D20] text-white' : 'bg-white text-[#666] border border-[#E0E0E0] hover:border-[#E85D20]'}`}
            style={{ minHeight: 'auto' }}
          >{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#E85D20] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-[#E0E0E0] text-center">
          <Mail className="w-12 h-12 text-[#CCCCCC] mx-auto mb-4" />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 8 }}>No messages yet.</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#999', maxWidth: 400, margin: '0 auto' }}>
            Once you connect with parents in the directory, conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(conv => {
            const name = maskName(conv.otherName);
            const initials = getInitials(conv.otherName);
            return (
              <div key={conv.id} className="bg-white rounded-xl p-4 border border-[#E0E0E0] hover:border-[#E85D20] transition-all cursor-pointer flex items-center gap-4">
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between gap-2">
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: conv.unread ? 700 : 500, fontSize: 15, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </p>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', flexShrink: 0 }}>{formatTime(conv.latest.created_date)}</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.latest.body?.substring(0, 80)}{(conv.latest.body?.length || 0) > 80 ? '...' : ''}
                  </p>
                </div>
                {conv.unread && (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E85D20', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}