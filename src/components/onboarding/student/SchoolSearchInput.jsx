import React, { useState, useEffect, useRef } from 'react';
import { useSchoolSearch, FALLBACK_SCHOOLS } from '@/lib/usSchoolSearch';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

// Backward-compatible export (other modules import COMMON_UNIVERSITIES from here).
export { FALLBACK_SCHOOLS as COMMON_UNIVERSITIES };

export default function SchoolSearchInput({ value, onChange, error, light }) {
  const [search, setSearch] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  // Suppresses the dropdown re-opening for one cycle after a school is picked.
  const [locked, setLocked] = useState(false);
  const { suggestions: filtered } = useSchoolSearch(search);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ''); }, [value]);

  useEffect(() => {
    if (locked) return;
    setShowDropdown(filtered.length > 0);
  }, [filtered, locked]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (name) => {
    setSearch(name);
    onChange(name);
    setShowDropdown(false);
    setLocked(true);
  };

  const onType = (val) => {
    setSearch(val);
    onChange(val);
    setLocked(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        value={search}
        onChange={e => onType(e.target.value)}
        placeholder="Start typing your school..."
        style={{
          width: '100%', background: light ? '#f8f9ff' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${error ? 'rgba(229,57,53,0.6)' : (light ? '#E2E8F0' : '#2A2A2A')}`,
          borderRadius: light ? 10 : 12, padding: light ? '12px 14px' : '14px 16px',
          fontFamily: dmSans, fontSize: light ? 14 : 15, fontWeight: 400,
          color: light ? '#0f172a' : '#fff', boxSizing: 'border-box',
          outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = light ? '#6d28d9' : ORANGE; }}
        onBlur={e => { if (!error) e.target.style.borderColor = light ? '#E2E8F0' : '#2A2A2A'; }}
      />
      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: light ? '#ffffff' : '#1A1A1A',
          border: `1px solid ${light ? '#E2E8F0' : '#2A2A2A'}`,
          borderRadius: light ? 10 : 12, marginTop: 4, maxHeight: 220, overflowY: 'auto',
          boxShadow: light ? '0 8px 24px rgba(0,0,0,0.12)' : '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {filtered.map(school => (
            <button
              key={school}
              type="button"
              onClick={() => select(school)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '12px 16px', background: 'none', border: 'none',
                fontFamily: dmSans, fontSize: 14, fontWeight: 400,
                color: light ? '#0f172a' : '#fff', cursor: 'pointer', minHeight: 'auto',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = light ? '#f8f9ff' : 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {school}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}