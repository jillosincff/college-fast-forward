import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const callingUser = await base44.auth.me();
    
    if (callingUser?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, updates } = await req.json();
    
    if (!email || !updates) {
      return Response.json({ error: 'email and updates required' }, { status: 400 });
    }

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found with email: ' + email }, { status: 404 });
    }

    const targetUser = users[0];
    const previousData = { ...targetUser.data } || {};
    console.log('Found user:', targetUser.id, targetUser.email, 'current data:', JSON.stringify(previousData));
    
    // Build clean merged data - remove any nested 'data' key from previous bad updates
    const cleanPrev = { ...previousData };
    delete cleanPrev.data; // remove nested data key if exists
    const newData = { ...cleanPrev, ...updates };
    
    console.log('Updating user data to:', JSON.stringify(newData));
    
    // Update user with the data field
    const result = await base44.asServiceRole.entities.User.update(targetUser.id, { data: newData });
    console.log('Update result:', JSON.stringify(result));

    return Response.json({ 
      success: true, 
      userId: targetUser.id,
      email: targetUser.email,
      previousData: cleanPrev,
      newData,
      result
    });
  } catch (error) {
    console.error('Error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});