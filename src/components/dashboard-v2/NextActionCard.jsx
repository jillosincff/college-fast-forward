import React from 'react';
import { navigate } from '@/components/utils/navigation';
import moment from 'moment';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function NextActionCard({ messages, matches }) {
  // Find the most recent unread message from a match/helper
  const unread = (messages || []).filter(m => !m.is_read && m.sender_email);
  if (unread.length === 0) return null;

  const msg = unread[0];
  const senderName = msg.sender_name || msg.sender_email?.split('@')[0] || 'Someone';
  const firstName = senderName.split(/\s+/)[0];

  // Find matching match record for role/company info
  const match = (matches || []).find(m =>
    m.parent_email === msg.sender_email || m.peer_email === msg.sender_email
  );
  const role = match?.parent_role || '';
  const company = match?.parent_company || '';
  const timeAgo = moment(msg.created_date).fromNow();

  const detailParts = [role, company, `Responded ${timeAgo}`].filter(Boolean);
  const pronoun = 'them';

  return (
    <div className="dash-next-action" style={{
      background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderLeft: '3px solid #E85D20',
      borderRadius: '0 16px 16px 0', padding: 20,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <style>{`
        @media(max-width:768px) {
          .dash-next-action {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .dash-next-action .na-btn { width: 100% !important; text-align: center; justify-content: center; }
        }
      `}</style>
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'rgba(232,93,32,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', display: 'block', marginBottom: 3 }}>
          {senderName} replied to your question
        </strong>
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#666' }}>
          {detailParts.join(' · ')} — don't leave {pronoun} hanging
        </span>
      </div>
      {/* Button */}
      <button className="na-btn" onClick={() => navigate('MyMessages')} style={{
        background: '#E85D20', color: '#fff',
        fontFamily: dmSans, fontSize: 13, fontWeight: 500,
        borderRadius: 100, padding: '9px 20px', border: 'none',
        cursor: 'pointer', transition: 'background 0.2s',
        whiteSpace: 'nowrap', flexShrink: 0, minHeight: 'auto', width: 'auto',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
      >
        Reply Now →
      </button>
    </div>
  );
}