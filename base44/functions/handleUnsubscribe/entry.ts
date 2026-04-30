import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Simple token: base64(userId:email) — not cryptographic but sufficient for low-risk email unsubscribe
function makeToken(userId, email) {
  return btoa(`${userId}:${email}`).replace(/=/g, '');
}

function parseToken(token) {
  try {
    const padded = token + '=='.slice(0, (4 - token.length % 4) % 4);
    const decoded = atob(padded);
    const [userId, ...emailParts] = decoded.split(':');
    return { userId, email: emailParts.join(':') };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // GET /  — generate token for a user (internal use by email senders)
  if (req.method === 'GET') {
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');
    if (!userId || !email) {
      return Response.json({ error: 'Missing userId or email' }, { status: 400 });
    }
    const token = makeToken(userId, email);
    const appBase = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
    return Response.json({ token, unsubscribe_url: `${appBase}/#Unsubscribe?token=${token}` });
  }

  // POST / — process the unsubscribe
  if (req.method === 'POST') {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json().catch(() => ({}));

    if (!token) return Response.json({ error: 'Missing token' }, { status: 400 });

    const parsed = parseToken(token);
    if (!parsed) return Response.json({ error: 'Invalid token' }, { status: 400 });

    const { userId, email } = parsed;

    // Find or create EmailPreference record
    const existing = await base44.asServiceRole.entities.EmailPreference.filter({ user_id: userId });

    if (existing.length > 0) {
      await base44.asServiceRole.entities.EmailPreference.update(existing[0].id, {
        all_emails: false,
        answer_notifications: false,
        nudge_emails: false,
        thank_you_notifications: false,
        daily_digest: false,
        weekly_digest: false,
        parent_joined_notifications: false,
        reengagement_emails: false,
      });
    } else {
      await base44.asServiceRole.entities.EmailPreference.create({
        user_id: userId,
        user_email: email,
        all_emails: false,
        answer_notifications: false,
        nudge_emails: false,
        thank_you_notifications: false,
        daily_digest: false,
        weekly_digest: false,
        parent_joined_notifications: false,
        reengagement_emails: false,
        description: `Unsubscribed via email link on ${new Date().toISOString().split('T')[0]}`,
      });
    }

    console.log(`[handleUnsubscribe] ${email} (${userId}) unsubscribed from all emails`);
    return Response.json({ success: true, email });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 });
});