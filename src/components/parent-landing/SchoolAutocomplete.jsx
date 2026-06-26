import { useState, useRef, useEffect } from 'react';

const SCHOOL_LIST = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'Florida Atlantic University', 'University of Miami', 'University of South Florida',
  'Ohio State University', 'University of Michigan', 'Penn State University',
  'University of Georgia', 'University of Maryland', 'University of Delaware',
  'Tulane University', 'James Madison University', 'University of South Carolina',
  'University of Kentucky', 'University of Texas at Austin', 'UC Berkeley',
  'University of Virginia', 'Duke University', 'University of North Carolina',
  'Northwestern University', 'University of Notre Dame', 'Georgetown University',
  'Boston University', 'Northeastern University', 'NYU', 'Cornell University',
  'University of Pennsylvania', 'Yale University', 'Harvard University', 'Stanford University',
  'UCLA', 'USC', 'University of Washington', 'Arizona State University',
  'University of Illinois', 'Indiana University', 'Purdue University',
  'Michigan State University', 'University of Wisconsin', 'University of Minnesota',
  'Virginia Tech', 'Georgia Tech', 'Texas A&M University', 'Rice University',
  'Vanderbilt University', 'Emory University', 'Carnegie Mellon University',
  'University of Pittsburgh', 'Rutgers University', 'University of Connecticut',
  'University of Colorado Boulder', 'Babson College',
];

export default function SchoolAutocomplete({ value, onChange, inputStyle, indigo, textColor }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [matches, setMatches] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const q = (value || '').toLowerCase().trim();
    if (q.length >= 2) {
      const found = SCHOOL_LIST.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
      setMatches(found);
      // Hide if the only match is exactly what's typed
      setShowDropdown(found.length > 0 && !(found.length === 1 && found[0].toLowerCase() === q));
    } else {
      setShowDropdown(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (name) => {
    onChange(name);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={wrapRef}>
      <input
        className="parent-input"
        style={inputStyle}
        placeholder="e.g. University of Florida"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { if (matches.length > 0) setShowDropdown(true); }}
        autoComplete="off"
        required
      />
      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: '#fff', border: '1.5px solid #E2E8F0',
          borderRadius: 12, marginTop: 4, maxHeight: 220, overflowY: 'auto',
          boxShadow: '0 12px 32px rgba(15,23,42,0.14)',
        }}>
          {matches.map(school => (
            <button
              key={school}
              type="button"
              onClick={() => select(school)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '11px 16px', background: 'none', border: 'none',
                fontFamily: 'inherit', fontSize: 14, color: textColor,
                cursor: 'pointer', minHeight: 'auto', transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.06)'; }}
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