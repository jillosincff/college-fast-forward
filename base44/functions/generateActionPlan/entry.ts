import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { force } = await req.json().catch(() => ({}));

    // Get user profile
    const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
    const profile = profiles[0];
    if (!profile) return Response.json({ error: 'No FASTIQ profile found' }, { status: 404 });

    // Check existing plan
    const existingPlans = await base44.entities.ActionPlan.filter({ student_email: user.email });
    const existing = existingPlans[0];

    // Skip if recently generated (within 6 hours) unless forced
    if (existing && !force) {
      const lastReviewed = existing.last_reviewed_at ? new Date(existing.last_reviewed_at) : new Date(existing.created_date);
      if (Date.now() - lastReviewed.getTime() < 6 * 60 * 60 * 1000) {
        return Response.json({ success: true, plan: existing, cached: true });
      }
    }

    // Get recent activity for context
    const recentActivity = await base44.entities.ActivityLog.filter(
      { student_email: user.email }, '-created_date', 20
    );

    const gradYear = user.graduation_year || profile.graduation_year || new Date().getFullYear() + 1;
    const gradDate = new Date(gradYear, 4, 15); // May 15
    const weeksUntilGrad = Math.max(1, Math.round((gradDate - Date.now()) / (7 * 24 * 60 * 60 * 1000)));
    const path = user.fastiq_mode || profile.path || 'focused';
    const targets = (profile.target_companies || []).join(', ') || 'Not set';

    const activitySummary = recentActivity.slice(0, 10).map(a =>
      `${a.type}: ${a.company_name || ''} ${a.contact_name || ''} (${new Date(a.created_date).toLocaleDateString()})`
    ).join('\n') || 'No recent activity';

    const prompt = `You are FASTIQ, an AI career advisor for UF students.

Generate a personalized action plan for this student:
Name: ${user.full_name || 'Student'}
Major: ${user.major || 'Not set'}
Graduation: ${gradYear}
Path: ${path}
Target companies: ${targets}
Exploration interest: ${user.fastiq_exploration_interest || 'Not set'}
Weeks until graduation: ${weeksUntilGrad}
Recent activity:
${activitySummary}

Generate:
1. Weekly goals (realistic numbers based on their activity level)
2. 5-7 milestones with due dates (ISO format) spaced across their timeline
3. Current focus — the ONE most important thing they should do this week
4. A short chat prompt for the focus action (e.g. "Draft outreach to alumni at Nike")

Be specific and actionable. Not "network more" but "send 3 outreach messages to UF alumni at Nike, HubSpot, and Ogilvy this week."

Return JSON with this exact shape:
{
  "weekly_goal_outreach": number,
  "weekly_goal_conversations": number,
  "weekly_goal_research": number,
  "weekly_goal_resumes": number,
  "milestones": [{"id": "m1", "title": "string", "description": "string", "due_date": "ISO date", "status": "pending"}],
  "current_focus": "string",
  "current_focus_action": "string"
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          weekly_goal_outreach: { type: "number" },
          weekly_goal_conversations: { type: "number" },
          weekly_goal_research: { type: "number" },
          weekly_goal_resumes: { type: "number" },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                due_date: { type: "string" },
                status: { type: "string" }
              }
            }
          },
          current_focus: { type: "string" },
          current_focus_action: { type: "string" }
        }
      }
    });

    const planData = {
      student_email: user.email,
      path,
      graduation_year: gradYear,
      weekly_goal_outreach: result.weekly_goal_outreach || 3,
      weekly_goal_conversations: result.weekly_goal_conversations || 1,
      weekly_goal_research: result.weekly_goal_research || 2,
      weekly_goal_resumes: result.weekly_goal_resumes || 1,
      milestones: (result.milestones || []).map((m, i) => ({
        ...m,
        id: m.id || `m${i + 1}`,
        status: m.status || 'pending'
      })),
      current_focus: result.current_focus || 'Start by researching your target companies.',
      current_focus_action: result.current_focus_action || 'Research my target companies',
      last_reviewed_at: new Date().toISOString(),
    };

    // Preserve completed milestones from existing plan
    if (existing?.milestones?.length) {
      const completedMap = {};
      existing.milestones.forEach(m => {
        if (m.status === 'complete') completedMap[m.title?.toLowerCase()] = m;
      });
      planData.milestones = planData.milestones.map(m => {
        const prev = completedMap[m.title?.toLowerCase()];
        if (prev) return { ...m, status: 'complete', completed_at: prev.completed_at };
        return m;
      });
    }

    let plan;
    if (existing) {
      await base44.entities.ActionPlan.update(existing.id, planData);
      plan = { ...existing, ...planData };
    } else {
      plan = await base44.entities.ActionPlan.create(planData);
    }

    return Response.json({ success: true, plan });
  } catch (error) {
    console.error('generateActionPlan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});