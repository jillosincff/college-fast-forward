import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Admin promotion request received');
    
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { email, adminSetupKey } = requestBody;
    
    // Check for the admin setup key
    const ADMIN_SETUP_KEY = Deno.env.get('ADMIN_SETUP_KEY') || 'college-fast-forward-admin-2024';
    console.log('Checking admin key...');
    
    if (adminSetupKey !== ADMIN_SETUP_KEY) {
      console.log('Invalid admin setup key provided');
      return new Response(JSON.stringify({ 
        error: 'Invalid admin setup key' 
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!email) {
      console.log('No email provided');
      return new Response(JSON.stringify({ 
        error: 'Email is required' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Creating base44 client...');
    const base44 = createClientFromRequest(req);
    
    console.log('Using service role to find user:', email);
    
    // Find the user by email using service role
    const users = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
    console.log('Found users:', users.length);
    
    if (!users || users.length === 0) {
      console.log('User not found');
      return new Response(JSON.stringify({ 
        error: 'User not found with that email address' 
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const user = users[0];
    console.log('Updating user:', user.id);

    // Update user to have admin role
    const currentRoles = user.roles || [];
    const updatedRoles = currentRoles.includes('admin') 
      ? currentRoles 
      : [...currentRoles, 'admin'];

    console.log('Current roles:', currentRoles);
    console.log('Updated roles:', updatedRoles);

    await base44.asServiceRole.entities.User.update(user.id, {
      roles: updatedRoles,
      role: 'admin' // Also set the legacy role field for compatibility
    });

    console.log(`✅ Admin access granted to: ${email}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully promoted ${email} to administrator`,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        roles: updatedRoles
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Admin promotion error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to promote user to admin',
      details: error.message,
      stack: error.stack
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});