import React, { useState, useRef, useEffect } from 'react';
import {
  OnboardingShell, ProgressDots, FieldLabel, FieldInput, FieldSelect,
  HelperText, PrimaryButton, BackLink, dmSans, playfair, ORANGE,
} from './ParentOnboardingShell';

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

const INDUSTRIES = [
  'Accounting & Finance', 'Advertising & Marketing', 'Architecture & Design',
  'Consulting', 'Education', 'Engineering & Technology', 'Entertainment & Media',
  'Fashion & Retail', 'Government & Public Policy', 'Healthcare & Life Sciences',
  'Hospitality & Tourism', 'Investment Banking & Private Equity', 'Law & Legal Services',
  'Manufacturing & Operations', 'Non-Profit & Social Impact', 'Real Estate',
  'Sales & Business Development', 'Sports & Athletics', 'Supply Chain & Logistics', 'Other',
];

const INTRO_OPTIONS = [
  { value: 'yes', label: 'Yes, happy to help' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'not_now', label: 'Not right now' },
];

export default function ParentStep1AboutYou({ formData, onUpdate, onNext, onBack, loading }) {
  const [schoolSearch, setSchoolSearch] = useState(formData.school || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]);
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
  };

  const handleContinue = () => {
    if (schoolSearch.trim()) onUpdate({ school: schoolSearch.trim() });
    onNext();
  };

  return (
    <OnboardingShell>
      <ProgressDots current={0} total={2} />

      {/* Header */}
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#f4f0e8', textAlign: 'center', lineHeight: 1.3, marginBottom: 8 }}>
        Help students find you.
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
        This helps us match your connections to students who need them.
      </p>

      {/* Framing card */}
      <div style={{ borderLeft: '3px solid #E85D20', padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: '0 10px 10px 0', marginBottom: 24 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, margin: '0 0 10px' }}>WHY WE ASK</p>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.82)', margin: '0 0 10px', lineHeight: 1.7 }}>
          Your network helps students get in front of the right people — whether you’re currently working, between roles, retired, or a stay-at-home parent with years of professional experience.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.82)', margin: '0 0 10px', lineHeight: 1.7 }}>
          When you share your background, students who need someone exactly like you can find you and reach out directly — for guidance, advice, or introductions.
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
          }}
          placeholder="Start typing their university..."
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '12px 16px',
            fontFamily: dmSans, fontSize: 14, fontWeight: 300,
            color: '#f4f0e8', boxSizing: 'border-box',
          }}
        />
        <HelperText>This connects you to the right school network.</HelperText>
        {showDropdown && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, marginTop: 4, maxHeight: 200, overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {filteredSchools.map(school => (
              <button
                key={school}
                type="button"
                onClick={() => selectSchool(school)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px', background: 'none', border: 'none',
                  fontFamily: dmSans, fontSize: 13, color: '#f4f0e8',
                  cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
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
          onChange={e => onUpdate({ fullName: e.target.value })}
          placeholder="Your full name"
        />
      </div>

      {/* Company */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>
          Where do you work or have you worked?{' '}
          <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
        </FieldLabel>
        <FieldInput
          value={formData.company || ''}
          onChange={e => onUpdate({ company: e.target.value })}
          placeholder="e.g. Disney, Goldman Sachs, Google..."
        />
        <HelperText>Not currently working? No problem — your past experience and network are just as valuable here.</HelperText>
      </div>

      {/* Career Background */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>
          Career Background{' '}
          <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
        </FieldLabel>
        <FieldInput
          value={formData.careerBackground || ''}
          onChange={e => onUpdate({ careerBackground: e.target.value })}
          placeholder="e.g. 20 years in finance, former marketing exec, retired teacher..."
        />
        <HelperText>This helps students understand your background even if you’re between roles or retired.</HelperText>
      </div>

      {/* Industry */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel>
          What industry are you in or have you worked in?{' '}
          <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
        </FieldLabel>
        <FieldSelect
          value={formData.industry || ''}
          onChange={e => onUpdate({ industry: e.target.value })}
          placeholder="Select your industry"
          options={INDUSTRIES}
        />
      </div>

      {/* Intro willingness */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel>Are you open to introducing students to people in your network?</FieldLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {INTRO_OPTIONS.map(opt => {
            const selected = (formData.introWillingness || 'yes') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ introWillingness: opt.value })}
                style={{
                  flex: 1, minWidth: 110, padding: '10px 12px', borderRadius: 100,
                  fontFamily: dmSans, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                  minHeight: 'auto', whiteSpace: 'nowrap', textAlign: 'center',
                  background: selected ? ORANGE : 'transparent',
                  color: selected ? '#fff' : ORANGE,
                  border: `1.5px solid ${ORANGE}`,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <HelperText>You can change this anytime in your profile settings.</HelperText>
      </div>

      {/* LinkedIn */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel>
          LinkedIn Profile{' '}
          <span style={{ color: '#888', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
        </FieldLabel>
        <FieldInput
          value={formData.linkedinUrl || ''}
          onChange={e => onUpdate({ linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/yourname"
        />
        <HelperText>Parents with LinkedIn get significantly more intro requests from students.</HelperText>
      </div>

      {/* Directory Visibility Toggle */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 8 }}>
          Directory Visibility
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px', lineHeight: 1.5 }}>
          This is what allows students to find and reach out to you.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#f4f0e8', lineHeight: 1.5 }}>
            Make my profile visible to students and parents in the network
          </span>
          <button
            type="button"
            onClick={() => onUpdate({ directoryVisible: formData.directoryVisible === false ? true : !(formData.directoryVisible ?? true) })}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: (formData.directoryVisible ?? true) ? ORANGE : '#444',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0, minHeight: 'auto', minWidth: 44,
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, left: (formData.directoryVisible ?? true) ? 23 : 3,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
        <HelperText>
          {(formData.directoryVisible ?? true)
            ? "Visible by default — students targeting your industry can find and contact you. Toggle off to stay hidden."
            : "Your profile is hidden — you won't appear in search results or receive intro requests."}
        </HelperText>
      </div>

      {/* CTA */}
      <PrimaryButton onClick={handleContinue} loading={loading} disabled={loading}>
        {loading ? 'Saving...' : 'Continue — help students find me →'}
      </PrimaryButton>

      <BackLink onClick={onBack} />
    </OnboardingShell>
  );
}