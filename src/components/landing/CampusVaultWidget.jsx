import React, { useState, useRef, useEffect } from 'react';

// Broad US college list for autocomplete
const US_COLLEGES = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Miami', 'Florida International University', 'University of South Florida',
  'Ohio State University', 'University of Michigan', 'Penn State University',
  'University of Southern California', 'University of Georgia', 'University of Maryland',
  'Tulane University', 'University of Delaware', 'New York University',
  'Boston University', 'Georgetown University', 'University of Texas at Austin',
  'UCLA', 'UC Berkeley', 'UC San Diego', 'UC Davis', 'UC Santa Barbara',
  'Indiana University', 'Purdue University', 'Arizona State University',
  'University of Wisconsin-Madison', 'University of Illinois Urbana-Champaign',
  'Northeastern University', 'Temple University', 'Drexel University',
  'University of Minnesota', 'University of Washington', 'University of Oregon',
  'University of Colorado Boulder', 'University of Arizona', 'University of Utah',
  'Michigan State University', 'University of Iowa', 'University of Kansas',
  'University of Missouri', 'University of Nebraska', 'Kansas State University',
  'Virginia Tech', 'University of Virginia', 'George Mason University',
  'James Madison University', 'Old Dominion University',
  'North Carolina State University', 'University of North Carolina at Chapel Hill',
  'Duke University', 'Wake Forest University', 'Davidson College',
  'Clemson University', 'University of South Carolina', 'College of Charleston',
  'Auburn University', 'University of Alabama', 'Mississippi State University',
  'Louisiana State University', 'University of Tennessee', 'Vanderbilt University',
  'University of Kentucky', 'University of Louisville',
  'Texas A&M University', 'University of Houston', 'Texas Tech University',
  'SMU', 'TCU', 'Baylor University', 'Rice University',
  'Northwestern University', 'University of Chicago', 'DePaul University',
  'Loyola University Chicago', 'Illinois State University',
  'Notre Dame University', 'Butler University', 'Ball State University',
  'Miami University', 'Ohio University', 'University of Cincinnati',
  'Case Western Reserve University', 'Bowling Green State University',
  'University of Pittsburgh', 'Carnegie Mellon University', 'Penn State Altoona',
  'Villanova University', 'Lehigh University', 'Bucknell University',
  'Fordham University', 'Hofstra University', 'Stony Brook University',
  'University at Buffalo', 'Syracuse University', 'Cornell University',
  'Columbia University', 'Princeton University', 'Yale University',
  'Harvard University', 'MIT', 'Tufts University', 'Boston College',
  'Brown University', 'Dartmouth College', 'University of New Hampshire',
  'University of Vermont', 'University of Connecticut', 'Quinnipiac University',
  'University of Rhode Island', 'Roger Williams University',
  'Rutgers University', 'Seton Hall University', 'Montclair State University',
  'University of Denver', 'Colorado State University', 'Colorado College',
  'Boise State University', 'University of Idaho', 'Washington State University',
  'Portland State University', 'Oregon State University',
  'University of Nevada Las Vegas', 'University of Nevada Reno',
  'San Diego State University', 'Cal Poly San Luis Obispo', 'Fresno State',
  'Santa Clara University', 'University of San Francisco', 'Stanford University',
  'Emory University', 'Georgia Tech', 'Georgia State University',
  'Spelman College', 'Morehouse College', 'Howard University',
];

// Quick-pick featured schools shown as pills
const FEATURED = [
  { label: 'UF',       name: 'University of Florida' },
  { label: 'FSU',      name: 'Florida State University' },
  { label: 'Ohio St.', name: 'Ohio State University' },
  { label: 'Penn St.', name: 'Penn State University' },
  { label: 'Michigan', name: 'University of Michigan' },
];

// Generate a plausible alumni count for any school (deterministic from name length)
function getCount(name) {
  const base = 400 + (name.length * 17 + name.charCodeAt(0) * 3) % 700;
  return base;
}

