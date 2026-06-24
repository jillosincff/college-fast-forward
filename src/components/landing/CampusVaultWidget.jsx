import React, { useState, useRef, useEffect } from 'react';

// Broad US college list for autocomplete
const US_COLLEGES = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Miami', 'Florida International University', 'University of South Florida',
  'Ohio State University', 'University of Michigan', 'Penn State University',
  'University of Southern California', 'University of Georgia', 'University of Maryland',
  'Tulane University', 'University of Delaware', 'New York University',
  'Boston University', 'Georgetown University', 'University of Texas at Austin',
  'UCLA', 'UC Berkeley', 'UC San Diego', 'UC Davis', 'UC Santa Barbara',
  'Indiana University', 'Purdue University', 'Arizona State University',
  'University of Wisconsin-Madison', 'University of Illinois Urbana-Champaign',
  'Northeastern University', 'Temple University', 'Drexel University',
  'University of Minnesota', 'University of Washington', 'University of Oregon',
  'University of Colorado Boulder', 'University of Arizona', 'University of Utah',
  'Michigan State University', 'University of Iowa', 'University of Kansas',
  'University of Missouri', 'University of Nebraska', 'Kansas State University',
  'Virginia Tech', 'University of Virginia', 'George Mason University',
  'James Madison University', 'Old Dominion University',
  'North Carolina State University', 'University of North Carolina at Chapel Hill',
  'Duke University', 'Wake Forest University', 'Davidson College',
  'Clemson University', 'University of South Carolina', 'College of Charleston',
  'Auburn University', 'University of Alabama', 'Mississippi State University',
  'Louisiana State University', 'University of Tennessee', 'Vanderbilt University',
  'University of Kentucky', 'University of Louisville',
  'Texas A&M University', 'University of Houston', 'Texas Tech University',
  'SMU', 'TCU', 'Baylor University', 'Rice University',
  'Northwestern University', 'University of Chicago', 'DePaul University',
  'Loyola University Chicago', 'Illinois State University',
  'Notre Dame University', 'Butler University', 'Ball State University',
  'Miami University', 'Ohio University', 'University of Cincinnati',
  'Case Western Reserve University', 'Bowling Green State University',
  'University of Pittsburgh', 'Carnegie Mellon University', 'Penn State Altoona',
  'Villanova University', 'Lehigh University', 'Bucknell University',
  'Fordham University', 'Hofstra University', 'Stony Brook University',
  'University at Buffalo', 'Syracuse University', 'Cornell University',
  'Columbia University', 'Princeton University', 'Yale University',
  'Harvard University', 'MIT', 'Tufts University', 'Boston College',
  'Brown University', 'Dartmouth College', 'University of New Hampshire',
  'University of Vermont', 'University of Connecticut', 'Quinnipiac University',
  'University of Rhode Island', 'Roger Williams University',
  'Rutgers University', 'Seton Hall University', 'Montclair State University',
  'University of Denver', 'Colorado State University', 'Colorado College',
  'Boise State University', 'University of Idaho', 'Washington State University',
  'Portland State University', 'Oregon State University',
  'University of Nevada Las Vegas', 'University of Nevada Reno',
  'San Diego State University', 'Cal Poly San Luis Obispo', 'Fresno State',
  'Santa Clara University', 'University of San Francisco', 'Stanford University',
  'Emory University', 'Georgia Tech', 'Georgia State University',
  'Spelman College', 'Morehouse College', 'Howard University',
];

// Quick-pick featured schools shown as pills
const FEATURED = [
  { label: 'UF',       name: 'University of Florida' },
  { label: 'FSU',      name: 'Florida State University' },
  { label: 'Ohio St.', name: 'Ohio State University' },
  { label: 'Penn St.', name: 'Penn State University' },
  { label: 'Michigan', name: 'University of Michigan' },
];

// Generate a plausible alumni count for any school (deterministic from name length)
function getCount(name) {
  const base = 400 + (name.length * 17 + name.charCodeAt(0) * 3) % 700;
  return base;
}

