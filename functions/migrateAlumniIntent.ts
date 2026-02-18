import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all alumni users
    const allUsers = await base44.asServiceRole.entities.User.filter(
      { persona: 'alumni' },
      '-created_date',
      500
    );

    let migrated = 0;
    let skipped = 0;
    const results = [];

    for (const alumniUser of allUsers) {
      // Skip if already has intent set
      if (alumniUser.alumni_intent) {
        skipped++;
        continue;
      }

      // Determine intent based on existing data
      // If they have seeker_needs populated → seeking_help
      // If they only have expertise/help_types → help_students
      // Default to help_students
      const hasSeekingData = (alumniUser.seeker_needs && alumniUser.seeker_needs.length > 0) ||
                             (alumniUser.needs_help_with && alumniUser.needs_help_with.length > 0) ||
                             alumniUser.seeker_actively_looking === true;

      const hasHelperData = (alumniUser.expertise_areas && alumniUser.expertise_areas.length > 0) ||
                            (alumniUser.help_types && alumniUser.help_types.length > 0);

      let intent;
      if (hasSeekingData && !hasHelperData) {
        intent = 'seeking_help';
      } else {
        // Default to helper if they offered help, or selected both, or neither
        intent = 'help_students';
      }

      await base44.asServiceRole.entities.User.update(alumniUser.id, {
        alumni_intent: intent
      });

      migrated++;
      results.push({
        email: alumniUser.email,
        intent,
        reason: hasSeekingData && !hasHelperData ? 'has_seeker_data' : 'default_helper'
      });
    }

    return Response.json({
      success: true,
      total: allUsers.length,
      migrated,
      skipped,
      results: results.slice(0, 50) // Limit output
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});