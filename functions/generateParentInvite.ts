import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function generateRandomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  console.log('=== GENERATE PARENT INVITE STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    console.log('User authenticated:', user?.email);

    if (!user) {
      console.error('❌ No user authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parent_slot } = await req.json();
    console.log('Parent slot requested:', parent_slot);

    // Validate parent_slot
    if (!parent_slot || !['parent_1', 'parent_2'].includes(parent_slot)) {
      return Response.json({ 
        error: 'Invalid parent_slot. Must be parent_1 or parent_2' 
      }, { status: 400 });
    }

    // Check if student already has a parent in this slot
    const slotField = `${parent_slot}_email`;
    if (user[slotField]) {
      return Response.json({
        error: `You already have a parent assigned to ${parent_slot}. This slot is filled.`
      }, { status: 400 });
    }

    // Check for existing active invite for this slot
    const existingInvites = await base44.entities.InviteCode.filter({
      inviter_id: user.id,
      invite_type: 'gator_to_parent',
      parent_slot: parent_slot,
      status: 'active'
    });

    if (existingInvites && existingInvites.length > 0) {
      console.log('Existing active invite found for this slot');
      return Response.json({
        success: true,
        code: existingInvites[0].code,
        expires_at: existingInvites[0].expires_at,
        invite_type: 'gator_to_parent',
        parent_slot: parent_slot
      });
    }

    // Generate unique code
    let code;
    let attempts = 0;
    let codeIsUnique = false;

    while (!codeIsUnique && attempts < 10) {
      code = generateRandomCode();
      
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

    // Create family_group_id if student doesn't have one
    let familyGroupId = user.family_group_id;
    if (!familyGroupId) {
      familyGroupId = `family_${user.id}_${Date.now()}`;
      await base44.asServiceRole.entities.User.update(user.id, {
        family_group_id: familyGroupId
      });
      console.log('Created family_group_id for student:', familyGroupId);
    }

    // Create invite code with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log('Creating parent invite code in database...');
    const inviteCode = await base44.asServiceRole.entities.InviteCode.create({
      code,
      inviter_id: user.id,
      inviter_email: user.email,
      inviter_name: user.full_name || user.email,
      invite_type: 'gator_to_parent',
      parent_slot: parent_slot,
      family_group_id: familyGroupId,
      status: 'active',
      expires_at: expiresAt.toISOString()
    });

    console.log('=== PARENT INVITE CODE GENERATION SUCCESS ===');
    console.log('Code:', inviteCode.code);
    console.log('Parent slot:', parent_slot);
    console.log('Family group:', familyGroupId);
    console.log('Expires:', inviteCode.expires_at);

    return Response.json({
      success: true,
      code: inviteCode.code,
      expires_at: inviteCode.expires_at,
      invite_type: inviteCode.invite_type,
      parent_slot: inviteCode.parent_slot,
      family_group_id: familyGroupId
    });

  } catch (error) {
    console.error('=== PARENT INVITE CODE GENERATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to generate parent invite code' 
    }, { status: 500 });
  }
});