import { createClient } from 'npm:@base44/sdk@0.8.4';

const ADMIN_SETUP_KEY = 'college-fast-forward-admin-2024';

Deno.serve(async (req) => {
  try {
    const { email, adminSetupKey } = await req.json();
    
    if (!email || !adminSetupKey) {
      return Response.json(
        { error: 'Email and admin setup key are required' },
        { status: 400 }
      );
    }

    if (adminSetupKey !== ADMIN_SETUP_KEY) {
      return Response.json(
        { error: 'Invalid admin setup key' },
        { status: 403 }
      );
    }

    // Create service role client directly (no user auth needed)
    const base44 = createClient({
      appId: Deno.env.get('BASE44_APP_ID'),
      serviceRoleKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY')
    });

    // Find the user
    console.log('Searching for user with email:', email);
    const users = await base44.entities.User.filter({ email });
    console.log('Found users:', users);
    
    if (!users || users.length === 0) {
      return Response.json(
        { error: 'User not found with that email' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('User found:', { id: user.id, email: user.email, currentRoles: user.roles });

    // Update user to add admin role
    const updatedRoles = Array.isArray(user.roles) ? [...user.roles] : [];
    if (!updatedRoles.includes('admin')) {
      updatedRoles.push('admin');
    }
    console.log('Updated roles:', updatedRoles);

    // Update the user entity with the new roles
    await base44.entities.User.update(user.id, {
      roles: updatedRoles
    });
    console.log('User updated successfully');

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