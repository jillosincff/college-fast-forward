/**
 * Agent Guardrail Validation
 * Enforces Identity, Target Matching, and Link Resolution rules before allowing API execution.
 * 
 * @param {Object} lead - The raw lead object from the backend/scraper payload
 * @param {Object} userGoals - The student's validated career goals from onboarding
 * @returns {Boolean} - True if the lead passes all data integrity checks, False if it should be discarded
 */
export function validateAgentLeadIntegrity(lead, userGoals) {
  // --- 1. KEY RETRIEVAL & NORMALIZATION ---
  const company = (lead.company || lead.companyName || lead.company_name || '').trim();
  const jobTitle = (lead.job_title || lead.role || lead.title || '').trim();
  const location = (lead.location || lead.job_location || '').toLowerCase();
  
  // Extract verified access identifiers required for Phase 2 automation
  const companyDomain = lead.domain || lead.company_domain || '';
  const linkedinUrl = lead.linkedin_url || lead.company_linkedin || lead.alumni_linkedin_url || '';

  const lowerCompany = company.toLowerCase();
  const lowerTitle = jobTitle.toLowerCase();

  // --- 2. IDENTITY CHECK (BLOCK GHOSTS & MIRRORED TITLES) ---
  if (!company || company.length < 3) {
    console.log(`🚫 [AgentGuardrail] REJECTED: Empty or too short company name "${company}"`);
    return false;
  }
  
  if (lowerCompany === lowerTitle) {
    console.log(`🚫 [AgentGuardrail] REJECTED: Company mirrors job title - "${company}" === "${jobTitle}"`);
    return false;
  }

  const jobTitleKeywords = [
    'intern', 'junior', 'senior', 'manager', 'director', 'coordinator', 
    'specialist', 'analyst', 'assistant', 'executive', 'lead', 'head', 
    'vp', 'chief', 'officer', 'engineer', 'developer', 'designer', 
    'consultant', 'associate', 'representative', 'account', 'administrator', 
    'supervisor', 'technician', 'scout', 'talent', 'recruiter', 'partner', 
    'strategist', 'operator', 'fellow', 'researcher', 'scientist', 'advisor'
  ];

  const businessSuffixes = ['inc', 'llc', 'corp', 'company', 'co', 'ltd', 'group', 'partners', 'associates', 'solutions', 'systems', 'services', 'ventures', 'capital', 'agency', 'firm'];
  const hasValidSuffix = businessSuffixes.some(suffix => new RegExp(`\\b${suffix}\\b`, 'i').test(lowerCompany));

  // If it flags a job title keyword and lacks an explicit business suffix, kill it instantly
  if (!hasValidSuffix && jobTitleKeywords.some(keyword => lowerCompany.includes(keyword))) {
    console.log(`🚫 [AgentGuardrail] REJECTED: Company "${company}" contains job title keyword without business suffix`);
    return false;
  }

  // --- 3. TARGET MATCHING (VALIDATE STRATEGIC RELEVANCE) ---
  // Block placeholder descriptions or fallback titles generated during systemic timeouts
  if (!jobTitle || jobTitle === 'Entry Level Role' || lowerTitle.includes('join our team')) {
    console.log(`🚫 [AgentGuardrail] REJECTED: Invalid job title "${jobTitle}"`);
    return false;
  }

  // Strict Location Validation (Matches onboarding criteria vs school physical location)
  if (userGoals?.location_preference) {
    const targetLoc = userGoals.location_preference.toLowerCase().trim();
    if (location && !location.includes(targetLoc) && !targetLoc.includes(location)) {
      console.log(`🚫 [AgentGuardrail] REJECTED: Location mismatch - "${location}" does not match "${targetLoc}"`);
      return false; // Dropped: Mismatched geographic parameters
    }
  }

  // --- 4. LINK RESOLUTION (CONFIRM ACTIONABLE ENGINES) ---
  // Ensure the data structure contains the baseline identity fingerprints required to run lookups
  if (!linkedinUrl && !companyDomain) {
    // Allow leads without LinkedIn/domain for now (not all sources provide this)
    // But log it for debugging
    console.log(`⚠️ [AgentGuardrail] WARNING: No LinkedIn URL or domain for "${company}"`);
  }

  console.log(`✅ [AgentGuardrail] PASSED: ${company} - ${jobTitle}`);
  return true;
}