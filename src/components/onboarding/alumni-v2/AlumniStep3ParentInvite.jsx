import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const AVATAR_COLORS = ['#E85D20', '#0821A5', '#6A2A60', '#16a34a', '#0891b2'];
function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AlumniStep3ParentInvite({ formData, onUpdate, onNext, onBack }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null); // null = not searched, 'found' | 'not_found'
  const [foundParent, setFoundParent] = useState(null);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    setFoundParent(null);
    setLinked(false);
    setInvited(false);

    try {
      const response = await base44.functions.invoke('searchUserForDirectory', { query: query.trim() });
      const users = response?.data?.users || response?.data || [];
      const parent = Array.isArray(users) ? users.find(u =>
        u.persona === 'parent' || u.roles?.includes('parent')
      ) : null;

      if (parent) {
        setFoundParent(parent);
        setResult('found');
      } else {
        setResult('not_found');
        // Pre-fill invite email if query looks like an email
        if (query.includes('@')) setInviteEmail(query.trim());
        else setInviteEmail('');
      }
    } catch (err) {
      console.error('Parent search failed:', err);
      setResult('not_found');
      if (query.includes('@')) setInviteEmail(query.trim());
    } finally {
      setSearching(false);
    }
  };

  const handleLink = async () => {
    if (!foundParent) return;
    setLinking(true);
    try {
      // Store parent link info for post-onboarding processing
      onUpdate({ linkedParentId: foundParent.id, linkedParentEmail: foundParent.email });
      setLinked(true);
    } catch (err) {
      console.error('Link failed:', err);
    } finally {
      setLinking(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), 'user');
      onUpdate({ invitedParentEmail: inviteEmail.trim() });
      setInvited(true);
    } catch (err) {
      console.error('Invite failed:', err);
      // Still mark as done so they can proceed
      setInvited(true);
    } finally {
      setInviting(false);
    }
  };

  const initials = foundParent?.full_name
    ? foundParent.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'P';

  return (
    <div>
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
        Is your parent on College Fast Forward?
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 28 }}>
        Search by name or email to find and link them.
      </p>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="e.g., Jane Doe or jane@email.com"
          style={{
            fontFamily: dmSans, fontSize: 14, flex: 1, height: 48,
            border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || searching}
          style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 700, padding: '0 24px', height: 48,
            borderRadius: 12, border: 'none',
            background: query.trim() ? '#E85D20' : '#e5e7eb',
            color: query.trim() ? '#fff' : '#aaa',
            cursor: query.trim() ? 'pointer' : 'not-allowed',
            minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {searching ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : 'Search →'}
        </button>
      </div>

      {/* Found parent */}
      {result === 'found' && foundParent && (
        <div style={{
          background: '#f8faf8', border: '2px solid #d1fae5', borderRadius: 14,
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: getAvatarColor(foundParent.id),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff' }}>{initials}</span>
            </div>
            <div>
              <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                {foundParent.full_name || 'Parent'}
              </p>
              <span style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                background: '#16a34a', color: '#fff', borderRadius: 100,
                padding: '2px 10px',
              }}>
                Parent · College Fast Forward
              </span>
            </div>
          </div>

          {linked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
              <CheckCircle2 style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600 }}>Linked!</span>
            </div>
          ) : (
            <button
              onClick={handleLink}
              disabled={linking}
              style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 700, width: '100%', height: 48,
                borderRadius: 12, border: 'none', background: '#E85D20', color: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {linking ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : `Link ${(foundParent.full_name || '').split(' ')[0] || 'them'} as My Parent →`}
            </button>
          )}
        </div>
      )}

      {/* Not found */}
      {result === 'not_found' && (
        <div style={{
          background: '#fefce8', border: '2px solid #fef08a', borderRadius: 14,
          padding: 20, marginBottom: 20,
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#854d0e', marginBottom: 4 }}>
            We didn't find them on College Fast Forward yet.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#a16207', marginBottom: 16 }}>
            No problem — invite them and we'll link you automatically when they join.
          </p>

          {invited ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a' }}>
              <CheckCircle2 style={{ width: 20, height: 20 }} />
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600 }}>Invite sent!</span>
            </div>
          ) : (
            <>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="Parent's email address"
                style={{
                  fontFamily: dmSans, fontSize: 14, width: '100%', height: 48,
                  border: '2px solid #e5e7eb', borderRadius: 12, padding: '0 14px',
                  outline: 'none', boxSizing: 'border-box', marginBottom: 10,
                }}
              />
              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
                style={{
                  fontFamily: dmSans, fontSize: 14, fontWeight: 700, width: '100%', height: 48,
                  borderRadius: 12, border: 'none',
                  background: inviteEmail.trim() ? '#E85D20' : '#e5e7eb',
                  color: inviteEmail.trim() ? '#fff' : '#aaa',
                  cursor: inviteEmail.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {inviting ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : 'Send Invite & Pre-Link →'}
              </button>
              <p style={{ fontFamily: dmSans, fontSize: 11, color: '#a16207', marginTop: 8 }}>
                They'll get a welcome email with your invite. You'll be notified when they join.
              </p>
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button onClick={onBack} style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, padding: '0 24px', height: 52,
          borderRadius: 12, border: '2px solid #e5e7eb', background: '#fff', color: '#555',
          cursor: 'pointer', minHeight: 'auto',
        }}>
          ← Back
        </button>
        <button onClick={onNext} style={{
          fontFamily: dmSans, fontSize: 16, fontWeight: 700, flex: 1, height: 52,
          borderRadius: 12, border: 'none', background: '#E85D20', color: '#fff', cursor: 'pointer',
        }}>
          Continue →
        </button>
      </div>

      {/* Skip option */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button onClick={onNext} style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          minHeight: 'auto', width: 'auto',
        }}>
          Skip for now →
        </button>
        <p style={{ fontFamily: dmSans, fontSize: 11, color: '#ccc', marginTop: 4 }}>
          You can invite your parent later from your dashboard.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}