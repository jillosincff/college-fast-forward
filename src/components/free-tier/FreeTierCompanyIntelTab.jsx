import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SAMPLE_COMPANIES = [
  { name: 'Google', industry: 'Technology', signal: 'hot', insight: 'Actively hiring for entry-level roles across multiple teams.' },
  { name: 'Nike', industry: 'Consumer Goods', signal: 'warm', insight: 'Selective hiring — focus on brand marketing and product roles.' },
  { name: 'Goldman Sachs', industry: 'Finance', signal: 'warm', insight: 'Summer analyst applications open for investment banking division.' },
  { name: 'Deloitte', industry: 'Consulting', signal: 'hot', insight: 'Hiring consultants and business analysts nationwide.' },
  { name: 'Apple', industry: 'Technology', signal: 'cool', insight: 'Limited entry-level openings — internship pipeline preferred.' },
];

export default function FreeTierCompanyIntelTab({ user, onOpenUpgrade }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const savedGoals = user?.career_goals;
  const targetCompanies = savedGoals?.target_companies || user?.target_companies || [];
  const targetIndustries = savedGoals?.industries || user?.target_industries || [];
  const hasGoals = !!(targetIndustries.length || targetCompanies.length);

  // Personalize: show target companies first, then sample data
  const personalizedCompanies = [
    ...SAMPLE_COMPANIES.filter(c => targetCompanies.some(t => c.name.toLowerCase().includes(t.toLowerCase()))),
    ...SAMPLE_COMPANIES.filter(c => !targetCompanies.some(t => c.name.toLowerCase().includes(t.toLowerCase()))),
  ];
  const displayCompanies = hasGoals ? personalizedCompanies : SAMPLE_COMPANIES;

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

      {/* Search */}
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

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', 'Actively Hiring', 'Your Industry', 'Trending'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f.toLowerCase().replace(/ /g, '_'))}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.toLowerCase().replace(/ /g, '_')
                ? 'bg-[#E85D20] text-white'
                : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'
            }`}
            style={{ minHeight: 'auto' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* No Goals Nudge */}
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

      {/* Company Cards */}
      <div className="space-y-4">
        {displayCompanies.map(company => {
          const signalConfig = {
            hot: { emoji: '🟢', label: 'Actively Hiring', bg: 'bg-green-100', text: 'text-green-700' },
            warm: { emoji: '🟡', label: 'Selective', bg: 'bg-yellow-100', text: 'text-yellow-700' },
            cool: { emoji: '🔴', label: 'Freeze', bg: 'bg-red-100', text: 'text-red-700' },
          };
          const s = signalConfig[company.signal];

          return (
            <div key={company.name} className="bg-white rounded-xl p-5 border border-[#E0E0E0] hover:border-[#E85D20] transition-all">
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
                onClick={onOpenUpgrade}
                className="text-sm text-[#E85D20] font-medium hover:underline"
                style={{ minHeight: 'auto' }}
              >
                View Full Intel →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}