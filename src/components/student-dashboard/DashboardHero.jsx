import React, { useState } from 'react';
import { dmSans, playfair, BG, ORANGE } from './constants';
import AskParentModal from './AskParentModal';

export default function DashboardHero({ user, isPaid, onUnlock }) {
  const [showAskParent, setShowAskParent] = useState(false);
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div style={{
      background: 'linear-gradient(180deg, #111111 0%, #0A0A0A 100%)',
      padding: '40px 24px 32px',
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 38px)', color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
          Welcome, {firstName}.
        </h1>
        <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 26px)', color: ORANGE, lineHeight: 1.3, marginBottom: 16 }}>
          Your career starts here.
        </p>

        {/* Subhead */}
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#888', lineHeight: 1.65, maxWidth: 600, marginBottom: isPaid ? 0 : 24 }}>
          {isPaid
            ? 'FastIQ is active. Your full career engine is ready.'
            : 'You have access to powerful career research tools. Unlock FastIQ to get the full plan, real alumni contacts, and personalized outreach.'}
        </p>

        {/* Upgrade banner — free users only */}
        {!isPaid && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,93,32,0.12) 0%, rgba(232,93,32,0.06) 100%)',
            border: '1px solid rgba(232,93,32,0.25)',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff', lineHeight: 1.5, marginBottom: 4 }}>
              🚀 Your parent can activate FastIQ for you in one click.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888', lineHeight: 1.5, marginBottom: 16 }}>
              It takes 5 minutes. It changes everything.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button
                onClick={onUnlock}
                style={{
                  fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
                  background: ORANGE, border: 'none', borderRadius: 100,
                  padding: '10px 24px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
                }}
              >
                Unlock FastIQ →
              </button>
              <button
                onClick={() => setShowAskParent(true)}
                style={{
                  fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#888',
                  background: 'transparent', border: '1px solid #333',
                  borderRadius: 100, padding: '10px 24px', cursor: 'pointer',
                  minHeight: 'auto', minWidth: 'auto',
                }}
              >
                Ask Your Parent →
              </button>
            </div>
          </div>
        )}
      </div>

      {showAskParent && (
        <AskParentModal user={user} onClose={() => setShowAskParent(false)} />
      )}
    </div>
  );
}