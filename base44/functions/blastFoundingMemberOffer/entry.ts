import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { dryRun = true } = await req.json();

    const allUsers = await base44.entities.User.filter({});
    
    const eligible = allUsers.filter(u =>
      u.email &&
      (u.is_founding_member === true ||
       u.subscription_tier === 'free_forever' ||
       u.price_tier === 'founding') &&
      u.fastiq_setup_complete !== true &&
      u.subscription_status !== 'active'
    );

    console.log(`Found ${eligible.length} eligible founding members`);
    console.log('Sample:', eligible.slice(0, 5).map(u => ({ 
      email: u.email, 
      name: u.full_name,
      tier: u.subscription_tier,
      is_founding: u.is_founding_member,
    })));

    if (dryRun) {
      return Response.json({ 
        success: true, 
        dryRun: true,
        count: eligible.length,
        sample: eligible.slice(0, 5).map(u => ({ 
          email: u.email, 
          name: u.full_name,
          school: u.school,
          tier: u.subscription_tier,
        }))
      });
    }

    const results = { sent: 0, failed: 0, errors: [] };
    
    for (const user of eligible) {
      const firstName = user.full_name?.split(' ')[0] || 'there';
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: user.email }] }],
            from: { 
              email: 'support@collegefastforward.com', 
              name: 'College Fast Forward' 
            },
            subject: `${firstName}, your founding member offer expires April 15th 🎖`,
            content: [{ type: 'text/html', value: buildFoundingEmail(firstName) }],
          }),
        });
        results.sent++;
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        results.failed++;
        results.errors.push({ email: user.email, error: e.message });
        console.error('Failed:', user.email, e.message);
      }
    }

    console.log('Blast complete:', results);
    return Response.json({ success: true, dryRun: false, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

const buildFoundingEmail = (firstName) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  
  <div style="text-align:center;margin-bottom:32px;">
    <p style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0;">
      COLLEGE FAST FORWARD
    </p>
  </div>

  <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    
    <div style="background:#0A0A0A;padding:36px 36px 32px;">
      <p style="font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#E85D20;margin:0 0 12px;">
        🎖 FOUNDING MEMBER OFFER
      </p>
      <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${firstName}, this expires April 15th.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        50% off FastIQ forever — locked in for life.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        You joined College Fast Forward early — and we want to reward that.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        A lot has changed since you signed up. FastIQ — our AI career engine — is now live. Here's what you unlock at <strong>$14.50/month forever</strong> (50% off the regular price):
      </p>

      <div style="background:#F9F9F9;border-radius:10px;padding:16px 20px;margin:16px 0;">
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">⚡ Unlimited alumni searches at any company</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">📄 Resume tailoring to any job description</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🎤 Full STAR method mock interview practice</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🔗 LinkedIn profile scoring and optimization</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">✉️ AI outreach drafts with follow-up nudges</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🧠 Career archetype assessment</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0;">👥 455+ parents and professionals ready to help</p>
      </div>

      <div style="text-align:center;margin:24px 0 8px;">
        <a href="https://collegefastforward.com/#FastIQDashboard" 
           style="display:inline-block;background:#E85D20;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
          Claim 50% Off — $14.50/month →
        </a>
      </div>

      <div style="height:1px;background:#F0F0F0;margin:24px 0;"></div>
      <div style="text-align:center;">
        <p style="font-size:13px;color:#E85D20;font-weight:700;margin:0 0 4px;">
          ⏰ Offer expires April 15, 2026
        </p>
        <p style="font-size:12px;color:#AAAAAA;margin:0;">
          After April 15th, FastIQ is $29/month. This founding rate is gone forever.
        </p>
      </div>
    </div>
  </div>

  <div style="text-align:center;margin-top:24px;">
    <p style="font-size:12px;color:#AAAAAA;margin:0 0 4px;">
      College Fast Forward · support@collegefastforward.com
    </p>
    <p style="font-size:11px;color:#CCCCCC;margin:0;">
      You're receiving this because you joined College Fast Forward.
    </p>
  </div>
</div>
</body>
</html>`;