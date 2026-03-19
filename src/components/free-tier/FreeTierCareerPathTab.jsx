import React, { useState } from 'react';
import { Search } from 'lucide-react';

const CAREER_PATHS = [
  {
    role: 'Investment Banking Analyst',
    industry: 'Finance',
    salary: '$85K–$110K',
    progression: 'Analyst → Associate → VP → Managing Director',
    skills: 'Financial modeling, Excel, PowerPoint, DCF analysis',
  },
  {
    role: 'Product Manager',
    industry: 'Technology',
    salary: '$90K–$120K',
    progression: 'APM → PM → Senior PM → Director → VP Product',
    skills: 'Roadmapping, user research, SQL, wireframing, metrics',
  },
  {
    role: 'Marketing Coordinator',
    industry: 'Marketing',
    salary: '$50K–$65K',
    progression: 'Coordinator → Specialist → Manager → Director',
    skills: 'Copywriting, social media, analytics, campaign management',
  },
  {
    role: 'Management Consultant',
    industry: 'Consulting',
    salary: '$75K–$95K',
    progression: 'Analyst → Consultant → Manager → Partner',
    skills: 'Problem-solving, slide design, client communication, Excel',
  },
];

export default function FreeTierCareerPathTab({ user, onOpenUpgrade }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        CAREER PATH RESEARCH
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
        Explore where your degree can take you.
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 24 }}>
        Real career paths, role breakdowns, and salary ranges.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
        <input
          type="text"
          placeholder="Search roles or industries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-[#E0E0E0] bg-white text-[#1A1A1A]"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', 'Finance', 'Marketing', 'Tech', 'Consulting', 'Healthcare', 'Other'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f.toLowerCase())}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f.toLowerCase()
                ? 'bg-[#E85D20] text-white'
                : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'
            }`}
            style={{ minHeight: 'auto' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Career Path Cards */}
      <div className="space-y-4">
        {CAREER_PATHS.map(path => {
          const isExpanded = expanded === path.role;
          return (
            <div key={path.role} className="bg-white rounded-xl p-5 border border-[#E0E0E0] hover:border-[#E85D20] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-[#1A1A1A] text-lg">{path.role}</h3>
                  <p className="text-xs text-[#999999]">{path.industry}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  {path.salary}
                </span>
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#E0E0E0] space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#666666] mb-1">CAREER PROGRESSION</p>
                    <p className="text-sm text-[#1A1A1A]">{path.progression}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#666666] mb-1">SKILLS TYPICALLY REQUIRED</p>
                    <p className="text-sm text-[#1A1A1A]">{path.skills}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setExpanded(isExpanded ? null : path.role)}
                className="mt-3 text-sm text-[#E85D20] font-medium hover:underline"
                style={{ minHeight: 'auto' }}
              >
                {isExpanded ? 'Collapse ↑' : 'Explore This Path →'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}