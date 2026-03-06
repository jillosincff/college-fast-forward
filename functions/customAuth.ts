import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Simple password hashing function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sendVerificationEmail(email, token, origin) {
  const verificationUrl = `${origin}/#VerifyEmail?token=${token}`;
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🐊 College Fast Forward</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Verify Your Email Address</p>
      </div>
      
      <div style="padding: 40px 20px; background: white;">
        <h2 style="color: #333; margin-top: 0;">Welcome to the Gator Network!</h2>
        <p style="color: #666; line-height: 1.6;">
          Thanks for joining College Fast Forward! To complete your registration and start connecting with fellow Gators, please verify your email address.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #0021A5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Verify My Email & Get Started
          </a>
        </div>
        
        <p style="color: #888; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <span style="color: #0021A5; word-break: break-all;">${verificationUrl}</span>
        </p>
        
        <p style="color: #888; font-size: 14px; margin-top: 20px;">
          This link will expire in 24 hours. If you didn't sign up for College Fast Forward, you can safely ignore this email.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
        <p>Go Gators! 🐊</p>
        <p>The College Fast Forward Team</p>
      </div>
    </div>
  `;

  await SendEmail({
    to: email,
    subject: '🐊 Welcome! Verify your email - College Fast Forward',
    body: emailBody
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, email, password, full_name } = await req.json();
    const origin = new URL(req.url).origin;

    if (action === 'register') {
      // Check if user already exists
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
      if (existingUsers && existingUsers.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'An account with this email already exists'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await base44.asServiceRole.entities.User.create({
        email,
        full_name,
        password_hash: passwordHash,
        is_email_verified: false,
        onboarding_completed: false,
        created_date: new Date().toISOString()
      });

      // Generate verification token
      const verificationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await base44.asServiceRole.entities.EmailVerificationToken.create({
        token: verificationToken,
        email,
        expires_at: expiresAt.toISOString(),
        used: false
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken, origin);

      return new Response(JSON.stringify({
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        requires_verification: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_email_verified: false
        }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (action === 'login') {
      // Find user by email
      const users = await base44.asServiceRole.entities.User.filter({ email });
      if (!users || users.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const user = users[0];

      // Check password
      const passwordHash = await hashPassword(password);
      if (user.password_hash !== passwordHash) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if email is verified
      if (!user.is_email_verified) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Please verify your email address before logging in',
          requires_verification: true
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate session token
      const sessionToken = crypto.randomUUID();
      await base44.asServiceRole.entities.User.update(user.id, {
        session_token: sessionToken,
        last_login_at: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Login successful',
        user: {
          ...user,
          session_token: sessionToken
        },
        session_token: sessionToken
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Custom auth error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Authentication failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});