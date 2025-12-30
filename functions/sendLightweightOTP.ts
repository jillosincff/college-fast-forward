import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Send OTP for lightweight responder verification
 * 
 * Rate limited: max 3 requests per email per hour
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, firstName, role, questionId } = await req.json();

    if (!email || !firstName) {
      return Response.json({ 
        success: false, 
        error: 'Email and first name are required' 
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limit (3 OTPs per email per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentAttempts = await base44.asServiceRole.entities.LightweightOTP.filter({
      email: normalizedEmail,
      created_date: { $gte: oneHourAgo }
    });

    if (recentAttempts.length >= 3) {
      return Response.json({
        success: false,
        error: 'Too many verification attempts. Please try again later.'
      }, { status: 429 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store OTP
    await base44.asServiceRole.entities.LightweightOTP.create({
      email: normalizedEmail,
      code: otpCode,
      first_name: firstName,
      role: role || 'other',
      source_question_id: questionId,
      expires_at: expiresAt,
      used: false
    });

    // Send email via SendGrid
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    
    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY not configured');
      return Response.json({
        success: false,
        error: 'Email service not configured'
      }, { status: 500 });
    }

    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: normalizedEmail }]
        }],
        from: {
          email: 'noreply@collegefastforward.com',
          name: 'College Fast Forward'
        },
        subject: `Your verification code: ${otpCode}`,
        content: [{
          type: 'text/html',
          value: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
              <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                  
                  <div style="text-align: center; margin-bottom: 24px;">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg" 
                         alt="College Fast Forward" 
                         style="width: 60px; height: 60px; border-radius: 50%;">
                  </div>
                  
                  <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; text-align: center; margin: 0 0 8px 0;">
                    Your verification code
                  </h1>
                  
                  <p style="font-size: 15px; color: #6b7280; text-align: center; margin: 0 0 24px 0;">
                    Hi ${firstName}! Use this code to verify your email:
                  </p>
                  
                  <div style="background: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0021A5; font-family: monospace;">
                      ${otpCode}
                    </span>
                  </div>
                  
                  <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
                    This code expires in 10 minutes.<br>
                    If you didn't request this, please ignore this email.
                  </p>
                  
                </div>
                
                <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
                  © ${new Date().getFullYear()} College Fast Forward
                </p>
              </div>
            </body>
            </html>
          `
        }]
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('SendGrid error:', errorText);
      return Response.json({
        success: false,
        error: 'Failed to send verification email'
      }, { status: 500 });
    }

    console.log('OTP sent successfully to:', normalizedEmail);

    return Response.json({
      success: true,
      message: 'Verification code sent'
    });

  } catch (error) {
    console.error('sendLightweightOTP error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
});