Deno.serve(async (req) => {
  console.log('[verifyEmailDirect] === FUNCTION STARTED ===');
  console.log('[verifyEmailDirect] Request URL:', req.url);
  console.log('[verifyEmailDirect] Request method:', req.method);
  
  // ALWAYS return HTML, even if everything fails
  try {
    // Step 1: Extract token
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    console.log('[verifyEmailDirect] Extracted token:', token);
    
    if (!token) {
      console.log('[verifyEmailDirect] No token found - returning error page');
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>No Token</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>❌ No Token</h1>
          <p>URL: ${req.url}</p>
          <p>No verification token found</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
        </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Step 2: Try to connect to Base44
    console.log('[verifyEmailDirect] Attempting to create Base44 client');
    
    let base44;
    try {
      const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.20');
      base44 = createClientFromRequest(req);
      console.log('[verifyEmailDirect] Base44 client created successfully');
    } catch (importError) {
      console.error('[verifyEmailDirect] Import/client creation failed:', importError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Server Error</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>❌ Server Error</h1>
          <p>Failed to initialize: ${importError.message}</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
        </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Step 3: Search for magic link
    console.log('[verifyEmailDirect] Searching for magic link with token:', token);
    
    let magicLinks;
    try {
      magicLinks = await base44.asServiceRole.entities.MagicLink.filter({ token: token });
      console.log('[verifyEmailDirect] Magic link search result:', magicLinks?.length || 'null');
    } catch (searchError) {
      console.error('[verifyEmailDirect] Magic link search failed:', searchError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Database Error</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>❌ Database Error</h1>
          <p>Search failed: ${searchError.message}</p>
          <p>Token: ${token}</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
        </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!magicLinks || magicLinks.length === 0) {
      console.log('[verifyEmailDirect] No magic link found for token');
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Token Not Found</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>❌ Token Not Found</h1>
          <p>No verification record found for token: ${token}</p>
          <p>The token may have expired or been used already.</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
        </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Step 4: Process the magic link
    const matchingLink = magicLinks[0];
    console.log('[verifyEmailDirect] Found magic link for email:', matchingLink.email);
    console.log('[verifyEmailDirect] Link expires at:', matchingLink.expires_at);
    console.log('[verifyEmailDirect] Link used:', matchingLink.used);

    // Check if expired
    if (new Date() > new Date(matchingLink.expires_at)) {
      console.log('[verifyEmailDirect] Token has expired');
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Token Expired</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>⏰ Token Expired</h1>
          <p>This verification token expired on ${new Date(matchingLink.expires_at).toLocaleString()}</p>
          <p>Please register again to get a new verification email.</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
        </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Check if already used
    if (matchingLink.used) {
      console.log('[verifyEmailDirect] Token already used');
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Already Verified</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>✅ Already Verified</h1>
          <p>This email address has already been verified.</p>
          <p>You can now log in to your account.</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Go to Login</a>
        </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Step 5: Parse registration data
    let registrationData;
    try {
      registrationData = JSON.parse(matchingLink.user_agent);
      console.log('[verifyEmailDirect] Parsed registration data for:', registrationData.full_name);
    } catch (parseError) {
      console.error('[verifyEmailDirect] Failed to parse registration data:', parseError);
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Data Error</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>❌ Data Error</h1>
          <p>Invalid registration data format</p>
          <p>Parse error: ${parseError.message}</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
        </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Step 6: Create user account
    console.log('[verifyEmailDirect] Attempting to create user account');
    try {
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

      console.log('[verifyEmailDirect] User created successfully:', newUser.id);

      // Mark token as used
      await base44.asServiceRole.entities.MagicLink.update(matchingLink.id, { used: true });
      console.log('[verifyEmailDirect] Token marked as used');

      // SUCCESS!
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Welcome to College Fast Forward!</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family:Arial;text-align:center;padding:50px;background:linear-gradient(135deg,#0021A5,#FA4616);color:white;">
          <h1>🎉 Welcome ${registrationData.full_name}!</h1>
          <p>Your email has been verified successfully!</p>
          <p>Your account is now active and ready to use.</p>
          <p><strong>You can now log in with your email and password.</strong></p>
          <br>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage" 
             style="color:white;background:rgba(255,255,255,0.2);padding:15px 30px;text-decoration:none;border-radius:5px;border:1px solid white;">
            Go to College Fast Forward
          </a>
        </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });

    } catch (createError) {
      console.error('[verifyEmailDirect] User creation failed:', createError);
      
      // Handle duplicate user
      if (createError.message && (
          createError.message.includes('duplicate') || 
          createError.message.includes('already exists') ||
          createError.message.includes('unique'))) {
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Account Exists</title></head>
          <body style="font-family:Arial;text-align:center;padding:50px;">
            <h1>⚠️ Account Already Exists</h1>
            <p>An account with email ${matchingLink.email} already exists.</p>
            <p>You can log in with your existing credentials.</p>
            <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Go to Login</a>
          </body>
          </html>
        `, {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Account Creation Failed</title></head>
        <body style="font-family:Arial;text-align:center;padding:50px;">
          <h1>❌ Account Creation Failed</h1>
          <p>Error: ${createError.message}</p>
          <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
        </body>
        </html>
      `, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }

  } catch (globalError) {
    console.error('[verifyEmailDirect] Global error:', globalError);
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><title>Unexpected Error</title></head>
      <body style="font-family:Arial;text-align:center;padding:50px;">
        <h1>❌ Unexpected Error</h1>
        <p>Something unexpected happened: ${globalError.message}</p>
        <p>Please try again or contact support.</p>
        <a href="https://preview--college-fast-forward-fce23588.base44.app/#LandingPage">Return Home</a>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
});