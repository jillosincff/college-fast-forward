import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Load all profiles with new alerts
    const profiles = await base44.asServiceRole.entities.FastTrackProProfile.filter(
      { assessment_complete: true },
      '-updated_date',
      100
    );

    let emailsSent = 0;

    for (const profile of profiles) {
      try {
        if (!profile.new_alerts_count || profile.new_alerts_count === 0) continue;

        // Check email preferences
        let prefs = [];
        try {
          const users = await base44.asServiceRole.entities.User.filter({ email: profile.user_email });
          if (users?.length > 0) {
            const emailPrefs = await base44.asServiceRole.entities.EmailPreference.filter({ user_id: users[0].id });
            prefs = emailPrefs;
          }
        } catch (e) {
          console.log('Could not check email prefs for', profile.user_email);
        }

        // If they explicitly turned off emails, skip
        const pref = prefs?.[0];
        if (pref && pref.all_emails === false) {
          console.log(`Skipping email for ${profile.user_email} — emails disabled`);
          continue;
        }

        // Get their new scouted opportunities
        const newOpps = await base44.asServiceRole.entities.ScoutedOpportunity.filter(
          { user_email: profile.user_email, is_new: true },
          '-scouted_date',
          10
        );

        if (newOpps.length === 0) continue;

        const atTargetCompanies = newOpps.filter(o =>
          (profile.target_companies || []).some(tc =>
            o.company_name?.toLowerCase().includes(tc.toLowerCase())
          )
        ).length;

        const withAlumni = newOpps.filter(o => o.alumni_available).length;

        // Build email
        const oppList = newOpps.slice(0, 5).map(o =>
          `• ${o.company_name} — ${o.role_title}${o.location ? ` (${o.location})` : ''}${o.alumni_available ? ' ✨ UF alumni here' : ''}\n  ${o.match_reason}`
        ).join('\n\n');

        const subject = `FASTIQ found ${newOpps.length} new opportunit${newOpps.length === 1 ? 'y' : 'ies'} this week`;

        const body = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0A1628, #0021A5); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
    <h1 style="color: white; font-size: 22px; margin: 0 0 8px 0;">⚡ FASTIQ Weekly Scout</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">Your AI career agent has been busy while you were away.</p>
  </div>

  <div style="background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
    <h2 style="color: #9A3412; font-size: 18px; margin: 0 0 12px 0;">🔔 ${newOpps.length} New Opportunit${newOpps.length === 1 ? 'y' : 'ies'} Found</h2>
    <div style="display: flex; gap: 16px; margin-bottom: 12px;">
      ${atTargetCompanies > 0 ? `<span style="background: #DBEAFE; color: #1E40AF; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${atTargetCompanies} at target companies</span>` : ''}
      ${withAlumni > 0 ? `<span style="background: #FEF3C7; color: #92400E; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${withAlumni} with UF alumni</span>` : ''}
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 14px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Top Opportunities</h3>
    ${newOpps.slice(0, 5).map(o => `
    <div style="background: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 8px;">
      <div style="font-weight: 600; color: #0F172A; font-size: 14px;">${o.company_name} — ${o.role_title}</div>
      ${o.location ? `<div style="font-size: 12px; color: #64748B; margin-top: 2px;">📍 ${o.location}</div>` : ''}
      <div style="font-size: 12px; color: #475569; margin-top: 4px;">${o.match_reason}</div>
      ${o.alumni_available ? `<div style="font-size: 12px; color: #EA580C; margin-top: 4px; font-weight: 600;">✨ ${o.alumni_count || ''} UF alumni work here</div>` : ''}
    </div>
    `).join('')}
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <a href="https://app.collegefastforward.com/#FastTrackPro" style="display: inline-block; background: #FA4616; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">Open FASTIQ →</a>
  </div>

  <p style="text-align: center; color: #94A3B8; font-size: 11px; margin-top: 20px;">FASTIQ is always scanning for you. New opportunities are checked every 48 hours.</p>
</div>
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.user_email,
          subject,
          body,
          from_name: 'FASTIQ Scout',
        });

        emailsSent++;
        console.log(`Sent digest to ${profile.user_email}: ${newOpps.length} opportunities`);

      } catch (profileError) {
        console.error(`Error sending digest to ${profile.user_email}:`, profileError.message);
      }
    }

    return Response.json({
      success: true,
      emails_sent: emailsSent,
      profiles_checked: profiles.length,
    });

  } catch (error) {
    console.error('fastiqScoutDigest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});