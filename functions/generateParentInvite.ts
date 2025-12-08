import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { parent_slot } = await req.json();

    console.log('🎫 Generating parent invite for user:', user.email, 'slot:', parent_slot);

    // Validate parent slot
    if (!parent_slot || !['parent_1', 'parent_2'].includes(parent_slot)) {
      return Response.json({ error: 'Invalid parent slot' }, { status: 400 });
    }

    // Check if slot is already filled
    const slotField = parent_slot === 'parent_1' ? 'parent_1_email' : 'parent_2_email';
    if (user[slotField]) {
      return Response.json({ 
        error: `${parent_slot === 'parent_1' ? 'Parent 1' : 'Parent 2'} slot is already filled` 
      }, { status: 400 });
    }

    // Generate or get family_group_id
    let familyGroupId = user.family_group_id;
    if (!familyGroupId) {
      familyGroupId = crypto.randomUUID();
      await base44.asServiceRole.entities.User.update(user.id, {
        family_group_id: familyGroupId
      });
      console.log('✅ Created new family_group_id:', familyGroupId);
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await base44.asServiceRole.entities.InviteCode.filter({ code });
      if (existing.length === 0) break;
      code = generateCode();
      attempts++;
    }

    // Create invite code
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await base44.asServiceRole.entities.InviteCode.create({
      code,
      inviter_id: user.id,
      inviter_email: user.email,
      inviter_name: user.full_name || user.email,
      invite_type: 'gator_to_parent',
      family_group_id: familyGroupId,
      parent_slot,
      status: 'active',
      expires_at: expiresAt.toISOString()
    });

    console.log('✅ Created parent invite:', code, 'for slot:', parent_slot);

    return Response.json({
      success: true,
      code: invite.code,
      parent_slot,
      expires_at: invite.expires_at
    });

  } catch (error) {
    console.error('❌ Generate parent invite error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate invite' 
    }, { status: 500 });
  }
});