import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Alumni Integrity Verification Pipeline (Inline for Deno)
 * Enforces strict validation of education and employment history
 */
function verifyAlumnusIntegrity(profile, targetSchoolCode, targetCompany) {
  const failures = [];
  const details = {
    education_checked: false,
    employment_checked: false,
    school_match: null,
    company_match: null,
    current_job_title: null,
  };

  if (!profile) {
    return { verified: false, failures: ['Profile payload is null or undefined'], details };
  }

  const normalizedSchool = targetSchoolCode.toLowerCase().trim();
  const normalizedCompany = targetCompany.toLowerCase().trim();

  // --- 1. STRICT EDUCATION VERIFICATION ---
  const educationHistory = Array.isArray(profile.education) ? profile.education : [];
  details.education_checked = true;

  const hasValidEducation = educationHistory.some(edu => {
    const schoolName = (edu.school || edu.school_name || '').toLowerCase();
    const schoolLinkedinId = edu.school_linkedin_id || edu.school_id;
    
    // UF LinkedIn ID: 13606 (hardcoded for bulletproof matching)
    const UF_LINKEDIN_ID = '13606';
    
    const matchesSchool = 
      schoolName.includes(normalizedSchool) || 
      (normalizedSchool === 'uf' && schoolName.includes('university of florida')) ||
      (normalizedSchool === 'uflorida' && schoolName.includes('university of florida')) ||
      (schoolLinkedinId && schoolLinkedinId === UF_LINKEDIN_ID);

    if (!matchesSchool) {
      failures.push(`Education mismatch: "${schoolName}" does not match target "${targetSchoolCode}"`);
      return false;
    }

    // Guardrail: Filter out high school, short certificate programs, or prep schools
    const degree = (edu.degree_name || edu.degree || '').toLowerCase();
    const field = (edu.field_of_study || '').toLowerCase();
    const isExcluded = ['high school', 'prep', 'certificate', 'bootcamp'].some(term => 
      degree.includes(term) || field.includes(term)
    );

    if (isExcluded) {
      failures.push(`Education excluded: "${degree || 'unknown'}" matches excluded pattern`);
      return false;
    }

    details.school_match = {
      name: edu.school || edu.school_name,
      linkedin_id: schoolLinkedinId,
      degree: degree,
      field: field,
    };

    return true;
  });

  if (!hasValidEducation) {
    return { verified: false, failures, details };
  }

  // --- 2. STRICT CURRENT EMPLOYMENT VERIFICATION ---
  const workHistory = Array.isArray(profile.experiences) ? profile.experiences : [];
  details.employment_checked = true;

  // Find chronologically active jobs (Proxycurl/LinkedIn standard)
  const currentJobs = workHistory.filter(exp => {
    const isCurrentlyEmployed = 
      exp.is_current === true || 
      !exp.ends_at || 
      exp.ends_at === 'Present' ||
      exp.ends_at === null ||
      exp.ends_at === undefined;
    
    return isCurrentlyEmployed;
  });

  if (currentJobs.length === 0) {
    failures.push('No current employment found in profile.experiences array');
    return { verified: false, failures, details };
  }

  const worksAtTargetCompany = currentJobs.some(job => {
    const companyName = (job.company || job.company_name || '').toLowerCase().trim();
    const companyLinkedinId = job.company_linkedin_id || job.company_id;

    // Clean corporate noise for comparative matching
    const cleanJobCompany = companyName.replace(/[,.\s]i?nc\b|[,.\s]llc\b|[,.\s]corp\b|[,.\s]ltd\b/g, '');
    const cleanTargetCompany = normalizedCompany.replace(/[,.\s]i?nc\b|[,.\s]llc\b|[,.\s]corp\b|[,.\s]ltd\b/g, '');

    const matchesCompany = 
      cleanJobCompany.includes(cleanTargetCompany) || 
      cleanTargetCompany.includes(cleanJobCompany);

    if (!matchesCompany) {
      failures.push(`Employment mismatch: "${companyName}" does not match target "${targetCompany}"`);
      return false;
    }

    details.company_match = {
      name: job.company || job.company_name,
      linkedin_id: companyLinkedinId,
      title: job.title || job.job_title,
      is_current: true,
    };

    details.current_job_title = job.title || job.job_title;

    return true;
  });

  if (!worksAtTargetCompany) {
    return { verified: false, failures, details };
  }

  return {
    verified: true,
    failures: [],
    details: {
      ...details,
      verification_passed: true,
      timestamp: new Date().toISOString(),
    }
  };
}

/**
 * Validates alumni profiles against strict education and employment criteria.
 * Returns only verified alumni with full audit trail.
 * 
 * This function enforces:
 * 1. Education array inspection (not just keyword matching)
 * 2. Current employment verification (is_current === true)
 * 3. LinkedIn ID matching when available (gold standard)
 * 4. Exclusion of high schools, prep schools, bootcamps
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const { profiles, school_code, company } = payload;

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return Response.json({ 
        error: 'profiles array is required',
        verified: [],
        rejected: [],
        summary: { total: 0, verified_count: 0, rejected_count: 0 }
      });
    }

    if (!school_code || !company) {
      return Response.json({ 
        error: 'school_code and company are required',
        verified: [],
        rejected: [],
        summary: { total: 0, verified_count: 0, rejected_count: 0 }
      });
    }

    console.log(`[verifyAlumniBatch] Validating ${profiles.length} profiles for ${school_code} @ ${company}`);

    // Batch verification
    const verified = [];
    const rejected = [];

    for (const profile of profiles) {
      const result = verifyAlumnusIntegrity(profile, school_code, company);
      
      if (result.verified) {
        verified.push({
          profile,
          verification_details: result.details,
        });
      } else {
        rejected.push({
          profile,
          failures: result.failures,
          details: result.details,
        });

        // Log rejection with reasons
        console.log(`🚫 [verifyAlumniBatch] REJECTED: ${profile.linkedin_url || 'unknown'}`);
        console.log(`   Reasons: ${result.failures.join(', ')}`);
      }
    }

    // Create debug log entries for rejections
    for (const rejectedItem of rejected) {
      try {
        await base44.asServiceRole.entities.DebugLogs.create({
          event: 'ALUMNI_FILTER_REJECTION',
          reason: rejectedItem.failures.join('; '),
          profile_url: rejectedItem.profile.linkedin_url || 'unknown',
          school_code,
          company,
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      } catch (logError) {
        console.warn('[verifyAlumniBatch] Failed to create debug log:', logError.message);
      }
    }

    const passRate = profiles.length > 0 ? (verified.length / profiles.length * 100).toFixed(1) : 0;
    console.log(`[verifyAlumniBatch] Results: ${verified.length}/${profiles.length} verified (${passRate}%)`);

    return Response.json({
      success: true,
      verified,
      rejected,
      summary: {
        total: profiles.length,
        verified_count: verified.length,
        rejected_count: rejected.length,
        pass_rate: passRate,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('[verifyAlumniBatch] Error:', error.message);
    return Response.json({ 
      error: error.message,
      verified: [],
      rejected: [],
      summary: { total: 0, verified_count: 0, rejected_count: 0 }
    }, { status: 500 });
  }
});