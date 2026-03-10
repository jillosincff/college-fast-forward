import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const APP_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find users who created accounts 20-28 hours ago and haven't completed onboarding
    const now = Date.now();
    const twentyHoursAgo = new Date(now - 20 * 60 * 60 * 1000).toISOString();
    const twentyEightHoursAgo = new Date(now - 28 * 60 * 60 * 1000).toISOString();

    const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 500);
    
    const abandonedUsers = (allUsers || []).filter(u => {
      if (!u.created_date) return false;
      const created = new Date(u.created_date).toISOString();
      // Created between 20-28 hours ago
      if (created > twentyHoursAgo || created < twentyEightHoursAgo) return false;
      // Has not completed onboarding (explicitly false)
      if (u.onboarding_completed !== false) return false;
      // Has an email
      if (!u.email || u.email.includes('service+')) return false;
      return true;
    });

    console.log(`Found ${abandonedUsers.length} abandoned onboarding users`);
    let sent = 0;
    let skipped = 0;

    for (const abandonedUser of abandonedUsers) {
      // Check if we already sent this email
      const existing = await base44.asServiceRole.entities.ReengagementEmail.filter({
        user_email: abandonedUser.email,
        email_type: 'onboarding_abandonment'
      });
      if (existing?.length > 0) {
        skipped++;
        continue;
      }

      // Check email preferences
      const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: abandonedUser.email });
      if (prefs?.[0]?.all_emails === false) {
        skipped++;
        continue;
      }

      const firstName = (() => {
        const fn = abandonedUser.full_name?.trim() || '';
        if (fn.includes(',')) return fn.split(',')[1]?.trim().split(/\s+/)[0] || 'there';
        return fn.split(/\s+/)[0] || 'there';
      })();

      const isStudent = abandonedUser.persona === 'gator' || abandonedUser.email?.toLowerCase().endsWith('@ufl.edu');
      const ctaUrl = isStudent ? `${APP_URL}/#StudentOnboarding` : `${APP_URL}/#ParentOnboarding`;
      const subject = "You're so close — finish setting up your CFF profile";

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0021A5 0%, #001580 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">You're one step away! 🎯</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Hey ${firstName},
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              You started setting up your College Fast Forward profile, but didn't finish. No worries — it only takes 2 more minutes.
            </p>
            <div style="background: #F0F9FF; border: 2px solid #0021A5; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="color: #0021A5; font-weight: 700; margin: 0 0 12px 0;">Here's what's waiting for you:</p>
              <ul style="color: #334155; margin: 0; padding-left: 20px; line-height: 2;">
                ${isStudent ? `
                  <li>Parents and alumni ready to help you land a job</li>
                  <li>Warm introductions to decision-makers</li>
                  <li>Free AI career coaching with FASTIQ</li>
                ` : `
                  <li>Students who need your expertise right now</li>
                  <li>A community of parents helping each other's kids</li>
                  <li>Family Karma that boosts your student's visibility</li>
                `}
              </ul>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${ctaUrl}" style="display: inline-block; background: #FA4616; color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 18px;">
                Finish My Profile →
              </a>
            </div>
            <p style="color: #94A3B8; font-size: 14px; text-align: center;">
              Takes less than 2 minutes. Your future network is waiting.
            </p>
          </div>
          <div style="background: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">College Fast Forward — The Private Career Network for UF Families</p>
          </div>
        </div>
      `;

      const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: abandonedUser.email }] }],
          from: { email: 'notifications@collegefastforward.com', name: 'College Fast Forward' },
          subject,
          content: [{ type: 'text/html', value: htmlBody }]
        })
      });

      await base44.asServiceRole.entities.ReengagementEmail.create({
        user_id: abandonedUser.id,
        user_email: abandonedUser.email,
        email_type: 'onboarding_abandonment',
        status: sgResponse.ok ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
        subject_variant: 'A'
      });

      await base44.asServiceRole.entities.EmailLog.create({
        user_email: abandonedUser.email,
        email_type: 'onboarding_abandonment',
        subject,
        status: sgResponse.ok ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
        persona: abandonedUser.persona || 'unknown'
      });

      if (sgResponse.ok) sent++;
      console.log(`Onboarding abandonment email ${sgResponse.ok ? 'sent' : 'failed'} to ${abandonedUser.email}`);
    }

    return Response.json({ success: true, found: abandonedUsers.length, sent, skipped });
  } catch (error) {
    console.error('onboardingAbandonmentEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});