import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const base44 = createClient({
  appId: Deno.env.get('BASE44_APP_ID'),
});

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  console.log("=== CREATE USER FROM VERIFICATION ===");
  
  try {
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
      const existingUsers = await base44.entities.User.filter({ email: lowerCaseEmail });
      if (existingUsers && existingUsers.length > 0) {
        console.log("User already exists, returning existing user");
        const existingUser = existingUsers[0];
        
        // Generate session token
        const sessionToken = crypto.randomUUID();
        const updatedUser = await base44.entities.User.update(existingUser.id, { 
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
    const newUser = await base44.entities.User.create({
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