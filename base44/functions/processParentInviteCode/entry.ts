import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  console.log('=== PROCESS PARENT INVITE CODE ===');
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      console.error('❌ No user authenticated');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User:', user.email);

    const { invite_code } = await req.json();
    console.log('📝 Received invite code:', invite_code);
    
    if (!invite_code) {
      console.error('❌ No invite code provided');
      return Response.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const normalizedCode = invite_code.trim().toUpperCase();
    console.log('🔍 Looking for code:', normalizedCode);

    // Find the invite code - support both gator_to_parent and admin_to_parent types
    const inviteCodes = await base44.asServiceRole.entities.InviteCode.filter({
      code: normalizedCode,
      status: 'active'
    });

    console.log('📊 Found codes:', inviteCodes.length);
    if (inviteCodes.length > 0) {
      console.log('📋 First code:', JSON.stringify(inviteCodes[0], null, 2));
    }

    if (inviteCodes.length === 0) {
      console.error('❌ No matching invite code found');
      return Response.json({ 
        success: false, 
        error: 'Invalid or expired invite code' 
      }, { status: 400 });
    }

    const inviteRecord = inviteCodes[0];

    // Check if code is expired
    if (inviteRecord.expires_at && new Date(inviteRecord.expires_at) < new Date()) {
      console.error('❌ Invite code expired');
      return Response.json({ 
        success: false, 
        error: 'This invite code has expired' 
      }, { status: 400 });
    }

    // Handle community/admin invites (admin_to_parent) differently
    if (inviteRecord.invite_type === 'admin_to_parent') {
      console.log('✅ Processing admin/community invite for parent');
      
      // Update parent user with role and mark code as used
      const parentUpdate = {
        persona: 'parent',
        roles: ['parent'],
        invite_code_used: normalizedCode,
        onboarding_completed: false
      };

      await base44.asServiceRole.entities.User.update(user.id, parentUpdate);

      // Increment current_uses for community invites
      if (inviteRecord.is_community_invite) {
        const currentUses = inviteRecord.current_uses || 0;
        await base44.asServiceRole.entities.InviteCode.update(inviteRecord.id, {
          current_uses: currentUses + 1
        });
        console.log(`✅ Community invite usage: ${currentUses + 1}`);
      } else {
        // For single-use admin codes, mark as used
        await base44.asServiceRole.entities.InviteCode.update(inviteRecord.id, {
          status: 'used',
          used_by_email: user.email,
          used_at: new Date().toISOString()
        });
      }

      console.log('✅ Parent setup complete via admin invite');
      return Response.json({
        success: true,
        message: 'Parent account created successfully'
      });
    }

    // Handle gator_to_parent invites (student inviting their parent)
    console.log('✅ Processing student-to-parent invite');

    // Get the student who created the invite
    const students = await base44.asServiceRole.entities.User.filter({
      id: inviteRecord.inviter_id
    });

    if (students.length === 0) {
      console.error('❌ Student not found');
      return Response.json({ 
        success: false, 
        error: 'Student not found' 
      }, { status: 404 });
    }

    const student = students[0];
    const targetSlot = inviteRecord.parent_slot; // 'parent_1' or 'parent_2'

    // Check if slot is already filled
    const slotEmail = targetSlot === 'parent_1' ? student.parent_1_email : student.parent_2_email;
    if (slotEmail) {
      console.error('❌ Parent slot already filled');
      return Response.json({ 
        success: false, 
        error: 'This parent slot is already filled' 
      }, { status: 400 });
    }

    // Create or get family_group_id
    let familyGroupId = student.family_group_id;
    if (!familyGroupId) {
      familyGroupId = `family_${student.id}_${Date.now()}`;
    }

    // Update student with parent email and family_group_id
    const studentUpdate = {
      family_group_id: familyGroupId
    };
    studentUpdate[`${targetSlot}_email`] = user.email;
    
    await base44.asServiceRole.entities.User.update(student.id, studentUpdate);

    // Update parent user with family info and ensure parent role
    const parentUpdate = {
      persona: 'parent',
      roles: ['parent'],
      family_group_id: familyGroupId,
      student_emails: [student.email],
      invite_code_used: normalizedCode
    };

    await base44.asServiceRole.entities.User.update(user.id, parentUpdate);

    // Mark invite code as used
    await base44.asServiceRole.entities.InviteCode.update(inviteRecord.id, {
      status: 'used',
      used_by_email: user.email,
      used_at: new Date().toISOString()
    });

    console.log('✅ Student-parent link complete');
    return Response.json({
      success: true,
      family_group_id: familyGroupId,
      student_email: student.email,
      student_name: student.full_name,
      parent_slot: targetSlot
    });

  } catch (error) {
    console.error('Process parent invite error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to process invite code' 
    }, { status: 500 });
  }
});