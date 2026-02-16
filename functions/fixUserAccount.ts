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
    
    // Clean up any nested 'data' key from previous bad updates, then merge
    const currentData = targetUser.data || {};
    const { data: _nestedData, ...cleanData } = currentData;
    const newData = { ...cleanData, ...updates };
    
    // Use raw fetch to set data cleanly without SDK merge behavior
    const APP_ID = Deno.env.get('BASE44_APP_ID');
    const SERVICE_KEY = Deno.env.get('BASE44_SERVICE_ROLE_KEY');
    
    const apiUrl = `https://app.base44.com/api/v1/apps/${APP_ID}/entities/User/${targetUser.id}`;
    const resp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({ data: newData })
    });
    
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Failed to update user: ${resp.status} ${errText}`);
    }

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