import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — reflects new parent joins quickly
const MIN_SKELETON_MS = 400;

// In-memory cache keyed by studentId
const memCache = {};

// ─── Company size classification ───
const SIZE_MAP = {
  'notion': 'startup', 'linear': 'startup', 'figma': 'startup', 'canva': 'mid',
  'duolingo': 'mid', 'mailchimp': 'mid', 'stripe': 'mid',
  'google': 'large', 'microsoft': 'large', 'goldman sachs': 'large',
  'jpmorgan': 'large', 'deloitte': 'large', 'mckinsey': 'large',
  'pwc': 'large', 'ey': 'large', 'kpmg': 'large', 'amazon': 'large',
  'apple': 'large', 'meta': 'large', 'nike': 'large',
};

function classifySize(name) {
  return SIZE_MAP[name.toLowerCase()] || 'mid';
}

// ─── Dynamic "why recommended" line ───
function generateWhyRecommended(company, goals) {
  const school = goals.university || 'your school';
  const industry = goals.industries?.[0] || 'your target industry';

  if (company.warm_path_strength === 'very_strong') {
    return `Your strongest opportunity — ${company.alumni_count} ${school} alumni and ${company.cff_connection_count} CFF parents work here`;
  }
  if (company.connection_type === 'alumni' && company.school_match) {
    return `${company.alumni_count} ${school} alumni work here — warm path available`;
  }
  if (company.connection_type === 'parent' && company.open_to_intro) {
    return `A CFF parent here is open to making introductions for students like you`;
  }
  if (company.connection_type === 'parent') {
    return `CFF parent works here — connection available through the network`;
  }
  if (company.gap_fill && company.hiring_signal === 'hot') {
    return `Actively hiring in your target industries — no CFF connections yet`;
  }
  if (company.gap_fill) {
    return `Strong match for your goals — be the first ${school} student to build a path here`;
  }
  return `Matches your ${industry} background`;
}

// ─── Apply size preference weighting as tiebreaker ───
function applyPreferenceWeighting(companies, sizePreference) {
  if (!sizePreference || sizePreference.length === 0) return companies;
  const weights = {};
  sizePreference.forEach((size, i) => { weights[size] = sizePreference.length - i; });

  return [...companies].sort((a, b) => {
    const strengthScore = { very_strong: 4, strong: 3, moderate: 2, none: 1 };
    const as = strengthScore[a.warm_path_strength] || 1;
    const bs = strengthScore[b.warm_path_strength] || 1;
    if (as !== bs) return bs - as;
    return (weights[b.size] || 0) - (weights[a.size] || 0);
  });
}

// ─── Enrich with CompanyIntelCache hiring signals ───
async function enrichWithHiringSignals(companies) {
  try {
    const cached = await base44.entities.CompanyIntelCache.list('-hiring_score', 200);
    return companies.map(company => {
      const intel = cached.find(c =>
        c.company_name?.toLowerCase() === company.name.toLowerCase()
      );
      if (intel) {
        return {
          ...company,
          hiring_signal: intel.hiring_signal || 'warm',
          hiring_score: intel.hiring_score,
          hiring_description: intel.intel_summary || intel.recommendation_text || '',
          has_intel: true,
        };
      }
      return { ...company, hiring_signal: 'warm', has_intel: false };
    });
  } catch {
    return companies.map(c => ({ ...c, hiring_signal: 'warm', has_intel: false }));
  }
}

