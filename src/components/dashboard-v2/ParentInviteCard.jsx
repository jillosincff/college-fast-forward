import React, { useState } from 'react';
import { toast } from 'sonner';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function ParentInviteCard({ user, linkedParents, onInviteParent }) {
  const [copied, setCopied] = useState(false);
  const hasParent = (linkedParents || []).length > 0 || user?.parentConnected === true;

  // If parent is connected, show the "Your Parent" card
  if (hasParent) {
    const parent = linkedParents?.[0];
    if (!parent) return null;
    const initials = (parent.full_name || parent.email || '??')
      .split(/[\s@]+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

    return (
      <div style={{
        background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: '#2a4a8a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
        }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', display: 'block', marginBottom: 2 }}>
            {parent.full_name || parent.email}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
            Active on CFF
          </span>
        </div>
        <button onClick={() => {}} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
          minHeight: 'auto', width: 'auto', padding: 0,
        }}>View their activity →</button>
      </div>
    );
  }

  const firstName = user?.first_name || user?.full_name?.split(/\s+/)[0] || 'Gator';
  const inviteLink = `${window.location.origin}/#GatorAuth`;

  const handleEmailInvite = () => {
    const subject = encodeURIComponent("I joined College Fast Forward — you should too");
    const body = encodeURIComponent(
      `Hey,\n\nI just joined College Fast Forward — a platform that connects UF students with parents and alumni for real career help. Students with a parent on the platform get 3x more warm intros.\n\nJoin here: ${inviteLink}\n\n— ${firstName}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    if (onInviteParent) onInviteParent();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className="parent-invite-card" style={{
      background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 16, padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @media(max-width:768px) {
          .parent-invite-inner { flex-direction: column !important; }
          .parent-invite-actions { flex-direction: column !important; }
          .parent-invite-actions button { width: 100% !important; justify-content: center; }
        }
      `}</style>
      {/* Subtle glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '50%', right: -40, transform: 'translateY(-50%)',
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(232,93,32,0.04)', pointerEvents: 'none',
      }} />

      <div className="parent-invite-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, flexShrink: 0, borderRadius: 14,
          background: 'rgba(232,93,32,0.08)', border: '0.5px solid rgba(232,93,32,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="7" r="3.5" />
            <path d="M3 19c0-3.5 3-6 6-6s6 2.5 6 6" />
            <line x1="17" y1="8" x2="17" y2="14" />
            <line x1="14" y1="11" x2="20" y2="11" />
          </svg>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a',
            marginBottom: 6, lineHeight: 1.3,
          }}>
            Your parent isn't on CFF yet — they should be.
          </p>
          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888',
            lineHeight: 1.6, marginBottom: 16,
          }}>
            Students with a parent on CFF get <strong style={{ color: '#E85D20', fontWeight: 500 }}>3x more warm intros</strong>. Your parent can see your matches, make introductions on your behalf, and help you get in the room. Add them in 30 seconds.
          </p>

          {/* Actions */}
          <div className="parent-invite-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleEmailInvite} style={{
              background: '#E85D20', color: '#fff',
              fontFamily: dmSans, fontSize: 13, fontWeight: 500,
              borderRadius: 100, padding: '10px 20px', border: 'none',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="22,4 12,13 2,4" />
              </svg>
              Send Email Invite
            </button>

            <button onClick={handleCopyLink} style={{
              background: 'rgba(0,0,0,0.04)', color: '#1a1a1a',
              border: '0.5px solid rgba(0,0,0,0.12)',
              fontFamily: dmSans, fontSize: 13, fontWeight: 400,
              borderRadius: 100, padding: '10px 20px',
              cursor: 'pointer', transition: 'background 0.2s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              {copied ? 'Link copied! ✓' : 'Copy Invite Link'}
            </button>
          </div>

          {/* Stat line */}
          <div style={{
            marginTop: 16, paddingTop: 14,
            borderTop: '0.5px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E85D20', opacity: 0.6, flexShrink: 0 }} />
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa' }}>
              Nearly 1,000 UF families are already on CFF — yours isn't one of them yet.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}