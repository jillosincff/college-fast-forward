import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * searchNetworkByBackground
 * Search alumni and parents in the CFF network by role, industry, or keyword.
 * Used by the FastIQ Scout agent when a student asks about people with a certain background.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query = '', persona_filter = 'all', limit = 10 } = await req.json();

    // Company size filter derived from student's saved preference
    const companySizePref = user?.career_goals?.company_size_preference || 'all';
    const SIZE_KEYWORDS = {
      startup: ['startup', 'early-stage', 'seed', 'series a', 'series b', 'co-founder', 'founding', '1-10', '11-20', '21-50'],
      midmarket: ['series c', 'series d', 'growth', 'scale-up', 'mid-market', 'scaleup', '51-200', '201-500'],
      enterprise: ['fortune 500', 'enterprise', 'global', 'publicly traded', 'corporate', 'multinational'],
    };
    const sizeFilterKws = SIZE_KEYWORDS[companySizePref] || [];

    if (!query.trim()) {
      return Response.json({ success: false, error: 'No search query provided', results: [] });
    }

    const schoolCode = user.school_code || '';
    const schoolName = user.school_name || user.school || user.university || '';

    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    // Load users from the platform
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 3000);
    const matches = [];

    for (const u of (allUsers || [])) {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));

      if (!isParent && !isAlumni) continue;
      if (!u.full_name) continue;
      if (u.visible_in_directory === false) continue;

      // Persona filter
      if (persona_filter === 'alumni' && !isAlumni) continue;
      if (persona_filter === 'parent' && !isParent) continue;

      // School isolation — apply to both alumni and parents
      // Parents store school as school_name/school (full name), may not have school_code
      if (schoolCode || schoolName) {
        const userSchoolCode = (u.school_code || '').toLowerCase();
        const userSchoolName = (u.school_name || u.school || u.university || '').toLowerCase();
        const codeMatch = schoolCode && userSchoolCode === schoolCode.toLowerCase();
        const nameMatch = schoolName && userSchoolName && userSchoolName === schoolName.toLowerCase();
        // Also match partial: e.g. "University of Florida" contains "florida"
        const partialMatch = schoolName && userSchoolName && (
          userSchoolName.includes(schoolName.toLowerCase()) ||
          schoolName.toLowerCase().includes(userSchoolName)
        );
        if (!codeMatch && !nameMatch && !partialMatch) continue;
      }

      // Build searchable text from their profile
      const searchableText = [
        u.job_title, u.current_position, u.position,
        u.industry, u.bio, u.company, u.current_company,
        u.major, u.expertise, u.skills,
        ...(Array.isArray(u.industries) ? u.industries : []),
        ...(Array.isArray(u.expertise_areas) ? u.expertise_areas : []),
      ].filter(Boolean).join(' ').toLowerCase();

      // Score: count how many keywords match
      const score = keywords.filter(kw => searchableText.includes(kw)).length;
      if (score === 0) continue;

      // Company size filter: if user has a preference and it's not 'all', soft-deprioritize non-matching
      if (sizeFilterKws.length > 0) {
        const companySizeText = [u.company, u.current_company, u.bio, u.industry].filter(Boolean).join(' ').toLowerCase();
        const sizeMatch = sizeFilterKws.some(kw => companySizeText.includes(kw));
        if (!sizeMatch) {
          // Still include but with reduced score (don't hard-exclude — size data is sparse)
          matches.push({ score: score * 0.5, id: u.id, full_name: u.full_name, job_title: u.job_title || u.current_position || u.position || '', company: u.company || u.current_company || u.employer || '', industry: u.industry || '', persona: isParent ? 'parent' : 'alumni', linkedin_url: u.linkedin_url || '', profile_image_url: u.profile_image_url || '', intro_willingness: u.intro_willingness || u.open_to_intros || 'unknown', bio: u.bio || '' });
          continue;
        }
      }

      matches.push({
        score,
        id: u.id,
        full_name: u.full_name,
        job_title: u.job_title || u.current_position || u.position || '',
        company: u.company || u.current_company || u.employer || '',
        industry: u.industry || '',
        persona: isParent ? 'parent' : 'alumni',
        linkedin_url: u.linkedin_url || '',
        profile_image_url: u.profile_image_url || '',
        intro_willingness: u.intro_willingness || u.open_to_intros || 'unknown',
        bio: u.bio || '',
      });
    }

    // Sort by score descending, take top N
    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, limit);

    console.log(`[searchNetworkByBackground] query="${query}" found ${topMatches.length} matches`);

    return Response.json({
      success: true,
      query,
      total_found: matches.length,
      results: topMatches,
    });

  } catch (error) {
    console.error('[searchNetworkByBackground] Error:', error.message);
    return Response.json({ error: error.message, results: [] }, { status: 500 });
  }
});