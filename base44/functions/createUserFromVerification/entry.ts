import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  console.log("=== CREATE USER FROM VERIFICATION ===");
  
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, full_name, password } = body;
    
    if (!email || !full_name || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lowerCaseEmail = email.toLowerCase();
    console.log("Creating user from verification for:", lowerCaseEmail);

    // Check if user already exists
    try {
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email: lowerCaseEmail });
      if (existingUsers && existingUsers.length > 0) {
        console.log("User already exists, returning existing user");
        const existingUser = existingUsers[0];
        
        // Generate session token
        const sessionToken = crypto.randomUUID();
        const updatedUser = await base44.asServiceRole.entities.User.update(existingUser.id, { 
          session_token: sessionToken,
          email_verified: true 
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          user: updatedUser,
          session_token: sessionToken,
          message: 'Account verified successfully!' 
        }), { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.log("Error checking existing users:", error);
    }

    // Generate password hash
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw', 
      new TextEncoder().encode(password), 
      { name: 'PBKDF2' }, 
      false, 
      ['deriveBits']
    );
    const hashedPasswordBuffer = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-512' }, 
      keyMaterial, 
      512
    );
    const hashedPassword = buf2hex(hashedPasswordBuffer);
    const saltHex = buf2hex(salt);
    const sessionToken = crypto.randomUUID();

    // Create new user
    const newUser = await base44.asServiceRole.entities.User.create({
      email: lowerCaseEmail,
      full_name,
      password_hash: hashedPassword,
      password_salt: saltHex,
      session_token: sessionToken,
      email_verified: true,
      onboarding_completed: false,
      profile_completion_score: 10
    });

    console.log("User created successfully:", newUser.id);

    // Notify admin of the new signup (non-blocking — never fail signup over this)
    try {
      await base44.functions.invoke('notifyAdminNewSignup', {
        full_name, email: lowerCaseEmail, persona: 'student',
      });
    } catch (notifyErr) {
      console.error('[createUserFromVerification] Admin notify failed:', notifyErr.message);
    }

    // Check if a parent gifted FastIQ to this email before they signed up
    try {
      // Find parents who have this email in their pending_fastiq_gift_emails array
      const allParents = await base44.asServiceRole.entities.User.filter({ persona: 'parent' });
      const parentRecords = (allParents || []).filter(p =>
        Array.isArray(p.pending_fastiq_gift_emails) && p.pending_fastiq_gift_emails.includes(lowerCaseEmail)
      );

      if (parentRecords.length > 0) {
        const parent = parentRecords[0];
        const trialStart = new Date();
        const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        await base44.asServiceRole.entities.User.update(newUser.id, {
          fastiq_active: true,
          is_fastiq: true,
          fastiq_setup_complete: true,
          membership_tier: 'fastiq',
          subscription_status: 'active',
          trial_start_date: trialStart.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          trial_status: 'active',
          fastiq_trial_active: true,
          gifted_by_parent_email: parent.email,
          linked_parent_name: parent.full_name?.split(' ')[0] || 'Your parent',
        });

        // Remove this email from parent's pending array
        const updatedPending = (parent.pending_fastiq_gift_emails || []).filter(e => e !== lowerCaseEmail);
        await base44.asServiceRole.entities.User.update(parent.id, {
          pending_fastiq_gift_emails: updatedPending,
        });

        console.log('[createUserFromVerification] Pending FastIQ gift activated from parent:', parent.email);
      }
    } catch (giftErr) {
      console.error('[createUserFromVerification] Pending gift check failed:', giftErr.message);
    }

    return new Response(JSON.stringify({
      success: true,
      user: newUser,
      session_token: sessionToken,
      message: 'Account created and verified successfully!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error creating user from verification:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to create account. Please try again.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});