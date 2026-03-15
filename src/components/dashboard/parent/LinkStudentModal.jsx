import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { debounce } from 'lodash';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

function ChainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10 14l4-4M7 12L5 14a4 4 0 005.66 5.66L12.66 17.66M11.34 6.34L13 5a4 4 0 015.66 5.66L17 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="#aaa" strokeWidth="1.5"/>
      <path d="M10.5 10.5L14 14" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CheckAnim() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: '50%', background: orange,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px', animation: 'lsmBounce 0.4s ease both',
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M10 16l5 5 8-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

const AVATAR_COLORS = ['#E85D20', '#0821A5', '#6A2A60', '#2e7d32', '#D32737'];

function getDisplayName(student) {
  if (!student.full_name?.trim()) return student.email?.split('@')[0] || 'Unknown';
  const name = student.full_name;
  if (name.includes(',')) {
    const parts = name.split(',').map(s => s.trim());
    return `${parts[1] || ''} ${parts[0] || ''}`.trim();
  }
  return name;
}

function getFirstName(student) {
  const full = getDisplayName(student);
  return full.split(' ')[0] || full;
}

export default function LinkStudentModal({ open, onOpenChange, onLinked }) {
  const [view, setView] = useState('search'); // 'search' | 'found' | 'not_found' | 'success'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkedName, setLinkedName] = useState('');
  const [notFoundEmail, setNotFoundEmail] = useState('');

  const resetState = () => {
    setView('search');
    setQuery('');
    setResults([]);
    setSearching(false);
    setHasSearched(false);
    setLinking(false);
    setLinkedName('');
    setNotFoundEmail('');
  };

  const handleSearch = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    setHasSearched(true);
    setResults([]);
    try {
      const res = await base44.functions.invoke('searchGatorStudents', { query: q });
      const students = res.data?.students || [];
      if (students.length > 0) {
        setResults(students);
        setView('found');
      } else {
        setNotFoundEmail(q.includes('@') ? q : '');
        setView('not_found');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setNotFoundEmail(q.includes('@') ? q : '');
      setView('not_found');
    } finally {
      setSearching(false);
    }
  };

  const handleLinkStudent = async (student) => {
    setLinking(true);
    try {
      const res = await base44.functions.invoke('linkStudentToParent', { studentEmail: student.email });
      setLinkedName(getDisplayName(student));
      setView('success');
      if (onLinked) onLinked(res.data);
    } catch (error) {
      console.error('Link failed:', error);
    } finally {
      setLinking(false);
    }
  };

  const handleInviteAndPreLink = async () => {
    const email = notFoundEmail.trim();
    if (!email || !email.includes('@')) return;
    setLinking(true);
    try {
      const res = await base44.functions.invoke('linkStudentToParent', { studentEmail: email });
      setLinkedName(email.split('@')[0]);
      setView('success');
      if (onLinked) onLinked(res.data);
    } catch (error) {
      console.error('Link failed:', error);
    } finally {
      setLinking(false);
    }
  };

  const handleClose = (v) => {
    onOpenChange(v);
    if (!v) setTimeout(resetState, 200);
  };

  const inputStyle = {
    width: '100%', background: '#fff',
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12,
    padding: '12px 16px 12px 40px', fontFamily: dmSans, fontSize: 14, fontWeight: 400,
    color: '#1a1a1a', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const btnStyle = (enabled) => ({
    width: '100%', padding: 13, borderRadius: 100, border: 'none',
    background: enabled ? orange : 'rgba(0,0,0,0.08)',
    color: enabled ? '#fff' : '#bbb',
    fontFamily: dmSans, fontSize: 14, fontWeight: 500,
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s', minHeight: 'auto',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[520px] p-0 rounded-2xl overflow-hidden border-0" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
          @keyframes lsmFadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
          @keyframes lsmBounce { 0% { transform:scale(0) } 50% { transform:scale(1.15) } 100% { transform:scale(1) } }
          .lsm-input:focus { border-color: rgba(232,93,32,0.5) !important; }
          .lsm-input::placeholder { color: rgba(0,0,0,0.3); }
        `}</style>

        <div style={{ padding: '32px 28px' }}>
          {/* ── SEARCH VIEW ── */}
          {view === 'search' && (
            <div style={{ animation: 'lsmFadeUp 0.3s ease both' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: orange,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <ChainIcon />
                </div>
                <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 6 }}>
                  Link Your Student
                </h2>
                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.6 }}>
                  Connect your student's account so your activity boosts their visibility in the network.
                </p>
              </div>

              {/* Search field */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
                  Student Name or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                    <SearchIcon />
                  </div>
                  <input
                    className="lsm-input"
                    style={inputStyle}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g. Jane Doe or jane@email.com"
                    onKeyDown={e => e.key === 'Enter' && query.trim().length >= 2 && !searching && handleSearch()}
                    autoFocus
                  />
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                disabled={query.trim().length < 2 || searching}
                style={btnStyle(query.trim().length >= 2 && !searching)}
                onMouseEnter={e => { if (query.trim().length >= 2 && !searching) e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { if (query.trim().length >= 2 && !searching) e.currentTarget.style.background = orange; }}
              >
                {searching ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Searching...
                  </>
                ) : 'Search →'}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* ── FOUND VIEW ── */}
          {view === 'found' && (
            <div style={{ animation: 'lsmFadeUp 0.3s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: orange,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <ChainIcon />
                </div>
                <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 6 }}>
                  Link Your Student
                </h2>
              </div>

              {/* Result cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {results.map((student, i) => {
                  const name = getDisplayName(student);
                  const initial = name.charAt(0).toUpperCase();
                  const bgColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <div key={student.id || i} style={{
                      background: '#f9f8f6', border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 12, padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0,
                      }}>{initial}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 1 }}>{name}</p>
                        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888' }}>
                          {student.major || ''}{student.major && ' · '}Student on CFF ✓
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Link button (link first result) */}
              <button
                onClick={() => handleLinkStudent(results[0])}
                disabled={linking}
                style={btnStyle(!linking)}
                onMouseEnter={e => { if (!linking) e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { if (!linking) e.currentTarget.style.background = orange; }}
              >
                {linking ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Linking...
                  </>
                ) : `Link ${getFirstName(results[0])} to My Account →`}
              </button>

              {/* Back link */}
              <button
                onClick={() => { setView('search'); setResults([]); setHasSearched(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'center', background: 'none', border: 'none',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
                  cursor: 'pointer', marginTop: 12, minHeight: 'auto',
                }}
              >
                ← Search again
              </button>
            </div>
          )}

          {/* ── NOT FOUND VIEW ── */}
          {view === 'not_found' && (
            <div style={{ animation: 'lsmFadeUp 0.3s ease both' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: orange,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <ChainIcon />
                </div>
                <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#1a1a1a', marginBottom: 6 }}>
                  We didn't find {query.trim().includes('@') ? query.trim() : `"${query.trim()}"`} on CFF yet.
                </h2>
                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.6 }}>
                  No problem — enter their email and we'll connect you automatically when they join.
                </p>
              </div>

              {/* Email input */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
                  Student Email
                </label>
                <input
                  className="lsm-input"
                  style={{ ...inputStyle, paddingLeft: 16 }}
                  type="email"
                  value={notFoundEmail}
                  onChange={e => setNotFoundEmail(e.target.value)}
                  placeholder="student@email.com"
                  onKeyDown={e => e.key === 'Enter' && notFoundEmail.includes('@') && !linking && handleInviteAndPreLink()}
                  autoFocus
                />
              </div>

              {/* Invite button */}
              <button
                onClick={handleInviteAndPreLink}
                disabled={!notFoundEmail.includes('@') || linking}
                style={btnStyle(notFoundEmail.includes('@') && !linking)}
                onMouseEnter={e => { if (notFoundEmail.includes('@') && !linking) e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { if (notFoundEmail.includes('@') && !linking) e.currentTarget.style.background = orange; }}
              >
                {linking ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Sending...
                  </>
                ) : 'Send Invite & Pre-Link →'}
              </button>

              {/* Fine print */}
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', textAlign: 'center', marginTop: 10 }}>
                They'll get a welcome email with your invite. You'll be notified when they join.
              </p>

              {/* Back link */}
              <button
                onClick={() => { setView('search'); setNotFoundEmail(''); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'center', background: 'none', border: 'none',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
                  cursor: 'pointer', marginTop: 10, minHeight: 'auto',
                }}
              >
                ← Search again
              </button>
            </div>
          )}

          {/* ── SUCCESS VIEW ── */}
          {view === 'success' && (
            <div style={{ animation: 'lsmFadeUp 0.3s ease both', textAlign: 'center', padding: '12px 0' }}>
              <CheckAnim />
              <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 6 }}>
                You're linked to {linkedName}!
              </h2>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>
                Your activity now boosts their visibility in the network. Keep helping students to increase their reach.
              </p>
              <button
                onClick={() => handleClose(false)}
                style={btnStyle(true)}
                onMouseEnter={e => { e.currentTarget.style.background = orangeHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = orange; }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}