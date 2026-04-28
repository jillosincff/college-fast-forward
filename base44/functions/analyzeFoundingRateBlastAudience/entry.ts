import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const INTENT_EVENTS = ['paywall_viewed', 'teaser_reveal_viewed', 'match_score_viewed', 'fastiq_leads_viewed', 'alumni_search_used', 'checkout_started'];
const SIXTY_DAYS_AGO = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    console.log(`[analyzeAudience] Fetched ${allUsers.length} total users`);

    // Fetch all analytics events in last 60 days
    const allEvents = await base44.asServiceRole.entities.AnalyticsEvent.list('-created_date', 10000);
    const recentEvents = allEvents.filter(e => new Date(e.created_date) >= new Date(SIXTY_DAYS_AGO));
    console.log(`[analyzeAudience] Fetched ${recentEvents.length} analytics events in last 60 days`);

    // Fetch email preferences
    const allPrefs = await base44.asServiceRole.entities.EmailPreference.list('-created_date', 5000);
    console.log(`[analyzeAudience] Fetched ${allPrefs.length} email preferences`);

    // Helper: check if user is upgraded
    function isUpgraded(u) {
      return u.subscription_status === 'active' || u.membership_tier === 'fastiq' || u.fastiq_trial_active === true;
    }

    // Helper: check if user unsubscribed
    function isUnsubscribed(u) {
      const pref = allPrefs.find(p => p.user_email?.toLowerCase() === u.email?.toLowerCase());
      return pref && pref.all_emails === false;
    }

    // Helper: has intent signal in last 60 days
    function hasIntentSignal(u) {
      return recentEvents.some(e => 
        e.user_email?.toLowerCase() === u.email?.toLowerCase() && 
        INTENT_EVENTS.includes(e.event_name)
      );
    }

    // Filter students
    const studentEligible = allUsers.filter(u =>
      u.persona === 'student' &&
      !isUpgraded(u) &&
      !isUnsubscribed(u) &&
      hasIntentSignal(u) &&
      u.email
    );

    console.log(`[analyzeAudience] ${studentEligible.length} eligible students`);

    // Filter parents with linked students
    // Assuming 'linked_students' or similar field exists; adjust based on actual schema
    const parentEligible = allUsers.filter(u => {
      if (u.persona !== 'parent') return false;
      if (isUpgraded(u)) return false;
      if (isUnsubscribed(u)) return false;
      
      // Check if parent has linked student
      // This may need adjustment based on actual schema
      const hasLinkedStudent = u.linked_students && Array.isArray(u.linked_students) && u.linked_students.length > 0;
      if (!hasLinkedStudent) return false;
      
      return u.email ? true : false;
    });

    console.log(`[analyzeAudience] ${parentEligible.length} eligible parents with linked students`);

    // Identify overlap (parents who are also in student list — shouldn't happen but check)
    const overlap = parentEligible.filter(p => studentEligible.find(s => s.email?.toLowerCase() === p.email?.toLowerCase()));
    console.log(`[analyzeAudience] ${overlap.length} parents also in student list (overlap)`);

    // School breakdown for students
    const studentsBySchool = {};
    studentEligible.forEach(s => {
      const school = s.school || s.school_name || 'Unknown';
      studentsBySchool[school] = (studentsBySchool[school] || 0) + 1;
    });
    const topStudentSchools = Object.entries(studentsBySchool)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // School breakdown for parents
    const parentsBySchool = {};
    parentEligible.forEach(p => {
      const school = p.school || p.school_name || 'Unknown';
      parentsBySchool[school] = (parentsBySchool[school] || 0) + 1;
    });
    const topParentSchools = Object.entries(parentsBySchool)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Sample 5 students with their intent signals
    const studentSample = studentEligible.slice(0, 5).map(s => {
      const signals = recentEvents
        .filter(e => e.user_email?.toLowerCase() === s.email?.toLowerCase())
        .map(e => e.event_name);
      return {
        name: s.full_name || s.email,
        email: s.email,
        school: s.school || s.school_name || 'Unknown',
        signals: [...new Set(signals)],
      };
    });

    // Sample 5 parents with their linked students
    const parentSample = parentEligible.slice(0, 5).map(p => ({
      name: p.full_name || p.email,
      email: p.email,
      school: p.school || p.school_name || 'Unknown',
      linked_students: p.linked_students ? p.linked_students.length : 0,
    }));

    return Response.json({
      total_students_eligible: studentEligible.length,
      total_parents_eligible: parentEligible.length,
      overlap_count: overlap.length,
      students_by_school: topStudentSchools.map(([school, count]) => ({ school, count })),
      parents_by_school: topParentSchools.map(([school, count]) => ({ school, count })),
      student_samples: studentSample,
      parent_samples: parentSample,
      technical_readiness: {
        targeted_query: true,
        pagination_100_chunks: 'queued_for_implementation',
        per_email_error_handling: 'queued_for_implementation',
      },
    });
  } catch (error) {
    console.error('[analyzeAudience] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});