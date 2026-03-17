import React from 'react';
import { GraduationCap, Users } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function ConnectionCard({ connection, onRequestIntro }) {
  const initials = connection.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const typeColor = connection.type === 'Parent' ? '#E85D20' : '#4F8CFF';
  const typeIcon = connection.type === 'Parent' ? Users : GraduationCap;
  const TypeIcon = typeIcon;

  return (
    <div style={{
      background: '#15171C',
      border: '1px solid #23252B',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
    }}>
      {/* Avatar */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: '#23252B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: dmSans,
        fontSize: 14,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        flexShrink: 0,
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: dmSans,
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
          }}>
            {connection.name}
          </span>

          {/* Type badge */}
          <span style={{
            background: `${typeColor}15`,
            border: `0.5px solid ${typeColor}40`,
            borderRadius: 6,
            padding: '2px 8px',
            fontFamily: dmSans,
            fontSize: 10,
            fontWeight: 600,
            color: typeColor,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <TypeIcon size={10} />
            {connection.type}
          </span>
        </div>

        <p style={{
          fontFamily: dmSans,
          fontSize: 13,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          marginBottom: 2,
        }}>
          {connection.role} — {connection.company}
        </p>

        {connection.school && (
          <p style={{
            fontFamily: dmSans,
            fontSize: 12,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.35)',
            marginBottom: 0,
          }}>
            {connection.school}
          </p>
        )}

        {/* Badges */}
        {(connection.openToHelping || connection.recentlyActive) && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {connection.openToHelping && (
              <span style={{
                background: 'rgba(76,175,80,0.1)',
                border: '0.5px solid rgba(76,175,80,0.25)',
                borderRadius: 6,
                padding: '3px 8px',
                fontFamily: dmSans,
                fontSize: 10,
                fontWeight: 500,
                color: '#4CAF50',
              }}>
                Open to helping students
              </span>
            )}
            {connection.recentlyActive && (
              <span style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                padding: '3px 8px',
                fontFamily: dmSans,
                fontSize: 10,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.5)',
              }}>
                Recently active
              </span>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => onRequestIntro(connection)}
        style={{
          background: 'rgba(79,140,255,0.1)',
          border: '1px solid rgba(79,140,255,0.2)',
          borderRadius: 8,
          padding: '8px 14px',
          cursor: 'pointer',
          fontFamily: dmSans,
          fontSize: 12,
          fontWeight: 600,
          color: '#4F8CFF',
          transition: 'all 0.15s',
          minHeight: 'auto',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(79,140,255,0.18)';
          e.currentTarget.style.borderColor = 'rgba(79,140,255,0.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(79,140,255,0.1)';
          e.currentTarget.style.borderColor = 'rgba(79,140,255,0.2)';
        }}
      >
        Request intro
      </button>
    </div>
  );
}