import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.persona !== 'parent') {
      return Response.json({ error: 'Only parents can add students' }, { status: 403 });
    }

    const { student_email, action } = await req.json();

    console.log('👨‍👩‍👧‍👦 Parent adding student:', student_email, 'action:', action);

    // CRITICAL: Validate parent has a family_group_id (cannot be changed once set)
    if (!user.family_group_id) {
      return Response.json({ error: 'Parent must have a family group first' }, { status: 400 });
    }

    // CRITICAL: Parents are locked to ONE family forever - verify this is their original family
    // This prevents parents from abandoning one family and joining another
    const parentCreationData = await base44.asServiceRole.entities.User.filter({ id: user.id });
    if (parentCreationData[0]?.family_group_id && parentCreationData[0].family_group_id !== user.family_group_id) {
      return Response.json({ 
        error: 'Security violation: Parent cannot switch families. You are permanently assigned to your original family.' 
      }, { status: 403 });
    }

    // Find student
    const students = await base44.asServiceRole.entities.User.filter({
      email: student_email.toLowerCase()
    });

    if (students.length === 0) {
      return Response.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = students[0];

    // Check if student already has 2 parents
    const familyMembers = await base44.asServiceRole.entities.User.filter({
      family_group_id: student.family_group_id || 'none'
    });

    const parentCount = familyMembers.filter(m => m.persona === 'parent').length;

    if (action === 'send_code') {
      // Generate verification code
      const verificationCode = generateVerificationCode();
      
      // Store code in student's user record (temporary)
      await base44.asServiceRole.entities.User.update(student.id, {
        pending_parent_verification_code: verificationCode,
        pending_parent_email: user.email,
        verification_code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
      });

      // Send email to student
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: student.email,
        subject: `${user.full_name || 'A Parent'} wants to connect as your parent on College Fast Forward`,
        body: `Hi ${student.first_name || 'there'},

${user.full_name || user.email} would like to connect with you as your parent on College Fast Forward.

Your verification code: ${verificationCode}

This code expires in 15 minutes.

If you didn't expect this, you can safely ignore this email.

Go Gators! 🐊

College Fast Forward Team`
      });

      console.log('✅ Verification code sent to student');

      return Response.json({
        success: true,
        message: 'Verification code sent to student'
      });
    }

    if (action === 'verify') {
      const { code } = await req.json();

      // Check verification code
      if (student.pending_parent_verification_code !== code) {
        return Response.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      // Check expiration
      if (new Date(student.verification_code_expires_at) < new Date()) {
        return Response.json({ error: 'Verification code expired' }, { status: 400 });
      }

      // Check if parent email matches
      if (student.pending_parent_email !== user.email) {
        return Response.json({ error: 'Verification code not for this parent' }, { status: 400 });
      }

      // Check parent limit
      if (student.parent_1_email && student.parent_2_email) {
        return Response.json({ error: 'Student already has 2 parents' }, { status: 400 });
      }

      // Determine which slot to use
      const parentSlot = !student.parent_1_email ? 'parent_1' : 'parent_2';
      const slotField = parentSlot === 'parent_1' ? 'parent_1_email' : 'parent_2_email';
      const slotIdField = parentSlot === 'parent_1' ? 'parent_1_id' : 'parent_2_id';

      // Link student to parent's family
      await base44.asServiceRole.entities.User.update(student.id, {
        [slotField]: user.email,
        [slotIdField]: user.id,
        family_group_id: user.family_group_id,
        pending_parent_verification_code: null,
        pending_parent_email: null,
        verification_code_expires_at: null
      });

      // Add student to parent's student list
      const studentEmails = user.student_emails || [];
      if (!studentEmails.includes(student.email)) {
        studentEmails.push(student.email);
        await base44.asServiceRole.entities.User.update(user.id, {
          student_emails: studentEmails
        });
      }

      console.log('✅ Student successfully added to family');

      return Response.json({
        success: true,
        message: 'Student successfully linked'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Add student error:', error);
    return Response.json({ 
      error: error.message || 'Failed to add student' 
    }, { status: 500 });
  }
});