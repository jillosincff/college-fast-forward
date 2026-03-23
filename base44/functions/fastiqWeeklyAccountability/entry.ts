import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const APP_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

  try {
    // Called by trusted scheduled automation — no user auth required

    // Get all FASTIQ profiles with active users
    const profiles = await base44.asServiceRole.entities.FastTrackProProfile.filter({}, '-updated_date', 500);
    const activeProfiles = (profiles || []).filter(p => p.user_email && p.assessment_complete);

    console.log(`Found ${activeProfiles.length} active FASTIQ profiles`);
    let sent = 0;
    let skipped = 0;

    for (const profile of activeProfiles) {
      // Check email preferences
      const prefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_email: profile.user_email });
      if (prefs?.[0]?.all_emails === false) {
        skipped++;
        continue;
      }

      const companiesResearched = profile.companies_researched || 0;
      const alumniDiscovered = profile.alumni_discovered || 0;
      const messagesDrafted = profile.messages_drafted || 0;
      const targetCompanies = profile.target_companies || [];

      const subject = `Your FASTIQ weekly action plan 🎯`;

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0021A5 0%, #7C3AED 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">⚡ Your Weekly FASTIQ Update</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Here's your progress so far:
            </p>
            
            <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <div style="display: flex; gap: 16px; text-align: center;">
                <div style="flex: 1;">
                  <div style="font-size: 24px; font-weight: 800; color: #0021A5;">${companiesResearched}</div>
                  <div style="color: #64748B; font-size: 12px;">Companies Researched</div>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 24px; font-weight: 800; color: #7C3AED;">${alumniDiscovered}</div>
                  <div style="color: #64748B; font-size: 12px;">Alumni Found</div>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 24px; font-weight: 800; color: #FA4616;">${messagesDrafted}</div>
                  <div style="color: #64748B; font-size: 12px;">Messages Drafted</div>
                </div>
              </div>
            </div>

            <div style="background: #FFF7ED; border-left: 4px solid #FA4616; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #FA4616; font-weight: 700; margin: 0 0 8px 0;">This week's action items:</p>
              <ul style="color: #334155; margin: 0; padding-left: 20px; line-height: 2;">
                ${targetCompanies.length > 0 ? `<li>Research ${targetCompanies[0]} — check hiring signals</li>` : '<li>Add your first target company</li>'}
                <li>Send at least one outreach message</li>
                <li>Update your resume with FASTIQ AI</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${APP_URL}/#FastIQ" style="display: inline-block; background: linear-gradient(135deg, #0021A5, #7C3AED); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700;">Open FASTIQ →</a>
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
      else console.error(`Failed to send to ${profile.user_email}: ${sgResponse.status}`);
    }

    return Response.json({ success: true, totalProfiles: activeProfiles.length, sent, skipped });
  } catch (error) {
    console.error('fastiqWeeklyAccountability error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});