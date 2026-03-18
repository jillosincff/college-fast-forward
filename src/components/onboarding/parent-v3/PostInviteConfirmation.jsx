import React from 'react';
import FoundingOfferBanner from '@/components/founding-offer/FoundingOfferBanner';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

/**
 * Post-invite confirmation state for Screen 2.
 * Shows success confirmation + founding offer + option to invite another or skip.
 */
export default function PostInviteConfirmation({ invitedStudents, offer, onInviteAnother, onSkip }) {
  const latest = invitedStudents[invitedStudents.length - 1];
  const studentName = latest?.name || 'your student';
  const university = latest?.university || '';

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

      {/* Confirmation text */}
      <h2 style={{
        fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff',
        lineHeight: 1.4, marginBottom: 8,
      }}>
        Invitation sent to {studentName}{university ? ` at ${university}` : ''}. ✓
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

      {/* Orange divider */}
      <div style={{ height: 1, background: ORANGE, opacity: 0.4, margin: '0 0 24px' }} />

      {/* Founding Member Offer */}
      {offer.active && (
        <FoundingOfferBanner display={offer.display} studentName={studentName} />
      )}

      {/* Invite another student option */}
      <div style={{ marginTop: offer.active ? 24 : 0 }}>
        {offer.active && (
          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 400,
            color: 'rgba(244,240,232,0.5)', marginBottom: 12,
          }}>
            Want to invite another student before deciding?
          </p>
        )}
        <button onClick={onInviteAnother} style={{
          width: '100%', padding: '13px 24px', borderRadius: 100,
          background: 'transparent', border: `1.5px solid ${ORANGE}`,
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: ORANGE,
          cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s',
        }}>
          Invite Another Student →
        </button>
      </div>

      {/* Skip link */}
      <button
        type="button"
        onClick={onSkip}
        style={{
          display: 'block', width: '100%', marginTop: 16, textAlign: 'center',
          background: 'none', border: 'none',
          fontFamily: dmSans, fontSize: 13, fontWeight: 300,
          color: 'rgba(244,240,232,0.35)', cursor: 'pointer',
          transition: 'color 0.2s', minHeight: 'auto',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.35)'; }}
      >
        {"I'll decide later →"}
      </button>
    </div>
  );
}