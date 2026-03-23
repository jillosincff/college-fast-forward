import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is admin
    const user = await base44.auth.me();
    const isAdmin = user?.roles?.includes('admin') || user?.role === 'admin';
    
    if (!user || !isAdmin) {
      return Response.json({ 
        error: 'Unauthorized',
        details: 'Admin access required'
      }, { status: 403 });
    }

    const { email } = await req.json();
    
    if (!email) {
      return Response.json({
        error: 'Email required'
      }, { status: 400 });
    }

    // Search for user
    const users = await base44.asServiceRole.entities.User.filter({
      email: email.trim().toLowerCase()
    });

    if (users.length === 0) {
      return Response.json({
        found: false,
        message: `No user found with email: ${email}`
      });
    }

    const foundUser = users[0];

    // Check directory eligibility
    const hasValidName = (foundUser.first_name && foundUser.last_name) || 
                        (foundUser.full_name && !foundUser.full_name.includes('@'));
    
    const hasPersonaOrRole = (foundUser.persona && ['student', 'alumni', 'parent'].includes(foundUser.persona)) ||
                             (foundUser.roles && Array.isArray(foundUser.roles) && 
                              foundUser.roles.some(role => ['student', 'alumni', 'parent'].includes(role)));
    
    const hasProfileContent = (foundUser.major || foundUser.current_company || 
                              foundUser.current_position || foundUser.industry || 
                              foundUser.bio || (foundUser.graduation_year && foundUser.graduation_year > 1900));

    const reasons = [];
    if (!foundUser.includeInDirectory) reasons.push("❌ includeInDirectory is false");
    if (!hasValidName) reasons.push("❌ No valid name (needs first_name + last_name OR full_name)");
    if (!hasPersonaOrRole && !hasProfileContent) {
      reasons.push("❌ No persona/role AND no profile content");
    }

    return Response.json({
      found: true,
      user: {
        email: foundUser.email,
        full_name: foundUser.full_name,
        first_name: foundUser.first_name,
        last_name: foundUser.last_name,
        persona: foundUser.persona,
        roles: foundUser.roles,
        includeInDirectory: foundUser.includeInDirectory,
        major: foundUser.major,
        current_company: foundUser.current_company,
        current_position: foundUser.current_position,
        industry: foundUser.industry,
        bio: foundUser.bio,
        graduation_year: foundUser.graduation_year
      },
      eligible: foundUser.includeInDirectory && hasValidName && (hasPersonaOrRole || hasProfileContent),
      checks: {
        includeInDirectory: foundUser.includeInDirectory,
        hasValidName,
        hasPersonaOrRole,
        hasProfileContent
      },
      reasons: reasons.length > 0 ? reasons : ["✅ Eligible for directory"]
    });

  } catch (error) {
    console.error('Search user error:', error);
    return Response.json({
      error: 'Failed to search user',
      details: error.message
    }, { status: 500 });
  }
});