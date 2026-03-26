import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const EXAMPLE_SEARCHES = (schoolName) => [
  `${schoolName} alumni who are VPs of Marketing at Fortune 500 companies`,
  `${schoolName} grads working at hospitals or health systems in Miami`,
  `${schoolName} alumni in investment banking at bulge bracket firms in NYC`,
  `${schoolName} grads who started their own company in tech`,
  `${schoolName} alumni working in sports management or athletics`,
  `${schoolName} grads in consulting at McKinsey, Bain, or BCG`,
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

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const schoolName = user?.school_name || user?.school || user?.university || user?.school_code?.toUpperCase() || 'your school';
  const examples = EXAMPLE_SEARCHES(schoolName);

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
        universityName: schoolName,
        maxResults: isFastIQ ? 8 : 5,
      });
      setResults(res?.profiles || []);

      if (!isFastIQ && !user?.alumni_search_used) {
        base44.auth.updateMe({ alumni_search_used: true }).catch(() => {});
      }
    } catch {
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
        alumniName: alum.full_name,
        alumniTitle: alum.headline,
        alumniCompany: alum.company || '',
      });
      return res?.data?.message || res?.message || '';
    } catch { return ''; }
  };

  const handleConnect = async (alum) => {
    if (sentTo.includes(alum.linkedin_url)) return;
    setConnectLoading(alum.linkedin_url);
    try {
      const draft = await generateDraft(alum);
      setOutreachModal({ alum, draft });
      setEditedDraft(draft);
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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 8px' }}>
          Alumni Search
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px', lineHeight: 1.2 }}>
          Find a {schoolName} alumni<br />in any role, at any company.
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
          Search in plain English · {schoolName} alumni only · Powered by Exa
        </p>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={`Try: "VP of Marketing at a Fortune 500" or "investment banker in NYC"`}
            style={{ flex: 1, fontSize: 14, padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 10, background: '#fff', color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
          />
          <button
            onClick={() => handleSearch()}
            disabled={searching || !query.trim()}
            style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 500, color: '#fff', cursor: searching || !query.trim() ? 'not-allowed' : 'pointer', opacity: searching || !query.trim() ? 0.7 : 1, whiteSpace: 'nowrap', minHeight: 'auto' }}
          >
            {searching ? 'Searching...' : 'Search →'}
          </button>
        </div>

        {/* Free search indicator */}
        {!isFastIQ && !user?.alumni_search_used && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', margin: 0, fontWeight: 500 }}>
            ✓ You have 1 free alumni search — make it count
          </p>
        )}
        {!isFastIQ && user?.alumni_search_used && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
            You've used your free search.{' '}
            <span onClick={() => onOpenUpgrade?.()} style={{ color: '#E85D20', cursor: 'pointer', fontWeight: 500 }}>
              Unlock FastIQ for unlimited searches →
            </span>
          </p>
        )}
        {isFastIQ && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
            Unlimited searches · results in ~2 seconds
          </p>
        )}
      </div>

      {/* Example chips */}
      {!searched && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: '0 0 10px' }}>Try one of these:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {examples.map(ex => (
              <button
                key={ex}
                onClick={() => handleSearch(ex)}
                style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#555', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}
              >
                {ex.replace(`${schoolName} `, '')}
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
            {results.length} {schoolName} alumni found
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
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#555', margin: '0 0 3px' }}>{alum.headline}</p>
                      {alum.summary && (
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#999', margin: 0, lineHeight: 1.4 }}>{alum.summary.slice(0, 100)}...</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleConnect(alum)}
                      disabled={connectLoading === alum.linkedin_url || sentTo.includes(alum.linkedin_url)}
                      style={{
                        background: 'none',
                        border: `1px solid ${sentTo.includes(alum.linkedin_url) ? '#22C55E' : '#E85D20'}`,
                        borderRadius: 6, padding: '7px 14px', fontSize: 12,
                        color: sentTo.includes(alum.linkedin_url) ? '#22C55E' : '#E85D20',
                        cursor: sentTo.includes(alum.linkedin_url) ? 'default' : 'pointer',
                        whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto',
                      }}
                    >
                      {connectLoading === alum.linkedin_url ? 'Drafting...' : sentTo.includes(alum.linkedin_url) ? 'Sent ✓' : 'Connect →'}
                    </button>
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

      {/* Outreach modal */}
      {outreachModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>Reaching out via LinkedIn</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{outreachModal.alum.full_name}</p>
              <p style={{ fontSize: 13, color: '#666', margin: '2px 0 0' }}>{outreachModal.alum.headline}</p>
            </div>
            <div style={{ background: '#F0F7FF', border: '1px solid #B3D9FF', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0057B8', lineHeight: 1.5 }}>
              Edit your message, then click "Copy & Open LinkedIn" — paste it into your connection request.
            </div>
            <textarea
              value={editedDraft}
              onChange={e => setEditedDraft(e.target.value)}
              rows={6}
              style={{ width: '100%', fontSize: 13, lineHeight: 1.6, color: '#1A1A1A', background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 8, padding: 12, resize: 'vertical', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setOutreachModal(null)} style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#666', cursor: 'pointer', minHeight: 'auto' }}>Cancel</button>
              <button onClick={handleSendLinkedIn} disabled={!editedDraft.trim()} style={{ background: '#0077B5', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: !editedDraft.trim() ? 'not-allowed' : 'pointer', opacity: !editedDraft.trim() ? 0.7 : 1, minHeight: 'auto' }}>
                Copy & Open LinkedIn →
              </button>
            </div>
          </div>
        </div>
      )}

      {copyToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#1A1A1A', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>
          ✓ Message copied — paste it into your LinkedIn connection request
        </div>
      )}
    </div>
  );
}