import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { studentId, studentEmail: rawEmail } = await req.json();
    const studentEmail = rawEmail?.trim().toLowerCase() || null;

    if (!studentId && !studentEmail) {
      return Response.json({
        error: 'Either studentId or studentEmail is required'
      }, { status: 400 });
    }

    const parentName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.full_name || 'Your parent';

    // Find student — by ID first, then by email
    let student = null;

    if (studentId) {
      try {
        student = await base44.asServiceRole.entities.User.get(studentId);
      } catch (e) {
        student = null;
      }

      // Security check — student must be at same school
      if (student && user.school_code && student.school_code !== user.school_code) {
        return Response.json({
          error: 'Student not found at your school'
        }, { status: 403 });
      }
    } else if (studentEmail) {
      const results = await base44.asServiceRole.entities.User.filter({
        email: studentEmail
      });
      student = results?.[0] || null;
    }

    // Update parent's student_emails array
    if (studentEmail) {
      const currentEmails = user.student_emails || [];
      if (!currentEmails.includes(studentEmail)) {
        await base44.asServiceRole.entities.User.update(user.id, {
          student_emails: [...currentEmails, studentEmail],
        });
      }
    }

    // Case 1 — Student already has FastIQ active
    const alreadyActive = student && !!(
      student.fastiq_setup_complete ||
      student.subscription_status === 'active' ||
      student.membership_tier === 'fastiq' ||
      student.trial_status === 'active' ||
      student.fastiq_trial_active === true
    );

    if (alreadyActive) {
      return Response.json({
        success: true,
        status: 'already_active',
        message: `${student.first_name || student.full_name?.split(' ')[0] || 'Your student'} already has FastIQ access!`
      });
    }

    // Case 2 — Student found, activate trial immediately (5 days)
    if (student) {
      const trialStart = new Date();
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 5);

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
        linked_parent_name: parentName,
      });

      // Send gift email to student
      base44.functions.invoke('sendParentGiftedFastIQEmail', {
        studentEmail: student.email,
        studentFirstName: student.first_name || student.full_name?.split(' ')[0] || 'there',
        parentFirstName: user.first_name || user.full_name?.split(' ')[0] || 'Your parent',
        trialDays: 5,
      }).catch(e => console.error('Gift email failed:', e.message));

      // Log analytics
      base44.functions.invoke('logAnalyticsEvent', {
        event_name: 'fastiq_gifted',
        properties: {
          gifted_by: user.id,
          gifted_to: student.id,
          school_code: user.school_code || '',
          method: studentId ? 'name_search' : 'email_lookup',
        }
      }).catch(() => {});

      return Response.json({
        success: true,
        status: 'activated',
        studentName: student.first_name || student.full_name?.split(' ')[0] || 'Your student',
      });
    }

    // Case 3 — Student not on CFF yet — store pending gift
    if (studentEmail) {
      const currentPending = user.pending_fastiq_gift_emails || [];
      if (!currentPending.includes(studentEmail)) {
        await base44.asServiceRole.entities.User.update(user.id, {
          pending_fastiq_gift_emails: [...currentPending, studentEmail],
        });
      }

      // Send invite/gift email to student
      base44.functions.invoke('sendParentGiftedFastIQEmail', {
        studentEmail,
        studentFirstName: 'there',
        parentFirstName: user.first_name || user.full_name?.split(' ')[0] || 'Your parent',
        trialDays: 5,
      }).catch(e => console.error('Pending gift email failed:', e.message));

      // Log analytics
      base44.functions.invoke('logAnalyticsEvent', {
        event_name: 'fastiq_gift_pending',
        properties: {
          gifted_by: user.id,
          student_email: studentEmail,
          school_code: user.school_code || '',
        }
      }).catch(() => {});

      return Response.json({
        success: true,
        status: 'pending',
        message: `We've sent an invite to ${studentEmail}. Their trial will activate when they sign up.`
      });
    }

    return Response.json({
      success: false,
      error: 'Student not found. Please try their email address instead.'
    }, { status: 404 });

  } catch (e) {
    console.error('giftFastIQToStudent error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});