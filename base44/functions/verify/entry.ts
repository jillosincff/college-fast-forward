import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    // Extract token from URL query parameters
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Verification Failed</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Verification Failed</h1>
          <p>No verification token found in URL</p>
          <a href="/#LandingPage">Return to Homepage</a>
        </body>
        </html>
      `, { 
        status: 400, 
        headers: { 'Content-Type': 'text/html' } 
      });
    }

    console.log(`[verify] Processing verification for token: ${token}`);

    // Create Base44 client
    const base44 = createClientFromRequest(req);

    try {
      // Find the magic link with this token
      const magicLinks = await base44.asServiceRole.entities.MagicLink.filter({ token: token });
      
      if (!magicLinks || magicLinks.length === 0) {
        console.log(`[verify] No magic link found for token: ${token}`);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Verification Failed</h1>
            <p>Invalid or expired verification token</p>
            <a href="/#LandingPage">Return to Homepage</a>
          </body>
          </html>
        `, { 
          status: 400, 
          headers: { 'Content-Type': 'text/html' } 
        });
      }

      const matchingLink = magicLinks[0];
      console.log(`[verify] Found magic link for email: ${matchingLink.email}`);

      // Check if token is expired
      if (new Date() > new Date(matchingLink.expires_at)) {
        console.log(`[verify] Token expired: ${matchingLink.expires_at}`);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Verification Failed</h1>
            <p>Verification token has expired. Please register again.</p>
            <a href="/#LandingPage">Return to Homepage</a>
          </body>
          </html>
        `, { 
          status: 400, 
          headers: { 'Content-Type': 'text/html' } 
        });
      }

      // Check if token was already used
      if (matchingLink.used) {
        console.log(`[verify] Token already used`);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Already Verified</h1>
            <p>This verification token has already been used</p>
            <a href="/#LandingPage">Try logging in</a>
          </body>
          </html>
        `, { 
          status: 400, 
          headers: { 'Content-Type': 'text/html' } 
        });
      }

      // Parse registration data
      let registrationData;
      try {
        registrationData = JSON.parse(matchingLink.user_agent);
      } catch (e) {
        console.error(`[verify] Failed to parse registration data:`, e);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Verification Failed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Verification Failed</h1>
            <p>Invalid registration data format</p>
            <a href="/#LandingPage">Return to Homepage</a>
          </body>
          </html>
        `, { 
          status: 400, 
          headers: { 'Content-Type': 'text/html' } 
        });
      }

      // Create the user account
      const newUser = await base44.asServiceRole.entities.User.create({
        email: matchingLink.email,
        full_name: registrationData.full_name,
        password_hash: registrationData.password_hash,
        password_salt: registrationData.password_salt,
        is_email_verified: true,
        email_verified: true,
        persona: 'student',
        onboarding_completed: false,
        profile_completion_score: 25
      });

      // Mark the magic link as used
      await base44.asServiceRole.entities.MagicLink.update(matchingLink.id, { used: true });

      console.log(`[verify] Successfully created user: ${newUser.email}`);

      // Redirect to success page
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified Successfully!</title>
          <meta http-equiv="refresh" content="3;url=/#LandingPage">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); color: white;">
          <div style="background: white; color: #333; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
            <h1 style="color: #0021A5;">🎉 Email Verified!</h1>
            <p>Welcome to College Fast Forward, <strong>${newUser.full_name}</strong>!</p>
            <p>Your account has been created successfully. You can now log in.</p>
            <p style="color: #666; font-size: 14px;">Redirecting to login page in 3 seconds...</p>
            <a href="/#LandingPage" style="background: #0021A5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Go to Login</a>
          </div>
        </body>
        </html>
      `, { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
      });

    } catch (dbError) {
      console.error('[verify] Database error:', dbError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Verification Failed</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Verification Failed</h1>
          <p>Database error: ${dbError.message}</p>
          <p>Please try registering again or contact support.</p>
          <a href="/#LandingPage">Return to Homepage</a>
        </body>
        </html>
      `, { 
        status: 500, 
        headers: { 'Content-Type': 'text/html' } 
      });
    }

  } catch (error) {
    console.error('[verify] General error:', error);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Verification Failed</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Verification Failed</h1>
        <p>Server error: ${error.message}</p>
        <a href="/#LandingPage">Return to Homepage</a>
      </body>
      </html>
    `, { 
      status: 500, 
      headers: { 'Content-Type': 'text/html' } 
    });
  }
});