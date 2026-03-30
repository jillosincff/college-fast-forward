// v2
import { useState, useEffect } from 'react';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';
import { base44 } from '@/api/base44Client';

export default function FreeTierDirectoryTab({ user, onOpenUpgrade }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sentTo, setSentTo] = useState([]);
  const [messaging, setMessaging] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const topRole = user?.career_goals?.target_roles?.[0];
  const topIndustry = user?.career_goals?.target_industries?.[0]
    ?.split(' & ')[0]?.split('&')[0]?.trim();
  const searchSuggestion = topRole || topIndustry || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getDirectoryUsers({});
        const all = res?.data?.data || [];
        const filtered = all.filter(u =>
          u.persona === 'parent' || u.persona === 'alumni'
        );
        setMembers(filtered);
      } catch (e) {
        console.error('Directory load error:', e);
        setMembers([]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const searchedMembers = members.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return [
      m.full_name,
      m.job_title,
      m.current_position,
      m.company,
      m.current_company,
      m.industry,
      m.bio,
      m.expertise_areas?.join(' '),
    ].some(f => f?.toLowerCase().includes(q));
  });

  const displayMembers = searchedMembers.filter(m => {
    if (activeFilter === 'helping') return m.availability === 'actively_helping';
    if (activeFilter === 'recent') return !!m.last_active_at;
    return true;
  });

  const handleSendMessage = async () => {
    if (!messaging || !draft.trim() || sending) return;
    setSending(true);
    try {
      const convo = await base44.entities.Conversation.create({
        participant_emails: [user.email, messaging.email].filter(Boolean),
        last_message_at: new Date().toISOString(),
      }).catch(() => null);
      const conversationId = convo?.id || `dir-${Date.now()}`;
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name || '',
        recipient_email: messaging.email,
        subject: `Message from ${user.full_name || 'a student'}`,
        body: draft,
        is_read: false,
        message_type: 'text',
      });
      base44.functions.invoke('sendMessageNotification', {
        recipient_email: messaging.email,
        sender_name: user.full_name || 'A student',
        message_preview: draft.slice(0, 120),
      }).catch(() => {});
      setSentTo(prev => [...prev, messaging.email]);
      setSent(true);
      setTimeout(() => { setMessaging(null); setSent(false); }, 1500);
    } catch (e) {
      console.error('Message failed:', e);
    }
    setSending(false);
  };

  const chipStyle = (active) => ({
    background: active ? '#E85D20' : '#fff',
    border: `1px solid ${active ? '#E85D20' : '#E0E0E0'}`,
    borderRadius: 20, padding: '7px 16px',
    fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? '#fff' : '#555',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    minHeight: 'auto',
  });

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#E85D20', margin: '0 0 8px'
        }}>CFF CONNECTIONS</p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.2
        }}>
          Find someone who can open a door.
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: '#888', margin: 0
        }}>
          {loading ? 'Loading...' : `${members.length} parents and professionals in the CFF network — and they want to help.`}
        </p>
      </div>

      {/* Search suggestion hint */}
      {searchSuggestion && !searchQuery && (
        <div style={{
          background: '#FFF5F0',
          border: '1px solid rgba(232,93,32,0.2)',
          borderRadius: 10, padding: '10px 16px',
          marginBottom: 12,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: '#555', margin: 0
          }}>
            💡 Try searching <strong>"{searchSuggestion}"</strong> to find relevant connections
          </p>
          <button
            onClick={() => setSearchQuery(searchSuggestion)}
            style={{
              background: '#E85D20', border: 'none',
              borderRadius: 6, padding: '6px 14px',
              fontSize: 12, fontWeight: 600,
              color: '#fff', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap', minHeight: 'auto',
            }}
          >
            Search "{searchSuggestion}" →
          </button>
        </div>
      )}

      {/* Search bar */}
      <div style={{ marginBottom: 16, position: 'relative' }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by industry, company, or name..."
          style={{
            width: '100%', fontSize: 14,
            padding: '12px 16px',
            border: '1px solid #E0E0E0',
            borderRadius: 10, background: '#fff',
            color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif",
            boxSizing: 'border-box', outline: 'none',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none', border: 'none',
              fontSize: 12, color: '#E85D20',
              cursor: 'pointer', padding: '4px 0',
              fontFamily: "'DM Sans', sans-serif",
              display: 'block', marginTop: 4, minHeight: 'auto',
            }}
          >
            Clear search — show all →
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'helping', label: 'Actively Helping' },
          { id: 'recent', label: 'Recently Active' },
        ].map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)} style={chipStyle(activeFilter === f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '3px solid #F0F0F0',
            borderTop: '3px solid #E85D20',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888' }}>
            Loading connections...
          </p>
        </div>
      ) : displayMembers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888' }}>
            No results found — try a different search.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none', border: 'none',
              color: '#E85D20', fontSize: 13,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600, minHeight: 'auto',
            }}
          >
            Clear Search →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {displayMembers.map(member => {
            const initials = (member.full_name || 'CFF')
              .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const alreadySent = sentTo.includes(member.email);
            const subtitle = [member.company || member.current_company, member.job_title || member.current_position]
              .filter(Boolean).join(' · ');

            return (
              <div key={member.id} style={{
                background: '#fff',
                border: '1px solid #E5E5E5',
                borderRadius: 14, padding: '20px',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#E85D20', color: '#fff',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 15,
                    fontWeight: 700, flexShrink: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14, fontWeight: 600,
                      color: '#1A1A1A', margin: '0 0 2px'
                    }}>
                      {member.full_name || 'CFF Member'}
                    </p>
                    {subtitle && (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12, color: '#666', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {member.industry && (
                  <span style={{
                    background: '#F5F5F5',
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, color: '#666',
                    fontFamily: "'DM Sans', sans-serif",
                    alignSelf: 'flex-start',
                  }}>
                    {member.industry}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: member.availability === 'actively_helping' ? '#22C55E' :
                                member.availability === 'occasionally_available' ? '#F59E0B' : '#CCCCCC',
                  }} />
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12, color: '#888', margin: 0
                  }}>
                    {member.availability === 'actively_helping' ? 'Actively helping' :
                     member.availability === 'occasionally_available' ? 'Occasionally available' :
                     'Availability unknown'}
                  </p>
                </div>

                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12, color: '#0077B5',
                      textDecoration: 'none', fontWeight: 600,
                    }}
                  >
                    🔗 View LinkedIn →
                  </a>
                )}

                <button
                  onClick={() => {
                    if (alreadySent) return;
                    setMessaging(member);
                    setDraft('');
                    setSent(false);
                  }}
                  disabled={alreadySent}
                  style={{
                    background: alreadySent ? '#F5F5F5' : '#E85D20',
                    border: 'none', borderRadius: 8,
                    padding: '11px', fontSize: 13,
                    fontWeight: 600,
                    color: alreadySent ? '#AAAAAA' : '#fff',
                    cursor: alreadySent ? 'default' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    width: '100%', minHeight: 'auto',
                  }}
                >
                  {alreadySent ? 'Message Sent ✓' : 'Send a Message →'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Message modal */}
      {messaging && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 50, padding: 20,
          }}
          onClick={() => setMessaging(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16,
              padding: 28, width: '100%', maxWidth: 520,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p style={{
                fontSize: 11, color: '#888', margin: '0 0 4px',
                textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600
              }}>
                Send a message on CFF
              </p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>
                {messaging.full_name}
              </p>
              {(messaging.job_title || messaging.current_position) && (
                <p style={{ fontSize: 13, color: '#666', margin: '2px 0 0' }}>
                  {messaging.job_title || messaging.current_position}
                </p>
              )}
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={5}
              placeholder={`Hi ${messaging.full_name?.split(' ')[0] || 'there'}, I'm a UF student interested in ${topRole || 'your industry'}...`}
              style={{
                width: '100%', fontSize: 13, lineHeight: 1.6,
                color: '#1A1A1A', background: '#F9F9F9',
                border: '1px solid #E0E0E0', borderRadius: 8,
                padding: 12, resize: 'vertical',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMessaging(null)}
                style={{
                  background: 'none', border: '1px solid #E0E0E0',
                  borderRadius: 8, padding: '8px 16px',
                  fontSize: 13, color: '#666', cursor: 'pointer', minHeight: 'auto',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!draft.trim() || sending || sent}
                style={{
                  background: sent ? '#22C55E' : '#E85D20',
                  border: 'none', borderRadius: 8,
                  padding: '8px 20px', fontSize: 13,
                  fontWeight: 600, color: '#fff',
                  cursor: sending || sent ? 'default' : 'pointer', minHeight: 'auto',
                }}
              >
                {sent ? 'Sent ✓' : sending ? 'Sending...' : 'Send Message →'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}