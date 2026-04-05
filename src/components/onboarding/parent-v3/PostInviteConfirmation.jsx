import React from 'react';
import InvitationUpgradeScreen from '@/components/founding-offer/InvitationUpgradeScreen';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

/**
 * Post-invite confirmation state for Screen 2.
 * When founding offer is active → renders the full InvitationUpgradeScreen (light bg).
 * When offer is inactive → simple confirmation + invite another.
 */
export default function PostInviteConfirmation({ invitedStudents, offer, onInviteAnother, onSkip }) {
  const latest = invitedStudents[invitedStudents.length - 1];
  const studentName = latest?.name || 'your student';

  // Full upgrade screen when offer is active
  if (offer.active) {
    return (
      <InvitationUpgradeScreen
        studentName={studentName}
        display={offer.display}
        onInviteAnother={onInviteAnother}
        onSkip={onSkip}
      />
    );
  }

  // Simple confirmation when no offer
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Success checkmark */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: 'rgba(76,175,80,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 style={{
        fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff',
        lineHeight: 1.4, marginBottom: 8,
      }}>
        Invitation sent to {studentName}. ✓
      </h2>
      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.45)',
        lineHeight: 1.6, marginBottom: 24,
      }}>
        {"We'll let you know when they create their account."}
      </p>

      {/* Previous invitations */}
      {invitedStudents.length > 1 && (
        <div style={{ marginBottom: 20 }}>
          {invitedStudents.slice(0, -1).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '4px 0' }}>
              <span style={{ color: '#4CAF50', fontSize: 12 }}>✓</span>
              <span style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(244,240,232,0.5)' }}>
                Also sent to <strong style={{ color: '#fff' }}>{s.name}</strong>{s.university ? ` at ${s.university}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      <button onClick={onSkip} style={{
        background: '#E85D20', border: 'none',
        borderRadius: 10, padding: '14px',
        fontSize: 15, fontWeight: 600,
        color: '#fff', cursor: 'pointer',
        width: '100%', marginBottom: 12,
        fontFamily: dmSans, minHeight: 'auto',
      }}>
        Continue →
      </button>

      <button
        type="button"
        onClick={onInviteAnother}
        style={{
          display: 'block', width: '100%', textAlign: 'center',
          background: 'none', border: 'none',
          fontFamily: dmSans, fontSize: 13,
          color: 'rgba(244,240,232,0.4)', cursor: 'pointer',
          minHeight: 'auto',
        }}
      >
        Invite another student →
      </button>
    </div>
  );
}