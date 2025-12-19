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

    console.log(`[Audit] Starting audit - dryRun: ${dryRun}`);

    // Get all users and invite codes
    const [allUsers, inviteCodes] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.InviteCode.list()
    ]);

    console.log(`[Audit] Found ${allUsers.length} users and ${inviteCodes.length} invite codes`);

    const issues = [];
    const fixes = [];
    
    // Get highest founding number to continue from
    const foundingUsers = allUsers.filter(u => u.founding_gator_number);
    const highestNumber = foundingUsers.length > 0 
      ? Math.max(...foundingUsers.map(u => u.founding_gator_number || 0))
      : 0;
    let nextFoundingNumber = highestNumber + 1;

    console.log(`[Audit] Highest founding number: ${highestNumber}, starting from: ${nextFoundingNumber}`);

    for (const u of allUsers) {
      const userIssues = [];
      const userFixes = {};
      
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
            userFixes.persona = assignedPersona;
            userFixes.roles = [assignedPersona];
            fixes.push({ email: u.email, fix: 'persona', value: assignedPersona });
          }
        }
      }
      
      // Check 2: Missing founding member status
      if (!u.is_founding_gator) {
        userIssues.push('not_founding_member');
        
        if (!dryRun) {
          userFixes.is_founding_gator = true;
          userFixes.founding_gator_number = nextFoundingNumber;
          userFixes.membership_tier = 'founding_gator';
          fixes.push({ email: u.email, fix: 'founding_member', number: nextFoundingNumber });
          nextFoundingNumber++;
        }
      }
      
      // Check 3: Onboarding not completed
      if (!u.onboarding_completed) {
        userIssues.push('onboarding_incomplete');
      }
      
      // Check 4: Missing roles array
      if (!u.roles || u.roles.length === 0) {
        userIssues.push('no_roles');
        
        if (!dryRun && (u.persona || userFixes.persona)) {
          const roleToAssign = userFixes.persona || u.persona;
          userFixes.roles = [roleToAssign];
          if (!fixes.some(f => f.email === u.email && f.fix === 'roles')) {
            fixes.push({ email: u.email, fix: 'roles', value: [roleToAssign] });
          }
        }
      }
      
      // Apply all fixes for this user in one update
      if (!dryRun && Object.keys(userFixes).length > 0) {
        try {
          await base44.asServiceRole.entities.User.update(u.id, userFixes);
          console.log(`[Audit] Fixed user ${u.email}:`, userFixes);
        } catch (err) {
          console.error(`[Audit] Failed to fix user ${u.email}:`, err);
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