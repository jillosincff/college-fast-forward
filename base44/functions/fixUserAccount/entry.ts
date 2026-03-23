import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const callingUser = await base44.auth.me();
    
    if (!callingUser?.roles?.includes('admin') && callingUser?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, updates } = await req.json();
    
    if (!email || !updates) {
      return Response.json({ error: 'email and updates required' }, { status: 400 });
    }

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found: ' + email }, { status: 404 });
    }

    const targetUser = users[0];
    console.log('Found user:', targetUser.id, targetUser.email);
    
    // Update user directly with the updates object
    await base44.asServiceRole.entities.User.update(targetUser.id, updates);

    // Re-read to confirm
    const updated = await base44.asServiceRole.entities.User.filter({ email });

    return Response.json({ 
      success: true, 
      userId: targetUser.id,
      email: targetUser.email,
      updatedUser: updated?.[0] || null
    });
  } catch (error) {
    console.error('fixUserAccount error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});