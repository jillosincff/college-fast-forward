import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users without persona
    const allUsers = await base44.asServiceRole.entities.User.list();
    const usersWithoutPersona = allUsers.filter(u => !u.persona || u.persona === '');

    console.log(`Found ${usersWithoutPersona.length} users without persona`);

    const fixed = [];
    const skipped = [];

    for (const userToFix of usersWithoutPersona) {
      let newPersona = null;
      
      // Check email domain first - @ufl.edu = gator
      if (userToFix.email?.toLowerCase().endsWith('@ufl.edu')) {
        newPersona = 'gator';
      }
      // Check invite code used
      else if (userToFix.invite_code_used) {
        const inviteCode = await base44.asServiceRole.entities.InviteCode.filter(
          { code: userToFix.invite_code_used }
        );
        
        if (inviteCode.length > 0) {
          const invite = inviteCode[0];
          // Determine persona from invite type
          if (invite.invite_type?.includes('parent')) {
            newPersona = 'parent';
          } else if (invite.invite_type?.includes('gator') || invite.invite_type?.includes('student')) {
            newPersona = 'gator';
          }
        }
      }

      if (newPersona) {
        await base44.asServiceRole.entities.User.update(userToFix.id, {
          persona: newPersona,
          roles: [newPersona]
        });
        fixed.push({ email: userToFix.email, persona: newPersona });
        console.log(`✅ Fixed ${userToFix.email} -> ${newPersona}`);
      } else {
        skipped.push(userToFix.email);
        console.log(`⚠️ Skipped ${userToFix.email} (no clear persona)`);
      }
    }

    return Response.json({
      success: true,
      total: usersWithoutPersona.length,
      fixed: fixed.length,
      skipped: skipped.length,
      details: { fixed, skipped }
    });

  } catch (error) {
    console.error('Fix personas error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});