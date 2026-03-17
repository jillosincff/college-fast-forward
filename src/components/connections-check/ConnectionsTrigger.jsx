import React from 'react';
import { Users } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function ConnectionsTrigger({ company, onCheck, variant = 'default' }) {
  const isCompact = variant === 'compact';

  return (
    <div style={{
      background: isCompact ? 'rgba(255,255,255,0.02)' : 'linear-gradient(135deg, rgba(79,140,255,0.06) 0%, rgba(79,140,255,0.02) 100%)',
      border: '1px solid rgba(79,140,255,0.12)',
      borderRadius: isCompact ? 12 : 16,
      padding: isCompact ? '16px 18px' : '24px 28px',
      textAlign: isCompact ? 'left' : 'center',
    }}>
      {!isCompact && (
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(79,140,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Users size={18} style={{ color: '#4F8CFF' }} />
        </div>
      )}

      <p style={{
        fontFamily: dmSans,
        fontSize: isCompact ? 14 : 16,
        fontWeight: 600,
        color: '#fff',
        marginBottom: isCompact ? 4 : 8,
      }}>
        {isCompact ? 'Network edge available' : 'Want an extra edge?'}
      </p>

      <p style={{
        fontFamily: dmSans,
        fontSize: isCompact ? 12 : 14,
        fontWeight: 400,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: isCompact ? 12 : 20,
        lineHeight: 1.5,
      }}>
        {company
          ? `Check if someone in the network can help with ${company}.`
          : 'Check if someone in the network can help you get an introduction.'}
      </p>

      <button
        onClick={onCheck}
        style={{
          background: 'rgba(79,140,255,0.12)',
          border: '1px solid rgba(79,140,255,0.25)',
          borderRadius: 10,
          padding: isCompact ? '10px 16px' : '12px 24px',
          cursor: 'pointer',
          fontFamily: dmSans,
          fontSize: isCompact ? 13 : 14,
          fontWeight: 600,
          color: '#4F8CFF',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
          minHeight: 'auto',
          width: isCompact ? '100%' : 'auto',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(79,140,255,0.18)';
          e.currentTarget.style.borderColor = 'rgba(79,140,255,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(79,140,255,0.12)';
          e.currentTarget.style.borderColor = 'rgba(79,140,255,0.25)';
        }}
      >
        <Users size={14} />
        Check for connections
      </button>

      {!isCompact && (
        <p style={{
          fontFamily: dmSans,
          fontSize: 11,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.25)',
          marginTop: 12,
          fontStyle: 'italic',
        }}>
          Not required — but powerful when available
        </p>
      )}
    </div>
  );
}