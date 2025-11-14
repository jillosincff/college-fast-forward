import { createClient } from 'npm:@base44/sdk@0.1.0';
import bcrypt from 'npm:bcryptjs@2.4.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required.' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID'),
      apiKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY'), // Admin key needed to query the User table
    });

    const users = await base44.entities.User.filter({ email: email.toLowerCase() });
    const user = users && users.length > 0 ? users[0] : null;

    if (!user || !user.password_hash) {
      // User not found or has no password set (e.g., magic link user)
      return new Response(JSON.stringify({ error: 'Invalid credentials.' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Securely compare the provided password with the stored hash.
    // bcrypt.compare automatically extracts the salt from the hash and uses it for the comparison.
    // This is the correct and secure way to verify a password.
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return new Response(JSON.stringify({ error: 'Invalid credentials.' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Do not return sensitive data like password hash or salt
    const { password_hash, password_salt, ...safeUser } = user;
    
    // On successful authentication, you would typically generate and return a session token (e.g., JWT).
    // For now, we'll return a success message.
    return new Response(JSON.stringify({ success: true, user: safeUser }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Authentication Error:', error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});