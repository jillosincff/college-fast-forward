// Premium, contrast-safe accent presets per school.
// Only subtle accent elements change — backgrounds, text, typography stay fixed.

const SCHOOL_ACCENTS = {
  'University of Michigan': { primary: '#D4A843', soft: 'rgba(212,168,67,0.12)', border: 'rgba(212,168,67,0.30)', glow: 'rgba(212,168,67,0.25)' },
  'University of Florida': { primary: '#E85D20', soft: 'rgba(232,93,32,0.12)', border: 'rgba(232,93,32,0.30)', glow: 'rgba(232,93,32,0.25)' },
  'UCF':                    { primary: '#CBA135', soft: 'rgba(203,161,53,0.12)', border: 'rgba(203,161,53,0.30)', glow: 'rgba(203,161,53,0.25)' },
  'Tulane University':      { primary: '#3A9E6E', soft: 'rgba(58,158,110,0.12)', border: 'rgba(58,158,110,0.30)', glow: 'rgba(58,158,110,0.25)' },
  'USC':                    { primary: '#C4362A', soft: 'rgba(196,54,42,0.12)', border: 'rgba(196,54,42,0.30)', glow: 'rgba(196,54,42,0.25)' },
  'Penn State':             { primary: '#5B8FD4', soft: 'rgba(91,143,212,0.12)', border: 'rgba(91,143,212,0.30)', glow: 'rgba(91,143,212,0.25)' },
  'University of Miami':    { primary: '#E8742B', soft: 'rgba(232,116,43,0.12)', border: 'rgba(232,116,43,0.30)', glow: 'rgba(232,116,43,0.25)' },
  'Ohio State University':  { primary: '#CE3B3B', soft: 'rgba(206,59,59,0.12)', border: 'rgba(206,59,59,0.30)', glow: 'rgba(206,59,59,0.25)' },
  'University of Georgia':  { primary: '#CE3B3B', soft: 'rgba(206,59,59,0.12)', border: 'rgba(206,59,59,0.30)', glow: 'rgba(206,59,59,0.25)' },
  'University of Texas at Austin': { primary: '#D07930', soft: 'rgba(208,121,48,0.12)', border: 'rgba(208,121,48,0.30)', glow: 'rgba(208,121,48,0.25)' },
  'University of Wisconsin': { primary: '#C4362A', soft: 'rgba(196,54,42,0.12)', border: 'rgba(196,54,42,0.30)', glow: 'rgba(196,54,42,0.25)' },
  'Boston University':      { primary: '#CE3B3B', soft: 'rgba(206,59,59,0.12)', border: 'rgba(206,59,59,0.30)', glow: 'rgba(206,59,59,0.25)' },
  'NYU':                    { primary: '#7B5EA7', soft: 'rgba(123,94,167,0.12)', border: 'rgba(123,94,167,0.30)', glow: 'rgba(123,94,167,0.25)' },
  'Vanderbilt University':  { primary: '#CBA135', soft: 'rgba(203,161,53,0.12)', border: 'rgba(203,161,53,0.30)', glow: 'rgba(203,161,53,0.25)' },
  'Clemson University':     { primary: '#E85D20', soft: 'rgba(232,93,32,0.12)', border: 'rgba(232,93,32,0.30)', glow: 'rgba(232,93,32,0.25)' },
};

const DEFAULT_ACCENT = { primary: '#4F8CFF', soft: 'rgba(79,140,255,0.12)', border: 'rgba(79,140,255,0.30)', glow: 'rgba(79,140,255,0.25)' };

export function getSchoolAccent(school) {
  return SCHOOL_ACCENTS[school] || DEFAULT_ACCENT;
}

// Apply accent CSS custom properties to the document root for the landing page hero area
export function setAccentVars(school) {
  const a = getSchoolAccent(school);
  const root = document.documentElement;
  root.style.setProperty('--accent-primary', a.primary);
  root.style.setProperty('--accent-soft', a.soft);
  root.style.setProperty('--accent-border', a.border);
  root.style.setProperty('--accent-glow', a.glow);
}