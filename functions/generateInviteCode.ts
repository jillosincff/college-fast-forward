import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

function generateRandomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  console.log('=== GENERATE INVITE CODE STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request URL:', req.url);
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    console.log('User authenticated:', user?.email);

    if (!user) {
      console.error('❌ No user authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invite_type } = await req.json();
    console.log('Invite type requested:', invite_type);

    // Simplified validation: gators and parents can invite anyone
    const validInviteTypes = [
      'gator_to_parent',
      'gator_to_gator', 
      'parent_to_parent',
      'parent_to_gator',
      'admin_to_parent',
      'admin_to_gator'
    ];

    if (!validInviteTypes.includes(invite_type)) {
      return Response.json({ 
        error: 'Invalid invite type' 
      }, { status: 400 });
    }

    // Validate user can generate this type (check admin first)
    if (user.roles?.includes('admin')) {
      // Admins can generate any type of invite
      console.log('Admin user generating invite');
    } else if (user.persona === 'gator') {
      if (!invite_type.startsWith('gator_to_')) {
        return Response.json({ 
          error: 'Invalid invite type for Gators' 
        }, { status: 400 });
      }
    } else if (user.persona === 'parent') {
      if (!invite_type.startsWith('parent_to_')) {
        return Response.json({ 
          error: 'Invalid invite type for Parents' 
        }, { status: 400 });
      }
    }

    // Generate unique code
    let code;
    let attempts = 0;
    let codeIsUnique = false;

    while (!codeIsUnique && attempts < 10) {
      code = generateRandomCode();
      
      // Check if code already exists
      const existingCodes = await base44.asServiceRole.entities.InviteCode.filter({ code });
      
      if (existingCodes.length === 0) {
        codeIsUnique = true;
      }
      attempts++;
    }

    if (!codeIsUnique) {
      return Response.json({ 
        error: 'Failed to generate unique code. Please try again.' 
      }, { status: 500 });
    }

    // Create invite code with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log('Creating invite code in database...');
    const inviteCode = await base44.asServiceRole.entities.InviteCode.create({
      code,
      inviter_id: user.id,
      inviter_email: user.email,
      inviter_name: user.full_name || user.email,
      invite_type,
      status: 'active',
      expires_at: expiresAt.toISOString()
    });

    console.log('=== INVITE CODE GENERATION SUCCESS ===');
    console.log('Code:', inviteCode.code);
    console.log('Expires:', inviteCode.expires_at);
    console.log('For user:', user.email);

    return Response.json({
      success: true,
      code: inviteCode.code,
      expires_at: inviteCode.expires_at,
      invite_type: inviteCode.invite_type
    });

  } catch (error) {
    console.error('=== INVITE CODE GENERATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to generate invite code' 
    }, { status: 500 });
  }
});