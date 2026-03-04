import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Weekly accountability email — runs every Monday via scheduled automation
// Generates a personalized weekly plan for each FASTIQ student

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all active FASTIQ profiles
    const profiles = await base44.asServiceRole.entities.FastTrackProProfile.filter({ assessment_complete: true }, '-updated_date', 200);
    if (!profiles || profiles.length === 0) {
      return Response.json({ success: true, message: 'No active FASTIQ profiles found', sent: 0 });
    }

    let sentCount = 0;
    const errors = [];

    for (const profile of profiles) {
      try {
        const email = profile.user_email;
        if (!email) continue;

        // Load user data
        const users = await base44.asServiceRole.entities.User.filter({ email });
        const userData = users?.[0] || {};
        const firstName = (userData.full_name || 'Gator').split(/[\s,]+/)[0];

        // Load pipeline — pending follow-ups
        const pipeline = await base44.asServiceRole.entities.NetworkingPipeline.filter(
          { user_email: email }, '-status_date', 50
        ).catch(() => []);

        // Find stale outreach (reached_out > 3 days ago, no reply)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const staleOutreach = pipeline.filter(p =>
          p.status === 'reached_out' &&
          p.reached_out_date &&
          new Date(p.reached_out_date) < threeDaysAgo
        );

        // New opportunities
        const newOpps = await base44.asServiceRole.entities.ScoutedOpportunity.filter(
          { user_email: email, is_new: true }, '-scouted_date', 5
        ).catch(() => []);

        // Activity last 7 days
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentActivity = await base44.asServiceRole.entities.ProActivityLog.filter(
          { user_email: email }, '-timestamp', 50
        ).catch(() => []);
        const weekActivity = recentActivity.filter(a => a.timestamp && new Date(a.timestamp) >= oneWeekAgo);

        // Resume check — when was it last updated?
        const resumeLastUpdated = profile.updated_date ? new Date(profile.updated_date) : null;
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const resumeStale = !profile.resume_text || (resumeLastUpdated && resumeLastUpdated < twoWeeksAgo);

        // Build plan items
        const planItems = [];
        let itemNum = 1;

        // Follow-ups — lead section (before numbered plan items)
        let followUpBlock = '';
        if (staleOutreach.length > 0) {
          const followUpLines = staleOutreach.slice(0, 5).map(p => {
            const days = Math.round((Date.now() - new Date(p.reached_out_date).getTime()) / (1000 * 60 * 60 * 24));
            return `<li style="margin-bottom:8px;font-size:13px;color:#92400E;">
              <strong>${p.alumni_name} at ${p.company}</strong> — sent ${days} days ago, no reply
            </li>`;
          }).join('');
          followUpBlock = `
            <div style="background:#FFF7ED;border:1.5px solid #FED7AA;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
              <div style="font-size:15px;font-weight:700;color:#92400E;margin-bottom:8px;">🔔 Follow-up needed</div>
              <ul style="list-style:disc;padding-left:18px;margin:0 0 12px;">${followUpLines}</ul>
              <a href="${Deno.env.get('APP_BASE_URL') || 'https://app.base44.com'}/#FastIQ" 
                 style="display:inline-block;background:#FA4616;color:#fff;padding:8px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:12px;">
                Open FASTIQ to draft follow-ups →
              </a>
            </div>
          `;
        }

        // Follow-ups as plan items too
        staleOutreach.slice(0, 3).forEach(p => {
          const days = Math.round((Date.now() - new Date(p.reached_out_date).getTime()) / (1000 * 60 * 60 * 24));
          planItems.push(`<li style="margin-bottom:12px;"><strong>${itemNum++}. Follow up with ${p.alumni_name} at ${p.company}</strong><br/><span style="color:#64748B;font-size:13px;">Sent ${days} days ago, no reply yet. A friendly follow-up doubles your response rate.</span></li>`);
        });

        // New opportunities
        newOpps.slice(0, 2).forEach(o => {
          planItems.push(`<li style="margin-bottom:12px;"><strong>${itemNum++}. Check out the new ${o.role_title} role at ${o.company_name}</strong><br/><span style="color:#64748B;font-size:13px;">FASTIQ matched this to your profile${o.alumni_available ? ' — and there are UF alumni at this company!' : '.'}</span></li>`);
        });

        // Resume nudge
        if (resumeStale) {
          planItems.push(`<li style="margin-bottom:12px;"><strong>${itemNum++}. Update your resume</strong><br/><span style="color:#64748B;font-size:13px;">You haven't touched your resume in ${resumeLastUpdated ? 'over 2 weeks' : 'a while'} — want FASTIQ to review it?</span></li>`);
        }

        // Activity nudge
        if (weekActivity.length < 2) {
          planItems.push(`<li style="margin-bottom:12px;"><strong>${itemNum++}. Research a target company</strong><br/><span style="color:#64748B;font-size:13px;">You've been quiet this week. Students who stay active find opportunities 3x faster.</span></li>`);
        }

        // Target companies that haven't been researched
        const targetCompanies = profile.target_companies || [];
        const researchedCompanies = new Set(recentActivity.filter(a => a.action_type === 'company_search').map(a => a.target_name?.toLowerCase()));
        const unresearched = targetCompanies.filter(c => !researchedCompanies.has(c.toLowerCase()));
        if (unresearched.length > 0 && planItems.length < 5) {
          planItems.push(`<li style="margin-bottom:12px;"><strong>${itemNum++}. Research ${unresearched[0]}</strong><br/><span style="color:#64748B;font-size:13px;">This target company hasn't been researched yet. Let FASTIQ scan it for open roles and alumni.</span></li>`);
        }

        if (planItems.length === 0) {
          planItems.push(`<li style="margin-bottom:12px;"><strong>1. Great job staying on top of things!</strong><br/><span style="color:#64748B;font-size:13px;">Your pipeline is active. Keep the momentum — log in to FASTIQ for new intel.</span></li>`);
        }

        // Weekly stats summary
        const companiesResearched = weekActivity.filter(a => a.action_type === 'company_search').length;
        const alumniFound = weekActivity.filter(a => a.action_type === 'alumni_view').length;
        const messagesDrafted = weekActivity.filter(a => a.action_type === 'message_draft').length;
        const totalPipeline = pipeline.length;

        const emailBody = `
          <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
            <div style="background:linear-gradient(135deg,#0021A5,#0033CC);padding:32px 24px;text-align:center;border-radius:16px 16px 0 0;">
              <div style="font-size:24px;margin-bottom:8px;">⚡</div>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px;">Your FASTIQ Weekly Plan</h1>
              <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">Here's what to focus on this week, ${firstName}.</p>
            </div>

            <div style="padding:24px;">
              <!-- Weekly Stats -->
              <div style="display:flex;gap:8px;margin-bottom:24px;">
                <div style="flex:1;background:#F8FAFC;border-radius:12px;padding:12px;text-align:center;border:1px solid #E2E8F0;">
                  <div style="font-size:20px;font-weight:800;color:#0021A5;">${companiesResearched}</div>
                  <div style="font-size:10px;color:#94A3B8;text-transform:uppercase;">Companies<br/>Researched</div>
                </div>
                <div style="flex:1;background:#F8FAFC;border-radius:12px;padding:12px;text-align:center;border:1px solid #E2E8F0;">
                  <div style="font-size:20px;font-weight:800;color:#8B5CF6;">${alumniFound}</div>
                  <div style="font-size:10px;color:#94A3B8;text-transform:uppercase;">Alumni<br/>Found</div>
                </div>
                <div style="flex:1;background:#F8FAFC;border-radius:12px;padding:12px;text-align:center;border:1px solid #E2E8F0;">
                  <div style="font-size:20px;font-weight:800;color:#FA4616;">${messagesDrafted}</div>
                  <div style="font-size:10px;color:#94A3B8;text-transform:uppercase;">Messages<br/>Drafted</div>
                </div>
                <div style="flex:1;background:#F8FAFC;border-radius:12px;padding:12px;text-align:center;border:1px solid #E2E8F0;">
                  <div style="font-size:20px;font-weight:800;color:#10B981;">${totalPipeline}</div>
                  <div style="font-size:10px;color:#94A3B8;text-transform:uppercase;">In<br/>Pipeline</div>
                </div>
              </div>

              ${followUpBlock}

              <!-- Plan Items -->
              <h2 style="font-size:16px;font-weight:700;color:#1E293B;margin-bottom:16px;">📋 This Week's Action Plan</h2>
              <ol style="padding-left:0;list-style:none;margin:0;">
                ${planItems.join('\n')}
              </ol>

              <!-- CTA -->
              <div style="text-align:center;margin-top:24px;">
                <a href="${Deno.env.get('APP_BASE_URL') || 'https://app.base44.com'}/#FastIQ" 
                   style="display:inline-block;background:#0021A5;color:#ffffff;padding:12px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
                  Open FASTIQ →
                </a>
              </div>

              <!-- Social Proof -->
              <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:16px;margin-top:24px;text-align:center;">
                <p style="font-size:13px;color:#9A3412;margin:0;line-height:1.5;">
                  📊 <strong>FASTIQ students</strong> who complete 3+ actions per week are <strong>4x more likely</strong> to land an interview within 30 days.
                </p>
              </div>
            </div>

            <div style="padding:16px 24px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="font-size:11px;color:#94A3B8;margin:0;">FASTIQ™ by College Fast Forward · Because applying isn't a strategy.</p>
            </div>
          </div>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: `⚡ Your FASTIQ Weekly Plan — ${planItems.length} action${planItems.length === 1 ? '' : 's'} for this week`,
          body: emailBody,
          from_name: 'FASTIQ™',
        });

        sentCount++;
      } catch (e) {
        console.log(`Error sending to ${profile.user_email}:`, e.message);
        errors.push({ email: profile.user_email, error: e.message });
      }
    }

    return Response.json({
      success: true,
      message: `Sent ${sentCount} weekly accountability emails`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('fastiqWeeklyAccountability error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});