import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and parents can view community invites they created
    if (!user.roles?.includes('admin') && user.persona !== 'parent') {
      return Response.json({ 
        error: 'Only admins and parents can view community invites' 
      }, { status: 403 });
    }

    // Get community invites
    let invites;
    
    if (user.roles?.includes('admin')) {
      // Admins can see all community invites
      invites = await base44.asServiceRole.entities.InviteCode.filter(
        { is_community_invite: true },
        '-created_date',
        50
      );
    } else {
      // Parents can only see their own community invites
      invites = await base44.asServiceRole.entities.InviteCode.filter(
        { 
          is_community_invite: true,
          inviter_id: user.id
        },
        '-created_date',
        50
      );
    }

    return Response.json({
      success: true,
      invites: invites || []
    });

  } catch (error) {
    console.error('Get community invites error:', error);
    return Response.json({ 
      error: error.message || 'Failed to fetch community invites' 
    }, { status: 500 });
  }
});