import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { tasks } = await req.json();
    if (!tasks || !Array.isArray(tasks)) {
      return Response.json({ error: 'tasks array required' }, { status: 400 });
    }

    // Map tasks to milestones format
    const milestones = tasks.map(t => ({
      id: t.id || crypto.randomUUID(),
      title: t.taskText,
      description: '',
      due_date: '',
      completed_at: t.completed ? new Date().toISOString() : '',
      status: t.completed ? 'complete' : 'pending',
      phase: t.phase || 'General',
      priority: t.priority || 'medium',
    }));

    // Upsert: find existing plan for this user or create new
    const existing = await base44.entities.ActionPlan.filter({ student_email: user.email });
    
    if (existing && existing.length > 0) {
      await base44.entities.ActionPlan.update(existing[0].id, {
        milestones,
        last_reviewed_at: new Date().toISOString(),
      });
      return Response.json({ success: true, id: existing[0].id, action: 'updated' });
    } else {
      const created = await base44.entities.ActionPlan.create({
        student_email: user.email,
        milestones,
        last_reviewed_at: new Date().toISOString(),
      });
      return Response.json({ success: true, id: created.id, action: 'created' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});