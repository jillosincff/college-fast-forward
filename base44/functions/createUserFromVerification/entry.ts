import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import bcrypt from 'npm:bcryptjs@2.4.3';

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
    const { token, password } = body;

    // Proof of email ownership is MANDATORY. The identity of the new account is
    // taken solely from the RegistrationAttempt that the emailed token points at
    // — never from the request body. Without this, anyone could POST a victim's
    // email plus their own password and receive a verified, attacker-controlled
    // account for that address (pre-registration takeover).
    if (!token || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const attempts = await base44.asServiceRole.entities.RegistrationAttempt.filter({ token });
    const attempt = attempts?.[0];
    if (!attempt) {
      console.log("createUserFromVerification refused: unknown token");
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired verification link. Please register again.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Single use — a redeemed token can never mint a second account.
    if (attempt.status === 'account_created' || attempt.status === 'expired') {
      console.log("createUserFromVerification refused: token already redeemed/expired");
      return new Response(JSON.stringify({
        success: false,
        error: 'This verification link has already been used. Please sign in instead.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Time-limited — 24h from the registration request.
    const issuedAt = new Date(attempt.created_date).getTime();
    if (!issuedAt || Date.now() - issuedAt > 24 * 60 * 60 * 1000) {
      await base44.asServiceRole.entities.RegistrationAttempt.update(attempt.id, { status: 'expired' });
      console.log("createUserFromVerification refused: token expired");
      return new Response(JSON.stringify({
        success: false,
        error: 'This verification link has expired. Please register again.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const lowerCaseEmail = String(attempt.email || '').toLowerCase();
    const full_name = attempt.full_name;
    if (!lowerCaseEmail || !full_name) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid or expired verification link. Please register again.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log("Creating user from verification for:", lowerCaseEmail);

    // The redeemer must also know the password chosen at registration — so a
    // leaked or forwarded verification link alone can never mint credentials.
    // The RegistrationAttempt stores the bcrypt hash created by registerUser.
    const storedHash = attempt.password_hash || '';
    const passwordMatches = storedHash ? await bcrypt.compare(password, storedHash) : false;
    if (!passwordMatches) {
      console.log("createUserFromVerification refused: password does not match registration");
      return new Response(JSON.stringify({
        success: false,
        error: 'Verification failed. Please register again.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Never mint credentials for an account that already exists — that path is
    // an unauthenticated takeover vector (any email → fresh session token). A
    // verified-email flow may only create a brand-new account; existing users
    // must authenticate through the normal login flow.
    try {
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email: lowerCaseEmail });
      if (existingUsers && existingUsers.length > 0) {
        console.log("createUserFromVerification refused: account already exists for", lowerCaseEmail);
        return new Response(JSON.stringify({
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
          already_exists: true,
        }), {
          status: 409,
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

    // Burn the token immediately — it is now spent for this account.
    try {
      await base44.asServiceRole.entities.RegistrationAttempt.update(attempt.id, { status: 'account_created' });
    } catch (burnErr) {
      console.error('[createUserFromVerification] Failed to mark token redeemed:', burnErr.message);
    }

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