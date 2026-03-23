import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all action plans
    const plans = await base44.asServiceRole.entities.ActionPlan.filter({}, '-created_date', 500);
    if (!plans.length) return Response.json({ success: true, nudged: 0 });

    let nudgedCount = 0;
    const now = new Date();
    const isWednesday = now.getDay() === 3;

    for (const plan of plans) {
      const email = plan.student_email;
      if (!email) continue;

      // Get recent activity
      const activities = await base44.asServiceRole.entities.ActivityLog.filter(
        { student_email: email }, '-created_date', 50
      );

      // Check overdue follow-ups
      const overdueFollowUps = activities.filter(a =>
        a.follow_up_due_at && !a.follow_up_complete && new Date(a.follow_up_due_at) < now
      );

      // Nudge 1: Overdue follow-ups
      if (overdueFollowUps.length > 0) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: email,
          type: 'fastiq_nudge',
          title: 'Follow-ups overdue',
          message: `You have ${overdueFollowUps.length} overdue follow-up${overdueFollowUps.length > 1 ? 's' : ''}. Don't let these connections go cold.`,
          link: 'ActionPlanTracker',
          is_read: false,
        });
        nudgedCount++;
        continue; // One nudge per student per run
      }

      // Nudge 2: Behind on weekly goals (Wednesday)
      if (isWednesday) {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const weekActivities = activities.filter(a => new Date(a.created_date) >= startOfWeek);
        const outreachSent = weekActivities.filter(a => a.type === 'outreach_sent' || a.type === 'follow_up_sent').length;
        const goal = plan.weekly_goal_outreach || 3;

        if (outreachSent < goal / 2) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: email,
            type: 'fastiq_nudge',
            title: 'Weekly goal check-in',
            message: `Halfway through the week — you've sent ${outreachSent} of your ${goal} outreach messages. FASTIQ can draft them in minutes.`,
            link: 'FastIQ',
            is_read: false,
          });
          nudgedCount++;
          continue;
        }
      }

      // Nudge 3: No activity in 7 days
      const lastActivity = activities[0];
      const daysSinceLast = lastActivity
        ? Math.floor((now - new Date(lastActivity.created_date)) / (24 * 60 * 60 * 1000))
        : 999;

      if (daysSinceLast >= 7) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: email,
          type: 'fastiq_nudge',
          title: 'Time to get back on track',
          message: `It's been ${daysSinceLast} days since your last career activity. Your momentum matters — let's pick it back up.`,
          link: 'FastIQ',
          is_read: false,
        });
        nudgedCount++;
      }
    }

    return Response.json({ success: true, nudged: nudgedCount, total: plans.length });
  } catch (error) {
    console.error('sendActivityNudges error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});