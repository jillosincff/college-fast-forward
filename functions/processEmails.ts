Deno.serve(async (req) => {
  console.log('[processEmails] Starting email processing function (Manual Mode)');
  
  try {
    const body = await req.json();
    const { email, full_name, token } = body;
    
    if (!email || !full_name || !token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: email, full_name, token'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const verificationLink = `https://preview--college-fast-forward-fce23588.base44.app/#VerifyEmail?token=${token}`;
    
    // Simulate email sending and return the link for manual verification
    console.log(`[processEmails] SIMULATING email to: ${email}`);
    console.log(`[processEmails] Verification link generated: ${verificationLink}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Verification link generated for ${email}. Please send manually.`,
      verification_link: verificationLink
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error('[processEmails] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});