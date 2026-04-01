import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const allUsers = await base44.entities.User.filter({});

    const breakdown = {
      total: allUsers.length,
      byPersona: {},
      byAlumniIntent: {},
      noPersona: 0,
    };

    allUsers.forEach(u => {
      // Count by persona
      const persona = u.persona || 'none';
      breakdown.byPersona[persona] = (breakdown.byPersona[persona] || 0) + 1;
      
      // Count alumni intent
      if (u.persona === 'alumni') {
        const intent = u.alumni_intent || 'none';
        breakdown.byAlumniIntent[intent] = (breakdown.byAlumniIntent[intent] || 0) + 1;
      }
      
      // Count missing persona
      if (!u.persona) breakdown.noPersona++;
    });

    return Response.json({ breakdown });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});