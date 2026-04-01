import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const allUsers = await base44.entities.User.filter({});

    // Persona breakdown
    const byPersona = {};
    allUsers.forEach(u => {
      const p = u.persona || 'none';
      byPersona[p] = (byPersona[p] || 0) + 1;
    });
    console.log('Personas:', byPersona);

    // For each persona, check FastIQ status
    const studentsNotFastIQ = allUsers.filter(u => u.persona === 'student').filter(u => u.fastiq_setup_complete !== true && u.subscription_status !== 'active').length;
    const gatorsNotFastIQ = allUsers.filter(u => u.persona === 'gator').filter(u => u.fastiq_setup_complete !== true && u.subscription_status !== 'active').length;
    const alumniNotFastIQ = allUsers.filter(u => u.persona === 'alumni').filter(u => u.fastiq_setup_complete !== true && u.subscription_status !== 'active').length;

    console.log(`Students (not FastIQ): ${studentsNotFastIQ}`);
    console.log(`Gators (not FastIQ): ${gatorsNotFastIQ}`);
    console.log(`Alumni (not FastIQ): ${alumniNotFastIQ}`);

    // Alumni intent breakdown
    const alumniByIntent = {};
    allUsers.filter(u => u.persona === 'alumni').forEach(u => {
      const intent = u.alumni_intent || 'none';
      alumniByIntent[intent] = (alumniByIntent[intent] || 0) + 1;
    });
    console.log('Alumni intents:', alumniByIntent);

    // What should be job seekers? (students + gators + alumni seeking)
    const potentialJobSeekers = allUsers.filter(u =>
      u.email &&
      u.fastiq_setup_complete !== true &&
      u.subscription_status !== 'active' &&
      (
        u.persona === 'student' ||
        u.persona === 'gator' ||
        (u.persona === 'alumni' && u.alumni_intent === 'seeking_help')
      )
    );

    console.log(`Potential job seekers: ${potentialJobSeekers.length}`);
    console.log('Sample:', potentialJobSeekers.slice(0, 5).map(u => ({ email: u.email, persona: u.persona, alumni_intent: u.alumni_intent })));

    return Response.json({
      personas: byPersona,
      studentsNotFastIQ,
      gatorsNotFastIQ,
      alumniNotFastIQ,
      alumniIntents: alumniByIntent,
      potentialJobSeekers: potentialJobSeekers.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});