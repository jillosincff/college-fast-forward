const ADMIN_SETUP_KEY = 'college-fast-forward-admin-2024';

Deno.serve(async (req) => {
  try {
    const { email, adminSetupKey } = await req.json();
    
    console.log('Received request for email:', email);
    
    if (!email || !adminSetupKey) {
      return Response.json(
        { error: 'Email and admin setup key are required' },
        { status: 400 }
      );
    }

    if (adminSetupKey !== ADMIN_SETUP_KEY) {
      console.log('Invalid admin key provided');
      return Response.json(
        { error: 'Invalid admin setup key' },
        { status: 403 }
      );
    }

    // Use Supabase admin client directly
    const supabaseUrl = `https://qtrypzzcjebvfcihiynt.supabase.co`;
    const serviceRoleKey = Deno.env.get('BASE44_SERVICE_ROLE_KEY');
    
    if (!serviceRoleKey) {
      console.error('Service role key not found');
      return Response.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Find user by email
    const getUserResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!getUserResponse.ok) {
      console.error('Failed to fetch user:', await getUserResponse.text());
      return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    const users = await getUserResponse.json();
    
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found with that email' }, { status: 404 });
    }

    const user = users[0];
    console.log('Found user:', user.id, user.email);

    // Update user roles
    const updatedRoles = Array.isArray(user.roles) ? [...user.roles] : [];
    if (!updatedRoles.includes('admin')) {
      updatedRoles.push('admin');
    }

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ roles: updatedRoles })
      }
    );

    if (!updateResponse.ok) {
      console.error('Failed to update user:', await updateResponse.text());
      return Response.json({ error: 'Failed to update user' }, { status: 500 });
    }

    console.log('Successfully promoted user to admin');

    return Response.json({
      success: true,
      message: 'User successfully promoted to admin! Please log out and log back in.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        roles: updatedRoles
      }
    });

  } catch (error) {
    console.error('Admin promotion error:', error);
    return Response.json(
      { 
        error: 'Failed to promote user',
        details: error.message 
      },
      { status: 500 }
    );
  }
});