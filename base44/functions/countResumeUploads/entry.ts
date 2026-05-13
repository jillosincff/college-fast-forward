import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allUsers = await base44.asServiceRole.entities.User.list(undefined, 5000);

  const studentPersonas = ['student', 'gator'];
  const students = allUsers.filter(u => studentPersonas.includes(u.persona));
  const withResume = students.filter(u => u.resume_url && u.resume_url.trim() !== '');

  // Break down by persona
  const byPersona = {};
  for (const u of withResume) {
    byPersona[u.persona] = (byPersona[u.persona] || 0) + 1;
  }

  const withAlumniSearch = students.filter(u => u.has_searched_alumni === true);

  return Response.json({
    total_students: students.length,
    students_with_resume: withResume.length,
    resume_pct: ((withResume.length / students.length) * 100).toFixed(1) + '%',
    by_persona: byPersona,
    students_searched_alumni: withAlumniSearch.length,
    alumni_search_pct: ((withAlumniSearch.length / students.length) * 100).toFixed(1) + '%',
    alumni_search_samples: withAlumniSearch.slice(0, 10).map(u => ({ email: u.email, persona: u.persona, school: u.school_name || u.school })),
  });
});