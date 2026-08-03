/**
 * Shared trust-boundary helpers for outbound-email functions.
 *
 * These endpoints send mail through SendGrid / Core.SendEmail, so without an
 * auth check they act as open mail relays. Every mail-sending function must
 * call requireUser() before touching the mail provider, and escapeHtml()
 * on every caller-supplied value interpolated into an HTML template.
 */

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Resolves the authenticated caller, or null when the request is anonymous.
 */
export async function getCaller(base44) {
  try {
    const user = await base44.auth.me();
    return user || null;
  } catch {
    return null;
  }
}

/**
 * Returns { user } for an authenticated caller, or { response } holding a 401
 * that the handler should return immediately.
 *
 * `internalSecret` supports server-to-server calls (schedulers invoking via
 * asServiceRole, which carry no user token). The secret lives only in the
 * backend environment and is never exposed to the browser, so it can't be
 * replayed by an external caller. Such calls are treated as trusted system
 * callers, equivalent to an admin.
 */
export async function requireUser(base44, internalSecret) {
  if (internalSecret && internalSecret === Deno.env.get('BASE44_SERVICE_ROLE_KEY')) {
    return { user: { email: null, role: 'admin', full_name: null, isSystem: true } };
  }
  const user = await getCaller(base44);
  if (!user) {
    return { response: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user };
}

const norm = (e) => String(e || '').trim().toLowerCase();

/**
 * True when the caller may send mail to `to`: admins may send anywhere,
 * everyone else only to their own address. Use for self-notification emails.
 */
export function canEmailSelf(user, to) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return norm(user.email) === norm(to);
}

/**
 * True when `to` belongs to a registered app user. Use for emails addressed to
 * someone other than the caller, so the endpoint can't reach arbitrary
 * external inboxes.
 */
export async function isRegisteredUser(base44, to) {
  const email = norm(to);
  if (!email) return false;
  const matches = await base44.asServiceRole.entities.User.filter({ email }, '-created_date', 1);
  return Array.isArray(matches) && matches.length > 0;
}