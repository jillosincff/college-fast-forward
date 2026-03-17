import React, { useState, useRef, useEffect } from 'react';
import { SCHOOLS } from './V3HeroDemoData';

const dmSans = '"DM Sans", system-ui, sans-serif';
const DEFAULT_PRIMARY = '#E85D20';

export default function V3SchoolSelector({ selectedSchool, onSelect, accent }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const primary = accent?.primary || DEFAULT_PRIMARY;
  const soft = accent?.soft || 'rgba(232,93,32,0.12)';
  const border = accent?.border || 'rgba(232,93,32,0.30)';

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

  return (
    <div ref={ref} className="mb-4" style={{ position: 'relative' }}>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
          Showing results for
        </span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: primary,
            background: soft, border: `1px solid ${border}`,
            borderRadius: 8, padding: '4px 12px', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            minHeight: 'auto', minWidth: 'auto', width: 'auto',
            transition: 'color 0.3s, background 0.3s, border-color 0.3s',
          }}
        >
          {selectedSchool}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <path d="M2 4L5 7L8 4" stroke={primary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 320, marginTop: 8,
            background: '#141417', border: '1px solid #1F1F23',
            borderRadius: 12, zIndex: 50,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              placeholder="Search schools…"
              style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#fff',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '8px 12px', width: '100%',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
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
                  padding: '10px 16px', background: school === selectedSchool ? soft : 'transparent',
                  border: 'none',
                  fontFamily: dmSans, fontSize: 14, fontWeight: school === selectedSchool ? 600 : 500,
                  color: school === selectedSchool ? primary : '#fff',
                  cursor: 'pointer', transition: 'background 0.15s',
                  minHeight: 'auto', minWidth: 'auto',
                }}
                onMouseEnter={e => { if (school !== selectedSchool) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { if (school !== selectedSchool) e.currentTarget.style.background = 'transparent'; }}
              >
                {school}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}