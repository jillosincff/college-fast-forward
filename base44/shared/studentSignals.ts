// Shared signal helpers used by CLIFF's student-facing engines.

// Company/role comparison key — strips punctuation and casing so
// "Procter & Gamble" and "procter and gamble" match.
export const normKey = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Lowercased, trimmed text for loose comparisons.
export const normText = (s) => (s || '').toLowerCase().trim();

// Whole days since a pipeline row last changed state.
export const daysSinceStatus = (row) =>
  (Date.now() - new Date(row.status_date || row.created_date).getTime()) / 86400000;