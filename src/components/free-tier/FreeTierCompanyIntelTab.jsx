import React, { useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, Loader2, Lock, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SAMPLE_COMPANIES = [
  {
    name: 'Google', industry: 'Technology', signal: 'hot',
    insight: 'Actively hiring for entry-level roles across multiple teams.',
    hiringScore: 88, openRoles: ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst'],
    culture: 'Strong culture of internal mobility. New grads often land via internship-to-full-time pipelines.',
    warnings: [], similar: ['Meta', 'Microsoft', 'Amazon'], careersUrl: 'https://careers.google.com',
  },
  {
    name: 'Nike', industry: 'Consumer Goods', signal: 'warm',
    insight: 'Selective hiring — focus on brand marketing and product roles.',
    hiringScore: 62, openRoles: ['Brand Manager', 'Marketing Coordinator', 'Product Developer'],
    culture: 'Brand-driven culture. Strong emphasis on athletics, storytelling, and consumer insights.',
    warnings: [], similar: ['Adidas', 'Under Armour', 'Puma'], careersUrl: 'https://jobs.nike.com',
  },
  {
    name: 'Goldman Sachs', industry: 'Finance', signal: 'warm',
    insight: 'Summer analyst applications open for investment banking division.',
    hiringScore: 58, openRoles: ['Summer Analyst', 'Investment Banking Analyst', 'Risk Associate'],
    culture: 'Highly competitive recruiting pipeline. Networking with alumni is critical to getting a first-round interview.',
    warnings: [], similar: ['JP Morgan', 'Morgan Stanley', 'Citigroup'], careersUrl: 'https://goldmansachs.com/careers',
  },
  {
    name: 'Deloitte', industry: 'Consulting', signal: 'hot',
    insight: 'Hiring consultants and business analysts nationwide.',
    hiringScore: 81, openRoles: ['Business Analyst', 'Technology Consultant', 'Advisory Analyst'],
    culture: 'Large firm with strong campus recruiting. Entry-level hiring is consistent year-round.',
    warnings: [], similar: ['McKinsey', 'BCG', 'PwC'], careersUrl: 'https://deloitte.com/careers',
  },
  {
    name: 'Apple', industry: 'Technology', signal: 'cool',
    insight: 'Limited entry-level openings — internship pipeline preferred.',
    hiringScore: 34, openRoles: ['Hardware Engineer Intern', 'Software Engineer Intern'],
    culture: 'Highly selective. Most new grad hires come through the internship pipeline.',
    warnings: [{ type: 'freeze', text: 'Paused external hiring for most new grad roles as of Q1.' }],
    similar: ['Microsoft', 'Google', 'Salesforce'], careersUrl: 'https://apple.com/jobs',
  },
];

const SIGNAL_CONFIG = {
  hot: { emoji: '🟢', label: 'Actively Hiring', bg: 'bg-green-100', text: 'text-green-700' },
  warm: { emoji: '🟡', label: 'Selective', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cool: { emoji: '🔴', label: 'Freeze', bg: 'bg-red-100', text: 'text-red-700' },
};

const jobsCache = {};

async function fetchJobs(company, user) {
  const cacheKey = company.name;
  const now = Date.now();
  if (jobsCache[cacheKey] && now - jobsCache[cacheKey].ts < 24 * 60 * 60 * 1000) {
    return jobsCache[cacheKey].data;
  }

  const major = user?.major || '';
  const goals = (user?.target_industries || []).join(', ');

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a job search assistant. Generate a realistic list of 8 current entry-level job openings and internships at ${company.name} in ${company.industry}.
Student context: Major: "${major}", Career interests: "${goals}".
Return exactly 8 jobs. For each job include: title, department, location, postedDaysAgo (1-30), matchesMajor (true/false based on major relevance), applicationUrl (use ${company.careersUrl || `https://${company.name.toLowerCase().replace(/ /g,'')} .com/careers`}).
Base variety on the company's industry. Mix entry-level full-time and internship roles. Be realistic.`,
    response_json_schema: {
      type: 'object',
      properties: {
        jobs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              department: { type: 'string' },
              location: { type: 'string' },
              postedDaysAgo: { type: 'number' },
              matchesMajor: { type: 'boolean' },
              applicationUrl: { type: 'string' },
            },
          },
        },
        isLiveData: { type: 'boolean' },
      },
    },
  });

  const data = { jobs: result?.jobs || [], isLiveData: false };
  jobsCache[cacheKey] = { data, ts: now };
  return data;
}

