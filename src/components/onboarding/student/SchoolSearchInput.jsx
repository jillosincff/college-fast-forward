import React, { useState, useEffect, useRef } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

const COMMON_UNIVERSITIES = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Miami', 'University of South Florida', 'Florida Atlantic University',
  'Florida International University', 'University of North Florida', 'Stetson University',
  'Rollins College', 'University of Tampa', 'Nova Southeastern University',
  'University of Alabama', 'Auburn University', 'University of Georgia', 'Georgia Tech',
  'Clemson University', 'University of South Carolina', 'University of Tennessee',
  'Vanderbilt University', 'University of Kentucky', 'University of Mississippi',
  'Louisiana State University', 'University of Arkansas', 'Texas A&M University',
  'University of Texas at Austin', 'Baylor University', 'Rice University', 'SMU',
  'TCU', 'Ohio State University', 'University of Michigan', 'Michigan State University',
  'Penn State University', 'University of Wisconsin', 'University of Minnesota',
  'University of Iowa', 'Indiana University', 'Purdue University', 'Northwestern University',
  'University of Illinois', 'University of Notre Dame', 'Wake Forest University',
  'Duke University', 'University of North Carolina', 'NC State University',
  'University of Virginia', 'Virginia Tech', 'James Madison University',
  'Boston College', 'Boston University', 'Northeastern University', 'Harvard University',
  'MIT', 'Yale University', 'Princeton University', 'Columbia University', 'NYU',
  'Cornell University', 'University of Pennsylvania', 'Brown University',
  'Dartmouth College', 'Georgetown University', 'American University',
  'George Washington University', 'Stanford University', 'UC Berkeley', 'UCLA', 'USC',
  'UC San Diego', 'UC Davis', 'UC Irvine', 'UC Santa Barbara',
  'University of Colorado Boulder', 'Arizona State University', 'University of Arizona',
  'University of Oregon', 'University of Washington', 'Colorado State University',
  'University of Denver', 'Emory University', 'Tulane University', 'Loyola University',
  'Marquette University', 'Villanova University', 'Fordham University', 'Syracuse University',
  'University of Connecticut', 'University of Maryland', 'Rutgers University',
  'University of Pittsburgh', 'Carnegie Mellon University', 'University of Rochester',
];

export default function SchoolSearchInput({ value, onChange, error }) {
  const [search, setSearch] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ref = useRef(null);

  useEffect(() => { setSearch(value || ''); }, [value]);

  useEffect(() => {
    if (search.length >= 2) {
      const q = search.toLowerCase();
      const matches = COMMON_UNIVERSITIES.filter(u => u.toLowerCase().includes(q)).slice(0, 8);
      setFiltered(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [search]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (name) => {
    setSearch(name);
    onChange(name);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <input
        value={search}
        onChange={e => { setSearch(e.target.value); onChange(e.target.value); }}
        placeholder="Start typing your school..."
        style={{
          width: '100%', background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${error ? 'rgba(229,57,53,0.6)' : '#2A2A2A'}`,
          borderRadius: 12, padding: '14px 16px',
          fontFamily: dmSans, fontSize: 15, fontWeight: 400,
          color: '#fff', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = ORANGE; }}
        onBlur={e => { if (!error) e.target.style.borderColor = '#2A2A2A'; }}
      />
      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: '#1A1A1A', border: '1px solid #2A2A2A',
          borderRadius: 12, marginTop: 4, maxHeight: 220, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
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
                color: '#fff', cursor: 'pointer', minHeight: 'auto',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
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

export { COMMON_UNIVERSITIES };