// ─── Gap fill from CompanyIntelCache ───
async function getGapFillCompanies(goals, excludeNames, count) {
  try {
    const cached = await base44.entities.CompanyIntelCache.list('-hiring_score', 50);
    const excludeLower = excludeNames.map(n => n.toLowerCase());
    const matches = cached.filter(c => {
      if (!c.company_name) return false;
      if (excludeLower.includes(c.company_name.toLowerCase())) return false;
      return c.hiring_signal === 'hot' || c.hiring_signal === 'warm';
    }).slice(0, count);

    if (matches.length > 0) {
      return matches.map(c => ({
        name: c.company_name,
        industry: '',
        hiring_signal: c.hiring_signal || 'warm',
        hiring_description: c.intel_summary || c.recommendation_text || '',
        cff_connection_count: 0,
        connection_type: 'none',
        warm_path_strength: 'none',
        size: classifySize(c.company_name),
        source: 'intel_cache',
        gap_fill: true,
        has_intel: true,
      }));
    }
  } catch { /* fall through */ }

  // Hardcoded last resort
  const primaryIndustry = goals.industries?.[0];
  const HARDCODED = {
    'Technology, Information & Media': [
      { name: 'Google', industry: 'Technology', hiring_signal: 'hot', hiring_description: 'Actively hiring for entry-level roles across multiple teams.' },
      { name: 'Microsoft', industry: 'Technology', hiring_signal: 'hot', hiring_description: 'Strong entry-level and internship programs across all divisions.' },
      { name: 'Spotify', industry: 'Media & Tech', hiring_signal: 'warm', hiring_description: 'Hiring for marketing, product, and engineering roles.' },
    ],
    'Finance & Insurance': [
      { name: 'JPMorgan', industry: 'Finance', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles nationwide.' },
      { name: 'Goldman Sachs', industry: 'Finance', hiring_signal: 'warm', hiring_description: 'Summer analyst applications open for investment banking division.' },
      { name: 'Deloitte', industry: 'Consulting', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.' },
    ],
    'Advertising & PR': [
      { name: 'Edelman', industry: 'PR', hiring_signal: 'hot', hiring_description: 'Actively hiring communications and PR associates.' },
      { name: 'Ogilvy', industry: 'Advertising', hiring_signal: 'warm', hiring_description: 'Creative and account management roles for recent grads.' },
      { name: 'WPP', industry: 'Advertising', hiring_signal: 'warm', hiring_description: 'Entry-level opportunities across global agency network.' },
    ],
    'Sports & Entertainment': [
      { name: 'Live Nation', industry: 'Entertainment', hiring_signal: 'hot', hiring_description: 'Entry-level roles in events, marketing, and operations.' },
      { name: 'ESPN', industry: 'Sports Media', hiring_signal: 'warm', hiring_description: 'Hiring for content, production, and marketing roles.' },
      { name: 'Nike', industry: 'Sports & Consumer', hiring_signal: 'warm', hiring_description: 'Brand marketing and product roles for recent grads.' },
    ],
    'Healthcare & Pharmaceuticals': [
      { name: 'Johnson & Johnson', industry: 'Healthcare', hiring_signal: 'hot', hiring_description: 'Large rotational programs for recent graduates.' },
      { name: 'CVS Health', industry: 'Healthcare', hiring_signal: 'hot', hiring_description: 'Operations and management training programs nationwide.' },
      { name: 'Pfizer', industry: 'Pharmaceuticals', hiring_signal: 'warm', hiring_description: 'Entry-level roles in research, sales, and operations.' },
    ],
    'Professional Services': [
      { name: 'PwC', industry: 'Accounting', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for audit, tax, and advisory.' },
      { name: 'EY', industry: 'Accounting', hiring_signal: 'hot', hiring_description: 'Entry-level associate roles across all service lines.' },
      { name: 'McKinsey', industry: 'Consulting', hiring_signal: 'warm', hiring_description: 'Business analyst roles for top undergraduates.' },
    ],
    'Retail & Consumer Goods': [
      { name: 'Procter & Gamble', industry: 'Consumer Goods', hiring_signal: 'hot', hiring_description: 'Brand management and operations roles for recent grads.' },
      { name: 'Target', industry: 'Retail', hiring_signal: 'hot', hiring_description: 'Store leadership and corporate rotational programs.' },
      { name: 'Unilever', industry: 'Consumer Goods', hiring_signal: 'warm', hiring_description: 'Future Leaders Program for top undergraduates.' },
    ],
  };
  const fallback = HARDCODED[primaryIndustry] || [
    { name: 'Deloitte', industry: 'Consulting', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.' },
    { name: 'Google', industry: 'Technology', hiring_signal: 'hot', hiring_description: 'Actively hiring for entry-level roles across multiple teams.' },
    { name: 'JPMorgan', industry: 'Finance', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles.' },
  ];
  const excludeLower = excludeNames.map(n => n.toLowerCase());
  return fallback
    .filter(c => !excludeLower.includes(c.name.toLowerCase()))
    .slice(0, count)
    .map(c => ({
      ...c,
      cff_connection_count: 0,
      connection_type: 'none',
      warm_path_strength: 'none',
      size: classifySize(c.name),
      source: 'hardcoded',
      gap_fill: true,
      has_intel: false,
      is_fallback: true,
    }));
}

// ─── MAIN QUERY — Network-first ───
async function getNetworkFirstRecommendations(goals, userId) {
  const industries = goals.industries || [];
  const targetCompanies = goals.target_companies || [];
  const university = goals.university || '';
  const industriesLower = industries.map(i => i.toLowerCase());
  const schoolWord = university.toLowerCase().split(' ')[0];

  const results = [];

  try {
    // Fetch all eligible CFF members in one call
    const allUsers = await base44.entities.User.list('-created_date', 500);

    // ─── Layer 1: CFF Parents by industry ───
    const parentMap = {};
    allUsers.forEach(u => {
      if (u.persona !== 'parent' && !u.roles?.includes('parent')) return;
      if (!u.show_in_directory && !u.directory_visible && !u.is_directory_visible) return;
      const company = (u.company || u.current_company || '').trim();
      if (!company) return;
      const uIndustry = (u.industry || '').toLowerCase();
      const industryMatch = industriesLower.length === 0 || industriesLower.some(i => uIndustry.includes(i.split(',')[0].trim()));
      const companyMatch = targetCompanies.some(t => company.toLowerCase().includes(t.toLowerCase()));
      if (!industryMatch && !companyMatch) return;

      const key = company.toLowerCase();
      if (!parentMap[key]) {
        parentMap[key] = {
          name: company,
          industry: u.industry || '',
          cff_connection_count: 0,
          open_to_intro: false,
          connection_type: 'parent',
          school_match: false,
          alumni_count: 0,
          warm_path_strength: 'moderate',
          source: 'cff_network',
          gap_fill: false,
        };
      }
      parentMap[key].cff_connection_count++;
      if (u.intro_availability === 'happy_to_help' || u.open_to_intro) {
        parentMap[key].open_to_intro = true;
        parentMap[key].warm_path_strength = 'strong';
      }
    });

    Object.values(parentMap).forEach(c => results.push(c));

    // ─── Layer 2: Alumni from student's school ───
    allUsers.forEach(u => {
      if (u.persona !== 'alumni' && !u.roles?.includes('alumni')) return;
      if (!u.show_in_directory && !u.directory_visible && !u.is_directory_visible) return;
      const company = (u.company || u.current_company || '').trim();
      if (!company) return;
      const uSchool = (u.school || u.university || '').toLowerCase();
      const schoolMatch = schoolWord && uSchool.includes(schoolWord);
      const uIndustry = (u.industry || '').toLowerCase();
      const industryMatch = industriesLower.length === 0 || industriesLower.some(i => uIndustry.includes(i.split(',')[0].trim()));
      if (!industryMatch && !schoolMatch) return;

      const key = company.toLowerCase();
      const existing = results.find(r => r.name.toLowerCase() === key);
      if (existing) {
        existing.school_match = existing.school_match || schoolMatch;
        existing.alumni_count = (existing.alumni_count || 0) + 1;
        existing.cff_connection_count++;
        existing.connection_type = existing.connection_type === 'parent' ? 'both' : 'alumni';
        if (existing.connection_type === 'both') existing.warm_path_strength = 'very_strong';
        else if (schoolMatch) existing.warm_path_strength = 'strong';
      } else {
        results.push({
          name: company,
          industry: u.industry || '',
          cff_connection_count: 1,
          connection_type: 'alumni',
          school_match: schoolMatch,
          alumni_count: 1,
          open_to_intro: false,
          warm_path_strength: schoolMatch ? 'strong' : 'moderate',
          source: 'cff_network',
          gap_fill: false,
        });
      }
    });
  } catch (e) {
    console.warn('Network query failed:', e.message);
  }

  // ─── Layer 3: Apply size classification ───
  results.forEach(c => { c.size = c.size || classifySize(c.name); });

  // ─── Layer 4: Enrich with hiring signals ───
  const enriched = await enrichWithHiringSignals(results);

  // ─── Layer 5: Gap fill if fewer than 3 ───
  if (enriched.length < 3) {
    const gaps = 3 - enriched.length;
    const gapFills = await getGapFillCompanies(goals, enriched.map(r => r.name), gaps);
    enriched.push(...gapFills);
  }

  // ─── Layer 6: Apply size preference + sort by warm_path_strength ───
  const sorted = applyPreferenceWeighting(enriched, goals.company_size_preference);

  // ─── Generate why_recommended for each ───
  sorted.forEach(c => {
    c.why_recommended = generateWhyRecommended(c, { ...goals, university });
  });

  return sorted.slice(0, 5);
}

export function useCompanyRecs(user) {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [weeklyNewCount, setWeeklyNewCount] = useState(null);

  const fetchRecs = useCallback(async () => {
    if (!user?.email) return;

    const goals = {
      target_companies: user?.career_goals?.target_companies || user?.target_companies || [],
      industries: user?.career_goals?.industries || user?.target_industries || [],
      locations: user?.career_goals?.locations || user?.location_preferences || [],
      company_size_preference: user?.career_goals?.company_size_preference || ['large', 'mid', 'startup'],
      university: user?.school || user?.university || '',
    };

    const cacheKey = `network_recs_${user.id || user.email}_${JSON.stringify(goals.industries)}_${JSON.stringify(goals.target_companies)}`;
    const now = Date.now();
    const cached = memCache[cacheKey];
    if (cached && (now - cached.ts < CACHE_TTL_MS)) {
      setCompanies(cached.data);
      setWeeklyNewCount(cached.weeklyCount);
      return;
    }

    setLoading(true);
    setError(false);
    setCompanies(null);

    const startTime = Date.now();

    // Hard cap: 2s max skeleton time
    const maxTimer = setTimeout(async () => {
      const fallback = await getGapFillCompanies(goals, [], 3);
      fallback.forEach(c => { c.why_recommended = generateWhyRecommended(c, goals); });
      setCompanies(fallback);
      setLoading(false);
    }, 2000);

    try {
      // Fetch weekly new parent count in parallel
      const [results, allRecentUsers] = await Promise.all([
        getNetworkFirstRecommendations(goals, user.id),
        base44.entities.User.filter({ persona: 'parent' }, '-created_date', 20).catch(() => []),
      ]);

      clearTimeout(maxTimer);

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const weeklyCount = allRecentUsers.filter(u => u.created_date > oneWeekAgo).length;

      memCache[cacheKey] = { data: results, ts: now, weeklyCount };

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SKELETON_MS) {
        await new Promise(r => setTimeout(r, MIN_SKELETON_MS - elapsed));
      }

      setCompanies(results);
      setWeeklyNewCount(weeklyCount);
    } catch (err) {
      clearTimeout(maxTimer);
      console.error('Network-first recs failed:', err.message);
      const fallback = await getGapFillCompanies(goals, [], 3).catch(() => []);
      fallback.forEach(c => { c.why_recommended = generateWhyRecommended(c, goals); });
      setCompanies(fallback.length > 0 ? fallback : null);
      setError(fallback.length === 0);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.id, JSON.stringify(user?.career_goals)]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  return { companies, loading, error, weeklyNewCount, refetch: fetchRecs };
}