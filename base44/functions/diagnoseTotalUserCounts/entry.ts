import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all users in one call
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    console.log(`[diagnoseTotalUserCounts] Total users fetched: ${allUsers.length}`);

    // Dedup check by email
    const emailsSeen = new Set();
    const duplicates = [];
    allUsers.forEach(u => {
      const email = u.email?.toLowerCase();
      if (!email) return;
      if (emailsSeen.has(email)) {
        duplicates.push({ email: u.email, id: u.id });
      } else {
        emailsSeen.add(email);
      }
    });

    // Count by persona
    const counts = { parent: 0, student: 0, alumni: 0, gator: 0, none: 0, other: 0 };
    const verifiedByPersona = { parent: 0, student: 0, alumni: 0, gator: 0, none: 0, other: 0 };
    const schoolBreakdown = {};
    const csvImported = { parent: 0, student: 0, alumni: 0 };

    allUsers.forEach(u => {
      const persona = u.persona || 'none';
      const key = counts[persona] !== undefined ? persona : 'other';
      counts[key]++;
      if (u.is_verified) verifiedByPersona[key]++;

      // School breakdown
      const school = u.school_name || u.school || u.school_code || 'Unknown';
      if (!schoolBreakdown[school]) schoolBreakdown[school] = { total: 0, parents: 0, students: 0, alumni: 0 };
      schoolBreakdown[school].total++;
      if (persona === 'parent') schoolBreakdown[school].parents++;
      if (persona === 'student') schoolBreakdown[school].students++;
      if (persona === 'alumni') schoolBreakdown[school].alumni++;

      // CSV imported
      if (u.source?.includes('csv') && csvImported[persona] !== undefined) {
        csvImported[persona]++;
      }
    });

    // Sort school breakdown by total desc, top 15
    const topSchools = Object.entries(schoolBreakdown)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 15)
      .map(([school, data]) => ({ school, ...data }));

    // Organic (non-CSV) signups
    const organicStudents = allUsers.filter(u => u.persona === 'student' && !u.source?.includes('csv'));
    const organicParents = allUsers.filter(u => u.persona === 'parent' && !u.source?.includes('csv'));
    const organicAlumni = allUsers.filter(u => u.persona === 'alumni' && !u.source?.includes('csv'));

    // Verified organic signups
    const verifiedOrganicStudents = organicStudents.filter(u => u.is_verified);
    const verifiedOrganicParents = organicParents.filter(u => u.is_verified);

    return Response.json({
      total_users: allUsers.length,
      unique_emails: emailsSeen.size,
      duplicate_emails: duplicates.length,
      duplicates: duplicates.slice(0, 10),
      counts_by_persona: counts,
      verified_by_persona: verifiedByPersona,
      csv_imported: csvImported,
      organic_signups: {
        students: organicStudents.length,
        parents: organicParents.length,
        alumni: organicAlumni.length,
      },
      verified_organic_signups: {
        students: verifiedOrganicStudents.length,
        parents: verifiedOrganicParents.length,
      },
      top_schools: topSchools,
    });

  } catch (error) {
    console.error('[diagnoseTotalUserCounts] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});