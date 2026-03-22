import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Industry-aware hardcoded fallbacks — used when cache is empty
const INDUSTRY_FALLBACKS = {
  'Healthcare & Pharmaceuticals': [
    { name: 'HCA Healthcare', industry: 'Healthcare', size: 'large', hiring_signal: 'hot', hiring_description: 'One of the largest hospital networks in the US, actively hiring nurses and clinical staff.' },
    { name: 'Mayo Clinic', industry: 'Healthcare', size: 'large', hiring_signal: 'hot', hiring_description: 'Top-ranked hospital system with strong nursing programs across multiple campuses.' },
    { name: 'CVS Health', industry: 'Healthcare', size: 'large', hiring_signal: 'warm', hiring_description: 'Hiring nurses and clinical staff for pharmacy and MinuteClinic locations nationwide.' },
  ],
  'Finance & Insurance': [
    { name: 'JPMorgan', industry: 'Finance', size: 'large', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles nationwide.' },
    { name: 'Goldman Sachs', industry: 'Finance', size: 'large', hiring_signal: 'warm', hiring_description: 'Summer analyst applications open for investment banking division.' },
    { name: 'Deloitte', industry: 'Consulting', size: 'large', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.' },
  ],
  'Technology, Information & Media': [
    { name: 'Google', industry: 'Technology', size: 'large', hiring_signal: 'hot', hiring_description: 'Actively hiring across engineering, product, and business roles.' },
    { name: 'Microsoft', industry: 'Technology', size: 'large', hiring_signal: 'hot', hiring_description: 'Strong new grad programs across all divisions.' },
    { name: 'Adobe', industry: 'Technology', size: 'large', hiring_signal: 'warm', hiring_description: 'Hiring across engineering, design, and marketing technology roles.' },
  ],
  'Advertising & PR': [
    { name: 'Edelman', industry: 'PR', size: 'large', hiring_signal: 'hot', hiring_description: "World's largest PR firm — actively hiring communications associates." },
    { name: 'Ogilvy', industry: 'Advertising', size: 'large', hiring_signal: 'warm', hiring_description: 'Creative and account management roles for recent grads.' },
    { name: 'Publicis', industry: 'Advertising', size: 'large', hiring_signal: 'warm', hiring_description: 'Global agency network with entry-level creative and strategy roles.' },
  ],
  'Professional Services': [
    { name: 'McKinsey', industry: 'Consulting', size: 'large', hiring_signal: 'warm', hiring_description: 'Business analyst roles for top undergraduates.' },
    { name: 'PwC', industry: 'Accounting', size: 'large', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for audit, tax, and advisory.' },
    { name: 'EY', industry: 'Accounting', size: 'large', hiring_signal: 'hot', hiring_description: 'Entry-level associate roles across all service lines.' },
  ],
  'Sports & Entertainment': [
    { name: 'ESPN', industry: 'Sports Media', size: 'large', hiring_signal: 'warm', hiring_description: 'Hiring for content, production, and marketing roles.' },
    { name: 'Live Nation', industry: 'Entertainment', size: 'large', hiring_signal: 'hot', hiring_description: 'Entry-level roles in events, marketing, and operations.' },
    { name: 'Nike', industry: 'Sports', size: 'large', hiring_signal: 'warm', hiring_description: 'Brand marketing and product roles for recent grads.' },
  ],
  'Retail & Consumer Goods': [
    { name: 'Procter & Gamble', industry: 'Consumer Goods', size: 'large', hiring_signal: 'hot', hiring_description: 'Brand management and operations roles for recent grads.' },
    { name: 'Target', industry: 'Retail', size: 'large', hiring_signal: 'hot', hiring_description: 'Store leadership and corporate rotational programs.' },
    { name: 'Unilever', industry: 'Consumer Goods', size: 'large', hiring_signal: 'warm', hiring_description: 'Future Leaders Program for top undergraduates.' },
  ],
};

const DEFAULT_FALLBACK = [
  { name: 'Deloitte', industry: 'Consulting', size: 'large', hiring_signal: 'hot', hiring_description: 'Hiring consultants and business analysts nationwide.' },
  { name: 'Amazon', industry: 'Technology', size: 'large', hiring_signal: 'hot', hiring_description: 'Hiring across logistics, technology, and business operations.' },
  { name: 'JPMorgan', industry: 'Finance', size: 'large', hiring_signal: 'hot', hiring_description: 'Large-scale hiring for finance and operations roles.' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const goals = body.career_goals || {};
    const industries = goals.industries?.length > 0 ? goals.industries : (user.target_industries || []);
    const excludeNames = (goals.target_companies || []).map(c => c.toLowerCase());

    // Fast DB query — CompanyIntelCache only, no LLM
    const cached = await base44.asServiceRole.entities.CompanyIntelCache.list('-hiring_score', 50);

    let companies = [];

    if (cached && cached.length > 0) {
      // Filter to relevant industries and good signals
      const industryKeywords = industries.flatMap(i => i.toLowerCase().split(/[,&\s]+/).filter(w => w.length > 3));
      
      companies = cached
        .filter(c => {
          if (!c.company_name) return false;
          if (excludeNames.includes(c.company_name.toLowerCase())) return false;
          // If no industries specified, include all; otherwise require an industry match
          if (industryKeywords.length === 0) return true;
          const summary = (c.intel_summary || c.recommendation_text || c.company_name || '').toLowerCase();
          return industryKeywords.some(kw => summary.includes(kw));
        })
        .slice(0, 5)
        .map(c => ({
          name: c.company_name,
          industry: '',
          size: 'large',
          hiring_signal: c.hiring_signal || 'warm',
          hiring_description: c.intel_summary || c.recommendation_text || '',
          has_web_result: true,
        }));

      console.log(`✅ Found ${companies.length} companies from CompanyIntelCache`);
    }

    // Fall back to hardcoded list if cache is empty or insufficient
    if (companies.length < 3) {
      const primaryIndustry = industries[0] || '';
      const fallback = INDUSTRY_FALLBACKS[primaryIndustry] || DEFAULT_FALLBACK;
      const existing = companies.map(c => c.name.toLowerCase());
      const toAdd = fallback
        .filter(c => !existing.includes(c.name.toLowerCase()) && !excludeNames.includes(c.name.toLowerCase()))
        .slice(0, 5 - companies.length)
        .map(c => ({ ...c, has_web_result: true }));
      companies = [...companies, ...toAdd];
      console.log(`ℹ️ Added ${toAdd.length} hardcoded fallbacks for "${primaryIndustry}"`);
    }

    return Response.json({ companies });

  } catch (error) {
    console.error('getLiveJobMatchesFn error:', error.message);
    return Response.json({ error: error.message, companies: [] }, { status: 500 });
  }
});