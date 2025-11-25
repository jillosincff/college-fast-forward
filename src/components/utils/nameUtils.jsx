/**
 * Utility functions for displaying user names consistently across the app
 */

/**
 * Properly capitalize a name (handles hyphenated names and special cases)
 */
function capitalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  
  return name.trim()
    .split(/(\s+|-|')/) // Split on spaces, hyphens, and apostrophes but keep delimiters
    .map((part, index, array) => {
      // If it's a delimiter, keep it as is
      if (part.match(/^(\s+|-|')$/)) return part;
      
      // If it's an empty string, skip
      if (!part) return part;
      
      // Capitalize first letter, lowercase the rest
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Get a properly formatted display name from user object
 * Priority: first_name + last_name > full_name > email fallback
 * Always capitalizes names properly regardless of how they're stored
 */
export function getDisplayName(user) {
  if (!user) return 'Unknown User';
  
  // Priority 1: first_name and last_name (most reliable)
  if (user.first_name && user.last_name) {
    const firstName = capitalizeName(user.first_name);
    const lastName = capitalizeName(user.last_name);
    return `${firstName} ${lastName}`;
  }
  
  // Priority 2: just first_name or last_name
  if (user.first_name && !user.last_name) {
    return capitalizeName(user.first_name);
  }
  if (!user.first_name && user.last_name) {
    return capitalizeName(user.last_name);
  }
  
  // Priority 3: full_name (if it doesn't look like an email)
  if (user.full_name && user.full_name.trim() && !user.full_name.includes('@')) {
    // Split full name and capitalize each part
    return user.full_name.trim()
      .split(' ')
      .map(part => capitalizeName(part))
      .filter(Boolean)
      .join(' ');
  }
  
  // Last resort: extract name from email and capitalize properly
  if (user.email) {
    const emailName = user.email.split('@')[0];
    // Convert "jill.camhi" to "Jill Camhi"
    if (emailName.includes('.')) {
      return emailName
        .split('.')
        .map(part => capitalizeName(part))
        .join(' ');
    }
    // Convert "spencer7stavrevski" to "Spencer Stavrevski" (remove numbers)
    const cleanName = emailName.replace(/[0-9]/g, '');
    return capitalizeName(cleanName);
  }
  
  return 'Gator User';
}

/**
 * Get initials from user object
 */
export function getInitials(user) {
  if (!user) return 'GU';
  
  // Priority 1: Use first and last name
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  
  // Priority 2: Parse display name
  const displayName = getDisplayName(user);
  const nameParts = displayName.split(' ').filter(Boolean);
  
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }
  
  return displayName.slice(0, 2).toUpperCase();
}

/**
 * Get first name only - always properly capitalized
 */
export function getFirstName(user) {
  if (!user) return 'User';
  
  if (user.first_name) {
    return capitalizeName(user.first_name);
  }
  
  const displayName = getDisplayName(user);
  return displayName.split(' ')[0];
}