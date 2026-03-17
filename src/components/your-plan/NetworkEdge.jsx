import React from 'react';
import { ArrowRight, Users } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function NetworkEdge({ visible, onCheckConnections }) {
  if (!visible) return null;

  return (
    <div style={{
      background: '#15171C', borderRadius: 16, border: '1px solid #23252B',
      padding: '24px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <h3 style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
          Need an edge?
        </h3>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Want to see if someone in the network can help?
        </p>
      </div>
      <button onClick={onCheckConnections} style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2D35',
        borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
        fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
        display: 'flex', alignItems: 'center', gap: 8,
        transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2D35'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
      >
        <Users size={15} /> Check for connections <ArrowRight size={14} />
      </button>
    </div>
  );
}