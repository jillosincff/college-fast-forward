import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Find all USC users with wrong school name
    const uscUsers = await base44.asServiceRole.entities.User.filter({ school_code: 'usc' });
    
    let fixed = 0;
    for (const u of uscUsers) {
      if (u.school_name !== 'University of South Carolina') {
        await base44.asServiceRole.entities.User.update(u.id, {
          school_name: 'University of South Carolina',
          school: 'University of South Carolina'
        });
        fixed++;
        console.log(`Fixed: ${u.email}`);
      }
    }

    return Response.json({ success: true, fixed, total: uscUsers.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});