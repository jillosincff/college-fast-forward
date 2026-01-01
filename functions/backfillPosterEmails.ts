import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Backfill poster_email for anonymous JobRequests by matching poster_name to User records.
 * This is an admin-only function to fix legacy data.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all JobRequests where created_by is 'anonymous' and poster_email is missing
    const allJobRequests = await base44.asServiceRole.entities.JobRequest.filter({
      created_by: 'anonymous'
    });

    // Filter to those missing poster_email
    const needsBackfill = allJobRequests.filter(jr => !jr.poster_email);

    console.log(`Found ${needsBackfill.length} JobRequests needing poster_email backfill`);

    if (needsBackfill.length === 0) {
      return Response.json({
        success: true,
        message: 'No JobRequests need backfill',
        updated: 0,
        checked: allJobRequests.length
      });
    }

    // Get all users to match against
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    console.log(`Loaded ${allUsers.length} users for matching`);

    // Build lookup maps for matching
    // Map by full_name (exact match)
    const userByFullName = new Map();
    // Map by normalized name (lowercase, no commas)
    const userByNormalizedName = new Map();
    
    allUsers.forEach(u => {
      if (u.full_name) {
        userByFullName.set(u.full_name, u.email);
        
        // Normalize: "Last, First M." -> "first last"
        let normalized = u.full_name.toLowerCase().trim();
        if (normalized.includes(',')) {
          const parts = normalized.split(',').map(p => p.trim());
          // "Last, First M." -> "first last"
          const lastName = parts[0];
          const firstName = parts[1]?.split(' ')[0] || '';
          normalized = `${firstName} ${lastName}`.trim();
        }
        userByNormalizedName.set(normalized, u.email);
        
        // Also try "First Last" format
        const firstLast = normalized.split(' ').reverse().join(' ');
        userByNormalizedName.set(firstLast, u.email);
      }
      
      // Also map by first + last name combination
      if (u.first_name && u.last_name) {
        const combo = `${u.first_name} ${u.last_name}`.toLowerCase();
        userByNormalizedName.set(combo, u.email);
      }
    });

    const results = {
      updated: 0,
      notFound: [],
      errors: []
    };

    // Process each JobRequest
    for (const jr of needsBackfill) {
      const posterName = jr.poster_name;
      
      if (!posterName) {
        results.notFound.push({ id: jr.id, reason: 'No poster_name' });
        continue;
      }

      let matchedEmail = null;

      // Try exact match first
      if (userByFullName.has(posterName)) {
        matchedEmail = userByFullName.get(posterName);
      }

      // Try normalized match
      if (!matchedEmail) {
        let normalized = posterName.toLowerCase().trim();
        if (normalized.includes(',')) {
          const parts = normalized.split(',').map(p => p.trim());
          const lastName = parts[0];
          const firstName = parts[1]?.split(' ')[0] || '';
          normalized = `${firstName} ${lastName}`.trim();
        }
        
        if (userByNormalizedName.has(normalized)) {
          matchedEmail = userByNormalizedName.get(normalized);
        }
      }

      // Try matching by first name + last name from JobRequest
      if (!matchedEmail && jr.poster_first_name && jr.poster_last_name) {
        const combo = `${jr.poster_first_name} ${jr.poster_last_name}`.toLowerCase();
        if (userByNormalizedName.has(combo)) {
          matchedEmail = userByNormalizedName.get(combo);
        }
      }

      if (matchedEmail) {
        try {
          await base44.asServiceRole.entities.JobRequest.update(jr.id, {
            poster_email: matchedEmail
          });
          results.updated++;
          console.log(`✅ Updated JobRequest ${jr.id}: poster_email = ${matchedEmail}`);
        } catch (updateError) {
          results.errors.push({ id: jr.id, error: updateError.message });
          console.error(`❌ Failed to update ${jr.id}:`, updateError.message);
        }
      } else {
        results.notFound.push({ 
          id: jr.id, 
          posterName: posterName,
          posterFirstName: jr.poster_first_name,
          posterLastName: jr.poster_last_name
        });
        console.log(`⚠️ No match found for: ${posterName}`);
      }
    }

    return Response.json({
      success: true,
      message: `Backfill complete. Updated ${results.updated} of ${needsBackfill.length} JobRequests.`,
      updated: results.updated,
      totalChecked: needsBackfill.length,
      notFound: results.notFound,
      errors: results.errors
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});