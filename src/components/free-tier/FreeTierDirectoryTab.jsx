import { useState, useEffect } from 'react';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { logAnalyticsEvent } from '@/functions/logAnalyticsEvent';

const ROLE_TO_SEARCH_KEYWORD = {
  'social media': 'Marketing', 'marketing': 'Marketing', 'brand': 'Marketing',
  'content': 'Marketing', 'pr': 'Marketing', 'communications': 'Marketing',
  'finance': 'Finance', 'banking': 'Finance', 'investment': 'Finance',
  'wealth': 'Finance', 'analyst': 'Finance', 'accounting': 'Finance',
  'software': 'Technology', 'engineer': 'Technology', 'developer': 'Technology',
  'product manager': 'Technology', 'data': 'Technology',
  'therapist': 'Healthcare', 'nursing': 'Healthcare', 'medical': 'Healthcare',
  'health': 'Healthcare', 'clinical': 'Healthcare',
  'lawyer': 'Law', 'attorney': 'Law', 'legal': 'Law', 'compliance': 'Law',
  'consultant': 'Consulting', 'consulting': 'Consulting', 'strategy': 'Consulting',
  'sales': 'Sales', 'business development': 'Sales', 'account': 'Sales',
  'film': 'Media', 'television': 'Media', 'journalism': 'Media', 'publishing': 'Media',
};

const INDUSTRY_TO_KEYWORD = {
  'Marketing & Brand': 'Marketing', 'Media & Entertainment': 'Media',
  'Financial Services & Banking': 'Finance', 'Technology & Software': 'Technology',
  'Healthcare & Life Sciences': 'Healthcare', 'Legal & Compliance': 'Law',
  'Consumer Goods & Retail': 'Retail', 'Real Estate': 'Real Estate',
  'Education': 'Education', 'Nonprofit & Social Impact': 'Nonprofit',
  'Government & Nonprofit': 'Nonprofit', 'Engineering': 'Engineering',
  'Consulting': 'Consulting', 'Hospitality & Tourism': 'Hospitality',
  'Sports & Athletics': 'Sports', 'Human Resources': 'HR',
  'Architecture & Design': 'Design', 'Biotech & Life Sciences': 'Biotech',
  'Logistics & Supply Chain': 'Logistics', 'Energy & Utilities': 'Energy',
};

const getBestKeyword = (user) => {
  const roles = user?.career_goals?.target_roles || [];
  const industries = user?.career_goals?.target_industries || [];
  for (const role of roles) {
    const roleLower = role.toLowerCase();
    for (const [key, value] of Object.entries(ROLE_TO_SEARCH_KEYWORD)) {
      if (roleLower.includes(key)) return value;
    }
  }
  for (const ind of industries) {
    if (INDUSTRY_TO_KEYWORD[ind]) return INDUSTRY_TO_KEYWORD[ind];
  }
  return roles[0] || '';
};

