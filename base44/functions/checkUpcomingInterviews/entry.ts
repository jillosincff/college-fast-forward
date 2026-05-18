import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Checks the student's NetworkingPipeline for upcoming interviews.
// Used by CliFF to surface a proactive prep prompt on dashboard mount.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch pipeline entries that are in an interview stage
    const INTERVIEW_STATUSES = ['coffee_chat', 'intro_made'];
    const entries = await base44.entities.NetworkingPipeline.filter({
      user_email: user.email,
    });

    if (!entries || entries.length === 0) {
      return Response.json({ has_upcoming: false });
    }

    // Find entries with an interview_date in the upcoming window OR status coffee_chat/intro_made
    const upcoming = entries.find(e => {
      const hasInterviewStatus = INTERVIEW_STATUSES.includes(e.status);
      if (e.interview_date) {
        const interviewDate = new Date(e.interview_date);
        return interviewDate >= now && interviewDate <= sevenDaysOut;
      }
      return hasInterviewStatus;
    });

    if (!upcoming) {
      return Response.json({ has_upcoming: false });
    }

    return Response.json({
      has_upcoming: true,
      interview: {
        company: upcoming.company,
        role: upcoming.alumni_role || null,
        interview_date: upcoming.interview_date || null,
        status: upcoming.status,
      }
    });
  } catch (error) {
    console.error('[checkUpcomingInterviews]', error.message);
    return Response.json({ has_upcoming: false, error: error.message });
  }
});