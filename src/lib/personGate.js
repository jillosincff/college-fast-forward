// Validates that a person object represents a REAL, contactable alum — not a
// placeholder or invented record. Returns the person if it passes, null otherwise.
//
// Criteria (all must pass):
//   1. Real name — non-empty, not a placeholder
//   2. Title or company — at least one must be present
//   3. Public https URL — a LinkedIn or source URL starting with https://
export function gatePersonReal(person) {
  if (!person || typeof person !== 'object') return null;

  const name = (person.name || '').trim();
  const title = (person.role_title || '').trim();
  const company = (person.company || '').trim();
  const linkedin = (person.linkedin_url || '').trim();
  const sourceUrl = (person.source_url || '').trim();

  // 1. Real name — non-empty, not a placeholder
  if (!name || name.length < 2) return null;
  if (/^(there|unknown|n\/a|test|example|placeholder|john doe|jane doe)/i.test(name)) return null;

  // 2. Title or company — at least one must be present
  if (!title && !company) return null;

  // 3. Public https URL — LinkedIn or source
  const url = linkedin || sourceUrl;
  if (!url || !url.startsWith('https://')) return null;
  try {
    const u = new URL(url);
    if (!u.hostname || !u.hostname.includes('.')) return null;
  } catch {
    return null;
  }

  return person;
}