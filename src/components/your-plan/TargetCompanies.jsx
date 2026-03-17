import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function TargetCompanies({ companies, selectedCompany, onSelect, onViewContacts, onGenerateOutreach }) {
  if (!companies || companies.length === 0) return null;

  return (
    <div style={{
      background: '#15171C', borderRadius: 16, border: '1px solid #23252B',
      padding: '28px 28px 24px',
    }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
          🎯 Your target companies
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Start here — these are your highest-value targets.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {companies.map((c, i) => {
          const name = typeof c === 'string' ? c : c.name;
          const isUserTyped = typeof c === 'object' && c.userTyped;
          const isActive = selectedCompany === name;
          return (
            <button key={i} onClick={() => onSelect(name)} style={{
              background: isActive ? 'rgba(79,140,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: isActive ? '1px solid rgba(79,140,255,0.4)' : '1px solid #2A2D35',
              borderRadius: 10, padding: '10px 18px',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 8,
              minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#2A2D35'; }}
            >
              <Building2 size={14} style={{ color: isActive ? '#4F8CFF' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <span style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: isActive ? 600 : 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              }}>
                {name}{isUserTyped ? '*' : ''}
              </span>
            </button>
          );
        })}
      </div>

      {selectedCompany && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => onViewContacts(selectedCompany)} style={{
            background: 'rgba(79,140,255,0.1)', border: '1px solid rgba(79,140,255,0.25)',
            borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#4F8CFF',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.15s', minHeight: 'auto', width: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,140,255,0.1)'; }}
          >
            View contacts <ArrowRight size={14} />
          </button>
          <button onClick={() => onGenerateOutreach(selectedCompany)} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2D35',
            borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s', minHeight: 'auto', width: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            Generate outreach
          </button>
        </div>
      )}
    </div>
  );
}