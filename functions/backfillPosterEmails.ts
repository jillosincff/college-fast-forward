import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('Starting poster_email backfill...');

    // Get all questions with null poster_email
    const questions = await base44.asServiceRole.entities.JobRequest.filter(
      { poster_email: null },
      '-created_date',
      500
    );

    console.log(`Found ${questions.length} questions with null poster_email`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const details = [];

    for (const question of questions) {
      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        let email = null;
        
        // Try to find email from created_by
        const createdBy = question.created_by;
        
        if (createdBy && createdBy !== 'anonymous') {
          // Check if created_by is already an email
          if (createdBy.includes('@')) {
            email = createdBy;
          } else {
            // Try to look up user by ID
            try {
              const users = await base44.asServiceRole.entities.User.filter({ id: createdBy });
              if (users && users.length > 0) {
                email = users[0].email;
              }
            } catch (e) {
              console.log(`Could not look up user ${createdBy}:`, e.message);
            }
          }
        }

        if (email) {
          await base44.asServiceRole.entities.JobRequest.update(question.id, {
            poster_email: email
          });
          updated++;
          details.push({
            id: question.id,
            status: 'updated',
            email,
            poster_name: question.poster_name
          });
        } else {
          skipped++;
          details.push({
            id: question.id,
            status: 'skipped',
            created_by: createdBy,
            poster_name: question.poster_name,
            reason: 'Could not find email'
          });
        }
      } catch (e) {
        failed++;
        details.push({
          id: question.id,
          status: 'failed',
          error: e.message
        });
      }
    }

    console.log(`Backfill complete: updated=${updated}, skipped=${skipped}, failed=${failed}`);

    return Response.json({
      success: true,
      summary: {
        total: questions.length,
        updated,
        skipped,
        failed
      },
      details: details.slice(0, 50) // Limit details for readability
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});