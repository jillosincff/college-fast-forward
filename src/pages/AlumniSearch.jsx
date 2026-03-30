import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const EXAMPLE_SEARCHES = () => [
  "VP of Marketing at a Fortune 500 company",
  "working at hospitals or health systems in Miami",
  "investment banker at a bulge bracket firm in NYC",
  "who started their own company in tech",
  "working in sports management or athletics",
  "consultant at McKinsey Bain or BCG",
];

export default function AlumniSearch({ user, onOpenUpgrade }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sentTo, setSentTo] = useState([]);
  const [connectLoading, setConnectLoading] = useState(null);
  const [outreachModal, setOutreachModal] = useState(null);
  const [editedDraft, setEditedDraft] = useState('');
  const [copyToast, setCopyToast] = useState(false);
  const [cffModal, setCffModal] = useState(null);
  const [cffDraft, setCffDraft] = useState('');
  const [cffSending, setCffSending] = useState(false);
  const [cffSent, setCffSent] = useState(false);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const schoolName = user?.school_name || user?.school || user?.university || user?.school_code?.toUpperCase() || 'your school';
  const examples = EXAMPLE_SEARCHES();

  const handleSearch = async (searchQuery) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    if (!isFastIQ && user?.alumni_search_used) {
      onOpenUpgrade?.();
      return;
    }

    setQuery(q);
    setSearching(true);
    setSearched(false);
    setResults([]);

    try {
      const res = await base44.functions.invoke('exaService', {
        action: 'searchAlumni',
        query: q,
        universityName: schoolName || user?.school || user?.university || 'University of Florida',
        maxResults: isFastIQ ? 8 : 5,
        isFastIQ: isFastIQ,
      });

      console.log('Search response:', res);
      const profiles = res?.data?.profiles || [];
      console.log('SETTING RESULTS:', profiles);
      setResults(profiles);

      if (!isFastIQ && !user?.alumni_search_used) {
        base44.auth.updateMe({ alumni_search_used: true }).catch(() => {});
      }
    } catch (e) {
      console.error('Search error:', e);
      setResults([]);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const generateDraft = async (alum) => {
    try {
      const res = await base44.functions.invoke('generateOutreachDraft', {
        studentName: user?.full_name || 'Student',
        major: user?.major || user?.career_goals?.major || '',
        targetRole: (user?.career_goals?.target_roles || [])[0] || alum.headline || '',
        graduationYear: user?.career_goals?.graduation_year || '',
        school: schoolName,
        alumniName: alum.full_name,
        alumniTitle: alum.headline,
        alumniCompany: alum.company || '',
      });
      return res?.data?.message || res?.message || '';
    } catch { return ''; }
  };

  const sendCffMessage = async () => {
    if (!cffModal || !cffDraft.trim() || cffSending) return;
    setCffSending(true);
    try {
      const convo = await base44.entities.Conversation.create({
        participant_emails: [user.email, cffModal.email].filter(Boolean),
        last_message_at: new Date().toISOString(),
      }).catch(() => null);
      const conversationId = convo?.id || `alumni-${Date.now()}`;
      await base44.entities.Message.create({
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name || '',
        recipient_email: cffModal.email,
        subject: `Connection request from ${user.full_name || 'a student'}`,
        body: cffDraft,
        is_read: false,
        message_type: 'text',
      });
      base44.functions.invoke('sendMessageNotification', {
        recipient_email: cffModal.email,
        sender_name: user.full_name || 'A student',
        message_preview: cffDraft.slice(0, 120),
      }).catch(() => {});
      base44.functions.invoke('trackMessage', {
        sender_email: user.email,
        recipient_email: cffModal.email,
      }).catch(() => {});
      setSentTo(prev => [...prev, cffModal.id]);
      setCffSent(true);
      setTimeout(() => { setCffModal(null); setCffSent(false); }, 1500);
    } catch (e) {
      console.error('CFF send failed:', e);
    }
    setCffSending(false);
  };

  const handleConnect = async (alum) => {
    const key = alum.cff_user_id || alum.linkedin_url;
    if (sentTo.includes(key)) return;
    setConnectLoading(key);
    try {
      const draft = await generateDraft(alum);
      if (alum.cff_user_id) {
        setCffModal({ id: alum.cff_user_id, full_name: alum.full_name, headline: alum.headline, email: alum.email || null });
        setCffDraft(draft);
        setCffSent(false);
      } else {
        setOutreachModal({ alum, draft });
        setEditedDraft(draft);
      }
    } finally {
      setConnectLoading(null);
    }
  };

  const handleSendLinkedIn = () => {
    if (!outreachModal) return;
    navigator.clipboard.writeText(editedDraft).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    });
    window.open(outreachModal.alum.linkedin_url, '_blank');
    setSentTo(prev => [...prev, outreachModal.alum.linkedin_url]);
    setOutreachModal(null);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(16px, 3vw, 24px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>
            Alumni Search
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.2 }}>
            Find your UF alumni<br />in any role, at any company.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
            Search in plain English · UF alumni only · Powered by Exa
          </p>
        </div>
        <button
          onClick={() => navigate('FreeTierDashboard')}
          style={{
            background: '#E85D20', border: 'none',
            borderRadius: 10, padding: 'clamp(10px, 2vw, 12px) clamp(14px, 3vw, 20px)',
            fontSize: 'clamp(12px, 2.5vw, 13px)', fontWeight: 600,
            color: '#fff', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: 'nowrap', flexShrink: 0, minHeight: 44,
          }}
        >
          Next Step →
        </button>
      </div>

      {/* Search bar — hidden when free tier search used */}
      <div style={{ marginBottom: 24 }}>
        {!isFastIQ && user?.alumni_search_used ? (
          <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: 0 }}>You've used your 1 free search.</p>
            <button onClick={() => onOpenUpgrade?.()} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}>
              Unlock FastIQ for unlimited searches →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: window.innerWidth < 500 ? 'column' : 'row', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={`Try: "VP of Marketing at a Fortune 500" or "investment banker in NYC"`}
              style={{ flex: 1, fontSize: 14, padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 10, background: '#fff', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box', width: '100%' }}
            />
            <button
              onClick={() => handleSearch()}
              disabled={searching || !query.trim()}
              style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 500, color: '#fff', cursor: searching || !query.trim() ? 'not-allowed' : 'pointer', opacity: searching || !query.trim() ? 0.7 : 1, whiteSpace: 'nowrap', minHeight: 44, width: window.innerWidth < 500 ? '100%' : 'auto' }}
            >
              {searching ? 'Searching...' : 'Search →'}
            </button>
          </div>
        )}
        {/* Free search indicator */}
        {!isFastIQ && !user?.alumni_search_used && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', margin: 0, fontWeight: 500 }}>
            ✓ You have 1 free alumni search — make it count
          </p>
        )}
        {/* used message now shown in replaced bar above */}
        {isFastIQ && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
            Unlimited searches · results in ~2 seconds
          </p>
        )}
      </div>

      {/* Example chips */}
      {!searched && query === '' && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '0 0 10px' }}>Try one of these:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {examples.map(ex => (
              <button
                key={ex}
                onClick={() => handleSearch(ex)}
                style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#555', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888' }}>
            No results found — try different keywords or a broader search.
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '0 0 16px' }}>
            {results.length} UF alumni found
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((alum, i) => {
              const isLocked = !isFastIQ && i > 0;
              const initials = (alum.full_name || 'UF').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{
                    background: '#fff', border: '1px solid #E5E5E5', borderRadius: 10, padding: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    filter: isLocked ? 'blur(4px)' : 'none',
                    pointerEvents: isLocked ? 'none' : 'auto',
                    userSelect: isLocked ? 'none' : 'auto',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>{alum.full_name}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#555', margin: '0 0 3px' }}>
                        {alum.headline?.split('·')[0]?.replace(/\s+/g, ' ')?.trim() || ''}{alum.company ? ` · ${alum.company}` : ''}
                      </p>
                      {alum.linkedin_url && (
                        <a
                          href={alum.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12, color: '#0077B5',
                            textDecoration: 'none', fontWeight: 600,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            marginBottom: 3,
                          }}
                        >
                          🔗 View LinkedIn Profile →
                        </a>
                      )}
                      {alum.location && (
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: '0 0 2px' }}>📍 {alum.location}</p>
                      )}
                      {alum.summary && (
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: 0, lineHeight: 1.4 }}>{alum.summary.slice(0, 100)}...</p>
                      )}
                    </div>
                    {(() => {
                        const key = alum.cff_user_id || alum.linkedin_url;
                        const isLoading = connectLoading === key;
                        const isSent = sentTo.includes(key);
                        return (
                          <button
                            onClick={() => handleConnect(alum)}
                            disabled={isLoading || isSent}
                            style={{
                              background: 'none',
                              border: `1px solid ${isSent ? '#22C55E' : '#E85D20'}`,
                              borderRadius: 6, padding: '7px 14px', fontSize: 12,
                              color: isSent ? '#22C55E' : '#E85D20',
                              cursor: isSent ? 'default' : 'pointer',
                              whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto',
                            }}
                          >
                            {isLoading ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(232,93,32,0.3)', borderTop: '2px solid #E85D20', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                Drafting...
                              </span>
                            ) : isSent ? (alum.cff_user_id ? 'Message sent ✓' : 'Sent ✓') : 'Connect →'}
                          </button>
                          );
                          })()}
                          </div>

                          {/* Lock overlay on first blurred result */}
                  {isLocked && i === 1 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 10, background: 'rgba(255,255,255,0.88)', padding: '16px 24px', textAlign: 'center' }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#1A1A1A', margin: 0, maxWidth: 260, lineHeight: 1.5 }}>
                        Unlock FastIQ to see all {results.length} alumni and connect with them directly.
                      </p>
                      <button onClick={() => onOpenUpgrade?.()} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: 'pointer', minHeight: 'auto' }}>
                        Unlock FastIQ →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LinkedIn outreach modal */}
      {outreachModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: window.innerWidth < 600 ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 50, padding: window.innerWidth < 600 ? 0 : 20 }} onClick={() => setOutreachModal(null)}>
          <div style={{ background: '#fff', borderRadius: window.innerWidth < 600 ? '16px 16px 0 0' : 16, padding: window.innerWidth < 600 ? '20px 16px' : 28, width: '100%', maxWidth: window.innerWidth < 600 ? '100%' : 520, maxHeight: window.innerWidth < 600 ? '90vh' : 'auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={e => e.stopPropagation()}>
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Reaching out via LinkedIn</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{outreachModal.alum.full_name}</p>
              <p style={{ fontSize: 13, color: '#666', margin: '2px 0 0' }}>{outreachModal.alum.headline}</p>
            </div>
            <div style={{ background: '#F0F7FF', border: '1px solid #B3D9FF', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0057B8', lineHeight: 1.5 }}>
              Edit your message, then click "Copy & Open LinkedIn" — paste it into your connection request.
            </div>
            <div>
              <textarea
                value={editedDraft}
                onChange={e => setEditedDraft(e.target.value)}
                rows={6}
                style={{ width: '100%', fontSize: 13, lineHeight: 1.6, color: '#1A1A1A', background: '#F9F9F9', border: `1px solid ${editedDraft.length > 300 ? '#EF4444' : '#E0E0E0'}`, borderRadius: 8, padding: 12, resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 12, color: '#EF4444', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                  {editedDraft.length > 300 ? 'LinkedIn connection requests have a 300 character limit' : ''}
                </span>
                <span style={{ fontSize: 12, color: editedDraft.length > 300 ? '#EF4444' : '#AAA', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                  {editedDraft.length} / 300
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setOutreachModal(null)} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#666', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
              <button onClick={handleSendLinkedIn} disabled={!editedDraft.trim()} style={{ background: '#0077B5', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: !editedDraft.trim() ? 'not-allowed' : 'pointer', opacity: !editedDraft.trim() ? 0.7 : 1, minHeight: 'auto' }}>
                Copy &amp; Open LinkedIn →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CFF in-platform modal */}
      {cffModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: window.innerWidth < 600 ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 50, padding: window.innerWidth < 600 ? 0 : 20 }} onClick={() => setCffModal(null)}>
          <div style={{ background: '#fff', borderRadius: window.innerWidth < 600 ? '16px 16px 0 0' : 16, padding: window.innerWidth < 600 ? '20px 16px' : 28, width: '100%', maxWidth: window.innerWidth < 600 ? '100%' : 520, maxHeight: window.innerWidth < 600 ? '90vh' : 'auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }} onClick={e => e.stopPropagation()}>
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Send a message on CFF</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{cffModal.full_name}</p>
              <p style={{ fontSize: 13, color: '#666', margin: '2px 0 0' }}>{cffModal.headline}</p>
            </div>
            <div style={{ background: '#F0F7FF', border: '1px solid #B3D9FF', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0057B8', lineHeight: 1.5 }}>
              ⚡ FastIQ drafted this for you — edit freely before sending.
            </div>
            <textarea
              value={cffDraft}
              onChange={e => setCffDraft(e.target.value)}
              rows={6}
              style={{ width: '100%', fontSize: 13, lineHeight: 1.6, color: '#1A1A1A', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 8, padding: 12, resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setCffModal(null)} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#666', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
              <button onClick={sendCffMessage} disabled={!cffDraft.trim() || cffSending || cffSent}
                style={{ background: cffSent ? '#22C55E' : '#E85D20', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: cffSending || cffSent ? 'default' : 'pointer', minHeight: 'auto' }}>
                {cffSent ? 'Sent ✓' : cffSending ? 'Sending...' : 'Send Message →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}