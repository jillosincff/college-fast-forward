import React, { useState, useEffect, useRef } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

const COMMON_UNIVERSITIES = [
  // Florida
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Miami', 'University of South Florida', 'Florida Atlantic University',
  'Florida International University', 'University of North Florida', 'Stetson University',
  'Rollins College', 'University of Tampa', 'Nova Southeastern University',
  'Florida Gulf Coast University', 'Embry-Riddle Aeronautical University', 'Flagler College',
  'Palm Beach Atlantic University', 'Jacksonville University', 'Barry University',
  'Florida Southern College', 'Saint Leo University', 'Eckerd College',

  // Southeast
  'University of Alabama', 'Auburn University', 'University of Alabama at Birmingham',
  'Alabama A&M University', 'Samford University', 'Troy University',
  'University of Georgia', 'Georgia Tech', 'Georgia State University', 'Georgia Southern University',
  'Kennesaw State University', 'Mercer University', 'Spelman College', 'Morehouse College',
  'Clemson University', 'University of South Carolina', 'College of Charleston',
  'Coastal Carolina University', 'Winthrop University', 'Furman University', 'Wofford College',
  'University of Tennessee', 'Vanderbilt University', 'Tennessee Tech University',
  'Middle Tennessee State University', 'Belmont University', 'Rhodes College',
  'University of Kentucky', 'University of Louisville', 'Western Kentucky University',
  'Eastern Kentucky University', 'Transylvania University',
  'University of Mississippi', 'Mississippi State University', 'Ole Miss',
  'Louisiana State University', 'Tulane University', 'Loyola University New Orleans',
  'Xavier University of Louisiana', 'University of New Orleans',
  'University of Arkansas', 'Arkansas State University',

  // Mid-Atlantic
  'University of Maryland', 'University of Maryland Baltimore County', 'Towson University',
  'Loyola University Maryland', 'Johns Hopkins University', 'Goucher College',
  'University of Virginia', 'Virginia Tech', 'James Madison University',
  'George Mason University', 'Virginia Commonwealth University', 'William & Mary',
  'Radford University', 'Liberty University', 'Hampden-Sydney College', 'Washington and Lee University',
  'West Virginia University', 'Marshall University',
  'Georgetown University', 'American University', 'George Washington University',
  'Howard University', 'Catholic University of America',
  'University of Delaware', 'Delaware State University',
  'Drexel University', 'Temple University', 'Villanova University', 'Penn State University',
  'University of Pennsylvania', 'Carnegie Mellon University', 'University of Pittsburgh',
  'Lehigh University', 'Lafayette College', 'Bucknell University', 'Dickinson College',
  'Gettysburg College', 'Muhlenberg College',
  'Rutgers University', 'Princeton University', 'Seton Hall University', 'Monmouth University',
  'Rider University', 'The College of New Jersey',

  // New England
  'Harvard University', 'MIT', 'Yale University', 'Dartmouth College', 'Brown University',
  'Boston College', 'Boston University', 'Northeastern University', 'Tufts University',
  'Brandeis University', 'Holy Cross', 'Worcester Polytechnic Institute',
  'University of Massachusetts Amherst', 'UMass Boston', 'UMass Lowell',
  'University of Connecticut', 'Fairfield University', 'Sacred Heart University',
  'University of Vermont', 'Middlebury College',
  'University of New Hampshire', 'Dartmouth College', 'Plymouth State University',
  'University of Maine', 'Bowdoin College', 'Colby College', 'Bates College',
  'Providence College', 'Bryant University', 'Roger Williams University',

  // New York
  'Columbia University', 'NYU', 'Cornell University', 'Fordham University',
  'Syracuse University', 'University of Rochester', 'Rensselaer Polytechnic Institute',
  'Clarkson University', 'Colgate University', 'Hamilton College', 'Vassar College',
  'Skidmore College', 'Union College', 'Binghamton University', 'Stony Brook University',
  'SUNY Buffalo', 'SUNY Albany', 'SUNY New Paltz', 'Marist College', 'Iona University',
  'Manhattan College', 'St. John\'s University', 'Pace University', 'New School',

  // Midwest
  'Ohio State University', 'University of Cincinnati', 'Miami University Ohio',
  'Ohio University', 'Bowling Green State University', 'Kent State University', 'Xavier University',
  'Case Western Reserve University', 'Denison University', 'Kenyon College', 'Oberlin College',
  'University of Michigan', 'Michigan State University', 'University of Michigan-Dearborn',
  'Western Michigan University', 'Grand Valley State University', 'Central Michigan University',
  'University of Notre Dame', 'Indiana University', 'Purdue University', 'Butler University',
  'DePauw University', 'Valparaiso University', 'Ball State University',
  'Northwestern University', 'University of Illinois', 'University of Illinois Chicago',
  'Illinois State University', 'Loyola University Chicago', 'DePaul University',
  'University of Chicago', 'Bradley University',
  'University of Wisconsin', 'University of Wisconsin-Milwaukee', 'Marquette University',
  'Beloit College', 'Lawrence University', 'Carthage College',
  'University of Minnesota', 'University of Minnesota Duluth', 'Carleton College', 'Macalester College',
  'University of Iowa', 'Iowa State University', 'Drake University', 'Grinnell College',
  'University of Missouri', 'Washington University in St. Louis', 'Saint Louis University',
  'Missouri State University', 'Mizzou',
  'University of Nebraska', 'Creighton University',
  'University of Kansas', 'Kansas State University',

  // South / Texas
  'Texas A&M University', 'University of Texas at Austin', 'Baylor University',
  'Rice University', 'SMU', 'TCU', 'Texas Tech University', 'University of Houston',
  'University of North Texas', 'Texas State University', 'Trinity University',
  'University of Oklahoma', 'Oklahoma State University',

  // Mountain / West
  'University of Colorado Boulder', 'Colorado State University', 'University of Denver',
  'Colorado College', 'United States Air Force Academy',
  'University of Utah', 'Utah State University', 'Brigham Young University', 'Westminster College',
  'Arizona State University', 'University of Arizona', 'Northern Arizona University',
  'University of New Mexico', 'New Mexico State University',
  'University of Nevada Las Vegas', 'University of Nevada Reno',
  'Boise State University', 'University of Idaho',
  'Montana State University', 'University of Montana',
  'University of Wyoming',

  // Pacific Northwest
  'University of Washington', 'Washington State University', 'Seattle University',
  'Gonzaga University', 'Western Washington University',
  'University of Oregon', 'Oregon State University', 'Portland State University', 'Reed College',
  'Lewis & Clark College',

  // California
  'Stanford University', 'UC Berkeley', 'UCLA', 'USC', 'UC San Diego', 'UC Davis',
  'UC Irvine', 'UC Santa Barbara', 'UC Santa Cruz', 'UC Riverside', 'UC Merced',
  'California Institute of Technology', 'Harvey Mudd College', 'Pomona College',
  'Claremont McKenna College', 'Scripps College', 'Pitzer College',
  'Loyola Marymount University', 'University of San Francisco', 'Santa Clara University',
  'Pepperdine University', 'San Diego State University', 'San Jose State University',
  'Cal Poly San Luis Obispo', 'Cal Poly Pomona', 'Fresno State University',
  'Chapman University', 'Occidental College',

  // Ivies / Elites
  'Princeton University', 'Harvard University', 'Yale University', 'Columbia University',
  'University of Pennsylvania', 'Brown University', 'Dartmouth College', 'Cornell University',
  'Duke University', 'Emory University', 'Wake Forest University',
  'University of North Carolina', 'NC State University', 'UNC Chapel Hill',

  // HBCUs
  'Howard University', 'Spelman College', 'Morehouse College', 'Hampton University',
  'Florida A&M University', 'North Carolina A&T State University', 'Tuskegee University',
  'Clark Atlanta University', 'Fisk University', 'Xavier University of Louisiana',
  'Morgan State University', 'Delaware State University', 'Tennessee State University',
  'Bethune-Cookman University', 'Edward Waters University',

  // Liberal Arts
  'Amherst College', 'Williams College', 'Swarthmore College', 'Wellesley College',
  'Smith College', 'Mount Holyoke College', 'Barnard College', 'Bryn Mawr College',
  'Haverford College', 'Bowdoin College', 'Colby College', 'Bates College',
  'Middlebury College', 'Carleton College', 'Macalester College', 'Grinnell College',
  'Wesleyan University', 'Trinity College', 'Connecticut College', 'Skidmore College',
  'Dickinson College', 'Gettysburg College', 'Muhlenberg College', 'Franklin & Marshall College',
  'Denison University', 'Kenyon College', 'Oberlin College', 'College of Wooster',
  'DePauw University', 'Wabash College', 'Rhodes College', 'Furman University', 'Wofford College',
  'Davidson College', 'Elon University', 'High Point University',
];

export default function SchoolSearchInput({ value, onChange, error, light }) {
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

export { COMMON_UNIVERSITIES };