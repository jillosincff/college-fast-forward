import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { studentEmail } = await req.json();
  if (!studentEmail) return Response.json({ error: 'Student email required' }, { status: 400 });

  // Add to parent's student_emails array if not already there
  const currentEmails = user.student_emails || [];
  if (!currentEmails.includes(studentEmail)) {
    await base44.entities.User.update(user.id, {
      student_emails: [...currentEmails, studentEmail],
    });
  }

  const parentName = user.full_name || 'Your parent';
  const parentFirstName = parentName.split(' ')[0];

  // Check if student already has an account
  const students = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
  const student = students?.[0];

  if (student) {
    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000);

    await base44.asServiceRole.entities.User.update(student.id, {
      fastiq_active: true,
      is_fastiq: true,
      fastiq_setup_complete: true,
      membership_tier: 'fastiq',
      subscription_status: 'active',
      trial_start_date: trialStart.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      trial_status: 'active',
      fastiq_trial_active: true,
      gifted_by_parent_email: user.email,
      linked_parent_name: parentFirstName,
    });

    await base44.asServiceRole.functions.invoke('sendParentGiftedFastIQEmail', {
      studentEmail,
      studentFirstName: student.full_name?.split(' ')[0] || 'there',
      parentFirstName,
      trialDays: 7,
    });

    return Response.json({ success: true, status: 'activated' });

  } else {
    // Student hasn't signed up yet — store pending gift on parent
    await base44.entities.User.update(user.id, {
      pending_fastiq_gift_email: studentEmail,
    });

    await base44.asServiceRole.functions.invoke('sendParentGiftedFastIQEmail', {
      studentEmail,
      studentFirstName: 'there',
      parentFirstName,
      trialDays: 7,
    });

    return Response.json({ success: true, status: 'pending' });
  }
});