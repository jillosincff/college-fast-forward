import React, { useState, useRef, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const SCHOOLS = [
  'University of Florida', 'University of Michigan', 'UCF', 'Tulane University',
  'USC', 'Penn State', 'University of Miami', 'Ohio State University',
  'University of Georgia', 'University of Texas at Austin', 'University of Wisconsin',
  'Boston University', 'NYU', 'Vanderbilt University', 'Clemson University',
  'Florida State University', 'University of Alabama', 'Auburn University',
  'Indiana University', 'University of Maryland',
];

export default function StepSchool({ value, onChange, onNext }) {
  const [search, setSearch] = useState(value || '');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const filtered = SCHOOLS.filter(s =>
    s.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const select = (school) => {
    setSearch(school);
    onChange(school);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 440, margin: '0 auto' }}>
      <h2 style={{
        fontFamily: dmSans, fontSize: 26, fontWeight: 700, color: '#fff',
        lineHeight: 1.25, marginBottom: 10, letterSpacing: '-0.02em',
      }}>
        Where do you go to school?
      </h2>
      <p style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 400,
        color: 'rgba(255,255,255,0.4)', marginBottom: 32,
      }}>
        This helps us find the most relevant alumni.
      </p>

      <div ref={inputRef} style={{ position: 'relative', textAlign: 'left', marginBottom: 32 }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search for your school..."
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid #2A2D35',
            fontFamily: dmSans, fontSize: 16, fontWeight: 400, color: '#fff',
            outline: 'none', boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.4)'; }}
          onMouseLeave={e => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#2A2D35'; }}
        />
        {open && filtered.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            background: '#1A1C22', border: '1px solid #2A2D35', borderRadius: 12,
            marginTop: 6, maxHeight: 240, overflowY: 'auto',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}>
            {filtered.map(s => (
              <button key={s} onClick={() => select(s)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '12px 18px', background: 'none', border: 'none',
                fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', transition: 'background 0.1s', minHeight: 'auto',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={onNext} disabled={!value} style={{
        background: value ? '#4F8CFF' : 'rgba(255,255,255,0.08)',
        border: 'none', borderRadius: 12, padding: '14px 44px',
        cursor: value ? 'pointer' : 'default',
        fontFamily: dmSans, fontSize: 16, fontWeight: 600,
        color: value ? '#fff' : 'rgba(255,255,255,0.25)',
        transition: 'all 0.2s', minHeight: 'auto',
        boxShadow: value ? '0 4px 24px rgba(79,140,255,0.25)' : 'none',
      }}>
        Continue
      </button>
    </div>
  );
}