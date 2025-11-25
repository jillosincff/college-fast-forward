import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 401 });
    }

    // Get all draft requests
    const draftRequests = await base44.asServiceRole.entities.JobRequest.filter({ status: 'draft' });
    
    const fixed = [];
    const errors = [];

    for (const request of draftRequests) {
      try {
        let needsUpdate = false;
        const updates = {};

        // Check if name has comma (Last, First format)
        const posterName = request.poster_name || '';
        if (posterName.includes(',')) {
          // Parse "Last, First" or "Last, First M." format
          const parts = posterName.split(',').map(p => p.trim());
          if (parts.length === 2) {
            const lastName = parts[0];
            const firstName = parts[1].split(' ')[0]; // Get first part before any middle initial
            const newFullName = `${firstName} ${lastName}`;
            
            updates.poster_name = newFullName;
            updates.poster_first_name = firstName;
            updates.poster_last_name = lastName;
            updates.title = request.title?.replace(posterName, newFullName) || `${newFullName} - ${request.role}`;
            needsUpdate = true;
          }
        }

        // Trim trailing spaces from target_industry
        if (request.target_industry && request.target_industry !== request.target_industry.trim()) {
          updates.target_industry = request.target_industry.trim();
          needsUpdate = true;
        }

        // Trim trailing spaces from description
        if (request.description && request.description !== request.description.trim()) {
          updates.description = request.description.trim();
          needsUpdate = true;
        }

        if (needsUpdate) {
          await base44.asServiceRole.entities.JobRequest.update(request.id, updates);
          fixed.push({
            id: request.id,
            originalName: posterName,
            newName: updates.poster_name || posterName,
            changes: Object.keys(updates)
          });
        }

      } catch (err) {
        errors.push({
          id: request.id,
          name: request.poster_name,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      summary: {
        totalDrafts: draftRequests.length,
        fixed: fixed.length,
        errors: errors.length
      },
      fixed,
      errors
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});