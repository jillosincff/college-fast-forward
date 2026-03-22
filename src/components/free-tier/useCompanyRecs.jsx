import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getCFFNetworkMatchesFn } from '@/functions/getCFFNetworkMatchesFn';
import { getLiveJobMatchesFn } from '@/functions/getLiveJobMatchesFn';

const CACHE_TTL_MS = 60 * 60 * 1000;
const MIN_SKELETON_MS = 600;
const SEARCH_TIMEOUT = 50000; // LLM+web search can take 20-40s

// In-flight deduplication — prevents double calls from React StrictMode / dual mounts
const inFlightRequests = {};

const memCache = {};

function inferIndustryFromRole(role) {
  if (!role) return null;
  const r = role.toLowerCase();
  const map = [
    // Construction BEFORE healthcare — order matters, first match wins
    { k: ['construction', 'superintendent', 'contractor', 'general contractor', 'subcontractor', 'civil engineer', 'structural engineer', 'architect', 'architecture', 'real estate', 'property manager', 'facilities', 'estimator', 'foreman', 'site manager', 'infrastructure', 'real estate developer'], v: 'Construction & Agriculture' },
    // Healthcare — require clinical/medical specificity
    { k: ['nurse', 'nursing', ' rn ', 'registered nurse', 'lpn', 'cna', 'physical therapist', 'occupational therapist', 'physician', 'doctor', 'medical doctor', 'surgeon', 'dentist', 'dental', 'pharmacist', 'pharmacy', 'radiologist', 'paramedic', 'emt', 'speech therapist', 'respiratory therapist', 'clinical', 'patient care', 'healthcare worker', 'health aide', 'medical assistant', 'hospital administrator'], v: 'Healthcare & Pharmaceuticals' },
    { k: ['investment banking','banker','finance','financial','accounting','accountant','cpa','portfolio','wealth management','private equity','hedge fund','trading','trader','actuary','insurance'], v: 'Finance & Insurance' },
    { k: ['software','engineer','developer','coding','programming','data science','data scientist','machine learning','product manager','ux ','ui ','cyber','devops','cloud','tech','information technology'], v: 'Technology, Information & Media' },
    { k: ['marketing','brand','advertising','social media','content','public relations','communications','digital marketing','seo','copywriter','creative'], v: 'Advertising & PR' },
    { k: ['sports','entertainment','music','film',' tv ','television','journalism','broadcast','athletic','coaching','talent agent'], v: 'Sports & Entertainment' },
    { k: ['consulting','consultant','strategy','management consulting','advisory'], v: 'Professional Services' },
    { k: ['teacher','teaching','education','school','professor','tutor','curriculum','instructional'], v: 'Education & Training' },
    { k: ['retail','consumer goods','merchandise','buying','fashion','apparel','ecommerce','e-commerce'], v: 'Retail & Consumer Goods' },
    { k: ['law','lawyer','attorney','legal','paralegal','litigation','compliance'], v: 'Professional Services' },
    { k: ['government','federal','policy','public sector','nonprofit','non-profit','ngo','advocacy'], v: 'Government & Public Sector' },
    { k: ['logistics','supply chain','transportation','shipping','warehouse','procurement'], v: 'Transportation & Logistics' },
  ];
  for (const { k, v } of map) {
    if (k.some(kw => r.includes(kw))) return v;
  }
  return null;
}

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
  const primaryIndustry = goals.industries?.[0];
  const sizePreference = goals.company_size_preference || ['large', 'mid', 'startup'];

  const SIZE_AWARE = {
    'Healthcare & Pharmaceuticals': [
      { name: 'HCA Healthcare', hiring_signal: 'hot', size: 'large', hiring_description: 'One of the largest hospital networks in the US — actively hiring nurses.' },
      { name: 'Mayo Clinic', hiring_signal: 'hot', size: 'large', hiring_description: 'Top-ranked hospital system with strong nursing programs.' },
      { name: 'Carbon Health', hiring_signal: 'hot', size: 'startup', hiring_description: 'Tech-enabled primary care startup rapidly expanding clinical teams.' },
      { name: 'CVS Health', hiring_signal: 'hot', size: 'large', hiring_description: 'Hiring nurses and clinical staff for pharmacy and MinuteClinic locations.' },
      { name: 'AdventHealth', hiring_signal: 'hot', size: 'mid', hiring_description: 'Faith-based hospital network with strong nursing culture.' },
    ],
    'Technology, Information & Media': [
      { name: 'Ramp', hiring_signal: 'hot', size: 'startup', hiring_description: 'Fast-growing fintech — real ownership from day one.' },
      { name: 'Google', hiring_signal: 'hot', size: 'large', hiring_description: 'Entry-level roles across engineering and business.' },
      { name: 'Duolingo', hiring_signal: 'hot', size: 'mid', hiring_description: 'Fast-growing edtech with analyst and product roles.' },
      { name: 'Linear', hiring_signal: 'warm', size: 'startup', hiring_description: 'Project management startup — data and analytics roles.' },
      { name: 'Microsoft', hiring_signal: 'hot', size: 'large', hiring_description: 'Strong new grad programs across all divisions.' },
    ],
    'Finance & Insurance': [
      { name: 'Ramp', hiring_signal: 'hot', size: 'startup', hiring_description: 'Fast-growing fintech — finance analyst roles with real ownership.' },
      { name: 'JPMorgan', hiring_signal: 'hot', size: 'large', hiring_description: 'Large-scale hiring for finance and operations analyst roles.' },
      { name: 'SoFi', hiring_signal: 'hot', size: 'mid', hiring_description: 'Personal finance platform hiring in analytics and operations.' },
      { name: 'Brex', hiring_signal: 'hot', size: 'startup', hiring_description: 'Corporate spend management startup — finance analyst roles.' },
      { name: 'Goldman Sachs', hiring_signal: 'warm', size: 'large', hiring_description: 'Analyst programs open for investment banking division.' },
    ],
    'Construction & Agriculture': [
      { name: 'Turner Construction', hiring_signal: 'hot', size: 'large', hiring_description: 'One of the largest US construction firms — hiring project managers.' },
      { name: 'Procore', hiring_signal: 'hot', size: 'startup', hiring_description: 'Construction management software — sales and customer success roles.' },
      { name: 'DPR Construction', hiring_signal: 'hot', size: 'mid', hiring_description: 'Employee-owned builder with strong entry-level project management.' },
      { name: 'AECOM', hiring_signal: 'hot', size: 'large', hiring_description: 'Global infrastructure firm — project management roles across the US.' },
      { name: 'Hines', hiring_signal: 'warm', size: 'mid', hiring_description: 'Real estate firm with construction management programs.' },
    ],
  };

  const DEFAULT_BY_SIZE = {
    large: [
      { name: 'Deloitte', hiring_signal: 'hot', size: 'large', hiring_description: 'Hiring consultants and analysts nationwide.' },
      { name: 'JPMorgan', hiring_signal: 'hot', size: 'large', hiring_description: 'Large-scale hiring for finance and operations roles.' },
      { name: 'Google', hiring_signal: 'hot', size: 'large', hiring_description: 'Entry-level roles across multiple teams.' },
    ],
    mid: [
      { name: 'Duolingo', hiring_signal: 'hot', size: 'mid', hiring_description: 'Fast-growing edtech with strong culture.' },
      { name: 'Canva', hiring_signal: 'hot', size: 'mid', hiring_description: 'Design platform scaling rapidly.' },
      { name: 'SoFi', hiring_signal: 'warm', size: 'mid', hiring_description: 'Personal finance platform with analyst roles.' },
    ],
    startup: [
      { name: 'Ramp', hiring_signal: 'hot', size: 'startup', hiring_description: 'Fast-growing fintech — real ownership from day one.' },
      { name: 'Linear', hiring_signal: 'warm', size: 'startup', hiring_description: 'Project management startup with a culture of craft.' },
      { name: 'Retool', hiring_signal: 'warm', size: 'startup', hiring_description: 'Internal tools startup — broad exposure and fast learning.' },
    ],
  };

  const pool = SIZE_AWARE[primaryIndustry] || null;
  const excludeLower = excludeNames.map(n => n.toLowerCase());

  let candidates;
  if (pool) {
    // Sort pool by size preference
    const sizeRank = Object.fromEntries(sizePreference.map((s, i) => [s, i]));
    candidates = [...pool]
      .sort((a, b) => (sizeRank[a.size] ?? 99) - (sizeRank[b.size] ?? 99))
      .filter(c => !excludeLower.includes(c.name.toLowerCase()));
  } else {
    const pref = sizePreference[0] || 'large';
    candidates = (DEFAULT_BY_SIZE[pref] || DEFAULT_BY_SIZE.large)
      .filter(c => !excludeLower.includes(c.name.toLowerCase()));
  }

  return candidates.slice(0, count).map(c => ({
    name: c.name,
    industry: primaryIndustry || '',
    hiring_signal: c.hiring_signal,
    hiring_description: c.hiring_description || '',
    cff_connection_count: 0,
    connection_type: 'none',
    warm_path_strength: 'none',
    size: c.size || classifySize(c.name),
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

// ─── Merge network + job results into tiered list ───
function mergeResults(networkCompanies, jobCompanies, goals, university) {
  const companyMap = new Map();

  // Add job search results first
  jobCompanies.forEach(c => {
    const key = c.name.toLowerCase();
    companyMap.set(key, {
      ...c,
      has_web_result: true,
      cff_parent_count: 0,
      school_alumni_count: 0,
      open_to_intro_count: 0,
      sample_roles: [],
    });
  });

  // Merge in CFF network data
  networkCompanies.forEach(c => {
    const key = c.name.toLowerCase();
    if (companyMap.has(key)) {
      const existing = companyMap.get(key);
      companyMap.set(key, {
        ...existing,
        cff_parent_count: c.cff_parent_count || 0,
        school_alumni_count: c.school_alumni_count || 0,
        open_to_intro_count: c.open_to_intro_count || 0,
        sample_roles: c.sample_roles || [],
        school_match: c.school_match || false,
        industry: existing.industry || c.industry || '',
      });
    } else {
      companyMap.set(key, {
        name: c.name,
        industry: c.industry || '',
        size: 'mid',
        hiring_signal: 'unknown',
        hiring_description: '',
        has_web_result: false,
        cff_parent_count: c.cff_parent_count || 0,
        school_alumni_count: c.school_alumni_count || 0,
        open_to_intro_count: c.open_to_intro_count || 0,
        sample_roles: c.sample_roles || [],
        school_match: c.school_match || false,
      });
    }
  });

  const role = goals.role || '';
  const school = university || 'your school';

  // Assign tiers and why_recommended
  const companies = Array.from(companyMap.values()).map(c => {
    const hasHiring = c.has_web_result && c.hiring_signal !== 'cool';
    const hasCFF = (c.cff_parent_count || 0) > 0 || (c.school_alumni_count || 0) > 0;
    const tier = hasHiring && hasCFF ? 1 : hasCFF ? 2 : hasHiring ? 3 : 4;

    let why = '';
    if (tier === 1) {
      if (c.open_to_intro_count > 0) why = `Hiring ${role}s now + ${c.open_to_intro_count} CFF parent${c.open_to_intro_count > 1 ? 's' : ''} ready to intro`;
      else if (c.school_alumni_count > 0) why = `Hiring ${role}s now + ${c.school_alumni_count} ${school} alumni in the network`;
      else why = `Actively hiring with a CFF network connection`;
    } else if (tier === 2) {
      if (c.school_alumni_count > 0 && c.cff_parent_count > 0) why = `${c.school_alumni_count} ${school} alumni and ${c.cff_parent_count} CFF parents work here`;
      else if (c.school_alumni_count > 0) why = `${c.school_alumni_count} ${school} alumni in the network`;
      else if (c.open_to_intro_count > 0) why = `${c.open_to_intro_count} CFF parent${c.open_to_intro_count > 1 ? 's' : ''} open to introductions`;
      else why = `${c.cff_parent_count} CFF connection${c.cff_parent_count > 1 ? 's' : ''} work here`;
    } else if (tier === 3) {
      why = `Actively hiring ${role}s — be the first ${school} student here`;
    }

    return { ...c, tier, why_recommended: why };
  });

  companies.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const aScore = (a.cff_parent_count * 2) + (a.school_alumni_count * 1.5) + (a.open_to_intro_count * 3);
    const bScore = (b.cff_parent_count * 2) + (b.school_alumni_count * 1.5) + (b.open_to_intro_count * 3);
    return bScore - aScore;
  });

  const tier1 = companies.filter(c => c.tier === 1).slice(0, 3);
  const tier2 = companies.filter(c => c.tier === 2).slice(0, 3);
  const tier3 = companies.filter(c => c.tier === 3).slice(0, 3);
  return { companies: [...tier1, ...tier2, ...tier3], weekly_new_count: 0 };
}

export function useCompanyRecs(user) {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false); // true only when no fallback yet
  const [searching, setSearching] = useState(false); // live search running in bg
  const [error, setError] = useState(false);
  const [noIndustry, setNoIndustry] = useState(false);
  const [weeklyNewCount, setWeeklyNewCount] = useState(null);

  const fetchRecs = useCallback(async () => {
    if (!user?.email) return;

    const rawIndustries = user?.career_goals?.industries?.length > 0 ? user.career_goals.industries
      : user?.target_industries?.length > 0 ? user.target_industries : [];
    const role = user?.career_goals?.role || user?.target_role || '';
    const inferred = rawIndustries.length === 0 && role ? inferIndustryFromRole(role) : null;
    const industries = rawIndustries.length > 0 ? rawIndustries : (inferred ? [inferred] : []);

    if (industries.length === 0 && !role) {
      setNoIndustry(true);
      setLoading(false);
      return;
    }
    setNoIndustry(false);

    const savedAt = user?.career_goals?.saved_at || '';
    const cacheKey = `recs_${user.id || user.email}_${JSON.stringify(industries)}_${role}_${savedAt}`;
    const now = Date.now();
    const cached = memCache[cacheKey];
    if (cached && (now - cached.ts < CACHE_TTL_MS)) {
      setCompanies(cached.data);
      setWeeklyNewCount(cached.weeklyCount);
      return;
    }

    // STEP 1: Show fallback IMMEDIATELY (<100ms) — student never stares at blank screen
    const fallbackIndustries = industries.length > 0 ? industries : (inferred ? [inferred] : []);
    const immediateFallback = await getGapFillCompanies({ industries: fallbackIndustries }, [], 3).catch(() => []);
    if (immediateFallback.length > 0) {
      setCompanies(immediateFallback);
    }
    setLoading(false); // fallback is showing — never block on spinner
    setSearching(true); // subtle background indicator
    setError(false);

    const goals = {
      role,
      industries,
      target_companies: user?.career_goals?.target_companies || user?.target_companies || [],
      locations: user?.career_goals?.locations || user?.location_preferences || [],
      company_size_preference: user?.career_goals?.company_size_preference || ['large', 'mid', 'startup'],
    };

    // STEP 2: Run both functions in parallel — each is lightweight enough to stay within CPU limit
    if (!inFlightRequests[cacheKey]) {
      inFlightRequests[cacheKey] = Promise.allSettled([
        getCFFNetworkMatchesFn({ career_goals: goals, university: user?.school || user?.university || '' }),
        getLiveJobMatchesFn({ career_goals: goals }),
      ])
        .then(([networkRes, jobsRes]) => {
          const network = networkRes.status === 'fulfilled' ? (networkRes.value?.data?.companies || []) : [];
          const jobs = jobsRes.status === 'fulfilled' ? (jobsRes.value?.data?.companies || []) : [];
          console.log(`✅ Network: ${network.length} companies, Jobs: ${jobs.length} companies`);
          if (networkRes.status === 'rejected') console.error('Network fn failed:', networkRes.reason);
          if (jobsRes.status === 'rejected') console.error('Jobs fn failed:', jobsRes.reason);
          return { data: mergeResults(network, jobs, goals, user?.school || '') };
        })
        .catch(err => {
          console.error('Background search failed — fallback stays:', err);
          return { data: null };
        })
        .finally(() => { delete inFlightRequests[cacheKey]; });
    }

    const { data: merged } = await inFlightRequests[cacheKey];
    const results = merged?.companies?.length > 0 ? merged.companies : null;
    const weeklyCount = merged?.weekly_new_count ?? 0;

    // STEP 3: Silently replace fallback with real results when they arrive
    if (results) {
      console.log(`✅ Real results arrived — updating ${results.length} companies`);
      memCache[cacheKey] = { data: results, ts: now, weeklyCount };
      setCompanies(results);
      setWeeklyNewCount(weeklyCount);
    } else {
      console.log('Background search empty — fallback stays');
    }

    setLoading(false);
    setSearching(false);
  }, [user?.email, user?.id, JSON.stringify(user?.career_goals), user?.target_role, JSON.stringify(user?.target_industries)]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  return { companies, loading, searching, error, noIndustry, weeklyNewCount, refetch: fetchRecs };
}