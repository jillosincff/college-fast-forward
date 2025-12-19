import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Find users who should be founding members but aren't marked
    const needsMarking = allUsers.filter(u => !u.is_founding_gator);
    
    const updated = [];
    const skipped = [];
    
    for (const userToFix of needsMarking) {
      try {
        // Get current count to assign next founding number
        const countResult = await base44.asServiceRole.functions.invoke('getUserCount', {});
        const nextNumber = (countResult.data?.count || 0) + 1;
        
        await base44.asServiceRole.entities.User.update(userToFix.id, {
          is_founding_gator: true,
          founding_gator_number: nextNumber,
          membership_tier: 'founding_gator'
        });
        
        // Increment counter
        await base44.asServiceRole.functions.invoke('incrementUserCount', {});
        
        updated.push({
          email: userToFix.email,
          name: userToFix.full_name,
          number: nextNumber
        });
      } catch (err) {
        skipped.push({
          email: userToFix.email,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      total_processed: needsMarking.length,
      updated: updated.length,
      skipped: skipped.length,
      updated_users: updated,
      skipped_users: skipped
    });

  } catch (error) {
    console.error('Mark as founding members error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});