export default function FreeTierDirectoryTab({ user, onOpenUpgrade, onTabChange }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState('');
  const [schoolError, setSchoolError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sentTo, setSentTo] = useState([]);
  const [messaging, setMessaging] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const topRole = user?.career_goals?.target_roles?.[0];
  const searchSuggestion = getBestKeyword(user);

  const handleShareInvite = () => {
    const link = `${window.location.origin}/#GatorAuth`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  useEffect(() => {
    // Log directory_viewed on mount
    logAnalyticsEvent({ event_name: 'directory_viewed', properties: {} }).catch(() => {});

    const load = async () => {
      setLoading(true);
      setSchoolError(false);
      try {
        const res = await getDirectoryUsers({});
        const payload = res?.data || {};
        if (payload.error === 'incomplete_profile' || payload.error === 'School not set on your profile.') {
          setSchoolError(true);
          setMembers([]);
        } else {
          const all = payload.data || [];
          setSchoolName(payload.school || '');
          const filtered = all.filter(u => u.persona === 'parent' || u.persona === 'alumni');
          setMembers(filtered);
        }
      } catch (e) {
        // 401 means user not authenticated — show empty state, don't crash
        if (e?.response?.status === 401 || e?.status === 401) {
          setSchoolError(false);
        }
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
    return [m.full_name, m.job_title, m.current_position, m.company, m.current_company, m.industry, m.bio, m.expertise_areas?.join(' ')]
      .some(f => f?.toLowerCase().includes(q));
  });

  const displayMembers = searchedMembers.filter(m => {
    if (activeFilter === 'helping') return m.availability === 'actively_helping' || m.availability === 'yes';
    if (activeFilter === 'recent') return !!m.last_active_at;
    return true;
  });

  const handleSendMessage = async () => {
    if (!messaging || !draft.trim() || sending) return;
    setSending(true);
    base44.entities.OutreachDraft.create({
      created_by: user?.email,
      recipient_name: messaging.full_name,
      recipient_title: messaging.job_title || messaging.current_position || '',
      recipient_company: messaging.company || messaging.current_company || '',
      recipient_linkedin_url: messaging.linkedin_url || '',
      context: 'cff_connection',
      message: draft,
      status: 'draft',
    }).catch(() => {});
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
      // Log message_sent
      logAnalyticsEvent({ event_name: 'message_sent', properties: { recipient_persona: messaging.persona || 'unknown' } }).catch(() => {});
      if (!user?.has_messaged_connection) {
        base44.auth.updateMe({ has_messaged_connection: true }).catch(() => {});
      }
      base44.entities.OutreachDraft.create({
        created_by: user?.email,
        recipient_name: messaging.full_name,
        recipient_title: messaging.job_title || messaging.current_position || '',
        recipient_company: messaging.company || messaging.current_company || '',
        recipient_linkedin_url: messaging.linkedin_url || '',
        context: 'cff_connection',
        message: draft,
        status: 'sent',
        sent_at: new Date().toISOString(),
        follow_up_due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        follow_up_sent: false,
      }).catch(() => {});
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>
            CFF CONNECTIONS
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.2 }}>
            Find someone who can open a door.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
            {loading ? 'Loading...' : schoolError ? 'Set your school to see your network.' : `${members.length} parents and professionals in the network — and they want to help.`}
          </p>
          {!loading && schoolName && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', fontWeight: 600, margin: '4px 0 0' }}>
              Showing {schoolName} network · {members.length} members
            </p>
          )}
        </div>
        <button
          onClick={() => onTabChange ? onTabChange('alumni_search') : navigate('FreeTierDashboard')}
          style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto' }}
        >
          Next Step →
        </button>
      </div>

      {/* School not set error */}
      {schoolError && (
        <div style={{ background: '#FFF5F5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#EF4444', margin: '0 0 10px', fontWeight: 500 }}>
            Your school isn't set. Please update your profile to see your network.
          </p>
          <button onClick={() => navigate('ProfileEdit')} style={{ background: '#EF4444', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
            Update Profile →
          </button>
        </div>
      )}

      {/* Search suggestion hint */}
      {searchSuggestion && !searchQuery && (
        <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: 0 }}>
            💡 Try searching <strong>"{searchSuggestion}"</strong> to find relevant connections
          </p>
          <button
            onClick={() => setSearchQuery(searchSuggestion)}
            style={{ background: '#E85D20', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
          >
            Search "{searchSuggestion}" →
          </button>
        </div>
      )}

      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by industry, company, or name..."
          style={{ width: '100%', fontSize: 14, padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 10, background: '#fff', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'none', border: 'none', fontSize: 12, color: '#E85D20', cursor: 'pointer', padding: '4px 0', fontFamily: "'DM Sans', sans-serif", display: 'block', marginTop: 4, minHeight: 'auto' }}
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

      {/* Growth banners */}
      {!loading && !schoolError && !searchQuery && members.length < 25 && (
        <div style={{ marginBottom: 24 }}>
          {members.length < 10 ? (
            <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 14, padding: '24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
                We're building the {schoolName || 'your school'} parent &amp; alumni network!
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.6, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                We're reaching out to {schoolName || 'your school'} families and alumni now. Check back soon — or help us grow faster by sharing CFF with a parent or alumni you know.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleShareInvite} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
                  {linkCopied ? '✓ Link Copied!' : '📨 Share with a Parent or Alumni →'}
                </button>
                <button onClick={() => onTabChange && onTabChange('alumni_search')} style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
                  🔍 Search Alumni on LinkedIn Instead →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: 0 }}>
                🌱 <strong>{schoolName || 'Your school'}'s</strong> parent &amp; alumni network is growing — {members.length} members and counting. Know a parent or alumni who should be here?
              </p>
              <button onClick={handleShareInvite} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}>
                {linkCopied ? '✓ Copied!' : 'Invite them →'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #F0F0F0', borderTop: '3px solid #E85D20', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888' }}>Loading connections...</p>
        </div>
      )}

      {!loading && displayMembers.length === 0 && searchQuery && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888' }}>No results found — try a different search.</p>
          <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#E85D20', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, minHeight: 'auto' }}>
            Clear Search →
          </button>
        </div>
      )}

      {!loading && displayMembers.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 16 }}>
          {displayMembers.map(member => {
            const initials = (member.full_name || 'CFF').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const alreadySent = sentTo.includes(member.email);
            const subtitle = [member.company || member.current_company, member.job_title || member.current_position].filter(Boolean).join(' · ');
            return (
              <div key={member.id} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>{member.full_name || 'CFF Member'}</p>
                    {subtitle && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</p>}
                  </div>
                </div>
                {member.industry && (
                  <span style={{ background: '#F5F5F5', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#666', fontFamily: "'DM Sans', sans-serif", alignSelf: 'flex-start' }}>
                    {member.industry}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: (member.availability === 'actively_helping' || member.availability === 'yes') ? '#22C55E' : (member.availability === 'occasionally_available' || member.availability === 'occasionally') ? '#F59E0B' : '#CCCCCC' }} />
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
                    {(member.availability === 'actively_helping' || member.availability === 'yes') ? 'Actively helping' : (member.availability === 'occasionally_available' || member.availability === 'occasionally') ? 'Occasionally available' : 'Availability unknown'}
                  </p>
                </div>
                {member.linkedin_url && (
                  <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#0077B5', textDecoration: 'none', fontWeight: 600 }}>
                    🔗 View LinkedIn →
                  </a>
                )}
                <button
                  onClick={() => { if (alreadySent) return; setMessaging(member); setDraft(''); setSent(false); }}
                  disabled={alreadySent}
                  style={{ background: alreadySent ? '#F5F5F5' : '#E85D20', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 600, color: alreadySent ? '#AAAAAA' : '#fff', cursor: alreadySent ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', minHeight: 'auto' }}
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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}
          onClick={() => setMessaging(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
                Send a message on CFF
              </p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{messaging.full_name}</p>
              {(messaging.job_title || messaging.current_position) && (
                <p style={{ fontSize: 13, color: '#666', margin: '2px 0 0' }}>{messaging.job_title || messaging.current_position}</p>
              )}
            </div>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={5}
              placeholder={`Hi ${messaging.full_name?.split(' ')[0] || 'there'}, I'm a student interested in ${topRole || 'your industry'}...`}
              style={{ width: '100%', fontSize: 13, lineHeight: 1.6, color: '#1A1A1A', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 8, padding: 12, resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setMessaging(null)} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#666', cursor: 'pointer', minHeight: 'auto' }}>
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!draft.trim() || sending || sent}
                style={{ background: sent ? '#22C55E' : '#E85D20', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: sending || sent ? 'default' : 'pointer', minHeight: 'auto' }}
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