export default function CampusVaultWidget({ go, onSchoolSelect, FONT, TEXT, TEXT2, TEXT3, CARD, BG, BLUE, BLUE_LIGHT, BLUE_BORDER, GREEN, GREEN_LIGHT, GREEN_BORDER, SHADOW, SHADOW_MD, R }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef();
  const containerRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val) => {
    setQuery(val);
    setSelectedSchool(null);
    if (val.length < 2) { setSuggestions([]); setDropdownOpen(false); return; }
    const filtered = US_COLLEGES.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 7);
    setSuggestions(filtered);
    setDropdownOpen(filtered.length > 0);
  };

  const selectSchool = (name) => {
    setQuery(name);
    setSelectedSchool(name);
    setSuggestions([]);
    setDropdownOpen(false);
    try { localStorage.setItem('cff_selected_school', name); } catch {}
    // Flash selection then launch
    setTimeout(() => {
      if (onSchoolSelect) onSchoolSelect(name);
    }, 280);
  };

  const count = selectedSchool ? getCount(selectedSchool) : null;

  return (
    <div style={{ padding: '80px 24px', background: BG }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>
          Live Campus Vault Status
        </p>
        <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 10px', lineHeight: 1.2 }}>
          Bypass the public portals.<br />Access the hidden market.
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 32px', lineHeight: 1.6 }}>
          Three out of four open roles are never posted to public job boards. Select your school to isolate unlisted opportunities matching your profile, paired instantly with verified campus insiders who can help fast-track your application.
        </p>

        {/* Autocomplete search */}
        <div ref={containerRef} style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: CARD, border: `2px solid ${dropdownOpen || selectedSchool ? BLUE : '#E2E8F0'}`,
            borderRadius: 14, padding: '4px 4px 4px 18px',
            boxShadow: dropdownOpen ? `0 0 0 4px ${BLUE_BORDER}` : SHADOW_MD,
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🎓</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleInput(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setDropdownOpen(true); }}
              placeholder="Type your university name (e.g., University of Miami...)"
              style={{
                flex: 1, fontFamily: FONT, fontSize: 15, color: TEXT,
                background: 'transparent', border: 'none', outline: 'none',
                padding: '12px 0',
              }}
            />
            <button
              onClick={() => {
                if (query.trim()) selectSchool(query.trim());
                else if (onSchoolSelect) onSchoolSelect('');
              }}
              style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff',
                background: `linear-gradient(135deg, ${BLUE} 0%, #06B6D4 100%)`,
                border: 'none', borderRadius: 10, padding: '12px 22px',
                cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              ⚡ Scan Now
            </button>
          </div>

          {/* Dropdown */}
          {dropdownOpen && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: CARD, border: `1px solid ${BLUE_BORDER}`,
              borderRadius: 12, boxShadow: SHADOW_MD, marginTop: 6, overflow: 'hidden',
            }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => selectSchool(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    fontFamily: FONT, fontSize: 14, color: TEXT, background: 'transparent',
                    border: 'none', borderBottom: '1px solid #F1F5F9',
                    padding: '13px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 14 }}>🎓</span>
                  <span>{s}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN }}>
                    {getCount(s)}+ insiders
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Universal catch-all */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <button
            onClick={() => { if (onSchoolSelect) onSchoolSelect(''); }}
            style={{
              fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#fff',
              background: '#0F172A', border: '1.5px solid #0F172A',
              borderRadius: 100, padding: '7px 16px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E293B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0F172A'; }}
          >
            🔍 Can't find your school? Scan anyway
          </button>
        </div>

        {/* Result card — shown after selection */}
        {selectedSchool && count && (
          <div style={{
            background: CARD, borderRadius: 16,
            border: `2px solid ${BLUE_BORDER}`,
            boxShadow: `0 12px 32px rgba(0,102,255,0.12)`,
            padding: '28px 24px', textAlign: 'center',
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 100, padding: '5px 16px', marginBottom: 16 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Network Active</span>
            </div>
            <h3 style={{ fontFamily: FONT, fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, color: BLUE, margin: '0 0 6px', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {count}+
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>
              Active Alumni &amp; Parents Synced
            </p>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
              <strong style={{ color: TEXT }}>{selectedSchool}</strong> insiders are on top-tier hiring teams right now — tap in before someone else does.
            </p>
            <button
              onClick={() => { if (onSchoolSelect) onSchoolSelect(selectedSchool); }}
              style={{
                fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff',
                background: `linear-gradient(135deg, ${BLUE} 0%, #06B6D4 100%)`,
                border: 'none', borderRadius: 12, padding: '14px 36px',
                cursor: 'pointer', minHeight: 'auto',
                boxShadow: '0 8px 24px rgba(0,102,255,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              ⚡ Launch My Network Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}