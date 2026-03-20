import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const SAMPLE_COMPANIES = [
  {
    name: 'Google',
    industry: 'Technology',
    signal: 'hot',
    insight: 'Actively hiring for entry-level roles across multiple teams.',
    hiringScore: 88,
    openRoles: ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst'],
    culture: 'Strong culture of internal mobility. New grads often land via internship-to-full-time pipelines.',
    warnings: [],
    similar: ['Meta', 'Microsoft', 'Amazon'],
  },
  {
    name: 'Nike',
    industry: 'Consumer Goods',
    signal: 'warm',
    insight: 'Selective hiring — focus on brand marketing and product roles.',
    hiringScore: 62,
    openRoles: ['Brand Manager', 'Marketing Coordinator', 'Product Developer'],
    culture: 'Brand-driven culture. Strong emphasis on athletics, storytelling, and consumer insights.',
    warnings: [],
    similar: ['Adidas', 'Under Armour', 'Puma'],
  },
  {
    name: 'Goldman Sachs',
    industry: 'Finance',
    signal: 'warm',
    insight: 'Summer analyst applications open for investment banking division.',
    hiringScore: 58,
    openRoles: ['Summer Analyst', 'Investment Banking Analyst', 'Risk Associate'],
    culture: 'Highly competitive recruiting pipeline. Networking with alumni is critical to getting a first-round interview.',
    warnings: [],
    similar: ['JP Morgan', 'Morgan Stanley', 'Citigroup'],
  },
  {
    name: 'Deloitte',
    industry: 'Consulting',
    signal: 'hot',
    insight: 'Hiring consultants and business analysts nationwide.',
    hiringScore: 81,
    openRoles: ['Business Analyst', 'Technology Consultant', 'Advisory Analyst'],
    culture: 'Large firm with strong campus recruiting. Entry-level hiring is consistent year-round.',
    warnings: [],
    similar: ['McKinsey', 'BCG', 'PwC'],
  },
  {
    name: 'Apple',
    industry: 'Technology',
    signal: 'cool',
    insight: 'Limited entry-level openings — internship pipeline preferred.',
    hiringScore: 34,
    openRoles: ['Hardware Engineer Intern', 'Software Engineer Intern'],
    culture: 'Highly selective. Most new grad hires come through the internship pipeline.',
    warnings: [{ type: 'freeze', text: 'Paused external hiring for most new grad roles as of Q1.' }],
    similar: ['Microsoft', 'Google', 'Salesforce'],
  },
];

