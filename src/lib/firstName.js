// Best display first name for greetings.
// Single source of truth: full_name. We do NOT persist a custom first_name
// passthrough (it isn't part of the built-in User schema, so it can be lost
// or disagree with full_name). Derive the first word at read time and fall
// back to "there" when missing or when full_name is just the email username
// (junk left over from older signups, e.g. "lindseyosinoff").
export function getFirstName(user) {
  if (!user) return 'there';
  const full = (user.full_name || '').trim();
  const emailLocal = (user.email || '').split('@')[0].toLowerCase();
  if (full && full.toLowerCase() !== emailLocal) {
    return full.split(/\s+/)[0];
  }
  return 'there';
}