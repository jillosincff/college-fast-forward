import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, linkedinUrl } = await req.json();
    if (!userId) return Response.json({ error: 'userId required' }, { status: 400 });

    const PROXYCURL_KEY = Deno.env.get('PROXYCURL_API_KEY');
    if (!PROXYCURL_KEY) return Response.json({ error: 'No Proxycurl key configured' }, { status: 500 });

    const target = await base44.asServiceRole.entities.User.get(userId);
    if (!target) return Response.json({ error: 'User not found' }, { status: 404 });

    // Don't re-enrich if done within 30 days
    if (target.enriched_at) {
      const daysSince = (Date.now() - new Date(target.enriched_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        console.log(`Skipping enrichment for ${userId} — enriched ${Math.round(daysSince)} days ago`);
        return Response.json({
          cached: true,
          data: {
            full_name: target.full_name,
            headline: target.headline,
            job_title: target.job_title,
            company: target.company,
            industry: target.industry,
            bio: target.bio,
            location_city: target.location_city,
            profile_image_url: target.profile_image_url,
            linkedin_url: target.linkedin_url,
            skills: target.skills || [],
          }
        });
      }
    }

    const urlToEnrich = linkedinUrl || target.linkedin_url;
    if (!urlToEnrich?.trim()) return Response.json({ error: 'No LinkedIn URL available', userId });

    const cleanUrl = urlToEnrich.trim().toLowerCase().startsWith('http')
      ? urlToEnrich.trim()
      : `https://${urlToEnrich.trim()}`;

    console.log(`Enriching ${userId} from ${cleanUrl}`);

    const resp = await fetch(
      `https://nubela.co/proxycurl/api/v2/linkedin?linkedin_profile_url=${encodeURIComponent(cleanUrl)}&extra=include&skills=include`,
      { headers: { 'Authorization': `Bearer ${PROXYCURL_KEY}` } }
    );

    if (!resp.ok) throw new Error(`Proxycurl returned ${resp.status}`);

    const profile = await resp.json();
    if (!profile || profile.code === 404) return Response.json({ error: 'LinkedIn profile not found', userId });

    const currentExp = profile.experiences?.filter(e => !e.ends_at)?.[0] || profile.experiences?.[0];

    const enrichedData = {
      full_name: profile.full_name || target.full_name,
      headline: profile.headline || '',
      job_title: currentExp?.title || target.job_title || '',
      company: currentExp?.company || target.company || '',
      industry: profile.industry || target.industry || '',
      bio: profile.summary || target.bio || '',
      location_city: profile.city || target.location_city || '',
      location_state: profile.state || target.location_state || '',
      profile_image_url: profile.profile_pic_url || target.profile_image_url || '',
      skills: (profile.skills?.slice(0, 8).map(s => s.name).filter(Boolean)) || [],
      enriched_at: new Date().toISOString(),
      enriched_via: 'proxycurl',
    };

    await base44.asServiceRole.entities.User.update(userId, enrichedData);

    return Response.json({ success: true, data: enrichedData, cached: false });
  } catch (error) {
    console.error('enrichRedHotLead error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});