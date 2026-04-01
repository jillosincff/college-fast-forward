import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { dryRun = true } = await req.json();

    const allUsers = await base44.entities.User.filter({});

    // Segment users
    const jobSeekers = allUsers.filter(u =>
      u.email &&
      u.membership_tier !== 'fastiq' &&
      u.fastiq_setup_complete !== true &&
      u.subscription_status !== 'active' &&
      (
        u.persona === 'student' ||
        (u.persona === 'alumni' && u.alumni_intent === 'seeking_help')
      )
    );

    const helpers = allUsers.filter(u =>
      u.email &&
      u.membership_tier !== 'fastiq' &&
      u.fastiq_setup_complete !== true &&
      u.subscription_status !== 'active' &&
      (
        u.persona === 'parent' ||
        (u.persona === 'alumni' && u.alumni_intent === 'helping')
      )
    );

    console.log(`Job seekers: ${jobSeekers.length}`);
    console.log(`Helpers: ${helpers.length}`);

    if (dryRun) {
      return Response.json({
        success: true,
        dryRun: true,
        jobSeekers: {
          count: jobSeekers.length,
          sample: jobSeekers.slice(0, 3).map(u => ({
            email: u.email,
            name: u.full_name,
            persona: u.persona,
            alumni_intent: u.alumni_intent,
          }))
        },
        helpers: {
          count: helpers.length,
          sample: helpers.slice(0, 3).map(u => ({
            email: u.email,
            name: u.full_name,
            persona: u.persona,
            alumni_intent: u.alumni_intent,
          }))
        }
      });
    }

    const results = { 
      jobSeekers: { sent: 0, failed: 0 }, 
      helpers: { sent: 0, failed: 0 },
      errors: [] 
    };

    // Send job seeker emails
    for (const user of jobSeekers) {
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
            subject: `${firstName}, a gift from us — 50% off FastIQ forever 🎖`,
            content: [{ type: 'text/html', value: buildJobSeekerEmail(firstName) }],
          }),
        });
        results.jobSeekers.sent++;
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        results.jobSeekers.failed++;
        results.errors.push({ email: user.email, error: e.message });
        console.error('Failed:', user.email, e.message);
      }
    }

    // Send helper emails
    for (const user of helpers) {
      const firstName = user.full_name?.split(' ')[0] || 'there';
      const isParent = user.persona === 'parent';
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
            subject: `${firstName}, a gift from us — 50% off FastIQ forever 🎖`,
            content: [{ type: 'text/html', value: buildHelperEmail(firstName, isParent) }],
          }),
        });
        results.helpers.sent++;
        await new Promise(r => setTimeout(r, 100));
      } catch (e) {
        results.helpers.failed++;
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

// EMAIL 1 — Job Seekers (students + alumni seeking help)
const buildJobSeekerEmail = (firstName) => `
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
        🎖 A GIFT FROM US
      </p>
      <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${firstName}, we rebuilt CFF for you.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        Your basic membership is free — and always will be.<br>But we wanted to supercharge your career launch.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        We rebuilt College Fast Forward from the ground up with one goal: get you hired faster through warm connections and AI.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        Because you were here from the beginning, we're giving you <strong>50% off FastIQ forever</strong> — our AI career engine that does the heavy lifting for you.
      </p>

      <div style="background:#F9F9F9;border-radius:10px;padding:16px 20px;margin:16px 0;">
        <p style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">
          FASTIQ UNLOCKS:
        </p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">⚡ Unlimited alumni searches at any company</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">📄 Resume tailoring to any job description</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🎤 Full STAR method mock interview practice</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🔗 LinkedIn profile scoring and optimization</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">✉️ AI outreach drafts with follow-up nudges</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0;">🧠 Career archetype assessment — discover your unique strengths</p>
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
          After April 15th, FastIQ is $29/month. This founding rate is locked in forever.
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

// EMAIL 2 — Helpers (parents + alumni helpers)
const buildHelperEmail = (firstName, isParent) => `
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
        🎖 A GIFT FROM US
      </p>
      <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 10px;line-height:1.3;">
        ${firstName}, thank you for showing up for students.
      </h1>
      <p style="font-size:15px;color:rgba(255,255,255,0.55);margin:0;line-height:1.6;">
        Your membership is free — and always will be.<br>But we wanted to give you something more.
      </p>
    </div>

    <div style="padding:28px 36px 32px;">
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        You joined CFF because you wanted to help ${isParent ? 'students like your own kids' : 'the next generation of professionals'}. That means everything to us — and to the students whose careers you're helping shape.
      </p>
      <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">
        We rebuilt College Fast Forward from the ground up. And because you were here from the start, we're giving you <strong>50% off FastIQ forever</strong> — our AI career engine that makes it even easier to make a difference.
      </p>

      <div style="background:#F9F9F9;border-radius:10px;padding:16px 20px;margin:16px 0;">
        <p style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">
          WITH FASTIQ YOU CAN:
        </p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">👥 See which students in your network need your expertise</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">✉️ Get AI-drafted intro messages so connecting takes 60 seconds</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">🔍 Find students targeting your industry or company</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0 0 8px;">📊 See the impact you're having on student careers</p>
        <p style="font-size:14px;color:#1A1A1A;margin:0;">🎯 Get matched with students who need exactly what you offer</p>
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
          After April 15th, FastIQ is $29/month. This founding rate is locked in forever.
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