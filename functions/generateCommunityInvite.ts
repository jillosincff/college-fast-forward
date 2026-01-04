import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

function generateReadableCode() {
  // Generate a more memorable code for community sharing
  const words = ['GATOR', 'CHOMP', 'SWAMP', 'GAINESVILLE', 'FLORIDA', 'ALUMNI', 'PARENT'];
  const numbers = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}${numbers}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins and parents can create community invites
    if (!user.roles?.includes('admin') && user.persona !== 'parent') {
      return Response.json({ 
        error: 'Only admins and parents can create community invite codes' 
      }, { status: 403 });
    }

    const { 
      group_name, 
      target_role = 'parent',
      max_uses = 5000,
      expiration_days = 30,
      custom_code = null
    } = await req.json();

    // Generate unique code
    let code;
    let attempts = 0;
    let codeIsUnique = false;

    if (custom_code) {
      // Check if custom code is available
      const existingCodes = await base44.asServiceRole.entities.InviteCode.filter({ 
        code: custom_code.toUpperCase() 
      });
      
      if (existingCodes.length > 0) {
        return Response.json({ 
          error: 'This custom code is already taken. Please choose another.' 
        }, { status: 400 });
      }
      
      code = custom_code.toUpperCase();
      codeIsUnique = true;
    } else {
      // Generate random code
      while (!codeIsUnique && attempts < 10) {
        code = generateReadableCode();
        
        const existingCodes = await base44.asServiceRole.entities.InviteCode.filter({ code });
        
        if (existingCodes.length === 0) {
          codeIsUnique = true;
        }
        attempts++;
      }
    }

    if (!codeIsUnique) {
      return Response.json({ 
        error: 'Failed to generate unique code. Please try again.' 
      }, { status: 500 });
    }

    // Create community invite with custom expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiration_days);

    // Determine invite type based on target role
    let invite_type;
    if (user.persona === 'parent') {
      invite_type = 'parent_to_parent';
    } else if (user.roles?.includes('admin')) {
      // Admins can create any type
      if (target_role === 'gator') {
        invite_type = 'admin_to_gator';
      } else if (target_role === 'alumni') {
        invite_type = 'admin_to_alumni';
      } else {
        invite_type = 'admin_to_parent';
      }
    }

    const inviteCode = await base44.asServiceRole.entities.InviteCode.create({
      code,
      inviter_id: user.id,
      inviter_email: user.email,
      inviter_name: user.full_name || user.email,
      invite_type,
      role: target_role,
      status: 'active',
      expires_at: expiresAt.toISOString(),
      // Store metadata about community invite
      group_name,
      max_uses,
      current_uses: 0,
      is_community_invite: true
    });

    return Response.json({
      success: true,
      code: inviteCode.code,
      expires_at: inviteCode.expires_at,
      invite_type: inviteCode.invite_type,
      max_uses,
      group_name,
      share_url: `${req.headers.get('origin')}?invite=${inviteCode.code}`,
      message: `Community invite code created successfully! Valid for ${expiration_days} days or ${max_uses} uses.`
    });

  } catch (error) {
    console.error('Generate community invite error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate community invite' 
    }, { status: 500 });
  }
});