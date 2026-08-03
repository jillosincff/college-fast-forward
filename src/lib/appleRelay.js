// Sign in with Apple can hide the real email behind a private relay address and
// only returns the user's name on the very first authorization. Accounts created
// that way often arrive with no usable name — detect them so onboarding asks.

export function isAppleRelayEmail(email = '') {
  return /@privaterelay\.appleid\.com$/i.test(String(email).trim());
}

// A name is unusable if it's empty or just the email/local-part the provider
// substituted in place of a real name.
export function hasUsableName(fullName = '', email = '') {
  const name = String(fullName || '').trim();
  if (!name) return false;
  const lower = name.toLowerCase();
  const mail = String(email || '').trim().toLowerCase();
  if (lower === mail) return false;
  if (mail && lower === mail.split('@')[0]) return false;
  return true;
}