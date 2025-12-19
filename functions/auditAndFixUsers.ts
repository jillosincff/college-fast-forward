import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dryRun = true } = await req.json().catch(() => ({ dryRun: true }));

    // Get all users and invite codes
    const [allUsers, inviteCodes] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.InviteCode.list()
    ]);

    const issues = [];
    const fixes = [];

    for (const u of allUsers) {
      const userIssues = [];
      
      // Check 1: Missing persona
      if (!u.persona) {
        userIssues.push('no_persona');
        
        if (!dryRun) {
          let assignedPersona = null;
          
          // Check email domain
          if (u.email?.toLowerCase().endsWith('@ufl.edu')) {
            assignedPersona = 'gator';
          } else if (u.invite_code_used) {
            // Check invite code
            const inviteCode = inviteCodes.find(ic => ic.code === u.invite_code_used);
            if (inviteCode) {
              if (inviteCode.invite_type?.includes('parent')) {
                assignedPersona = 'parent';
              } else if (inviteCode.invite_type?.includes('gator')) {
                assignedPersona = 'gator';
              }
            }
          }
          
          if (assignedPersona) {
            await base44.asServiceRole.entities.User.update(u.id, {
              persona: assignedPersona,
              roles: [assignedPersona]
            });
            fixes.push({ email: u.email, fix: 'persona', value: assignedPersona });
          }
        }
      }
      
      // Check 2: Missing founding member status
      if (!u.is_founding_gator) {
        userIssues.push('not_founding_member');
        
        if (!dryRun) {
          const countResult = await base44.asServiceRole.functions.invoke('getUserCount', {});
          const nextNumber = (countResult.data?.count || 0) + 1;
          
          await base44.asServiceRole.entities.User.update(u.id, {
            is_founding_gator: true,
            founding_gator_number: nextNumber,
            membership_tier: 'founding_gator'
          });
          
          await base44.asServiceRole.functions.invoke('incrementUserCount', {});
          fixes.push({ email: u.email, fix: 'founding_member', number: nextNumber });
        }
      }
      
      // Check 3: Onboarding not completed
      if (!u.onboarding_completed) {
        userIssues.push('onboarding_incomplete');
      }
      
      // Check 4: Missing roles array
      if (!u.roles || u.roles.length === 0) {
        userIssues.push('no_roles');
        
        if (!dryRun && u.persona) {
          await base44.asServiceRole.entities.User.update(u.id, {
            roles: [u.persona]
          });
          fixes.push({ email: u.email, fix: 'roles', value: [u.persona] });
        }
      }
      
      if (userIssues.length > 0) {
        issues.push({
          id: u.id,
          email: u.email,
          name: u.full_name,
          persona: u.persona,
          is_founding: u.is_founding_gator,
          onboarding: u.onboarding_completed,
          issues: userIssues,
          created: u.created_date
        });
      }
    }

    return Response.json({
      success: true,
      mode: dryRun ? 'DRY RUN (no changes made)' : 'LIVE (changes applied)',
      total_users: allUsers.length,
      users_with_issues: issues.length,
      issues,
      fixes: dryRun ? [] : fixes,
      summary: {
        no_persona: issues.filter(i => i.issues.includes('no_persona')).length,
        not_founding: issues.filter(i => i.issues.includes('not_founding_member')).length,
        no_onboarding: issues.filter(i => i.issues.includes('onboarding_incomplete')).length,
        no_roles: issues.filter(i => i.issues.includes('no_roles')).length
      }
    });

  } catch (error) {
    console.error('Audit and fix users error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    }, { status: 500 });
  }
});