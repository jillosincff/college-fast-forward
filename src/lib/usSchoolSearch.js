import { useState, useEffect } from 'react';

// Curated fallback shown only if the live US-college API is unreachable.
// The input itself always accepts free text, so any school can still be entered.
const FALLBACK_SCHOOLS = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of South Florida', 'Florida International University', 'University of Miami',
  'University of Georgia', 'Georgia Tech', 'Georgia State University',
  'Clemson University', 'University of South Carolina',
  'University of Tennessee', 'Vanderbilt University',
  'University of Kentucky', 'University of Louisville',
  'Louisiana State University', 'Tulane University',
  'University of Alabama', 'Auburn University',
  'University of Mississippi', 'Mississippi State University',
  'University of Maryland', 'Johns Hopkins University',
  'University of Virginia', 'Virginia Tech', 'James Madison University',
  'George Mason University', 'William & Mary',
  'Georgetown University', 'George Washington University', 'American University',
  'University of Delaware',
  'Penn State University', 'University of Pennsylvania', 'Carnegie Mellon University',
  'University of Pittsburgh', 'Temple University', 'Drexel University',
  'Rutgers University', 'Princeton University',
  'Harvard University', 'MIT', 'Yale University', 'Brown University', 'Dartmouth College',
  'Boston College', 'Boston University', 'Northeastern University', 'Tufts University',
  'University of Massachusetts Amherst', 'University of Connecticut',
  'Columbia University', 'NYU', 'Cornell University', 'Fordham University',
  'Syracuse University', 'University of Rochester', 'Binghamton University', 'Stony Brook University',
  'Ohio State University', 'University of Cincinnati', 'Miami University Ohio',
  'Case Western Reserve University', 'Ohio University',
  'University of Michigan', 'Michigan State University',
  'University of Notre Dame', 'Indiana University', 'Purdue University',
  'Northwestern University', 'University of Illinois', 'University of Chicago',
  'University of Wisconsin', 'Marquette University',
  'University of Minnesota', 'University of Iowa', 'Iowa State University',
  'University of Missouri', 'Washington University in St. Louis',
  'University of Kansas', 'University of Nebraska', 'Creighton University',
  'Texas A&M University', 'University of Texas at Austin', 'Baylor University',
  'Rice University', 'Texas Tech University', 'University of Houston',
  'University of Oklahoma', 'Oklahoma State University',
  'University of Colorado Boulder', 'Colorado State University',
  'University of Utah', 'Brigham Young University',
  'Arizona State University', 'University of Arizona',
  'University of New Mexico', 'University of Nevada Las Vegas',
  'Boise State University', 'University of Wyoming',
  'University of Washington', 'Washington State University',
  'University of Oregon', 'Oregon State University',
  'Stanford University', 'UC Berkeley', 'UCLA', 'USC', 'UC San Diego', 'UC Davis',
  'UC Irvine', 'UC Santa Barbara', 'California Institute of Technology',
  'Loyola Marymount University', 'Santa Clara University', 'Pepperdine University',
  'San Diego State University', 'San Jose State University', 'Cal Poly San Luis Obispo',
  'Duke University', 'Emory University', 'Wake Forest University',
  'University of North Carolina', 'NC State University', 'UNC Chapel Hill',
  'Howard University', 'Spelman College', 'Morehouse College', 'Hampton University',
  'Florida A&M University', 'North Carolina A&T State University', 'Tuskegee University',
  'Amherst College', 'Williams College', 'Swarthmore College', 'Wellesley College',
  'Barnard College', 'Middlebury College', 'Carleton College', 'Davidson College',
  'Elon University', 'High Point University', 'College of Charleston', 'Furman University',
];

const cache = new Map();

/**
 * Search US colleges/universities by name (live, no API key required).
 * Falls back to the curated list if the request fails.
 */
export async function searchUSColleges(query, { signal } = {}) {
  const q = (query || '').trim().toLowerCase();
  if (q.length < 2) return [];

  if (cache.has(q)) return cache.get(q);

  try {
    const res = await fetch(
      `https://universities.hipolabs.com/search?country=United+States&name=${encodeURIComponent(q)}`,
      { signal }
    );
    if (!res.ok) throw new Error('school search failed');
    const data = await res.json();
    const names = Array.from(new Set((data || []).map(d => d.name).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8);
    const result = names.length
      ? names
      : FALLBACK_SCHOOLS.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
    cache.set(q, result);
    return result;
  } catch (e) {
    if (e?.name === 'AbortError') return [];
    return FALLBACK_SCHOOLS.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
  }
}

/**
 * Debounced hook returning live US-college suggestions for a query string.
 */
export function useSchoolSearch(query) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const q = (query || '').trim();
    if (q.length < 2) { setSuggestions([]); return; }

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const r = await searchUSColleges(q, { signal: ctrl.signal });
      setSuggestions(r);
    }, 220);

    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  return { suggestions };
}

export { FALLBACK_SCHOOLS };