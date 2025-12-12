import { Base44 } from 'npm:@base44/sdk@0.8.4';

const ADMIN_SETUP_KEY = 'college-fast-forward-admin-2024';

Deno.serve(async (req) => {
  try {
    const { email, adminSetupKey } = await req.json();
    
    console.log('=== Admin Promotion Request ===');
    console.log('Email:', email);
    
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

    const appId = Deno.env.get('BASE44_APP_ID');
    const serviceRoleKey = Deno.env.get('BASE44_SERVICE_ROLE_KEY');
    
    if (!appId || !serviceRoleKey) {
      console.error('Missing app ID or service role key');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const base44 = new Base44({ appId, serviceRoleKey });

    console.log('Searching for user with email:', email);
    
    // List all users and filter manually as a fallback
    const allUsers = await base44.entities.User.list();
    console.log('Total users in database:', allUsers.length);
    
    const user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.log('No user found with email:', email);
      return Response.json({ error: 'User not found with that email' }, { status: 404 });
    }

    console.log('Found user:', user.id, user.email);

    // Update user roles
    const currentRoles = Array.isArray(user.roles) ? user.roles : [];
    console.log('Current roles:', currentRoles);
    
    if (currentRoles.includes('admin')) {
      console.log('User is already an admin');
      return Response.json({
        success: true,
        message: 'User is already an admin',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          roles: currentRoles
        }
      });
    }

    const updatedRoles = [...currentRoles, 'admin'];
    console.log('Updating to roles:', updatedRoles);

    await base44.entities.User.update(user.id, {
      roles: updatedRoles
    });

    console.log('✅ Successfully promoted user to admin');

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
    console.error('❌ Admin promotion error:', error);
    console.error('Error stack:', error.stack);
    return Response.json(
      { 
        error: 'Failed to promote user',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
});