import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Called when a parent completes onboarding after arriving via a student's
 * text-referral link. Links parent ↔ student and grants the student
 * 3 days of premium trial (once).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const parent = await base44.auth.me();
    if (!parent) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await req.json().catch(() => ({}));
    if (!code) return Response.json({ error: 'Missing code' }, { status: 400 });

    const codes = await base44.asServiceRole.entities.InviteCode.filter({
      code: String(code).toUpperCase(),
      invite_type: 'gator_to_parent',
      description: 'text_referral_3day',
    });
    const invite = codes?.[0];
    if (!invite) return Response.json({ success: false, reason: 'invalid_code' });
    if (invite.status !== 'active') return Response.json({ success: false, reason: 'code_inactive' });
    if (invite.inviter_email?.toLowerCase() === parent.email?.toLowerCase()) {
      return Response.json({ success: false, reason: 'self_referral' });
    }

    const students = await base44.asServiceRole.entities.User.filter({ id: invite.inviter_id });
    const student = students?.[0];
    if (!student) return Response.json({ success: false, reason: 'student_not_found' });

    // ── Link parent ↔ student ──────────────────────────────────────────
    const parentEmails = student.parent_emails || [];
    const studentUpdate = {};
    if (!parentEmails.includes(parent.email)) {
      studentUpdate.parent_emails = [...parentEmails, parent.email];
    }

    const studentEmails = parent.student_emails || [];
    if (!studentEmails.includes(student.email)) {
      await base44.auth.updateMe({ student_emails: [...studentEmails, student.email] });
    }

    // ── Grant 3-day premium reward (once per student) ──────────────────
    let rewardGranted = false;
    const isPaying = student.subscription_status === 'active';
    if (!student.parent_referral_reward_granted && !isPaying) {
      const now = new Date();
      const currentEnd = student.trial_end_date ? new Date(student.trial_end_date) : null;
      const base = currentEnd && currentEnd > now ? currentEnd : now;
      const newEnd = new Date(base);
      newEnd.setDate(newEnd.getDate() + 3);

      Object.assign(studentUpdate, {
        trial_start_date: student.trial_start_date || now.toISOString(),
        trial_end_date: newEnd.toISOString(),
        trial_status: 'active',
        fastiq_trial_active: true,
        membership_tier: 'fastiq_trial',
        subscription_status: 'trial',
        parent_referral_reward_granted: true,
      });
      rewardGranted = true;
    }

    if (Object.keys(studentUpdate).length > 0) {
      await base44.asServiceRole.entities.User.update(student.id, studentUpdate);
    }

    // ── Mark code usage ────────────────────────────────────────────────
    const uses = (invite.current_uses || 0) + 1;
    await base44.asServiceRole.entities.InviteCode.update(invite.id, {
      current_uses: uses,
      used_by_email: parent.email,
      used_at: new Date().toISOString(),
      ...(uses >= (invite.max_uses || 1) ? { status: 'used' } : {}),
    });

    // ── Notify the student ─────────────────────────────────────────────
    const parentFirstName = (parent.full_name || 'Your parent').split(' ')[0];
    base44.asServiceRole.entities.Notification.create({
      recipient_email: student.email,
      type: 'application_received',
      title: rewardGranted ? '🎉 Your parent joined — 3 days of Premium unlocked!' : '🎉 Your parent joined the network!',
      message: rewardGranted
        ? `${parentFirstName} just signed up from your invite. We added 3 free days of Premium to your account.`
        : `${parentFirstName} just signed up from your invite and is now part of your network.`,
      action_url: 'FreeTierDashboard',
      action_label: 'View Dashboard',
      priority: 'high',
    }).catch(() => {});

    base44.asServiceRole.integrations.Core.SendEmail({
      to: student.email,
      subject: rewardGranted ? '🎉 Your parent joined — 3 days of Premium unlocked' : '🎉 Your parent joined CliFF',
      body: rewardGranted
        ? `Great news — ${parentFirstName} just joined College Fast Forward from your invite!\n\nAs a thank-you, we've added 3 free days of Premium to your account. All features are unlocked right now.\n\nMake them count: ${Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com'}/#/FreeTierDashboard\n\n— The CliFF Team`
        : `Great news — ${parentFirstName} just joined College Fast Forward from your invite and is now part of your network.\n\n— The CliFF Team`,
    }).catch(() => {});

    return Response.json({ success: true, reward_granted: rewardGranted, student_name: student.full_name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});