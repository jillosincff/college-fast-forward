// Best display first name for greetings.
// Prefers the explicit first_name collected in onboarding; falls back to the
// first word of full_name — unless full_name is just the email username
// (junk left over from older signups, e.g. "lindseyosinoff").
export function getFirstName(user) {
  if (!user) return 'there';
  const first = (user.first_name || '').trim();
  if (first) return first.charAt(0).toUpperCase() + first.slice(1);
  const emailLocal = (user.email || '').split('@')[0].toLowerCase();
  const full = (user.full_name || '').trim();
  if (full && full.toLowerCase() !== emailLocal) return full.split(' ')[0];
  return 'there';
}