function JobCard({ job, careersUrl, blur = false }) {
  return (
    <div style={{
      background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: 16,
      filter: blur ? 'blur(3px)' : 'none', userSelect: blur ? 'none' : 'auto',
      pointerEvents: blur ? 'none' : 'auto',
    }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', margin: 0 }}>{job.title}</p>
        {job.matchesMajor && (
          <span style={{ background: '#14532D', color: '#4ADE80', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Matches your goals ✓
          </span>
        )}
      </div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: '0 0 4px' }}>{job.department}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
        {job.location}
        {job.postedDaysAgo && <span style={{ marginLeft: 10, color: '#555' }}>Posted {job.postedDaysAgo}d ago</span>}
      </p>
      {!blur && (
        <a
          href={job.applicationUrl || careersUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#E85D20', fontWeight: 500, textDecoration: 'none' }}
        >
          View Role → <ExternalLink style={{ width: 12, height: 12 }} />
        </a>
      )}
    </div>
  );
}

function JobsSection({ company, user, isFree, onOpenUpgrade }) {
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const data = await fetchJobs(company, user);
      setJobs(data.jobs || []);
      setIsLive(data.isLiveData);
    } catch (e) {
      setJobs([]);
    }
    setLoading(false);
    setLoaded(true);
  }, [company, user, loaded]);

  // Auto-load when section mounts
  React.useEffect(() => { load(); }, [load]);

  const major = user?.major || '';
  const matchCount = (jobs || []).filter(j => j.matchesMajor).length;
  const visibleJobs = isFree ? (jobs || []).slice(0, 3) : (jobs || []);
  const lockedJobs = isFree ? (jobs || []).slice(3, 6) : [];
  const totalCount = (jobs || []).length;

  return (
    <div>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', marginBottom: 6 }}>OPEN ROLES</p>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: isLive ? 4 : 12 }}>
        What {company.name} is hiring for right now.
      </p>
      {!isLive && loaded && jobs?.length > 0 && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontStyle: 'italic', color: '#999', marginBottom: 12 }}>
          Based on typical hiring patterns at {company.name}
        </p>
      )}

      {loading && <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-[#E85D20] animate-spin" /></div>}

      {loaded && jobs?.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', marginBottom: 4 }}>
            {company.name} appears to have limited openings right now.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', marginBottom: 8 }}>
            This could change — we update intel every 24 hours.
          </p>
          {company.similar?.length > 0 && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666' }}>
              Consider these similar companies: <span style={{ color: '#E85D20' }}>{company.similar.join(' · ')}</span>
            </p>
          )}
        </div>
      )}

      {loaded && jobs?.length > 0 && (
        <div className="space-y-3">
          {visibleJobs.map((job, i) => <JobCard key={i} job={job} careersUrl={company.careersUrl} />)}

          {isFree && lockedJobs.length > 0 && (
            <div className="relative">
              {/* Blurred preview cards */}
              <div className="space-y-3 pointer-events-none">
                {lockedJobs.map((job, i) => <JobCard key={i} job={job} careersUrl={company.careersUrl} blur />)}
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl p-6 text-center backdrop-blur-sm">
                <Lock className="w-6 h-6 text-[#E85D20] mb-3" />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>
                  Showing 3 of {totalCount} open roles at {company.name}.
                </p>
                {matchCount > 3 && major && (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontStyle: 'italic', color: '#E85D20', margin: '4px 0 16px' }}>
                    {matchCount} match your {major} background.
                  </p>
                )}
                {(!matchCount || matchCount <= 3 || !major) && <div style={{ marginBottom: 16 }} />}
                <button
                  onClick={onOpenUpgrade}
                  className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors"
                  style={{ minHeight: 'auto', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                >
                  See All {totalCount} Roles + Get a Tailored Resume for Each →
                </button>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', marginTop: 8 }}>
                  FastIQ tailors your resume and cover letter for every role — ATS-optimized and specific.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#aaa', marginTop: 4 }}>
                  Unlock FastIQ from $29/mo · 7-day free trial included
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company, user, isFree, onOpenUpgrade }) {
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
        <div className="border-t border-[#F0F0F0] p-5 bg-[#FAFAFA] space-y-6">
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

          {/* Open role categories */}
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

          {/* Open Roles — NEW */}
          <JobsSection company={company} user={user} isFree={isFree} onOpenUpgrade={onOpenUpgrade} />

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

          {/* Soft FastIQ upsell */}
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
  const isFree = !(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

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
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === val ? 'bg-[#E85D20] text-white' : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'}`}
            style={{ minHeight: 'auto' }}
          >{label}</button>
        ))}
      </div>

      {!hasGoals && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#E85D20', marginBottom: 8 }}>
            Add your target companies in Career Goals to see personalized intel first.
          </p>
          <button onClick={() => window.location.hash = '#FreeTierDashboard?tab=career_goals'}
            className="border border-[#E85D20] text-[#E85D20] px-4 py-2 rounded-full font-medium hover:bg-[#E85D20]/10 transition-colors"
            style={{ minHeight: 'auto' }}>
            Go to Career Goals →
          </button>
        </div>
      )}

      <div className="space-y-4">
        {displayCompanies.map(company => (
          <CompanyCard key={company.name} company={company} user={user} isFree={isFree} onOpenUpgrade={onOpenUpgrade} />
        ))}
      </div>
    </div>
  );
}