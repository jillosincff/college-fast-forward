import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const allEvents = await base44.asServiceRole.entities.AnalyticsEvent.list('-created_date', 10000);

    // Josh check
    const josh = allUsers.find(u => u.email?.toLowerCase() === 'joshflusser@gmail.com');
    const joshSignals = allEvents.filter(e => e.user_email?.toLowerCase() === 'joshflusser@gmail.com').map(e => e.event_name);

    // Sami check
    const sami = allUsers.find(u => u.email?.toLowerCase() === 'samigreen219@gmail.com');
    const firstName = sami?.full_name?.split(' ')?.[0] || '';
    const isBrokenName = /^\d+$/.test(firstName) || firstName === '' || !firstName;
    const renderedGreeting = isBrokenName ? 'Hi,' : `Hi ${firstName},`;

    return Response.json({
      josh_flusser: {
        email: josh?.email,
        persona: josh?.persona,
        school: josh?.school,
        onboarding_completed: josh?.onboarding_completed,
        created_date: josh?.created_date,
        intent_signals: joshSignals,
        flag: "⚠️ NON-UF SCHOOL — Verify he registered legitimately before including",
      },
      samigreen219: {
        email: sami?.email,
        full_name: sami?.full_name,
        first_name_extracted: firstName,
        is_broken_name: isBrokenName,
        rendered_email_greeting: renderedGreeting,
        flag: isBrokenName ? "✓ CORRECT — Uses fallback 'Hi,' greeting" : "NO FALLBACK NEEDED",
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});