import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const INDUSTRIES = [
  'Technology, Information & Media',
  'Healthcare & Pharmaceuticals',
  'Manufacturing & Industrial',
  'Finance & Insurance',
  'Professional Services',
  'Retail & Consumer Goods',
  'Construction & Agriculture',
  'Transportation & Logistics',
  'Education & Training',
  'Government & Public Sector',
  'Advertising & PR',
  'Sports & Entertainment',
  'Other',
];
const LOCATIONS = ['Remote', 'New York', 'Los Angeles', 'Chicago', 'Boston', 'Miami', 'San Francisco', 'Other'];
const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029', '2030'];

const SAMPLE_COMPANIES = [
  { name: 'Google', industry: 'Technology, Information & Media', signal: 'hot', insight: 'Actively hiring for entry-level roles across multiple teams.' },
  { name: 'Nike', industry: 'Retail & Consumer Goods', signal: 'warm', insight: 'Selective hiring — focus on brand marketing and product roles.' },
  { name: 'Goldman Sachs', industry: 'Finance & Insurance', signal: 'warm', insight: 'Summer analyst applications open for investment banking division.' },
  { name: 'Deloitte', industry: 'Professional Services', signal: 'hot', insight: 'Hiring consultants and business analysts nationwide.' },
  { name: 'Apple', industry: 'Technology, Information & Media', signal: 'cool', insight: 'Limited entry-level openings — internship pipeline preferred.' },
  { name: 'Amazon', industry: 'Technology, Information & Media', signal: 'hot', insight: 'Large-scale hiring for operations, tech, and business roles.' },
  { name: 'Johnson & Johnson', industry: 'Healthcare & Pharmaceuticals', signal: 'warm', insight: 'Consistent hiring in medical devices and consumer health.' },
  { name: 'McKinsey', industry: 'Professional Services', signal: 'warm', insight: 'Recruiting analysts from top universities across all majors.' },
  { name: 'ESPN', industry: 'Sports & Entertainment', signal: 'warm', insight: 'Content and production roles available for new grads.' },
  { name: 'Target', industry: 'Retail & Consumer Goods', signal: 'hot', insight: 'Strong merchandising and supply chain hiring pipeline.' },
];

const SAMPLE_ALUMNI = [
  { company: 'Goldman Sachs', role: 'Analyst', industry: 'Finance & Insurance' },
  { company: 'Google', role: 'Product Manager', industry: 'Technology, Information & Media' },
  { company: 'Nike', role: 'Brand Manager', industry: 'Retail & Consumer Goods' },
  { company: 'Deloitte', role: 'Business Analyst', industry: 'Professional Services' },
  { company: 'Amazon', role: 'Operations Manager', industry: 'Technology, Information & Media' },
];

const SIGNAL_CONFIG = {
  hot: { emoji: '🟢', label: 'Actively Hiring', bg: '#DCFCE7', text: '#15803D' },
  warm: { emoji: '🟡', label: 'Selective', bg: '#FEF9C3', text: '#A16207' },
  cool: { emoji: '🔴', label: 'Freeze', bg: '#FEE2E2', text: '#B91C1C' },
};

const BTN = { idle: 'idle', saving: 'saving', saved: 'saved', error: 'error' };

