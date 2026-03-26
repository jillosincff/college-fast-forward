import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

  // Target: parents missing LinkedIn URL
  const incompleteParents = allUsers.filter(u => {
    const isParent = u.persona === 'parent' || u.roles?.includes('parent');
    if (!isParent) return false;
    if (!u.email) return false;
    if (u.linkedin_url?.trim()) return false; // already has LinkedIn
    if (u.onboarding_completed === false) return false; // not yet onboarded
    return true;
  }).slice(0, 8); // ~8 parents per run

  const sent = [];
  const skipped = [];

  for (const parent of incompleteParents) {
    const firstName = parent.full_name?.split(' ')[0] || 'there';
    const subject = `Quick question about your CFF profile, ${firstName}`;
    const body = `Hi ${firstName},

Just a quick note from the CFF team — your profile is looking great, but we noticed one thing is missing: your LinkedIn URL.

Adding it takes 30 seconds and makes a real difference. It helps students see exactly what you do and why you're the right person to reach out to. It also lets us auto-fill your job title and company so your profile shows up in more student searches.

Your LinkedIn URL: https://linkedin.com/in/[your-username]

Just reply to this email with your LinkedIn link and we'll add it for you — or log in and add it yourself in Profile > LinkedIn.

Thanks for being part of CFF,
The CFF Team`;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: parent.email,
        subject,
        body,
        from_name: 'College Fast Forward',
      });
      sent.push(parent.email);
    } catch (e) {
      skipped.push({ email: parent.email, error: e.message });
    }
  }

  return Response.json({
    total_incomplete: incompleteParents.length,
    sent: sent.length,
    sent_to: sent,
    skipped,
  });
});