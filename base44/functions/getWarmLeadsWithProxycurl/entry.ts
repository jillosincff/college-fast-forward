import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Known LinkedIn company URLs — extend as needed
const COMPANY_LINKEDIN_URLS = {
  'NBCUniversal': 'https://www.linkedin.com/company/nbcuniversal',
  'The Walt Disney Company': 'https://www.linkedin.com/company/the-walt-disney-company',
  'ViacomCBS': 'https://www.linkedin.com/company/paramount',
  'Warner Bros. Entertainment': 'https://www.linkedin.com/company/warner-bros-entertainment',
  'Sony Music Entertainment': 'https://www.linkedin.com/company/sony-music',
  'Live Nation Entertainment': 'https://www.linkedin.com/company/live-nation-entertainment',
  'Goldman Sachs': 'https://www.linkedin.com/company/goldman-sachs',
  'JPMorgan Chase': 'https://www.linkedin.com/company/jpmorgan-chase',
  'Deloitte': 'https://www.linkedin.com/company/deloitte',
  'Google': 'https://www.linkedin.com/company/google',
  'Apple': 'https://www.linkedin.com/company/apple',
  'Microsoft': 'https://www.linkedin.com/company/microsoft',
  'Amazon': 'https://www.linkedin.com/company/amazon',
  'Meta': 'https://www.linkedin.com/company/meta',
  'CBRE': 'https://www.linkedin.com/company/cbre',
  'JLL': 'https://www.linkedin.com/company/jll',
  'Blackstone': 'https://www.linkedin.com/company/blackstone',
  'McKinsey': 'https://www.linkedin.com/company/mckinsey',
  'BCG': 'https://www.linkedin.com/company/boston-consulting-group',
  'Roc Nation': 'https://www.linkedin.com/company/roc-nation',
  'A24': 'https://www.linkedin.com/company/a24',
  'Spotify': 'https://www.linkedin.com/company/spotify',
  'Nike': 'https://www.linkedin.com/company/nike',
  'PwC': 'https://www.linkedin.com/company/pwc',
  'EY': 'https://www.linkedin.com/company/ernstandyoung',
  'KPMG': 'https://www.linkedin.com/company/kpmg',
  'Morgan Stanley': 'https://www.linkedin.com/company/morgan-stanley',
  'Bank of America': 'https://www.linkedin.com/company/bank-of-america',
  'Citi': 'https://www.linkedin.com/company/citi',
  'Wells Fargo': 'https://www.linkedin.com/company/wells-fargo',
  'Salesforce': 'https://www.linkedin.com/company/salesforce',
  'Adobe': 'https://www.linkedin.com/company/adobe',
  'Netflix': 'https://www.linkedin.com/company/netflix',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { student_id } = await req.json();
    if (student_id !== user.id) return Response.json({ error: 'Can only fetch own leads' }, { status: 403 });

    const student = await base44.asServiceRole.entities.User.get(student_id);
    if (!student) return Response.json({ error: 'Student not found' }, { status: 404 });

    const school = student.school || student.university || 'University of Florida';
    const careerGoals = student.career_goals || {};
    let targetCompanies = careerGoals.target_companies || [];
    if (careerGoals.dream_company && careerGoals.dream_company !== 'Not specified') {
      targetCompanies = [careerGoals.dream_company, ...targetCompanies];
    }

    if (targetCompanies.length === 0) {
      return Response.json({ warmLeads: [], message: 'No target companies set' });
    }

    const warmLeads = await Promise.all(
      targetCompanies.slice(0, 15).map(async (companyName) => {
        const cacheKey = `alumni_${companyName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${school.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;

        // Check AlumniCountCache
        const existing = await base44.asServiceRole.entities.AlumniCountCache.filter({ cache_key: cacheKey });
        const cached = existing?.[0] || null;
        const cacheAge = cached ? Date.now() - new Date(cached.scraped_at || cached.created_date).getTime() : Infinity;

        if (cached && cacheAge < ONE_WEEK_MS) {
          console.log(`[Cache HIT] ${companyName}`);
          return cached.data;
        }

        const linkedInUrl = COMPANY_LINKEDIN_URLS[companyName];
        if (!linkedInUrl) {
          console.log(`[No LinkedIn URL] ${companyName} — skipping Proxycurl`);
          return { company: companyName, alumni_count: null, confidence: 'unknown', source: 'not_mapped' };
        }

        try {
          const result = await base44.asServiceRole.functions.invoke('proxycurlService', {
            action: 'getAlumniCount',
            params: { companyName, companyLinkedInUrl: linkedInUrl, universityName: school },
          });

          const cacheData = {
            company: companyName,
            alumni_count: result?.alumni_count || 0,
            confidence: 'verified',
            source: 'linkedin_proxycurl',
            hiring_signal: 'unknown',
          };

          if (cached) {
            await base44.asServiceRole.entities.AlumniCountCache.update(cached.id, {
              data: cacheData,
              scraped_at: new Date().toISOString(),
            });
          } else {
            await base44.asServiceRole.entities.AlumniCountCache.create({
              cache_key: cacheKey,
              data: cacheData,
              scraped_at: new Date().toISOString(),
            });
          }

          console.log(`[Proxycurl] ${companyName}: ${cacheData.alumni_count} alumni`);
          return cacheData;
        } catch (err) {
          console.error(`[Proxycurl ERROR] ${companyName}:`, err.message);
          return { company: companyName, alumni_count: null, confidence: 'unknown', source: 'proxycurl_error' };
        }
      })
    );

    const sorted = warmLeads
      .filter(r => r !== null)
      .sort((a, b) => (b.alumni_count || 0) - (a.alumni_count || 0));

    return Response.json({ warmLeads: sorted, school, targetCompanies });
  } catch (error) {
    console.error('[getWarmLeadsWithProxycurl] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});