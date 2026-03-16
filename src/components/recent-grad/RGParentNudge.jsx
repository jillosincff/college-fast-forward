import React from 'react';
import { Link2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function RGParentNudge({ onInviteParent }) {
  return (
    <div style={{
      background: '#fffaf5', border: '2px solid #E85D20', borderRadius: 16,
      padding: '24px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(232,93,32,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Link2 style={{ width: 22, height: 22, color: '#E85D20' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontFamily: playfair, fontWeight: 700, fontSize: 18, color: '#1a1a1a',
            marginBottom: 6,
          }}>
            Invite Your Parent to Boost Your Visibility
          </h3>
          <p style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#666',
            lineHeight: 1.6, marginBottom: 16,
          }}>
            Every time your parent helps another student, your requests move up in the feed. It's the fastest way to get more responses.
          </p>
          <button
            onClick={onInviteParent}
            style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 700, width: '100%',
              height: 48, borderRadius: 12, border: 'none', background: '#E85D20',
              color: '#fff', cursor: 'pointer',
            }}
          >
            Find & Invite Your Parent →
          </button>
          <p style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#aaa',
            textAlign: 'center', marginTop: 10,
          }}>
            If they're already on College Fast Forward we'll link you automatically.
          </p>
        </div>
      </div>
    </div>
  );
}