const SIGNAL_CONFIG = {
  hot: { emoji: '🟢', label: 'Actively Hiring', bg: 'bg-green-100', text: 'text-green-700' },
  warm: { emoji: '🟡', label: 'Selective', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cool: { emoji: '🔴', label: 'Freeze', bg: 'bg-red-100', text: 'text-red-700' },
};

function CompanyCard({ company, onOpenUpgrade }) {
  const [expanded, setExpanded] = useState(false);
  const s = SIGNAL_CONFIG[company.signal];

  return (
    <div className="bg-white rounded-xl border border-[#E0E0E0] hover:border-[#E85D20] transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-lg">{company.name}</h3>
            <p className="text-xs text-[#999999]">{company.industry}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            {s.emoji} {s.label}
          </span>
        </div>
        <p className="text-sm text-[#666666] mb-4">{company.insight}</p>
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1 text-sm text-[#E85D20] font-medium hover:underline"
          style={{ minHeight: 'auto' }}
        >
          {expanded ? 'Hide Intel' : 'View Full Intel →'}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#F0F0F0] p-5 bg-[#FAFAFA] space-y-4">
          {/* Hiring score */}
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>HIRING SIGNAL SCORE</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#E0E0E0] rounded-full h-2">
                <div className="h-2 rounded-full bg-[#E85D20]" style={{ width: `${company.hiringScore}%` }} />
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{company.hiringScore}/100</span>
            </div>
          </div>

          {/* Open roles */}
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 8 }}>OPEN ROLE CATEGORIES</p>
            <div className="flex flex-wrap gap-2">
              {company.openRoles.map(r => (
                <span key={r} style={{ background: '#FFF5F0', color: '#E85D20', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 100, border: '1px solid #FDDBC8' }}>{r}</span>
              ))}
            </div>
          </div>

          {/* Culture */}
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>CULTURE INSIGHTS</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', lineHeight: 1.6 }}>{company.culture}</p>
          </div>

          {/* Warnings */}
          {company.warnings?.length > 0 && (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#EF4444', marginBottom: 6 }}>⚠️ WARNING SIGNALS</p>
              {company.warnings.map((w, i) => (
                <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#B91C1C', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', margin: 0 }}>{w.text}</p>
              ))}
            </div>
          )}

          {/* Similar companies */}
          {company.similar?.length > 0 && (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>SIMILAR COMPANIES TO CONSIDER</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555' }}>{company.similar.join(' · ')}</p>
            </div>
          )}

          {/* Soft FastIQ upsell — no modal */}
          <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 12 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 8px' }}>
              Want to find alumni at {company.name} and get a personalized outreach message?{' '}
              <span style={{ fontStyle: 'italic', color: '#E85D20' }}>That's FastIQ.</span>
            </p>
            <button
              onClick={onOpenUpgrade}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#E85D20', background: 'transparent', border: '1.5px solid #E85D20', borderRadius: 100, padding: '6px 16px', cursor: 'pointer', minHeight: 'auto' }}
            >
              Unlock FastIQ →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FreeTierCompanyIntelTab({ user, onOpenUpgrade }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const savedGoals = user?.career_goals;
  const targetCompanies = savedGoals?.target_companies || user?.target_companies || [];
  const targetIndustries = savedGoals?.industries || user?.target_industries || [];
  const hasGoals = !!(targetIndustries.length || targetCompanies.length);

  const personalizedCompanies = [
    ...SAMPLE_COMPANIES.filter(c => targetCompanies.some(t => c.name.toLowerCase().includes(t.toLowerCase()))),
    ...SAMPLE_COMPANIES.filter(c => !targetCompanies.some(t => c.name.toLowerCase().includes(t.toLowerCase()))),
  ];
  const baseList = hasGoals ? personalizedCompanies : SAMPLE_COMPANIES;

  const displayCompanies = baseList.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filter === 'actively_hiring') return c.signal === 'hot';
    if (filter === 'your_industry') return targetIndustries.some(i => c.industry.toLowerCase().includes(i.toLowerCase()));
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        COMPANY INTEL
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
        What's happening at companies that matter.
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 24 }}>
        Hiring signals, culture insights, and open roles — updated regularly.
      </p>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
        <input
          type="text"
          placeholder="Search any company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-[#E0E0E0] bg-white text-[#1A1A1A]"
        />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', 'All'], ['actively_hiring', 'Actively Hiring'], ['your_industry', 'Your Industry'], ['trending', 'Trending']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === val ? 'bg-[#E85D20] text-white' : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'}`}
            style={{ minHeight: 'auto' }}
          >
            {label}
          </button>
        ))}
      </div>

      {!hasGoals && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#E85D20', marginBottom: 8 }}>
            Add your target companies in Career Goals to see personalized intel first.
          </p>
          <button
            onClick={() => window.location.hash = '#FreeTierDashboard?tab=career_goals'}
            className="border border-[#E85D20] text-[#E85D20] px-4 py-2 rounded-full font-medium hover:bg-[#E85D20]/10 transition-colors"
            style={{ minHeight: 'auto' }}
          >
            Go to Career Goals →
          </button>
        </div>
      )}

      <div className="space-y-4">
        {displayCompanies.map(company => (
          <CompanyCard key={company.name} company={company} onOpenUpgrade={onOpenUpgrade} />
        ))}
      </div>
    </div>
  );
}