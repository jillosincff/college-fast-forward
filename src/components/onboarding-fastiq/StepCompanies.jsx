import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const SUGGESTED = ['Deloitte', 'Google', 'Nike', 'JPMorgan', 'Spotify', 'McKinsey', 'Apple', 'Amazon'];

export default function StepCompanies({ selected, onChange, onBuild }) {
  const [customInput, setCustomInput] = useState('');

  const toggle = (name) => {
    if (selected.includes(name)) onChange(selected.filter(s => s !== name));
    else onChange([...selected, name]);
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
  };

  return (
    <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{
        fontFamily: dmSans, fontSize: 26, fontWeight: 700, color: '#fff',
        lineHeight: 1.25, marginBottom: 10, letterSpacing: '-0.02em',
      }}>
        Any companies you're interested in?
      </h2>
      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 400,
        color: 'rgba(255,255,255,0.4)', marginBottom: 24,
      }}>
        Don't worry if you're not sure — we'll help.
      </p>

      {/* Custom input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
        <input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a company name..."
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid #2A2D35',
            fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button onClick={addCustom} disabled={!customInput.trim()} style={{
          background: customInput.trim() ? 'rgba(79,140,255,0.15)' : 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(79,140,255,0.25)',
          borderRadius: 10, padding: '12px 16px', cursor: customInput.trim() ? 'pointer' : 'default',
          fontFamily: dmSans, fontSize: 14, fontWeight: 500,
          color: customInput.trim() ? '#4F8CFF' : 'rgba(255,255,255,0.2)',
          minHeight: 'auto', width: 'auto', transition: 'all 0.15s',
        }}>
          Add
        </button>
      </div>

      {/* Suggested chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
        {SUGGESTED.map(name => {
          const active = selected.includes(name);
          return (
            <button key={name} onClick={() => toggle(name)} style={{
              background: active ? 'rgba(79,140,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: active ? '1px solid rgba(79,140,255,0.4)' : '1px solid #2A2D35',
              borderRadius: 10, padding: '10px 16px',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: dmSans, fontSize: 14, fontWeight: active ? 600 : 500,
              color: active ? '#fff' : 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = active ? 'rgba(79,140,255,0.4)' : '#2A2D35'; }}
            >
              <Building2 size={13} style={{ color: active ? '#4F8CFF' : 'rgba(255,255,255,0.3)' }} />
              {name}
            </button>
          );
        })}
      </div>

      {/* Selected custom tags */}
      {selected.filter(s => !SUGGESTED.includes(s)).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {selected.filter(s => !SUGGESTED.includes(s)).map(name => (
            <span key={name} onClick={() => toggle(name)} style={{
              background: 'rgba(79,140,255,0.15)', border: '1px solid rgba(79,140,255,0.4)',
              borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {name} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>✕</span>
            </span>
          ))}
        </div>
      )}

      <button onClick={onBuild} style={{
        background: '#4F8CFF', border: 'none', borderRadius: 12,
        padding: '16px 44px', cursor: 'pointer',
        fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff',
        transition: 'all 0.2s', minHeight: 'auto',
        boxShadow: '0 4px 24px rgba(79,140,255,0.3)',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        Build My Plan
      </button>
    </div>
  );
}