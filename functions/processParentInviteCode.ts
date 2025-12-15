import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

    // Find the invite code
    const inviteCodes = await base44.asServiceRole.entities.InviteCode.filter({
      code: normalizedCode,
      invite_type: 'gator_to_parent',
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
      return Response.json({ 
        success: false, 
        error: 'This invite code has expired' 
      }, { status: 400 });
    }

    // Get the student who created the invite
    const students = await base44.asServiceRole.entities.User.filter({
      id: inviteRecord.inviter_id
    });

    if (students.length === 0) {
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
      student_emails: student.email,
      invite_code_used: invite_code.trim().toUpperCase()
    };

    await base44.asServiceRole.entities.User.update(user.id, parentUpdate);

    // Mark invite code as used
    await base44.asServiceRole.entities.InviteCode.update(inviteRecord.id, {
      status: 'used',
      used_by_email: user.email,
      used_at: new Date().toISOString()
    });

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