export default function CampusVaultWidget({ go, onSchoolSelect, FONT, TEXT, TEXT2, TEXT3, CARD, BG, BLUE, BLUE_LIGHT, BLUE_BORDER, GREEN, GREEN_LIGHT, GREEN_BORDER, SHADOW, SHADOW_MD, R }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('form');
  const [formData, setFormData] = useState({ university: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef();
  const containerRef = useRef();

  // Mock job matches data
  const mockJobs = [
    { title: 'Software Engineering Intern', company: 'Google', daysAgo: 6, matchStrength: 'High', insiders: 2 },
    { title: 'Finance Analyst', company: 'Goldman Sachs', daysAgo: 3, matchStrength: 'High', insiders: 1 },
    { title: 'Marketing Coordinator', company: 'Meta', daysAgo: 12, matchStrength: 'Medium', insiders: 3 },
    { title: 'Data Science Intern', company: 'Microsoft', daysAgo: 8, matchStrength: 'High', insiders: 1 },
    { title: 'Product Management Rotational', company: 'Amazon', daysAgo: 5, matchStrength: 'Medium', insiders: 2 },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.university) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setModalStep('success');
    setIsSubmitting(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStep('form');
    setFormData({ university: '', email: '' });
  };

  const selectSchool = (name) => {
    setQuery(name);
    setSelectedSchool(name);
    setSuggestions([]);
    setDropdownOpen(false);
    try { localStorage.setItem('cff_selected_school', name); } catch {}
    
    // Show loading state first
    setIsLoading(true);
    setShowResults(false);
    
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
      if (onSchoolSelect) onSchoolSelect(name);
    }, 1800);
  };

  const handleInput = (val) => {
    setQuery(val);
    setSelectedSchool(null);
    if (val.length < 2) { setSuggestions([]); setDropdownOpen(false); return; }
    const filtered = US_COLLEGES.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 7);
    setSuggestions(filtered);
    setDropdownOpen(filtered.length > 0);
  };

  const count = selectedSchool ? getCount(selectedSchool) : null;

  return (
    <div style={{ padding: '80px 24px', background: BG }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,102,255,0.15)} 50%{box-shadow:0 0 0 8px rgba(0,102,255,0)} }
          @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        `}</style>

        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>
          Your Campus Vault
        </p>
        <h2 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 10px', lineHeight: 1.2 }}>
          Stop applying as a stranger.<br />Tap into your school's home-team advantage.
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 8px', lineHeight: 1.6 }}>
          Employers get flooded with thousands of random resumes. We connect you directly with alumni and parents from your university who are already eager to pull your application to the top of the pile.
        </p>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 32px', lineHeight: 1.6 }}>
          Pick your school below to see how many advocates and matched roles are waiting for you.
        </p>

        {/* Autocomplete search */}
        <div ref={containerRef} style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: CARD, border: `2px solid ${dropdownOpen || selectedSchool ? BLUE : '#E2E8F0'}`,
            borderRadius: 14, padding: '4px 4px 4px 18px',
            boxShadow: dropdownOpen ? `0 0 0 4px ${BLUE_BORDER}` : SHADOW_MD,
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🎓</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleInput(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setDropdownOpen(true); }}
              placeholder="Type your university name (e.g., University of Miami...)"
              style={{
                flex: 1, fontFamily: FONT, fontSize: 15, color: TEXT,
                background: 'transparent', border: 'none', outline: 'none',
                padding: '12px 0',
              }}
            />
            <button
              onClick={() => {
                if (query.trim()) selectSchool(query.trim());
                else if (onSchoolSelect) onSchoolSelect('');
              }}
              style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff',
                background: `linear-gradient(135deg, ${BLUE} 0%, #06B6D4 100%)`,
                border: 'none', borderRadius: 10, padding: '12px 22px',
                cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              ⚡ Show Me Hidden Roles
            </button>
          </div>

          {/* Dropdown */}
          {dropdownOpen && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: CARD, border: `1px solid ${BLUE_BORDER}`,
              borderRadius: 12, boxShadow: SHADOW_MD, marginTop: 6, overflow: 'hidden',
            }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => selectSchool(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    fontFamily: FONT, fontSize: 14, color: TEXT, background: 'transparent',
                    border: 'none', borderBottom: '1px solid #F1F5F9',
                    padding: '13px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 14 }}>🎓</span>
                  <span>{s}</span>
                  <span style={{ marginLeft: 'auto', fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN }}>
                    {getCount(s)}+ insiders
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Universal catch-all */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#fff',
              background: '#0F172A', border: '1.5px solid #0F172A',
              borderRadius: 100, padding: '7px 16px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1E293B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0F172A'; }}
          >
            My school isn't listed? Click here
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }} onClick={closeModal}>
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%',
                padding: 32, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                animation: 'fadeUp 0.2s ease',
              }}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute', top: 16, right: 16, background: 'transparent',
                  border: 'none', fontSize: 24, cursor: 'pointer', color: '#64748B',
                  padding: 4, minHeight: 'auto', lineHeight: 1,
                }}
              >
                ×
              </button>

              {modalStep === 'form' ? (
                <>
                  <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                    Can't find your school?
                  </h3>
                  <p style={{ fontFamily: FONT, fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.6 }}>
                    We're adding new universities every week.<br />
                    Drop your school + email below and we'll notify you the moment it's live in the Campus Vault.
                  </p>

                  <form onSubmit={handleModalSubmit}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        University Name
                      </label>
                      <input
                        type="text"
                        value={formData.university}
                        onChange={e => setFormData({ ...formData, university: e.target.value })}
                        placeholder="e.g., University of California, Los Angeles"
                        required
                        style={{
                          width: '100%', fontFamily: FONT, fontSize: 14, color: '#0F172A',
                          background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10,
                          padding: '12px 14px', boxSizing: 'border-box', outline: 'none',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = BLUE}
                        onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                      />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Email Address <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@university.edu"
                        required
                        style={{
                          width: '100%', fontFamily: FONT, fontSize: 14, color: '#0F172A',
                          background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 10,
                          padding: '12px 14px', boxSizing: 'border-box', outline: 'none',
                          transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = BLUE}
                        onBlur={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: '100%', fontFamily: FONT, fontSize: 15, fontWeight: 800,
                        color: '#fff', background: isSubmitting ? '#94A3B8' : BLUE,
                        border: 'none', borderRadius: 12, padding: '14px 24px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1,
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Notify Me When My School Is Added'}
                    </button>

                    <p style={{ fontFamily: FONT, fontSize: 11, color: '#94A3B8', textAlign: 'center', margin: '12px 0 0' }}>
                      We respect your inbox. You can unsubscribe anytime.
                    </p>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                    <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                      You're on the list!
                    </h3>
                    <p style={{ fontFamily: FONT, fontSize: 14, color: '#64748B', margin: '0 0 8px', lineHeight: 1.6 }}>
                      Thanks! We'll email you as soon as <strong style={{ color: BLUE }}>{formData.university}</strong> is added to CFF.
                    </p>
                    <p style={{ fontFamily: FONT, fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.6 }}>
                      In the meantime, feel free to explore our free resources or join the general waitlist for early access.
                    </p>
                    <button
                      onClick={closeModal}
                      style={{
                        fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff',
                        background: BLUE, border: 'none', borderRadius: 10, padding: '12px 28px',
                        cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                      onMouseLeave={e => e.currentTarget.style.background = BLUE}
                    >
                      Back to Search
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={{
            background: CARD, borderRadius: 16,
            border: `2px solid ${BLUE_BORDER}`,
            boxShadow: `0 12px 32px rgba(0,102,255,0.12)`,
            padding: '48px 24px', textAlign: 'center',
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${BLUE_LIGHT}`, borderTop: `4px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
            <p style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: TEXT, margin: 0 }}>
              Scanning <strong style={{ color: BLUE }}>{query || selectedSchool}</strong> alumni network…
            </p>
          </div>
        )}

        {/* Results Screen */}
        {showResults && selectedSchool && (
          <div style={{
            background: CARD, borderRadius: 16,
            border: `2px solid ${BLUE_BORDER}`,
            boxShadow: `0 12px 32px rgba(0,102,255,0.12)`,
            padding: '32px 28px', textAlign: 'left',
            animation: 'fadeUp 0.3s ease',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: GREEN_LIGHT, border: `2px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14, color: GREEN }}>✓</span>
              </div>
              <h3 style={{ fontFamily: FONT, fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>
                {selectedSchool} Campus Vault Unlocked
              </h3>
            </div>

            {/* Big Result Number */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontFamily: FONT, fontSize: 'clamp(42px, 8vw, 64px)', fontWeight: 800, color: BLUE, margin: '0 0 8px', letterSpacing: '-0.04em', lineHeight: 1 }}>
                47
              </p>
              <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT, margin: '0 0 6px' }}>
                hidden opportunities matched for you right now
              </p>
              <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
                These roles are never posted on public job boards. CFF found them through your school's alumni network.
              </p>
            </div>

            {/* Job Matches */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
                🔥 Top Matches This Week
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mockJobs.slice(0, 4).map((job, i) => (
                  <div key={i} style={{
                    background: BG, borderRadius: 12, padding: '16px 18px',
                    border: '1px solid #E2E8F0', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>
                          {job.title}
                        </p>
                        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>
                          {job.company} • Posted {job.daysAgo} days ago via alumni
                        </p>
                      </div>
                      <span style={{
                        fontFamily: FONT, fontSize: 11, fontWeight: 700,
                        color: job.matchStrength === 'High' ? '#059669' : '#D97706',
                        background: job.matchStrength === 'High' ? GREEN_LIGHT : '#FEF3C7',
                        border: `1px solid ${job.matchStrength === 'High' ? GREEN_BORDER : '#FCD34D'}`,
                        borderRadius: 100, padding: '4px 10px',
                      }}>
                        {job.matchStrength} Match
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: FONT, fontSize: 11, color: TEXT2 }}>
                        {job.insiders} insider{job.insiders > 1 ? 's' : ''} can connect you
                      </span>
                      <button style={{
                        fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '4px 8px', minHeight: 'auto', marginLeft: 'auto',
                      }}>
                        View Role →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insider Summary */}
            <div style={{
              background: BLUE_LIGHT, borderRadius: 12, padding: '20px 22px',
              border: `1px solid ${BLUE_BORDER}`, marginBottom: 28,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>🎓</span>
                <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: BLUE, margin: 0 }}>
                  Campus Insider Summary
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: BLUE, margin: '0 0 2px' }}>
                    12
                  </p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0 }}>
                    Verified insiders at target companies
                  </p>
                </div>
                <div>
                  <p style={{ fontFamily: FONT, fontSize: 20, fontWeight: 800, color: BLUE, margin: '0 0 2px' }}>
                    3
                  </p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: 0 }}>
                    At Google, Goldman, Meta
                  </p>
                </div>
              </div>
              <button style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff',
                background: BLUE, border: 'none', borderRadius: 10, padding: '10px 20px',
                cursor: 'pointer', minHeight: 'auto', width: '100%',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                onMouseLeave={e => e.currentTarget.style.background = BLUE}
              >
                Connect with Insiders →
              </button>
            </div>

            {/* Next Steps Bar */}
            <div style={{
              background: '#0F172A', borderRadius: 12, padding: '20px 22px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#94A3B8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Next Steps
              </p>
              <button
                onClick={() => { if (onSchoolSelect) onSchoolSelect(selectedSchool); }}
                style={{
                  fontFamily: FONT, fontSize: 14, fontWeight: 800, color: '#fff',
                  background: `linear-gradient(135deg, ${BLUE} 0%, #06B6D4 100%)`,
                  border: 'none', borderRadius: 10, padding: '14px 24px',
                  cursor: 'pointer', minHeight: 'auto', width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                📦 Build My Targeted Application Pack
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <button style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff',
                  background: 'transparent', border: '2px solid #334155', borderRadius: 10,
                  padding: '12px 18px', cursor: 'pointer', minHeight: 'auto',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.color = BLUE; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#fff'; }}
                >
                  See All 47 Roles
                </button>
                <button style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#fff',
                  background: 'transparent', border: '2px solid #334155', borderRadius: 10,
                  padding: '12px 18px', cursor: 'pointer', minHeight: 'auto',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.color = GREEN; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#fff'; }}
                >
                  🎤 Get Interview Coaching
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}