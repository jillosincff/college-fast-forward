import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Send founding member notification email
 * Can be used for:
 * 1. Notifying existing users they're founding members
 * 2. Welcome email for new founding members
 */

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access for bulk sends
    const user = await base44.auth.me();
    
    const { mode = 'single', user_id, dry_run = true } = await req.json().catch(() => ({}));

    if (mode === 'bulk' && (!user || !user.roles?.includes('admin'))) {
      return Response.json({ error: 'Admin access required for bulk sends' }, { status: 403 });
    }

    // For bulk mode - send to all existing founding members
    if (mode === 'bulk') {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const foundingMembers = allUsers.filter(u => 
        u.is_founding_member || u.is_founding_gator || u.price_tier === 'founding'
      );

      console.log(`Found ${foundingMembers.length} founding members`);

      if (dry_run) {
        return Response.json({
          success: true,
          dry_run: true,
          message: `Would send emails to ${foundingMembers.length} founding members`,
          sample_emails: foundingMembers.slice(0, 10).map(u => u.email)
        });
      }

      let sent = 0;
      let errors = [];

      for (const member of foundingMembers) {
        try {
          await sendFoundingEmail(member);
          sent++;
          // Rate limit: 1 email per 100ms
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          errors.push({ email: member.email, error: err.message });
        }
      }

      return Response.json({
        success: true,
        sent,
        errors: errors.length,
        error_details: errors.slice(0, 10)
      });
    }

    // Single user mode
    if (!user_id && !user) {
      return Response.json({ error: 'user_id required' }, { status: 400 });
    }

    const targetUser = user_id 
      ? await base44.asServiceRole.entities.User.get(user_id)
      : user;

    if (dry_run) {
      return Response.json({
        success: true,
        dry_run: true,
        message: `Would send founding member email to ${targetUser.email}`,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.full_name,
          member_number: targetUser.member_number || targetUser.founding_gator_number
        }
      });
    }

    await sendFoundingEmail(targetUser);

    return Response.json({
      success: true,
      message: `Sent founding member email to ${targetUser.email}`
    });

  } catch (error) {
    console.error('❌ Send founding email error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send email'
    }, { status: 500 });
  }
});

async function sendFoundingEmail(user) {
  const memberNumber = user.member_number || user.founding_gator_number || user.signup_order;
  const firstName = user.first_name || user.full_name?.split(' ')[0] || 'Gator';

  const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .badge { display: inline-block; background: linear-gradient(135deg, #FA4616, #f97316); color: white; padding: 10px 20px; border-radius: 50px; font-weight: bold; font-size: 14px; }
    .hero { background: linear-gradient(135deg, #0021A5, #0039C7); color: white; padding: 40px; border-radius: 16px; text-align: center; margin-bottom: 30px; }
    .hero h1 { margin: 0 0 10px 0; font-size: 28px; }
    .hero .emoji { font-size: 48px; margin-bottom: 20px; }
    .member-number { background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 10px; display: inline-block; margin-top: 20px; }
    .benefits { background: #fefce8; border: 2px solid #fde047; border-radius: 12px; padding: 24px; margin-bottom: 30px; }
    .benefits h3 { color: #854d0e; margin-top: 0; }
    .benefits ul { margin: 0; padding-left: 20px; }
    .benefits li { margin-bottom: 8px; color: #713f12; }
    .footer { text-align: center; color: #64748b; font-size: 14px; margin-top: 40px; }
    .cta { display: inline-block; background: #FA4616; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg" alt="College Fast Forward" style="height: 60px;">
    </div>

    <div class="hero">
      <div class="emoji">🎉</div>
      <h1>You're a Founding Member!</h1>
      <p style="margin-bottom: 0; opacity: 0.9;">Your access is FREE FOREVER</p>
      ${memberNumber ? `<div class="member-number">👑 Member #${memberNumber}</div>` : ''}
    </div>

    <p>Hi ${firstName},</p>

    <p><strong>Big news:</strong> You're officially a Gator Network Founding Member.</p>

    <div class="benefits">
      <h3>👑 What this means for you:</h3>
      <ul>
        <li>✅ Your access is <strong>FREE FOREVER</strong></li>
        <li>✅ You'll <strong>never pay a subscription fee</strong></li>
        <li>✅ You get an exclusive <strong>Founding Member badge</strong></li>
        <li>✅ <strong>Early access</strong> to all new features</li>
        <li>✅ <strong>VIP status</strong> in the community</li>
      </ul>
    </div>

    <p>Starting today, new members joining after the first 1,000 families will pay $9-19/month for access.</p>

    <p><strong>But you? You're locked in FREE. Forever.</strong></p>

    <p>Thanks for being here from the beginning.</p>

    <p style="margin-top: 30px;">
      <a href="https://www.collegefastforward.com/#Dashboard" class="cta">Go to My Dashboard →</a>
    </p>

    <p style="margin-top: 30px;">Go Gators! 🐊</p>

    <p>
      <strong>Jill</strong><br>
      Founder, College Fast Forward
    </p>

    <p style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 14px; color: #475569;">
      <strong>P.S.</strong> Invite your friends now before we hit 1,000 members and the free spots are gone!
    </p>

    <div class="footer">
      <p>© 2024 College Fast Forward. All rights reserved.</p>
      <p>
        <a href="https://www.collegefastforward.com/#Privacy" style="color: #64748b;">Privacy</a> •
        <a href="https://www.collegefastforward.com/#Terms" style="color: #64748b;">Terms</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: user.email, name: user.full_name }]
      }],
      from: {
        email: 'team@collegefastforward.com',
        name: 'College Fast Forward'
      },
      subject: '🎉 You\'re a Founding Member - FREE FOREVER',
      content: [{
        type: 'text/html',
        value: emailContent
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
  }

  console.log('Sent founding member email to:', user.email);
}