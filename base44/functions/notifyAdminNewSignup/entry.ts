import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called from signup flows whenever a new user joins.
// Sends a notification email to the admin so they know about every new signup.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const data = await req.json().catch(() => ({}));
    if (!data || !data.email) return Response.json({ success: false, error: 'No user data' });

    const name = data.full_name || 'Unknown';
    const email = data.email || 'Unknown';
    const persona = data.persona || data.roles?.[0] || 'unknown';
    const school = data.school_name || data.school || data.school_code || 'N/A';
    const joinedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'josinoff@gmail.com',
      from_name: 'College Fast Forward',
      subject: `New signup: ${name} (${persona})`,
      body: `A new user just signed up to College Fast Forward.\n\n` +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Persona: ${persona}\n` +
        `School: ${school}\n` +
        `Joined: ${joinedAt} ET`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});