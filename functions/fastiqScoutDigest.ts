import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const APP_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

  try {
    // Called by trusted scheduled automation — no user auth required
    // Find profiles with new scouted opportunities
    const profiles = await base44.asServiceRole.entities.FastTrackProProfile.filter({}, '-updated_date', 500);
    const profilesWithAlerts = (profiles || []).filter(p =>
      p.user_email && (p.new_alerts_count || 0) > 0
    );

    console.log(`Found ${profilesWithAlerts.length} profiles with new scout alerts`);
    let sent = 0;
    let skipped = 0;

    for (const profile of profilesWithAlerts) {
      // Check email preferences
      const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: profile.user_email });
      if (prefs?.[0]?.all_emails === false) {
        skipped++;
        continue;
      }

      // Get new scouted opportunities
      const opportunities = await base44.asServiceRole.entities.ScoutedOpportunity.filter({
        user_email: profile.user_email,
        is_new: true
      });
      const newOpps = (opportunities || []).slice(0, 5);
      if (newOpps.length === 0) {
        skipped++;
        continue;
      }

      const subject = `🔍 FASTIQ found ${newOpps.length} new ${newOpps.length === 1 ? 'opportunity' : 'opportunities'} for you`;

      const oppsHtml = newOpps.map(opp => `
        <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin: 8px 0;">
          <p style="font-weight: 600; color: #1E293B; margin: 0;">${opp.role_title || 'Role'}</p>
          <p style="color: #64748B; font-size: 14px; margin: 4px 0;">${opp.company_name} ${opp.location ? `· ${opp.location}` : ''}</p>
          ${opp.match_reason ? `<p style="color: #7C3AED; font-size: 13px; margin: 4px 0;">✨ ${opp.match_reason}</p>` : ''}
          ${opp.alumni_available ? `<p style="color: #16A34A; font-size: 13px; margin: 4px 0;">🐊 ${opp.alumni_count || 0} UF alumni work here</p>` : ''}
        </div>
      `).join('');

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0021A5 0%, #7C3AED 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">🔍 New Opportunities Found</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">FASTIQ scouted these for you</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              FASTIQ found <strong>${newOpps.length} new ${newOpps.length === 1 ? 'opportunity' : 'opportunities'}</strong> matching your profile:
            </p>
            ${oppsHtml}
            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/#FastIQ" style="display: inline-block; background: linear-gradient(135deg, #0021A5, #7C3AED); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700;">View All in FASTIQ →</a>
            </div>
          </div>
          <div style="background: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">College Fast Forward — FASTIQ Career Intelligence</p>
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
          personalizations: [{ to: [{ email: profile.user_email }] }],
          from: { email: 'notifications@collegefastforward.com', name: 'FASTIQ by CFF' },
          subject,
          content: [{ type: 'text/html', value: htmlBody }]
        })
      });

      if (sgResponse.ok) sent++;
      else console.error(`Failed to send digest to ${profile.user_email}: ${sgResponse.status}`);
    }

    return Response.json({ success: true, profilesWithAlerts: profilesWithAlerts.length, sent, skipped });
  } catch (error) {
    console.error('fastiqScoutDigest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});