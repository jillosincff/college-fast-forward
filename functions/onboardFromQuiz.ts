import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Map funnel interest keys to industries
const INTEREST_TO_INDUSTRY = {
  tech_ai: 'Technology & Software',
  creative: 'Media & Entertainment',
  high_pay: 'Finance & Banking',
  helping: 'Healthcare',
  travel: 'Consulting',
  startups: 'Technology & Software',
  not_sure: '',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizAnswers = {} } = await req.json();
    const {
      major,
      gradYear,
      targets = [],
      locationPref,
      jobType,
      interests = [],
      industries = [],
    } = quizAnswers;

    // Build target_industry string from interests + industries
    const industrySet = new Set();
    interests.forEach(i => {
      const mapped = INTEREST_TO_INDUSTRY[i];
      if (mapped) industrySet.add(mapped);
    });
    industries.forEach(i => industrySet.add(i));
    const targetIndustry = [...industrySet].join(', ');

    // Map jobType to FastTrackProProfile field values
    const jobSearchTypeMap = {
      internship: 'internship',
      full_time: 'entry_level',
      entry_level: 'entry_level',
      part_time: 'internship',
      co_op: 'co_op',
    };

    // Check if profile exists
    const existing = await base44.asServiceRole.entities.FastTrackProProfile.filter(
      { user_email: user.email },
      undefined,
      1
    );

    const profileData = {
      user_email: user.email,
      target_companies: targets.slice(0, 5),
      assessment_complete: true,
    };

    if (major) profileData.target_role = major;
    if (gradYear) profileData.start_timeline = `spring_${gradYear}`;
    if (targetIndustry) profileData.target_industry = targetIndustry;
    if (jobType) profileData.job_search_type = jobSearchTypeMap[jobType] || jobType;
    if (locationPref) profileData.location_preference = locationPref;

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.FastTrackProProfile.update(existing[0].id, profileData);
    } else {
      await base44.asServiceRole.entities.FastTrackProProfile.create(profileData);
    }

    return Response.json({ success: true, profileUpdated: true });
  } catch (error) {
    console.error('onboardFromQuiz error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});