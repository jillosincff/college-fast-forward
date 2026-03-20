import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2 } from 'lucide-react';

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

// Button states
const BTN = { idle: 'idle', saving: 'saving', saved: 'saved', error: 'error' };

export default function FreeTierCareerGoalsTab({ user, onOpenUpgrade, onGoalsSaved }) {
  const [role, setRole] = useState('');
  const [industries, setIndustries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [gradYear, setGradYear] = useState('');
  const [locations, setLocations] = useState([]);
  const [companyInput, setCompanyInput] = useState('');
  const [companySkipped, setCompanySkipped] = useState(false);
  const [btnState, setBtnState] = useState(BTN.idle);
  const [btnError, setBtnError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      if (g.saved_at) setShowConfirmation(true);
    } else {
      // Fall back to flat fields
      setRole(user?.target_role || '');
      setIndustries(user?.target_industries || []);
      setCompanies(user?.target_companies || []);
      setGradYear(user?.graduation_year?.toString() || '');
      setLocations(user?.location_preferences || []);
    }
  }, [user]);

  const handleSave = async () => {
    setBtnState(BTN.saving);
    setBtnError('');
    try {
      await base44.auth.updateMe({
        // Flat fields for backward compat with other tabs
        target_role: role,
        target_industries: industries,
        target_companies: companies,
        graduation_year: gradYear ? parseInt(gradYear) : null,
        location_preferences: locations,
        firstVisitComplete: true,
        // Nested career_goals object
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
      setShowConfirmation(true);
      if (onGoalsSaved) onGoalsSaved();
      setTimeout(() => setBtnState(BTN.idle), 3000);
    } catch (err) {
      console.error('Failed to save goals:', err);
      setBtnState(BTN.error);
      setBtnError('Something went wrong. Please try again.');
      setTimeout(() => setBtnState(BTN.idle), 3000);
    }
  };

  const toggleIndustry = (ind) => setIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  const toggleLocation = (loc) => setLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);

  const btnLabel = () => {
    if (btnState === BTN.saving) return null;
    if (btnState === BTN.saved) return 'Goals Saved ✓';
    if (btnState === BTN.error) return 'Save Failed — Try Again';
    return 'Save My Goals →';
  };

  const btnBg = () => {
    if (btnState === BTN.saved) return '#22C55E';
    if (btnState === BTN.error) return '#EF4444';
    return '#E85D20';
  };

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
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            What kind of role are you looking for?
          </label>
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
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            What industries interest you?
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => toggleIndustry(ind)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  industries.includes(ind)
                    ? 'bg-[#E85D20] text-white'
                    : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'
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
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            What are your target companies?
          </label>
          {companySkipped ? (
            <p style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>
              <span style={{ color: '#E85D20' }}>✓</span> Skipped — FastIQ will suggest companies for you after setup.
            </p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Start typing company names..."
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
                    <button
                      onClick={() => setCompanies(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-[#E85D20] hover:text-[#d44e14]"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {companyInput.length === 0 && companies.length === 0 && (
                <div className="rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] p-4 mt-1">
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', marginBottom: 8 }}>NOT SURE WHERE TO START?</p>
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 0 }}>Think about:</p>
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
                    Or skip for now — FastIQ will suggest target companies based on your major and interests once you save your goals.
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Graduation Year */}
        <div>
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Graduation year</label>
          <select
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#E0E0E0] bg-white text-[#1A1A1A]"
          >
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
                  locations.includes(loc)
                    ? 'bg-[#E85D20] text-white'
                    : 'bg-white text-[#666666] border border-[#E0E0E0] hover:border-[#E85D20]'
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
          className="w-full text-white px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ minHeight: 'auto', background: btnBg(), transition: 'background 0.3s' }}
        >
          {btnState === BTN.saving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
          ) : (
            btnLabel()
          )}
        </button>

        {btnState === BTN.error && btnError && (
          <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginTop: -8 }}>{btnError}</p>
        )}

        {/* Post-save confirmation card */}
        {showConfirmation && (
          <div style={{ background: '#1A1A1A', borderLeft: '3px solid #E85D20', borderRadius: 12, padding: 16 }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>Goals saved.</p>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 8 }}>
              FastIQ uses these goals to find your alumni, build your outreach, and create your daily action plan.
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, color: '#E85D20', marginBottom: 16 }}>
              Your goals are set. Now let FastIQ put them to work.
            </p>
            <div className="space-y-2">
              <button
                onClick={onOpenUpgrade}
                className="w-full border border-[#E85D20] text-[#E85D20] py-2.5 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
                style={{ minHeight: 'auto' }}
              >
                Unlock FastIQ →
              </button>
              <button
                onClick={onOpenUpgrade}
                className="w-full border border-[#E85D20] text-[#E85D20] py-2.5 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
                style={{ minHeight: 'auto' }}
              >
                Ask My Parent to Activate →
              </button>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#555', marginTop: 10, textAlign: 'center' }}>
              Free 7-day trial included. Cancel anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}