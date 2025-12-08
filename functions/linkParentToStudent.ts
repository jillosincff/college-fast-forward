import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { code, parentEmail } = await req.json();

    console.log('🔗 Linking parent to student with code:', code);

    // Find the invite code
    const invites = await base44.asServiceRole.entities.InviteCode.filter({
      code: code.toUpperCase()
    });

    if (invites.length === 0) {
      return Response.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    const invite = invites[0];

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return Response.json({ error: 'Invite code has expired' }, { status: 400 });
    }

    // Check if already used
    if (invite.status === 'used') {
      return Response.json({ error: 'Invite code has already been used' }, { status: 400 });
    }

    // Check if parent email already exists
    const existingParents = await base44.asServiceRole.entities.User.filter({
      email: parentEmail.toLowerCase()
    });

    let parentUser = existingParents.length > 0 ? existingParents[0] : null;
    let parentFamilyGroupId = invite.family_group_id;

    if (parentUser) {
      // Parent already exists - check if they have a family_group_id
      if (parentUser.family_group_id) {
        // Use existing family group (sibling case)
        parentFamilyGroupId = parentUser.family_group_id;
        console.log('✅ Using existing parent family_group_id:', parentFamilyGroupId);
      } else {
        // Assign them to this family
        await base44.asServiceRole.entities.User.update(parentUser.id, {
          family_group_id: parentFamilyGroupId
        });
        console.log('✅ Assigned parent to family_group_id:', parentFamilyGroupId);
      }
    }

    // Get student
    const student = await base44.asServiceRole.entities.User.get(invite.inviter_id);

    // Update student with parent email and family_group_id
    const slotField = invite.parent_slot === 'parent_1' ? 'parent_1_email' : 'parent_2_email';
    const slotIdField = invite.parent_slot === 'parent_1' ? 'parent_1_id' : 'parent_2_id';
    
    const updateData = {
      [slotField]: parentEmail.toLowerCase(),
      family_group_id: parentFamilyGroupId
    };

    if (parentUser) {
      updateData[slotIdField] = parentUser.id;
    }

    await base44.asServiceRole.entities.User.update(student.id, updateData);

    // If parent exists, add student email to their student_emails array
    if (parentUser) {
      const studentEmails = parentUser.student_emails || [];
      if (!studentEmails.includes(student.email)) {
        studentEmails.push(student.email);
        await base44.asServiceRole.entities.User.update(parentUser.id, {
          student_emails: studentEmails,
          family_group_id: parentFamilyGroupId
        });
      }
    }

    // Mark invite as used
    await base44.asServiceRole.entities.InviteCode.update(invite.id, {
      status: 'used',
      used_by_email: parentEmail,
      used_at: new Date().toISOString()
    });

    console.log('✅ Successfully linked parent to student');

    return Response.json({
      success: true,
      family_group_id: parentFamilyGroupId,
      parent_slot: invite.parent_slot
    });

  } catch (error) {
    console.error('❌ Link parent error:', error);
    return Response.json({ 
      error: error.message || 'Failed to link parent' 
    }, { status: 500 });
  }
});