import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Called by trusted scheduled automation — no user auth required

    const allUsers = await base44.asServiceRole.entities.User.list();
    const parents = (allUsers || []).filter(u =>
      u.persona === 'parent' || (u.roles && u.roles.includes('parent'))
    );

    if (parents.length === 0) {
      return Response.json({ message: 'No parent users found', sent: 0 });
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    // Load all karma data for ranking
    const allKarma = await base44.asServiceRole.entities.FamilyKarma.list();

    let sentCount = 0;
    const errors = [];

    for (const parent of parents) {
      try {
        if (!parent.email) continue;

        // Fetch all feedback by this parent
        const allFeedback = await base44.asServiceRole.entities.InteractionFeedback.filter({
          reviewer_email: parent.email
        });

        if (!allFeedback || allFeedback.length === 0) continue;

        const weekFeedback = allFeedback.filter(r => r.created_date && r.created_date >= oneWeekAgoISO);
        const totalFeedback = allFeedback.length;

        // Calculate average response time (hours between interaction completion and feedback)
        let avgResponseHours = null;
        const feedbackWithTiming = [];
        for (const fb of allFeedback) {
          if (fb.interaction_log_id && fb.created_date) {
            try {
              const logs = await base44.asServiceRole.entities.InteractionLog.filter({
                id: fb.interaction_log_id
              });
              const log = logs && logs.length > 0 ? logs[0] : null;
              if (log && log.completed_at) {
                const completedAt = new Date(log.completed_at);
                const feedbackAt = new Date(fb.created_date);
                const hours = (feedbackAt - completedAt) / (1000 * 60 * 60);
                if (hours >= 0 && hours < 720) { // ignore outliers > 30 days
                  feedbackWithTiming.push(hours);
                }
              }
            } catch (e) {
              // skip timing for this feedback
            }
          }
        }
        if (feedbackWithTiming.length > 0) {
          avgResponseHours = Math.round(feedbackWithTiming.reduce((a, b) => a + b, 0) / feedbackWithTiming.length);
        }

        // Calculate karma percentile
        let percentile = 50;
        if (allKarma && allKarma.length > 0 && parent.family_group_id) {
          const myKarma = allKarma.find(k => k.family_group_id === parent.family_group_id);
          if (myKarma) {
            const myTotal = myKarma.total_karma || 0;
            const below = allKarma.filter(k => (k.total_karma || 0) < myTotal).length;
            percentile = Math.max(1, Math.round(100 - (below / allKarma.length) * 100));
          }
        }

        // Find a recent positive feedback quote
        let feedbackQuote = '';
        const visiblePositiveFeedback = allFeedback
          .filter(r => r.feedback_visible !== false && r.open_feedback && r.open_feedback.trim().length > 10)
          .sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''));

        if (visiblePositiveFeedback.length > 0) {
          const topFeedback = visiblePositiveFeedback[0];
          const studentFirstName = topFeedback.student_name ? topFeedback.student_name.split(' ')[0] : 'A student';
          feedbackQuote = `\nA STUDENT SAID:\n"${topFeedback.open_feedback}"\n— ${studentFirstName}\n`;
        }

        const parentName = parent.full_name ? parent.full_name.split(' ')[0] : 'there';
        const responseTimeText = avgResponseHours !== null
          ? `YOUR RESPONSE TIME: ~${avgResponseHours} hour${avgResponseHours !== 1 ? 's' : ''}`
          : 'YOUR RESPONSE TIME: —';

        const emailBody = `Hi ${parentName},

Here's what your mentorship accomplished this week:

STUDENTS HELPED THIS WEEK: ${weekFeedback.length}
ALL-TIME STUDENTS HELPED: ${totalFeedback}
${responseTimeText}
YOUR KARMA RANK AT UF: Top ${percentile}%
${feedbackQuote}
Thank you for showing up for these students. You're making a difference that goes far beyond a single conversation.

— College Fast Forward at UF`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: parent.email,
          subject: 'Your CFF Impact This Week',
          body: emailBody,
          from_name: 'College Fast Forward'
        });

        sentCount++;
      } catch (parentError) {
        console.error(`Error processing parent ${parent.email}:`, parentError.message);
        errors.push({ email: parent.email, error: parentError.message });
      }
    }

    return Response.json({
      message: 'Weekly parent impact reports sent',
      sent: sentCount,
      total: parents.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Parent impact report error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});