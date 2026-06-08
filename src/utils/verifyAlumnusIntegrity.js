/**
 * Alumni Integrity Verification Pipeline
 * 
 * Enforces strict validation of education and employment history
 * using structured array inspection rather than keyword matching.
 * 
 * @param {Object} profile - Raw JSON profile from Proxycurl/Exa/LinkedIn API
 * @param {string} targetSchoolCode - Expected school identifier (e.g., 'UF', 'UFLORIDA')
 * @param {string} targetCompany - Expected company name (e.g., 'Google', 'Nike')
 * @returns {Object} - { verified: boolean, failures: string[], details: Object }
 */
export function verifyAlumnusIntegrity(profile, targetSchoolCode, targetCompany) {
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
    const jobTitle = (job.title || job.job_title || '').toLowerCase();

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
 * LinkedIn ID-based validation (gold standard)
 * Uses canonical LinkedIn IDs instead of text matching
 * 
 * @param {Object} profile - Raw profile payload
 * @param {string} schoolLinkedinId - LinkedIn school ID (e.g., '13606' for UF)
 * @param {string} companyLinkedinId - LinkedIn company ID (e.g., '123456')
 * @returns {Object} - { verified: boolean, failures: string[], details: Object }
 */
export function verifyAlumnusById(profile, schoolLinkedinId, companyLinkedinId) {
  const failures = [];
  const details = {
    education_checked: false,
    employment_checked: false,
    school_id_match: false,
    company_id_match: false,
  };

  if (!profile) {
    return { verified: false, failures: ['Profile payload is null'], details };
  }

  // --- 1. EDUCATION ID VERIFICATION ---
  const educationHistory = Array.isArray(profile.education) ? profile.education : [];
  details.education_checked = true;

  const hasMatchingSchool = educationHistory.some(edu => {
    const eduSchoolId = edu.school_linkedin_id || edu.school_id;
    
    if (!eduSchoolId) {
      failures.push(`Education record missing LinkedIn ID`);
      return false;
    }

    if (eduSchoolId === schoolLinkedinId) {
      details.school_id_match = true;
      details.school_match = {
        name: edu.school || edu.school_name,
        linkedin_id: eduSchoolId,
      };
      return true;
    }

    failures.push(`Education ID mismatch: ${eduSchoolId} !== ${schoolLinkedinId}`);
    return false;
  });

  if (!hasMatchingSchool) {
    return { verified: false, failures, details };
  }

  // --- 2. EMPLOYMENT ID VERIFICATION ---
  const workHistory = Array.isArray(profile.experiences) ? profile.experiences : [];
  details.employment_checked = true;

  const currentJobs = workHistory.filter(exp => 
    exp.is_current === true || !exp.ends_at || exp.ends_at === 'Present'
  );

  const hasMatchingCompany = currentJobs.some(job => {
    const jobCompanyId = job.company_linkedin_id || job.company_id;

    if (!jobCompanyId) {
      failures.push(`Employment record missing LinkedIn ID`);
      return false;
    }

    if (jobCompanyId === companyLinkedinId) {
      details.company_id_match = true;
      details.company_match = {
        name: job.company || job.company_name,
        linkedin_id: jobCompanyId,
        title: job.title || job.job_title,
      };
      return true;
    }

    failures.push(`Company ID mismatch: ${jobCompanyId} !== ${companyLinkedinId}`);
    return false;
  });

  if (!hasMatchingCompany) {
    return { verified: false, failures, details };
  }

  return {
    verified: true,
    failures: [],
    details: {
      ...details,
      verification_passed: true,
      method: 'linkedin_id',
      timestamp: new Date().toISOString(),
    }
  };
}

/**
 * Batch verification for multiple profiles
 * Returns only verified alumni with full audit trail
 * 
 * @param {Array} profiles - Array of profile objects
 * @param {string} schoolCode - Target school code
 * @param {string} company - Target company
 * @returns {Object} - { verified: Array, rejected: Array, summary: Object }
 */
export function batchVerifyAlumni(profiles, schoolCode, company) {
  const verified = [];
  const rejected = [];

  for (const profile of profiles) {
    const result = verifyAlumnusIntegrity(profile, schoolCode, company);
    
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
    }
  }

  return {
    verified,
    rejected,
    summary: {
      total: profiles.length,
      verified_count: verified.length,
      rejected_count: rejected.length,
      pass_rate: profiles.length > 0 ? (verified.length / profiles.length * 100).toFixed(1) : 0,
      timestamp: new Date().toISOString(),
    }
  };
}