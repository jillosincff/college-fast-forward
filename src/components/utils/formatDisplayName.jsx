/**
 * SINGLE SOURCE OF TRUTH for "First L." display name formatting.
 * Import this everywhere instead of writing local formatters.
 *
 * Rules:
 *   1. If real first + last available → "First L."
 *   2. "Last, First M." format → "First L."
 *   3. "First Last" format → "First L."
 *   4. Single proper name → "Name"
 *   5. Username / email prefix → "Member"
 *   6. null / undefined → fallback (default "Member")
 */

function looksLikeUsername(str) {
  if (!str) return true;
  const t = str.trim();
  if (t.length === 0 || t.includes('@')) return true;
  // all lowercase, no spaces, under 20 chars → likely username
  if (t === t.toLowerCase() && !t.includes(' ') && t.length < 20 && !/[._-]/.test(t)) return true;
  return false;
}

function cap(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * @param {object|string} userOrName — either a user object or a raw name string
 * @param {string} [fallback='Member'] — what to return when no usable name
 * @returns {string} "First L." formatted name
 */
export default function formatDisplayName(userOrName, fallback = 'Member') {
  if (!userOrName) return fallback;

  // If a plain string was passed, parse it directly
  if (typeof userOrName === 'string') return formatFromString(userOrName, fallback);

  const u = userOrName;

  // Priority 1: first_name + last_name fields
  if (u.first_name && u.last_name && !looksLikeUsername(u.first_name)) {
    return `${cap(u.first_name)} ${u.last_name.charAt(0).toUpperCase()}.`;
  }

  // Priority 2: full_name field
  if (u.full_name && !u.full_name.includes('@')) {
    return formatFromString(u.full_name, fallback);
  }

  // Priority 3: email prefix
  if (u.email) {
    const prefix = u.email.split('@')[0];
    if (prefix.includes('.')) {
      const parts = prefix.split('.').filter(Boolean);
      if (parts.length >= 2) return `${cap(parts[0])} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
    }
  }

  return fallback;
}

function formatFromString(raw, fallback) {
  if (!raw || !raw.trim()) return fallback;
  let name = raw.trim();

  // Strip emails
  if (name.includes('@')) name = name.split('@')[0];

  // Handle "Last, First M." format
  if (name.includes(',')) {
    const [last, rest] = name.split(',').map(s => s.trim());
    const first = rest?.split(/\s+/)[0];
    if (first && last) return `${cap(first)} ${last.charAt(0).toUpperCase()}.`;
  }

  // Handle dot / underscore separated (e.g. "david.brown")
  if (!name.includes(' ') && (name.includes('.') || name.includes('_'))) {
    const parts = name.split(/[._]+/).filter(Boolean);
    if (parts.length >= 2) return `${cap(parts[0])} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
    if (parts.length === 1) return cap(parts[0]);
  }

  // Pure username check (e.g. "amisokol")
  if (looksLikeUsername(name)) return fallback;

  // "First Last" or "First Middle Last"
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${cap(parts[0])} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
  }
  if (parts.length === 1 && parts[0][0] === parts[0][0].toUpperCase()) return parts[0];

  return fallback;
}

/**
 * Get initials from a user object — "FL" format.
 */
export function getInitialsFromUser(userOrName, fallback = 'M') {
  if (!userOrName) return fallback;

  if (typeof userOrName === 'string') {
    const parts = userOrName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0].length >= 1) return parts[0][0].toUpperCase();
    return fallback;
  }

  const u = userOrName;
  if (u.first_name && u.last_name) return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase();
  if (u.full_name && !u.full_name.includes('@')) {
    const parts = u.full_name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
  }
  return fallback;
}