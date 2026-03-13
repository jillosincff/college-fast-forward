import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Explorer interest-to-industry mapping
const INTEREST_INDUSTRY_MAP = {
  tech_ai: ['Technology & Software', 'Engineering'],
  creative: ['Media & Entertainment', 'Marketing'],
  high_pay: ['Finance & Banking', 'Consulting'],
  helping: ['Healthcare', 'Non-Profit', 'Education'],
  travel: ['Consulting', 'Hospitality'],
  startups: ['Technology & Software', 'Retail'],
  not_sure: ['Technology & Software', 'Finance & Banking', 'Consulting'],
};

// Explorer path labels
const INTEREST_PATH_LABELS = {
  tech_ai: 'Tech & AI Product',
  creative: 'Creative & Design',
  high_pay: 'Finance & Investment',
  helping: 'Healthcare & Impact',
  travel: 'Consulting & Strategy',
  startups: 'Startup & Venture',
  not_sure: 'Business & Strategy',
};

// Fallback companies per industry when no DiscoveredAlumni exist
const INDUSTRY_EXAMPLE_COMPANIES = {
  'Technology & Software': ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta'],
  'Finance & Banking': ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley', 'Citadel'],
  'Consulting': ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture'],
  'Marketing': ['Procter & Gamble', 'Nike', 'Coca-Cola', 'HubSpot'],
  'Healthcare': ['UnitedHealth', 'Mayo Clinic', 'Pfizer', 'Johnson & Johnson'],
  'Engineering': ['SpaceX', 'Lockheed Martin', 'Boeing', 'Tesla'],
  'Media & Entertainment': ['Disney', 'Netflix', 'Warner Bros', 'Spotify'],
  'Education': ['Teach For America', 'Coursera', 'Khan Academy'],
  'Non-Profit': ['Red Cross', 'United Way', 'Habitat for Humanity'],
  'Hospitality': ['Marriott', 'Hilton', 'Airbnb'],
  'Retail': ['Amazon', 'Shopify', 'Target'],
};

function blurName(name) {
  if (!name) return 'UF Alum';
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
  return `${first} ${lastInitial}`;
}

