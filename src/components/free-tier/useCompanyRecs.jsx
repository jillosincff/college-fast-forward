import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const MIN_SKELETON_MS = 800;
const MAX_SKELETON_MS = 2000;

// Hardcoded fallback companies per industry
const INDUSTRY_FALLBACKS = {
  'Technology, Information & Media': [
    { name: 'Google', industry: 'Technology', hiring_signal: 'hot', hiring_description: 'Actively hiring for entry-level roles across multiple teams.', is_fallback: true },
    { name: 'Microsoft', industry: 'Technology', hiring_signal: 'hot', hiring_description: 'Strong entry-level and internship programs across all divisions.', is_fallback: true },
    { name: 'Spotify', industry: 'Media & Tech', hiring_signal: 'warm', hiring_description: 'Hiring for marketing, product, and engineering roles.', is_fallback: true },
  ],
  'Finance & Insurance': [
    { name: 'Goldman Sachs', industry: 'Finance', hiring_signal: 'warm', hiring_description: 'Summer analyst applications open for investment banking division.', is_fallback: true },
    { name: 'JPMorgan', industry: 'Finance', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles nationwide.', is_fallback: true },
    { name: 'Deloitte', industry: 'Consulting', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.', is_fallback: true },
  ],
  'Advertising & PR': [
    { name: 'Ogilvy', industry: 'Advertising', hiring_signal: 'warm', hiring_description: 'Creative and account management roles for recent grads.', is_fallback: true },
    { name: 'WPP', industry: 'Advertising', hiring_signal: 'warm', hiring_description: 'Entry-level opportunities across global agency network.', is_fallback: true },
    { name: 'Edelman', industry: 'PR', hiring_signal: 'hot', hiring_description: 'Actively hiring communications and PR associates.', is_fallback: true },
  ],
  'Sports & Entertainment': [
    { name: 'ESPN', industry: 'Sports Media', hiring_signal: 'warm', hiring_description: 'Hiring for content, production, and marketing roles.', is_fallback: true },
    { name: 'Live Nation', industry: 'Entertainment', hiring_signal: 'hot', hiring_description: 'Entry-level roles in events, marketing, and operations.', is_fallback: true },
    { name: 'Nike', industry: 'Sports & Consumer', hiring_signal: 'warm', hiring_description: 'Brand marketing and product roles for recent grads.', is_fallback: true },
  ],
  'Healthcare & Pharmaceuticals': [
    { name: 'Johnson & Johnson', industry: 'Healthcare', hiring_signal: 'hot', hiring_description: 'Large rotational programs for recent graduates.', is_fallback: true },
    { name: 'CVS Health', industry: 'Healthcare', hiring_signal: 'hot', hiring_description: 'Operations and management training programs nationwide.', is_fallback: true },
    { name: 'Pfizer', industry: 'Pharmaceuticals', hiring_signal: 'warm', hiring_description: 'Entry-level roles in research, sales, and operations.', is_fallback: true },
  ],
  'Professional Services': [
    { name: 'McKinsey', industry: 'Consulting', hiring_signal: 'warm', hiring_description: 'Business analyst roles for top undergraduates.', is_fallback: true },
    { name: 'PwC', industry: 'Accounting', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for audit, tax, and advisory.', is_fallback: true },
    { name: 'EY', industry: 'Accounting', hiring_signal: 'hot', hiring_description: 'Entry-level associate roles across all service lines.', is_fallback: true },
  ],
  'Retail & Consumer Goods': [
    { name: 'Target', industry: 'Retail', hiring_signal: 'hot', hiring_description: 'Store leadership and corporate rotational programs.', is_fallback: true },
    { name: 'Procter & Gamble', industry: 'Consumer Goods', hiring_signal: 'hot', hiring_description: 'Brand management and operations roles for recent grads.', is_fallback: true },
    { name: 'Unilever', industry: 'Consumer Goods', hiring_signal: 'warm', hiring_description: 'Future Leaders Program for top undergraduates.', is_fallback: true },
  ],
  'Manufacturing & Industrial': [
    { name: 'Boeing', industry: 'Aerospace', hiring_signal: 'warm', hiring_description: 'Engineering and operations roles for recent graduates.', is_fallback: true },
    { name: 'Caterpillar', industry: 'Manufacturing', hiring_signal: 'hot', hiring_description: 'Engineering, finance, and supply chain rotational programs.', is_fallback: true },
    { name: 'GE', industry: 'Industrial', hiring_signal: 'warm', hiring_description: 'Leadership programs across multiple engineering disciplines.', is_fallback: true },
  ],
  'Government & Public Sector': [
    { name: 'Deloitte Government', industry: 'Consulting', hiring_signal: 'hot', hiring_description: 'Public sector consulting for recent graduates.', is_fallback: true },
    { name: 'Booz Allen Hamilton', industry: 'Government Consulting', hiring_signal: 'hot', hiring_description: 'Entry-level analyst roles supporting government clients.', is_fallback: true },
    { name: 'KPMG', industry: 'Professional Services', hiring_signal: 'warm', hiring_description: 'Government and public sector advisory roles.', is_fallback: true },
  ],
  'Education & Training': [
    { name: 'Teach For America', industry: 'Education', hiring_signal: 'hot', hiring_description: 'Corps member program for recent graduates.', is_fallback: true },
    { name: 'Kaplan', industry: 'Education', hiring_signal: 'warm', hiring_description: 'Instructional and operations roles for recent grads.', is_fallback: true },
    { name: 'Coursera', industry: 'EdTech', hiring_signal: 'warm', hiring_description: 'Business development and marketing roles.', is_fallback: true },
  ],
  'Transportation & Logistics': [
    { name: 'UPS', industry: 'Logistics', hiring_signal: 'hot', hiring_description: 'Management trainee programs nationwide.', is_fallback: true },
    { name: 'FedEx', industry: 'Logistics', hiring_signal: 'hot', hiring_description: 'Operations and supply chain roles for recent graduates.', is_fallback: true },
    { name: 'Amazon Logistics', industry: 'E-commerce Logistics', hiring_signal: 'hot', hiring_description: 'Operations management and supply chain roles.', is_fallback: true },
  ],
  'Construction & Agriculture': [
    { name: 'CBRE', industry: 'Real Estate', hiring_signal: 'warm', hiring_description: 'Real estate analyst and advisory roles.', is_fallback: true },
    { name: 'JLL', industry: 'Real Estate', hiring_signal: 'warm', hiring_description: 'Entry-level analyst roles in commercial real estate.', is_fallback: true },
    { name: 'Bechtel', industry: 'Construction', hiring_signal: 'warm', hiring_description: 'Engineering and project management roles.', is_fallback: true },
  ],
};

const GENERAL_FALLBACK = [
  { name: 'Deloitte', industry: 'Consulting', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.', is_fallback: true },
  { name: 'Google', industry: 'Technology', hiring_signal: 'hot', hiring_description: 'Actively hiring for entry-level roles across multiple teams.', is_fallback: true },
  { name: 'JPMorgan', industry: 'Finance', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles.', is_fallback: true },
];

function getHardcodedFallback(industries) {
  if (!industries || industries.length === 0) return GENERAL_FALLBACK;
  return INDUSTRY_FALLBACKS[industries[0]] || GENERAL_FALLBACK;
}

// TODO: Re-enable AI query once timeout issue is resolved
// async function getExternalCompanyRecommendations(goals) { ... }

async function getCompanyRecommendationsImmediate(goals) {
  const targetCompanies = goals?.target_companies || [];
  const industries = goals?.industries || [];

  // Step 1: target companies from cache
  if (targetCompanies.length > 0) {
    try {
      const cached = await base44.entities.CompanyIntelCache.list('-hiring_score', 50);
      const matches = cached.filter(c =>
        targetCompanies.some(t => c.company_name?.toLowerCase().includes(t.toLowerCase()))
      );
      if (matches.length > 0) {
        return matches.slice(0, 3).map(c => ({
          name: c.company_name,
          industry: '',
          hiring_signal: c.hiring_signal || 'warm',
          hiring_description: c.intel_summary || c.recommendation_text || '',
          cff_data: null,
          is_fallback: false,
        }));
      }
    } catch (e) { /* continue */ }
  }

  // Step 2: industry matches from cache
  if (industries.length > 0) {
    try {
      const cached = await base44.entities.CompanyIntelCache.list('-hiring_score', 20);
      if (cached.length > 0) {
        return cached.slice(0, 3).map(c => ({
          name: c.company_name,
          industry: '',
          hiring_signal: c.hiring_signal || 'warm',
          hiring_description: c.intel_summary || c.recommendation_text || '',
          cff_data: null,
          is_fallback: false,
        }));
      }
    } catch (e) { /* continue */ }
  }

  // Step 3: CFF parent companies matching industries
  try {
    const users = await base44.entities.User.filter({ persona: 'parent' }, '-created_date', 100);
    const industriesLower = industries.map(i => i.toLowerCase());
    const seen = new Set();
    const results = [];
    for (const u of users) {
      const company = (u.company || u.current_company || '').trim();
      if (!company || seen.has(company.toLowerCase())) continue;
      const uIndustry = (u.industry || '').toLowerCase();
      const match = industriesLower.length === 0 || industriesLower.some(i => uIndustry.includes(i.split(',')[0].trim()));
      if (match) {
        seen.add(company.toLowerCase());
        results.push({
          name: company,
          industry: u.industry || '',
          hiring_signal: 'warm',
          hiring_description: `${u.full_name || 'A CFF parent'} works here and may be able to make introductions.`,
          cff_data: { cff_connection_count: 1, connection_type: 'parent', school_match: false },
          is_fallback: false,
        });
        if (results.length >= 3) break;
      }
    }
    if (results.length > 0) return results;
  } catch (e) { /* continue */ }

  // Step 4: hardcoded fallback
  return getHardcodedFallback(industries);
}

export function useCompanyRecs(user) {
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRecs = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(false);
    setCompanies(null);

    const startTime = Date.now();

    // Hard cap: never show skeleton beyond MAX_SKELETON_MS
    const maxTimer = setTimeout(() => {
      setCompanies(getHardcodedFallback(user?.career_goals?.industries || user?.target_industries));
      setLoading(false);
    }, MAX_SKELETON_MS);

    try {
      const goals = {
        target_companies: user?.career_goals?.target_companies || user?.target_companies || [],
        industries: user?.career_goals?.industries || user?.target_industries || [],
      };

      const results = await getCompanyRecommendationsImmediate(goals);

      clearTimeout(maxTimer);

      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_SKELETON_MS) {
        await new Promise(r => setTimeout(r, MIN_SKELETON_MS - elapsed));
      }

      setCompanies(results);
    } catch (err) {
      clearTimeout(maxTimer);
      console.error('Company recs failed:', err.message);
      setCompanies(getHardcodedFallback(user?.career_goals?.industries || user?.target_industries));
    } finally {
      setLoading(false);
    }
  }, [user?.email, JSON.stringify(user?.career_goals)]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  return { companies, loading, error, refetch: fetchRecs };
}