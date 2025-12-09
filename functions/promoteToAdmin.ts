import { createClient } from 'npm:@base44/sdk@0.8.4';

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

    // Create Base44 client with service role
    const base44 = createClient({
      serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY')
    });

    console.log('Searching for user...');
    const users = await base44.entities.User.filter({ email });
    console.log('Search result:', users?.length || 0, 'users found');
    
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found with that email' }, { status: 404 });
    }

    const user = users[0];
    console.log('Found user:', user.id);

    // Update user roles
    const updatedRoles = Array.isArray(user.roles) ? [...user.roles] : [];
    if (!updatedRoles.includes('admin')) {
      updatedRoles.push('admin');
    }
    console.log('Updating roles to:', updatedRoles);

    await base44.entities.User.update(user.id, {
      roles: updatedRoles
    });

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