import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, updates } = await req.json();
    
    if (!email || !updates) {
      return Response.json({ error: 'email and updates required' }, { status: 400 });
    }

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUser = users[0];
    
    // The SDK stores custom user fields inside the `data` object
    // But the updateMe API sets them at the top level
    // For service role, we need to set the data object directly with flattened fields
    const currentData = targetUser.data || {};
    // Remove any nested 'data' key from previous bad update
    const { data: _nestedData, ...cleanData } = currentData;
    const newData = { ...cleanData, ...updates };
    
    // Update user data
    await base44.asServiceRole.entities.User.update(targetUser.id, { data: newData });

    return Response.json({ 
      success: true, 
      userId: targetUser.id,
      email: targetUser.email,
      previousData: currentData,
      newData 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});