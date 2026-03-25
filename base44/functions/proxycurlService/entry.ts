import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = 'https://nubela.co/proxycurl/api';

async function proxycurlFetch(path, key) {
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${key}` },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Proxycurl HTTP ${resp.status}: ${text}`);
  }
  return resp.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, params } = await req.json();
    const PROXYCURL_KEY = Deno.env.get('PROXYCURL_API_KEY');
    if (!PROXYCURL_KEY) return Response.json({ error: 'PROXYCURL_API_KEY not set' }, { status: 500 });

    // ── Get alumni COUNT at a company from a university (cheap — no profile enrichment)
    if (action === 'getAlumniCount') {
      const { companyLinkedInUrl, universityName, companyName } = params;
      const qs = new URLSearchParams({
        current_company_linkedin_profile_url: companyLinkedInUrl,
        education_school_name: universityName,
        enrich_profiles: 'skip',
        page_size: '1',
      });
      const data = await proxycurlFetch(`/v2/search/person?${qs}`, PROXYCURL_KEY);
      return Response.json({
        company: companyName,
        alumni_count: data.total_result_count || 0,
        confidence: 'verified',
        source: 'linkedin_proxycurl',
      });
    }

    // ── Get actual alumni PROFILES at a company (costs credits per profile)
    if (action === 'getAlumniProfiles') {
      const { companyLinkedInUrl, universityName, companyName, maxResults = 10 } = params;
      const qs = new URLSearchParams({
        current_company_linkedin_profile_url: companyLinkedInUrl,
        education_school_name: universityName,
        enrich_profiles: 'enrich',
        page_size: String(maxResults),
      });
      const data = await proxycurlFetch(`/v2/search/person?${qs}`, PROXYCURL_KEY);
      const profiles = (data.results || []).map(p => ({
        full_name: p.profile?.full_name || '',
        headline: p.profile?.headline || '',
        current_title: p.profile?.experiences?.[0]?.title || '',
        graduation_year: p.profile?.education
          ?.find(e => e.school?.name?.toLowerCase().includes(universityName.toLowerCase()))
          ?.ends_at?.year || null,
        linkedin_url: p.linkedin_profile_url || '',
        location: p.profile?.city || '',
      }));
      return Response.json({
        company: companyName,
        profiles,
        total_count: data.total_result_count || 0,
        confidence: 'verified',
        source: 'linkedin_proxycurl',
      });
    }

    // ── Enrich a single profile from their LinkedIn URL (on-demand, costs 1 credit)
    if (action === 'enrichParentProfile') {
      const { linkedinUrl } = params;
      if (!linkedinUrl) return Response.json({ error: 'No LinkedIn URL provided' }, { status: 400 });
      const qs = new URLSearchParams({
        linkedin_profile_url: linkedinUrl,
        extra: 'include',
        skills: 'include',
      });
      const profile = await proxycurlFetch(`/v2/linkedin?${qs}`, PROXYCURL_KEY);
      return Response.json({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        current_title: profile.experiences?.[0]?.title || '',
        current_company: profile.experiences?.[0]?.company || '',
        industry: profile.industry || '',
        location: profile.city || '',
        summary: profile.summary || '',
        skills: (profile.skills || []).slice(0, 10).map(s => s.name || s),
        profile_pic: profile.profile_pic_url || null,
        enriched_at: new Date().toISOString(),
      });
    }

    // ── Get alumni with a specific job title/role from a university
    if (action === 'getAlumniByRole') {
      const { jobTitle, universityName, location, maxResults = 10 } = params;
      const qs = new URLSearchParams({
        headline: jobTitle,
        education_school_name: universityName,
        enrich_profiles: 'enrich',
        page_size: String(maxResults),
      });
      if (location && location.toLowerCase() !== 'open to anything') {
        qs.append('city', location);
      }
      const data = await proxycurlFetch(`/v2/search/person?${qs}`, PROXYCURL_KEY);
      const profiles = (data.results || []).map(p => ({
        full_name: p.profile?.full_name || '',
        current_title: p.profile?.experiences?.[0]?.title || '',
        current_company: p.profile?.experiences?.[0]?.company || '',
        graduation_year: p.profile?.education
          ?.find(e => e.school?.name?.toLowerCase().includes(universityName.toLowerCase()))
          ?.ends_at?.year || null,
        linkedin_url: p.linkedin_profile_url || '',
        location: p.profile?.city || '',
      }));
      return Response.json({
        job_title: jobTitle,
        profiles,
        total_count: data.total_result_count || 0,
        confidence: 'verified',
        source: 'linkedin_proxycurl',
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[proxycurlService] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});