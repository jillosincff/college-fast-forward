import React, { useState, useRef, useEffect } from 'react';
import { SCHOOLS } from './V3HeroDemoData';

const dmSans = '"DM Sans", system-ui, sans-serif';

export default function V3SchoolSelector({ selectedSchool, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const filtered = query
    ? SCHOOLS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : SCHOOLS;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (selectedSchool) {
    return (
      <div className="flex items-center justify-center gap-2 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
          Showing results for
        </span>
        <button
          onClick={() => { onSelect(null); setQuery(''); }}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#E85D20',
            background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.25)',
            borderRadius: 8, padding: '4px 12px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            minHeight: 'auto', minWidth: 'auto', width: 'auto',
          }}
        >
          {selectedSchool}
          <span style={{ fontSize: 11, opacity: 0.6 }}>✕</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="mb-5" style={{ position: 'relative', maxWidth: 380, margin: '0 auto' }}>
      <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, textAlign: 'center' }}>
        What school does your student attend?
      </label>
      <div
        onClick={() => setOpen(true)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 12, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'text',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search or select school"
          style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff',
            background: 'transparent', border: 'none', outline: 'none',
            width: '100%', padding: 0, margin: 0,
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
            background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12, maxHeight: 220, overflowY: 'auto', zIndex: 50,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '14px 16px', fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
              No schools found
            </div>
          ) : filtered.map(school => (
            <button
              key={school}
              onClick={() => { onSelect(school); setOpen(false); setQuery(''); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '12px 16px', background: 'transparent', border: 'none',
                fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
                cursor: 'pointer', transition: 'background 0.15s',
                minHeight: 'auto', minWidth: 'auto',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {school}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}