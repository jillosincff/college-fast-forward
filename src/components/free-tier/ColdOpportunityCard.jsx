/**
 * ColdOpportunityCard
 * Displays an industry-matched role without alumni connections.
 * Clearly labeled as "cold" to maintain trust.
 */
import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function ColdOpportunityCard({ card, shortName, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 'calc(100vw - 56px)',
        maxWidth: 480,
        scrollSnapAlign: 'start',
        background: '#fff',
        borderRadius: 20,
        border: hovered ? '1.5px solid #9ca3af' : '1.5px solid #e5e7eb',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 0.25s, border-color 0.25s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Row 1: Company header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            🏢
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 900, color: '#0f172a', margin: '0 0 1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.company}
            </p>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.role}
            </p>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 100, padding: '3px 8px', flexShrink: 0 }}>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>❄️ COLD</span>
        </span>
      </div>

      {/* Row 2: Job description */}
      <div style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0' }}>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#475569', margin: 0, lineHeight: 1.55 }}>
          {card.jobDescription}
        </p>
      </div>

      {/* Row 3: Honest status */}
      <div style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)', borderBottom: '1px solid #fde68a' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#92400e', margin: '0 0 2px' }}>
              No {shortName} connections yet
            </p>
            <p style={{ fontFamily: dm, fontSize: 10, color: '#78350f', margin: 0, lineHeight: 1.5 }}>
              Traditional application required — CLiFF is still hunting for backdoors
            </p>
          </div>
        </div>
      </div>

      {/* Row 4: Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
          <span style={{ fontSize: 11 }}>📋</span>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#64748b' }}>
            Standard Apply
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onClick && onClick(); }}
          style={{
            fontFamily: dm, fontSize: 11, fontWeight: 800,
            color: '#fff', background: '#64748b',
            border: 'none', borderRadius: 8, padding: '6px 12px',
            cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}