export default function FreeTierCareerGoalsTab({ user, onOpenUpgrade, onGoalsSaved, onTabChange }) {
  const [role, setRole] = useState('');
  const [industries, setIndustries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [gradYear, setGradYear] = useState('');
  const [locations, setLocations] = useState([]);
  const [companyInput, setCompanyInput] = useState('');
  const [companySkipped, setCompanySkipped] = useState(false);
  const [btnState, setBtnState] = useState(BTN.idle);
  const [btnError, setBtnError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);
  const [savedIndustries, setSavedIndustries] = useState([]);
  const [savedCompanies, setSavedCompanies] = useState([]);

  // Pre-populate from saved values
  useEffect(() => {
    const g = user?.career_goals;
    if (g) {
      setRole(g.role || user?.target_role || '');
      setIndustries(g.industries || user?.target_industries || []);
      setCompanies(g.target_companies || user?.target_companies || []);
      setGradYear(g.graduation_year?.toString() || user?.graduation_year?.toString() || '');
      setLocations(g.locations || user?.location_preferences || []);
      setCompanySkipped(g.companies_skipped || false);
      if (g.saved_at) {
        setSavedIndustries(g.industries || []);
        setSavedCompanies(g.target_companies || []);
        setShowResults(true);
      }
    } else {
      setRole(user?.target_role || '');
      setIndustries(user?.target_industries || []);
      setCompanies(user?.target_companies || []);
      setGradYear(user?.graduation_year?.toString() || '');
      setLocations(user?.location_preferences || []);
    }
  }, [user]);

  // Compute personalized companies for post-save display
  const getPersonalizedCompanies = (inds, comps) => {
    const targetFirst = SAMPLE_COMPANIES.filter(c =>
      comps.some(t => c.name.toLowerCase().includes(t.toLowerCase()))
    );
    const industryMatch = SAMPLE_COMPANIES.filter(c =>
      inds.some(i => c.industry === i) &&
      !comps.some(t => c.name.toLowerCase().includes(t.toLowerCase()))
    );
    const rest = SAMPLE_COMPANIES.filter(c =>
      !targetFirst.includes(c) && !industryMatch.includes(c)
    );
    return [...targetFirst, ...industryMatch, ...rest].slice(0, 3);
  };

  const getPersonalizedAlumni = (inds, comps) => {
    const matched = SAMPLE_ALUMNI.filter(a =>
      comps.some(c => a.company.toLowerCase().includes(c.toLowerCase())) ||
      inds.some(i => a.industry === i)
    );
    const rest = SAMPLE_ALUMNI.filter(a => !matched.includes(a));
    return [...matched, ...rest].slice(0, 3);
  };

  const handleSave = async () => {
    setBtnState(BTN.saving);
    setBtnError('');
    try {
      await base44.auth.updateMe({
        target_role: role,
        target_industries: industries,
        target_companies: companies,
        graduation_year: gradYear ? parseInt(gradYear) : null,
        location_preferences: locations,
        firstVisitComplete: true,
        career_goals: {
          role,
          industries,
          target_companies: companies,
          graduation_year: gradYear ? parseInt(gradYear) : null,
          locations,
          companies_skipped: companySkipped,
          saved_at: new Date().toISOString(),
        },
      });
      setBtnState(BTN.saved);
      setSavedIndustries(industries);
      setSavedCompanies(companies);
      setShowResults(true);
      if (onGoalsSaved) onGoalsSaved();
      setTimeout(() => setBtnState(BTN.idle), 3000);
    } catch (err) {
      console.error('Failed to save goals:', err);
      setBtnState(BTN.error);
      setBtnError('Something went wrong. Please try again.');
      setTimeout(() => { setBtnState(BTN.idle); setBtnError(''); }, 3000);
    }
  };

  const toggleIndustry = (ind) => setIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  const toggleLocation = (loc) => setLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);

  const btnBg = () => {
    if (btnState === BTN.saved) return '#22C55E';
    if (btnState === BTN.error) return '#EF4444';
    return '#E85D20';
  };

  useEffect(() => {
    if (showResults && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showResults]);

  const primaryIndustry = savedIndustries[0] || industries[0] || 'your target industry';
  const personalizedCompanies = getPersonalizedCompanies(savedIndustries, savedCompanies);
  const personalizedAlumni = getPersonalizedAlumni(savedIndustries, savedCompanies);
  const school = user?.school || user?.university || 'your school';

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        CAREER GOALS
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
        Build your career target list.
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 32 }}>
        The clearer your goals, the better FastIQ can help you.
      </p>

      <div className="space-y-6">
        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">What kind of role are you looking for?</label>
          <input
            type="text"
            placeholder="Marketing Manager, Investment Banking Analyst, Software Engineer..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#E0E0E0] bg-white text-[#1A1A1A]"
          />
        </div>

        {/* Industries */}
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">What industries interest you?</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => toggleIndustry(ind)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  industries.includes(ind) ? 'bg-[#E85D20] text-white' : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'
                }`}
                style={{ minHeight: 'auto' }}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Companies */}
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">What are your target companies?</label>
          {companySkipped ? (
            <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>
              <span style={{ color: '#E85D20' }}>✓</span> Skipped — FastIQ will suggest companies for you after setup.
            </p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Type a company name and press Enter..."
                value={companyInput}
                onChange={e => setCompanyInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E0E0E0] bg-white text-[#1A1A1A] mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && companyInput.trim()) {
                    setCompanies(prev => [...prev, companyInput.trim()]);
                    setCompanyInput('');
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mb-2">
                {companies.map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-[#E85D20]/10 text-[#E85D20] text-sm rounded-full flex items-center gap-2">
                    {c}
                    <button onClick={() => setCompanies(prev => prev.filter((_, idx) => idx !== i))} style={{ minHeight: 'auto', minWidth: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#E85D20' }}>×</button>
                  </span>
                ))}
              </div>
              {companyInput.length === 0 && companies.length === 0 && (
                <div className="rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] p-4 mt-1">
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', marginBottom: 8 }}>NOT SURE WHERE TO START?</p>
                  <ul style={{ fontSize: 13, color: '#555', lineHeight: 1.8, paddingLeft: 18, margin: '4px 0 12px' }}>
                    <li>Companies you've seen in your major's coursework</li>
                    <li>Brands you use or admire</li>
                    <li>Places your friends or family work</li>
                    <li>Companies that come up when you search "[your major] jobs"</li>
                  </ul>
                  <button
                    onClick={() => setCompanySkipped(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#999', minHeight: 'auto', padding: 0 }}
                  >
                    Skip for now — FastIQ will suggest companies based on your goals.
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Graduation Year */}
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Graduation year</label>
          <select value={gradYear} onChange={(e) => setGradYear(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-[#E0E0E0] bg-white text-[#1A1A1A]">
            <option value="">Select year</option>
            {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Locations */}
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Where are you open to working?</label>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map(loc => (
              <button
                key={loc}
                onClick={() => toggleLocation(loc)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  locations.includes(loc) ? 'bg-[#E85D20] text-white' : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'
                }`}
                style={{ minHeight: 'auto' }}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={btnState === BTN.saving}
          className="w-full text-white px-6 py-3 rounded-full font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ minHeight: 'auto', background: btnBg(), transition: 'background 0.3s' }}
        >
          {btnState === BTN.saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : btnState === BTN.saved ? 'Goals Saved ✓'
          : btnState === BTN.error ? 'Save Failed — Try Again'
          : 'Save My Goals →'}
        </button>

        {btnError && (
          <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginTop: -8 }}>{btnError}</p>
        )}
      </div>

      {/* ── POST-SAVE RESULTS ── */}
      {showResults && (
        <div ref={resultsRef} style={{ marginTop: 24 }}>

          {/* Section 1 — Confirmation header */}
          <div className="flex items-center gap-2" style={{ marginBottom: 32 }}>
            <CheckCircle2 style={{ width: 18, height: 18, color: '#22C55E', flexShrink: 0 }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              Goals saved. Here's what we found for you.
            </p>
          </div>

          {/* Section 2 — Personalized company intel */}
          <section style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 10 }}>
              COMPANIES HIRING IN YOUR INDUSTRIES
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
              Based on your goals, these companies are actively hiring.
            </h2>
            <div className="space-y-3">
              {personalizedCompanies.map(company => {
                const s = SIGNAL_CONFIG[company.signal];
                return (
                  <div key={company.name} className="bg-white rounded-xl p-5 border border-[#E0E0E0]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 style={{ fontWeight: 700, color: '#1A1A1A', fontSize: 16, margin: 0 }}>{company.name}</h3>
                        <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>{company.industry}</p>
                      </div>
                      <span style={{ background: s.bg, color: s.text, padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {s.emoji} {s.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>{company.insight}</p>
                    <button
                      onClick={() => onTabChange && onTabChange('company_intel')}
                      style={{ fontSize: 13, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      View Full Intel <ArrowRight style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => onTabChange && onTabChange('company_intel')}
              style={{ marginTop: 12, fontSize: 13, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
            >
              See all companies in your industries →
            </button>
          </section>

          {/* Section 3 — Alumni network teaser */}
          <section style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 10 }}>
              YOUR NETWORK
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#1A1A1A', marginBottom: 16 }}>
              <strong>{personalizedAlumni.length * 4}+ alumni</strong> from {school} work at companies in your target industries. The more parents who join, the more possibilities you have.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-3">
              {personalizedAlumni.map((a, i) => (
                <div key={i} className="relative rounded-lg p-4 border border-[#E0E0E0] bg-[#F5F5F5]">
                  <div className="filter blur-sm select-none">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mb-2" />
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#888', margin: '0 0 2px' }}>Profile Hidden</p>
                    <p style={{ fontSize: 12, color: '#999' }}>{a.role}</p>
                    <p style={{ fontSize: 12, color: '#999' }}>{a.company}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={onOpenUpgrade}
                      className="bg-[#E85D20] text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#d44e14] transition-colors"
                      style={{ minHeight: 'auto' }}
                    >
                      🔒 See who to contact →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onTabChange && onTabChange('alumni_network')}
              style={{ fontSize: 13, color: '#E85D20', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}
            >
              See all alumni in your network →
            </button>
          </section>

          {/* Section 4 — Career path suggestion */}
          <section style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 10 }}>
              EXPLORE YOUR PATH
            </p>
            <div className="bg-white rounded-xl p-6 border border-[#E0E0E0]">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                What does a career in {primaryIndustry} actually look like?
              </h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
                Explore real career paths, role breakdowns, and salary ranges for your target industries.
              </p>
              <button
                onClick={() => onTabChange && onTabChange('career_path')}
                className="border border-[#E85D20] text-[#E85D20] px-6 py-2.5 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
                style={{ minHeight: 'auto' }}
              >
                Explore Career Paths →
              </button>
            </div>
          </section>

          {/* Section 5 — Soft upgrade prompt */}
          <section>
            <div style={{ height: 1, background: '#E85D20', opacity: 0.3, marginBottom: 28 }} />
            <div className="text-center">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', marginBottom: 6 }}>
                Want to see exactly who to contact and get a personalized outreach plan?
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: '#E85D20', marginBottom: 20 }}>
                That's what FastIQ is built for.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={onOpenUpgrade}
                  className="border border-[#E85D20] text-[#E85D20] px-6 py-2.5 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
                  style={{ minHeight: 'auto' }}
                >
                  Unlock FastIQ →
                </button>
                <button
                  onClick={onOpenUpgrade}
                  className="border border-[#E85D20] text-[#E85D20] px-6 py-2.5 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
                  style={{ minHeight: 'auto' }}
                >
                  Ask My Parent to Activate →
                </button>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#aaa', marginTop: 12 }}>
                Free 7-day trial included. Cancel anytime.
              </p>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}