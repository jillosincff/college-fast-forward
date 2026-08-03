import React, { useState, useRef, useEffect } from 'react';
import {
  OnboardingShell, ProgressDots, FieldLabel, FieldInput,
  HelperText, PrimaryButton, BackLink, dmSans, playfair, ORANGE,
} from './ParentOnboardingShell';
import SchoolNetworkProof from './SchoolNetworkProof';

const COMMON_UNIVERSITIES = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'Florida Atlantic University', 'University of Miami', 'University of South Florida',
  'Ohio State University', 'University of Michigan', 'Penn State University',
  'University of Georgia', 'University of Maryland', 'University of Delaware',
  'Tulane University', 'James Madison University', 'University of South Carolina',
  'University of Kentucky', 'University of Texas at Austin', 'UC Berkeley',
  'University of Virginia', 'Duke University', 'University of North Carolina',
  'Northwestern University', 'University of Notre Dame', 'Georgetown University',
  'Boston University', 'Northeastern University', 'NYU', 'Cornell University',
  'University of Pennsylvania', 'Yale University', 'Harvard University', 'Stanford University',
  'UCLA', 'USC', 'University of Washington', 'Arizona State University',
  'University of Illinois', 'Indiana University', 'Purdue University',
  'Michigan State University', 'University of Wisconsin', 'University of Minnesota',
  'Virginia Tech', 'Georgia Tech', 'Texas A&M University', 'Rice University',
  'Vanderbilt University', 'Emory University', 'Carnegie Mellon University',
  'University of Pittsburgh', 'Rutgers University', 'University of Connecticut',
  'University of Colorado Boulder', 'Babson College', 'Other',
];

/**
 * Step 1 — only the three fields we actually require. Everything optional moved
 * to step 2 so parents reach a commitment point before the form feels long.
 */
export default function ParentStep1Essentials({ formData, onUpdate, onNext, onBack, loading }) {
  const [schoolSearch, setSchoolSearch] = useState(formData.school || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (schoolSearch.length >= 2) {
      const q = schoolSearch.toLowerCase();
      const matches = COMMON_UNIVERSITIES.filter(u => u.toLowerCase().includes(q)).slice(0, 8);
      setFilteredSchools(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [schoolSearch]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectSchool = (name) => {
    setSchoolSearch(name);
    onUpdate({ school: name });
    setShowDropdown(false);
    setErrors(p => ({ ...p, school: null }));
  };

  const validate = () => {
    const e = {};
    if (!schoolSearch.trim()) e.school = "Please add your student's school.";
    if (!(formData.fullName || '').trim()) e.fullName = 'Please add your full name.';
    if (!(formData.company || '').trim()) e.company = 'Please add where you work — this is what students search by.';
    return e;
  };

  // Inline validation: only surface an error once a field has been visited.
  const markTouched = (field) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(validate());
  };

  const handleContinue = () => {
    const e = validate();
    setErrors(e);
    setTouched({ school: true, fullName: true, company: true });
    if (Object.keys(e).length > 0) return;
    onUpdate({ school: schoolSearch.trim() });
    onNext();
  };

  const showErr = (field) => (touched[field] ? errors[field] : null);

  return (
    <OnboardingShell>
      <ProgressDots current={0} total={3} />

      <h1 style={{ fontFamily: playfair, fontWeight: 800, fontSize: 26, color: '#0f172a', textAlign: 'center', lineHeight: 1.3, marginBottom: 8, letterSpacing: '-0.02em' }}>
        Help students find you.
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#475569', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
        Three quick things — that’s all it takes to get on students’ radar.
      </p>

      {/* Framing card */}
      <div style={{ borderLeft: '3px solid #6d28d9', padding: '16px 20px', background: 'rgba(109,40,217,0.06)', borderRadius: '0 10px 10px 0', marginBottom: 24 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, margin: '0 0 10px' }}>WHY WE ASK</p>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#334155', margin: '0 0 10px', lineHeight: 1.7 }}>
          Your network helps students get in front of the right people — whether you’re currently working, between roles, retired, or a stay-at-home parent with years of professional experience.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: ORANGE, margin: 0, lineHeight: 1.7, fontStyle: 'italic' }}>
          You decide how much you engage — but showing up here could change someone’s life.
        </p>
      </div>

      {/* School */}
      <div style={{ marginBottom: 20, position: 'relative' }} ref={dropdownRef}>
        <FieldLabel required>Which school is your student at?</FieldLabel>
        <input
          value={schoolSearch}
          onChange={e => {
            setSchoolSearch(e.target.value);
            onUpdate({ school: e.target.value });
            if (touched.school) setErrors(validate());
          }}
          onBlur={() => markTouched('school')}
          placeholder="Start typing their university..."
          className="po3-field"
          style={{
            width: '100%', background: '#F8FAFC',
            border: `1.5px solid ${showErr('school') ? 'rgba(244,63,94,0.6)' : '#E2E8F0'}`,
            borderRadius: 12, padding: '14px 16px',
            fontFamily: dmSans, fontSize: 15, fontWeight: 400,
            color: '#0f172a', boxSizing: 'border-box',
          }}
        />
        {showErr('school')
          ? <HelperText error>{errors.school}</HelperText>
          : <HelperText>This connects you to the right school network.</HelperText>}

        <SchoolNetworkProof school={schoolSearch} />

        {showDropdown && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: '#ffffff', border: '1px solid #E2E8F0',
            borderRadius: 12, marginTop: 4, maxHeight: 200, overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          }}>
            {filteredSchools.map(school => (
              <button
                key={school}
                type="button"
                onClick={() => selectSchool(school)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px', background: 'none', border: 'none',
                  fontFamily: dmSans, fontSize: 14, color: '#0f172a',
                  cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5ff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                {school}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full Name */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel required>Full Name</FieldLabel>
        <FieldInput
          value={formData.fullName || ''}
          onChange={e => { onUpdate({ fullName: e.target.value }); if (touched.fullName) setErrors(validate()); }}
          onBlur={() => markTouched('fullName')}
          placeholder="Your full name"
          error={showErr('fullName')}
        />
        {showErr('fullName') && <HelperText error>{errors.fullName}</HelperText>}
      </div>

      {/* Company */}
      <div style={{ marginBottom: 28 }}>
        <FieldLabel required>Where do you work or have you worked?</FieldLabel>
        <FieldInput
          value={formData.company || ''}
          onChange={e => { onUpdate({ company: e.target.value }); if (touched.company) setErrors(validate()); }}
          onBlur={() => markTouched('company')}
          placeholder="e.g. Disney, Goldman Sachs, Google..."
          error={showErr('company')}
        />
        {showErr('company')
          ? <HelperText error>{errors.company}</HelperText>
          : <HelperText>This is what students search by — enter your company on its own (most recent is fine if you’re between roles).</HelperText>}
      </div>

      <PrimaryButton onClick={handleContinue} loading={loading} disabled={loading}>
        Continue →
      </PrimaryButton>

      <BackLink onClick={onBack} />
    </OnboardingShell>
  );
}