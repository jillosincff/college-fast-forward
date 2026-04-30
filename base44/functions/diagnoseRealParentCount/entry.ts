import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const parents = allUsers.filter(u => u.persona === 'parent');

    // Segment parents into meaningful buckets
    const csvImported = parents.filter(u => u.source?.includes('csv'));
    const organic = parents.filter(u => !u.source?.includes('csv'));

    const verifiedOrganicParents = organic.filter(u => u.is_verified);
    const unverifiedOrganic = organic.filter(u => !u.is_verified);

    const onboardingCompleted = parents.filter(u => u.onboarding_completed === true);
    const pledgeTaken = parents.filter(u => u.pledge_taken === true);
    const hasLinkedIn = parents.filter(u => u.linkedin_url && u.linkedin_url.trim().length > 5);
    const hasCompany = parents.filter(u => u.company && u.company.trim().length > 2);
    const visibleInDirectory = parents.filter(u => u.visible_in_directory === true);
    const hasStudentEmail = parents.filter(u => u.student_emails && u.student_emails.length > 0);

    // "Active" definition: verified + onboarding_completed
    const active = parents.filter(u => u.is_verified && u.onboarding_completed === true);

    // "High quality": verified + onboarding + pledge taken
    const highQuality = parents.filter(u =>
      u.is_verified && u.onboarding_completed === true && u.pledge_taken === true
    );

    // Check for gators/alumni who have parent roles too (persona mismatch?)
    const personaMismatches = allUsers.filter(u =>
      u.persona !== 'parent' && u.roles?.includes('parent')
    );

    // Sample organic verified parents
    const sampleActive = active.slice(0, 10).map(u => ({
      email: u.email,
      name: u.full_name,
      school: u.school_name || u.school,
      company: u.company,
      verified: u.is_verified,
      onboarded: u.onboarding_completed,
      pledge: u.pledge_taken,
      source: u.source || 'organic',
      created: u.created_date,
    }));

    // School breakdown for active parents
    const activeBySchool = {};
    active.forEach(u => {
      const school = u.school_name || u.school || 'Unknown';
      activeBySchool[school] = (activeBySchool[school] || 0) + 1;
    });
    const topSchools = Object.entries(activeBySchool)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([school, count]) => ({ school, count }));

    return Response.json({
      // Raw counts
      total_with_parent_persona: parents.length,
      csv_imported: csvImported.length,
      organic_signups: organic.length,

      // Quality filters
      verified: parents.filter(u => u.is_verified).length,
      verified_organic: verifiedOrganicParents.length,
      unverified_organic: unverifiedOrganic.length,
      onboarding_completed: onboardingCompleted.length,
      pledge_taken: pledgeTaken.length,
      visible_in_directory: visibleInDirectory.length,
      has_linkedin: hasLinkedIn.length,
      has_company: hasCompany.length,
      has_student_email_linked: hasStudentEmail.length,

      // Best "real parent" definitions
      active_parents: active.length, // verified + onboarding complete
      high_quality_parents: highQuality.length, // verified + onboarded + pledged

      // Anomalies
      persona_mismatches_with_parent_role: personaMismatches.length,
      mismatch_samples: personaMismatches.slice(0, 5).map(u => ({
        email: u.email, persona: u.persona, roles: u.roles
      })),

      // Top schools among active parents
      active_parents_by_school: topSchools,

      // Sample
      sample_active_parents: sampleActive,
    });

  } catch (error) {
    console.error('[diagnoseRealParentCount] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});