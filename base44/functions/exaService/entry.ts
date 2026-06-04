import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FUNCTION_TO_KEYWORDS = {
  'Software Engineering': ['engineer', 'developer', 'swe', 'backend', 'frontend'],
  'Product Management': ['product manager', 'pm', 'product lead'],
  'Sales & Business Development': ['sales', 'business development', 'bdr', 'sdr', 'account executive'],
  'Marketing & Brand': ['marketing', 'brand', 'growth', 'content', 'social media'],
  'Finance & Accounting': ['finance', 'accounting', 'analyst', 'audit', 'fp&a'],
  'Operations & Strategy': ['operations', 'strategy', 'chief of staff', 'biz ops'],
  'Data & Analytics': ['data', 'analytics', 'bi', 'sql', 'data science'],
  'Human Resources': ['hr', 'recruiting', 'talent', 'people ops'],
  'Consulting / Advisory': ['consultant', 'advisor', 'associate', 'engagement'],
  'Supply Chain & Logistics': ['supply chain', 'logistics', 'procurement', 'sourcing'],
  'Healthcare / Clinical': ['clinical', 'nursing', 'physician', 'medical'],
  'Legal & Compliance': ['legal', 'compliance', 'counsel', 'attorney'],
};

Deno.serve(async (req) => {
  const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
  if (!EXA_API_KEY) return Response.json({ success: false, error: 'EXA_API_KEY not set' }, { status: 500 });

  const exaFetch = async (endpoint, body) => {
    const res = await fetch(`https://api.exa.ai/${endpoint}`, {
      method: 'POST',
      headers: { 'x-api-key': EXA_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  try {
    const { action, ...params } = await req.json();

    // ── ACTION 1: Company hiring signal ──────────────────────────────
    if (action === 'getHiringSignal') {
      const { companyName, targetFunctions = [], location = '' } = params;
      const functionTitles = targetFunctions.slice(0, 2).join(' or ');
      const query = `${companyName} hiring ${functionTitles || 'entry level'} jobs ${location} 2025`;

      const [hiringData, layoffData] = await Promise.all([
        exaFetch('search', {
          query,
          type: 'auto',
          numResults: 5,
          includeDomains: [
            'greenhouse.io',
            'lever.co',
            'linkedin.com/jobs',
            'jobs.lever.co',
            'boards.greenhouse.io',
            'myworkdayjobs.com',
            'careers.smartrecruiters.com',
            'indeed.com',
          ],
          contents: { highlights: { maxCharacters: 4000 } },
        }),
        exaFetch('search', {
          query: `${companyName} layoffs OR "hiring freeze" OR "headcount reduction" 2024 2025`,
          type: 'auto',
          numResults: 3,
          category: 'news',
          contents: { highlights: { maxCharacters: 2000 } },
        }),
      ]);

      const layoffResults = layoffData.results || [];
      const layoffDetected = layoffResults.some(r => {
        const text = (r.highlights || []).join(' ').toLowerCase();
        return text.includes('layoff') || text.includes('hiring freeze') ||
               text.includes('headcount reduction') || text.includes('laid off');
      });

      const hiringResults = hiringData.results || [];
      const openRoles = hiringResults
        .filter(r => {
          const url = r.url?.toLowerCase() || '';
          return url.includes('greenhouse') || url.includes('lever') ||
                 url.includes('linkedin') || url.includes('workday') ||
                 url.includes('smartrecruiters') || url.includes('indeed');
        })
        .map(r => r.title?.split('|')?.[0]?.trim() || r.title)
        .filter(Boolean)
        .slice(0, 5);

      const jobCount = openRoles.length;

      // Filter by target functions using highlights from valid results
      const functionKeywords = new Set();
      targetFunctions.forEach(fn => (FUNCTION_TO_KEYWORDS[fn] || []).forEach(k => functionKeywords.add(k)));
      const matchedRoles = functionKeywords.size > 0
        ? openRoles.filter(t => [...functionKeywords].some(kw => t.toLowerCase().includes(kw)))
        : openRoles;

      // Confidence: only 'high' when results come from verified job board domains
      const JOB_BOARD_DOMAINS = ['greenhouse.io', 'lever.co', 'boards.greenhouse.io', 'myworkdayjobs.com', 'jobs.lever.co', 'smartrecruiters.com', 'indeed.com'];
      const verifiedJobBoardResults = hiringResults.filter(r => {
        const url = r.url?.toLowerCase() || '';
        return JOB_BOARD_DOMAINS.some(d => url.includes(d));
      });
      const confidence = verifiedJobBoardResults.length > 0 ? 'high' : 'low';

      // Only set active/selective when confidence is high (real job board hits)
      let hiring_signal = 'unknown';
      if (layoffDetected) hiring_signal = 'freeze';
      else if (confidence === 'high' && jobCount >= 3) hiring_signal = 'active';
      else if (confidence === 'high' && jobCount >= 1) hiring_signal = 'selective';

      const growthData = await exaFetch('search', {
        query: `${companyName} funding OR "Series" OR expansion OR growth 2024 2025`,
        type: 'auto',
        numResults: 2,
        category: 'news',
        contents: { highlights: { maxCharacters: 1000 } },
      });

      const growthHighlights = (growthData.results || []).flatMap(r => r.highlights || []);
      const growthDetected = growthHighlights.some(h => {
        const lower = h.toLowerCase();
        return lower.includes('raised') || lower.includes('series') ||
               lower.includes('funding') || lower.includes('expansion');
      });

      return Response.json({
        success: true,
        hiring_signal,
        open_roles: openRoles,
        matched_roles: matchedRoles,
        layoff_alert: layoffDetected
          ? { detected: true, summary: (layoffResults[0]?.highlights?.[0] || '').slice(0, 120) }
          : null,
        growth_signal: growthDetected
          ? { detected: true, summary: growthHighlights[0]?.slice(0, 120) || null }
          : null,
      });
    }

    // ── ACTION 2: Alumni people search ───────────────────────────────
    if (action === 'searchAlumni') {
      const { 
        query: freeTextQuery, 
        universityName: clientUniversityName,
        maxResults = 5
      } = params;

      // Always derive university and FastIQ status from authenticated session — never trust client
      let universityName = clientUniversityName; // fallback for service-role calls
      let isFastIQ = false;
      let sessionUser = null;
      const base44 = createClientFromRequest(req);
      try {
        sessionUser = await base44.auth.me();
        if (sessionUser) {
          const sessionSchool = sessionUser.school_name || sessionUser.school || sessionUser.university;
          if (!sessionSchool) {
            console.warn('[exaService] searchAlumni called by user with no school_code:', sessionUser.email);
            return Response.json({ success: false, error: 'School not set on your profile. Please update your profile to search alumni.', profiles: [] });
          }
          universityName = sessionSchool;
          // Derive FastIQ status from user subscription — never trust client param
          isFastIQ = !!(sessionUser.fastiq_setup_complete || sessionUser.subscription_status === 'active' || sessionUser.membership_tier === 'fastiq' || sessionUser.trial_status === 'active' || sessionUser.fastiq_trial_active === true);
          // Enforce free tier limit for expired trials
          const trialExpired = sessionUser.trial_status === 'expired' && sessionUser.subscription_status !== 'active';
          if (trialExpired) {
            params.maxResults = 1;
          }
        }
      } catch (_) {
        // Service-role internal call — use passed universityName
      }

      if (!universityName) {
        console.warn('[exaService] searchAlumni called with no university name');
        return Response.json({ success: false, error: 'University not set. Please update your profile.', profiles: [] });
      }

      // Build short school name: "University of Florida" → "Florida", "Tulane University" → "Tulane"
      const universityShortName = universityName
        .replace(/^University of /i, '')
        .replace(/ University$/i, '')
        .replace(/ College$/i, '')
        .trim();

      const excludeTerms = `NOT "director of athletics" NOT "assistant coach" NOT "staff" NOT "faculty" NOT "administrator" NOT "department of"`;

      // Build company size keywords to inject into queries based on student's preference
      const companySizePref = sessionUser?.career_goals?.company_size_preference || 'all';
      const sizeKeywords = {
        startup: '"early-stage" OR "seed" OR "series A" OR "series B" OR "co-founder" OR "founding team" OR "startup"',
        midmarket: '"series C" OR "series D" OR "growth stage" OR "scale-up" OR "mid-market"',
        enterprise: '"Fortune 500" OR "enterprise" OR "global" OR "publicly traded" OR "corporate"',
        all: '',
      };
      const sizeClause = sizeKeywords[companySizePref] || '';
      const sizeStr = sizeClause ? ` (${sizeClause})` : '';

      const queries = [
        `${universityShortName} alumnus alumna graduate ${freeTextQuery}${sizeStr} ${excludeTerms}`,
        `studied at ${universityName} ${freeTextQuery} career${sizeStr} ${excludeTerms}`,
        `${universityName} graduate ${freeTextQuery} professional${sizeStr} ${excludeTerms}`,
      ];

      console.log('[Alumni Search] Queries:', queries);

      const exaResults = await Promise.all(
        queries.map(q => exaFetch('search', {
          query: q,
          type: 'auto',
          category: 'people',
          numResults: Math.ceil((maxResults * 2) / queries.length) + 2,
          contents: { highlights: { maxCharacters: 500 } },
        }).catch(() => ({ results: [] })))
      );

      // Merge and deduplicate by URL
      const seen = new Set();
      const rawProfiles = exaResults
        .flatMap(d => d.results || [])
        .filter(r => {
          if (!r?.url || seen.has(r.url)) return false;
          seen.add(r.url);
          return true;
        })
        .map(r => {
          const parts = (r.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
          const full_name = parts[0]?.replace(/\s+Bio$/i, '').trim() || 'Unknown';
          const headline = parts.slice(1).join(' · ') || '';
          const summary = (r.highlights || [])
            .join(' ')
            .replace(/^#+\s*/gm, '')
            .trim()
            .slice(0, 200);
          return { full_name, linkedin_url: r.url, headline, summary, source: 'exa', cff_user_id: null, email: null };
        })
        .filter(p => p.full_name !== 'Unknown' && p.full_name.length < 50);

      // Claude post-filter — remove staff/faculty who work AT the university vs attended it
      let profiles = rawProfiles;
      if (rawProfiles.length > 0) {
        try {
          const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 500,
              messages: [{
                role: 'user',
                content: `A student at ${universityName} is searching for alumni who ATTENDED ${universityName} and now work in: ${freeTextQuery}\n\nFor each person, determine if they are:\nA) An alumnus/alumna who ATTENDED ${universityName} as a student → KEEP\nB) Someone who currently WORKS AT ${universityName} (staff, faculty, administrator, coach, director) → REMOVE\nC) Unclear → REMOVE to be safe\n\nResults:\n${rawProfiles.map((p, i) => `${i + 1}. ${p.full_name} — ${p.headline}`).join('\n')}\n\nReturn ONLY a JSON array of the numbers to KEEP, e.g. [1, 3, 4]\nNo markdown, no explanation.`,
              }],
            }),
          });
          const claudeData = await claudeRes.json();
          const rawText = claudeData?.content?.[0]?.text || '[]';
          let keepIndices;
          try {
            keepIndices = new Set(JSON.parse(rawText.replace(/```json|```/g, '').trim()));
          } catch {
            keepIndices = new Set(rawProfiles.map((_, i) => i + 1));
          }
          const filteredProfiles = rawProfiles.filter((_, i) => keepIndices.has(i + 1));
          console.log(`[Alumni Search] Raw results: ${rawProfiles.length}, After Claude filter: ${filteredProfiles.length}`);
          console.log(`[Alumni Search] Removed as non-alumni:`, rawProfiles.filter((_, i) => !keepIndices.has(i + 1)).map(p => p.full_name));
          profiles = filteredProfiles;
        } catch (e) {
          console.warn('[Alumni Search] Claude filter failed, using raw results:', e.message);
        }
      }

      profiles = profiles.slice(0, maxResults);

      // Log feature usage
      if (sessionUser) {
        base44.asServiceRole.entities.AnalyticsEvent.create({
          event_name: 'fastiq_feature_used',
          user_id: sessionUser.id,
          user_email: sessionUser.email,
          school_code: universityName || '',
          properties: { feature_type: 'alumni_search', results_count: profiles.length },
        }).catch(() => {});
      }

      // Exa-only profiles (Proxycurl/NinjaPear is sunset)
      return Response.json({ 
        success: true, 
        profiles, 
        total_count: profiles.length, 
        source: 'exa_people_search' 
      });
    }

    // ── ACTION 3: Live public job listings with age risk ─────────────
    // Sources niche/non-mainstream job boards only — NOT LinkedIn or Indeed
    if (action === 'getLivePublicListings') {
      const { targetRoles = [], targetIndustries = [], location = '', limit = 6 } = params;

      // Only pure ATS subdomains — every URL on these domains IS a job posting by design
      const NICHE_DOMAINS = [
        'jobs.lever.co',        // Lever ATS — always a job posting URL
        'boards.greenhouse.io', // Greenhouse ATS — always a job posting URL
        'jobs.ashbyhq.com',     // Ashby ATS — always a job posting URL
        'apply.workable.com',   // Workable ATS — always a job posting URL
      ];

      const NICHE_SOURCE_LABELS = {
        'jobs.lever.co': 'Lever',
        'boards.greenhouse.io': 'Greenhouse',
        'jobs.ashbyhq.com': 'Ashby',
        'apply.workable.com': 'Workable',
      };

      const roleQuery = targetRoles.slice(0, 3).join(' OR ') || 'entry level analyst';
      const locationStr = location ? ` ${location}` : '';
      // Use keyword search — Exa neural search drifts to articles; keyword keeps it grounded on job boards
      const query = `(${roleQuery}) (entry level OR junior OR associate OR new grad OR internship) ${locationStr}`;

      const searchRes = await exaFetch('search', {
        query,
        type: 'keyword',
        numResults: Math.min(limit * 3, 20),
        includeDomains: NICHE_DOMAINS,
        contents: { highlights: { maxCharacters: 600 } },
        startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const results = searchRes.results || [];

      const SENIOR_KEYWORDS = /\b(senior|sr\b|lead|principal|director|manager|head of|vp\b|vice president|staff engineer|architect|managing partner)\b/i;

      // ATS job posting URL patterns — these subdomains ONLY serve job postings
      const JOB_URL_PATTERNS = [
        /^https:\/\/jobs\.lever\.co\//,
        /^https:\/\/boards\.greenhouse\.io\//,
        /^https:\/\/jobs\.ashbyhq\.com\//,
        /^https:\/\/apply\.workable\.com\//,
      ];

      const jobs = results
        .filter(r => {
          if (!r.url || !r.title) return false;
          if (SENIOR_KEYWORDS.test(r.title)) return false;
          // Must match a real ATS job posting URL pattern
          const matchesJobUrl = JOB_URL_PATTERNS.some(p => p.test(r.url));
          if (!matchesJobUrl) return false;
          return true;
        })
        .map(r => {
          // Calculate age in days
          const publishedDate = r.publishedDate ? new Date(r.publishedDate) : null;
          const daysLive = publishedDate
            ? Math.max(0, Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)))
            : null;

          let riskLevel = 'LOW';
          if (daysLive !== null) {
            if (daysLive > 6) riskLevel = 'HIGH';
            else if (daysLive > 3) riskLevel = 'MEDIUM';
          }

          // Extract company from ATS URL slug (most reliable for Lever/Greenhouse)
          const urlMatch = r.url?.match(/(?:jobs\.lever\.co|boards\.greenhouse\.io|jobs\.ashbyhq\.com|apply\.workable\.com)\/([^/]+)/);
          const companySlug = urlMatch ? urlMatch[1] : '';
          const companyName = companySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

          // Extract job title: try snippet header (## Title), then page title parts, then URL-based guess
          const snippetText = (r.highlights || []).join(' ');
          const snippetHeaderMatch = snippetText.match(/##\s*([^\n\[]+)/);
          const rawTitle = r.title || '';
          // Page title for ATS boards is often "Company Name | Job Title" or just company
          const titleAfterPipe = rawTitle.split(/[|·]/).map(s => s.trim()).filter(Boolean);
          const roleWords = /\b(engineer|analyst|associate|intern|coordinator|specialist|manager|developer|designer|consultant|researcher|scientist|writer|advisor|representative|assistant|strategist|accountant)\b/i;
          const titleCandidate = titleAfterPipe.find(p => roleWords.test(p));
          
          let jobTitle = snippetHeaderMatch?.[1]?.trim() || titleCandidate || rawTitle;

          // Determine niche source label
          const matchedDomain = NICHE_DOMAINS.find(d => r.url?.includes(d));
          const source = matchedDomain ? (NICHE_SOURCE_LABELS[matchedDomain] || matchedDomain) : 'Niche Board';

          return {
            id: r.id || r.url,
            title: jobTitle,
            companyName,
            sourceUrl: r.url,
            source,
            daysLive,
            riskLevel,
            publishedDate: publishedDate?.toISOString() || null,
            snippet: (r.highlights || [])[0] || '',
          };
        })
        .filter(j => j.title)
        .slice(0, limit);

      return Response.json({ success: true, jobs });
    }

    return Response.json({ success: false, error: 'Unknown action' });
  } catch (e) {
    console.error('[exaService] Error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});