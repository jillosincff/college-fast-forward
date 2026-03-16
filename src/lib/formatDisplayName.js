/**
 * Global display name formatter — single source of truth.
 * Formats names as "First L." for privacy across the entire app.
 * 
 * @param {string} fullName - Full name string (e.g. "John Smith")
 * @param {object} options
 * @param {boolean} options.fullFirstName - Show full first name (default: true)
 * @param {string} options.fallback - Fallback text if name is empty
 * @returns {string} Formatted name like "John S."
 */
export function formatDisplayName(fullName, options = {}) {
  const { fullFirstName = true, fallback = 'Member' } = options;

  if (!fullName || typeof fullName !== 'string') return fallback;

  const trimmed = fullName.trim();
  if (!trimmed) return fallback;

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0];

  if (parts.length === 1) {
    return fullFirstName ? firstName : firstName;
  }

  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * Get initials from a name (for avatar fallbacks).
 * @param {string} fullName
 * @returns {string} Up to 2-letter initials like "JS"
 */
export function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return '?';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}