function extractGradYear(degreeInfo) {
  if (!degreeInfo) return null;
  const match = degreeInfo.match(/'?\d{2,4}/);
  if (match) {
    const yr = match[0].replace("'", '');
    return yr.length === 2 ? `'${yr}` : `'${yr.slice(-2)}`;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { answers = {} } = body;
    const { major, grad_year, companies = [], industries = [], interests = [] } = answers;
    const isKnown = companies.length > 0;

    // ── KNOWN TARGETS PATH ──
    if (isKnown) {
      const companyCounts = {};
      const teaserCards = [];

      for (const company of companies.slice(0, 5)) {
        let alumni = [];
        try {
          alumni = await base44.asServiceRole.entities.DiscoveredAlumni.filter(
            { company, school_code: 'UF' },
            '-match_score',
            10
          );
          // Filter to match_score > 65
          alumni = alumni.filter(a => (a.match_score || 0) > 65);
        } catch (e) {
          console.log(`No alumni found for ${company}:`, e.message);
        }

        const count = alumni.length || (2 + Math.floor(Math.random() * 4));
        companyCounts[company] = count;

        // Pick top 1 alumni for teaser card
        if (alumni.length > 0) {
          const top = alumni[0];
          teaserCards.push({
            company: top.company,
            roleTitle: top.role_title || 'Professional',
            blurredName: blurName(top.name),
            gradYear: extractGradYear(top.degree_info) || "'20",
            matchReason: `Works at ${top.company}${top.match_score ? ` · ${top.match_score}% match` : ''}`,
          });
        } else {
          // Synthetic teaser with varied roles/years when no real data
          const syntheticRoles = [
            { role: 'Product Marketing Manager', year: "'21" },
            { role: 'Software Engineer', year: "'19" },
            { role: 'Strategy Consultant', year: "'22" },
            { role: 'Financial Analyst', year: "'20" },
            { role: 'Program Manager', year: "'23" },
          ];
          const syntheticReasons = [
            `Strong match for your ${major || 'target'} background`,
            `High response rate — open to coffee chats`,
            `Referred 2 interns last cycle`,
            `Active on CFF — recently helped a student`,
            `Works in your target area`,
          ];
          const pick = syntheticRoles[teaserCards.length % syntheticRoles.length];
          const reason = syntheticReasons[teaserCards.length % syntheticReasons.length];
          teaserCards.push({
            company,
            roleTitle: `${pick.role}`,
            blurredName: 'UF Alum',
            gradYear: pick.year,
            matchReason: reason,
          });
        }
      }

      const totalMatches = Object.values(companyCounts).reduce((a, b) => a + b, 0);

      return Response.json({
        type: 'known',
        teaserCount: totalMatches,
        totalMatches,
        companyCounts,
        teasers: teaserCards.slice(0, 3),
      });
    }

    // ── EXPLORER PATH ──
    // Map interests to industries, then find alumni
    const targetIndustries = new Set();
    (interests.length > 0 ? interests : ['not_sure']).forEach(i => {
      (INTEREST_INDUSTRY_MAP[i] || INTEREST_INDUSTRY_MAP.not_sure).forEach(ind => targetIndustries.add(ind));
    });
    // Also add explicitly selected industries
    industries.forEach(ind => targetIndustries.add(ind));

    const paths = [];
    let totalMatches = 0;

    const interestKeys = interests.length > 0 ? interests.slice(0, 3) : ['not_sure'];

    for (const interestKey of interestKeys) {
      const mappedIndustries = INTEREST_INDUSTRY_MAP[interestKey] || INTEREST_INDUSTRY_MAP.not_sure;
      const pathLabel = INTEREST_PATH_LABELS[interestKey] || 'Career Path';

      // Try to find real alumni for this interest cluster
      let bestAlumni = null;
      for (const industry of mappedIndustries) {
        const exampleCompanies = INDUSTRY_EXAMPLE_COMPANIES[industry] || [];
        for (const comp of exampleCompanies.slice(0, 3)) {
          try {
            const results = await base44.asServiceRole.entities.DiscoveredAlumni.filter(
              { company: comp, school_code: 'UF' },
              '-match_score',
              3
            );
            if (results.length > 0) {
              bestAlumni = results[0];
              break;
            }
          } catch (e) {
            // continue
          }
        }
        if (bestAlumni) break;
      }

      const pathCount = 3 + Math.floor(Math.random() * 8);
      totalMatches += pathCount;

      if (bestAlumni) {
        paths.push({
          path: pathLabel,
          company: bestAlumni.company,
          roleTitle: bestAlumni.role_title || 'Professional',
          blurredName: blurName(bestAlumni.name),
          gradYear: extractGradYear(bestAlumni.degree_info) || "'20",
          matchReason: `${pathLabel} at ${bestAlumni.company}`,
          count: pathCount,
        });
      } else {
        // Synthetic fallback with varied roles
        const fallbackCompany = (INDUSTRY_EXAMPLE_COMPANIES[mappedIndustries[0]] || ['Company'])[0];
        const explorerRoles = [
          { role: 'Associate Product Manager', year: "'22" },
          { role: 'Marketing Analyst', year: "'21" },
          { role: 'Investment Banking Analyst', year: "'23" },
          { role: 'UX Researcher', year: "'20" },
          { role: 'Data Scientist', year: "'19" },
        ];
        const pick = explorerRoles[paths.length % explorerRoles.length];
        paths.push({
          path: pathLabel,
          company: fallbackCompany,
          roleTitle: pick.role,
          blurredName: 'UF Alum',
          gradYear: pick.year,
          matchReason: `${pathLabel} at ${fallbackCompany} · High response rate`,
          count: pathCount,
        });
      }
    }

    return Response.json({
      type: 'explorer',
      teaserCount: totalMatches,
      totalMatches,
      paths,
      teasers: paths,
    });

  } catch (error) {
    console.error('Alumni teaser error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});