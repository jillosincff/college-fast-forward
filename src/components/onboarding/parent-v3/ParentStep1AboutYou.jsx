import React, { useState } from 'react';
import {
  OnboardingShell, ProgressDots, FieldLabel, FieldInput, FieldSelect,
  HelperText, PrimaryButton, BackLink, dmSans, playfair, ORANGE,
} from './ParentOnboardingShell';

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

export default function ParentStep1AboutYou({ formData, onUpdate, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.fullName?.trim()) e.fullName = 'Full name is required';
    if (!formData.company?.trim()) e.company = 'Company is required';
    if (!formData.industry) e.industry = 'Industry is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) onNext();
  };

  return (
    <OnboardingShell>
      <ProgressDots current={0} total={2} />

      {/* Header */}
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#f4f0e8', textAlign: 'center', lineHeight: 1.3, marginBottom: 8 }}>
        Tell us a little about yourself.
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
        This helps us match your connections to students who need them.
      </p>

      {/* Full Name */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel required>Full Name</FieldLabel>
        <FieldInput
          value={formData.fullName || ''}
          onChange={e => { onUpdate({ fullName: e.target.value }); setErrors(p => ({ ...p, fullName: null })); }}
          placeholder="Your full name"
          error={errors.fullName}
        />
        {errors.fullName && <HelperText error>{errors.fullName}</HelperText>}
      </div>

      {/* Company */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel required>Where do you work?</FieldLabel>
        <FieldInput
          value={formData.company || ''}
          onChange={e => { onUpdate({ company: e.target.value }); setErrors(p => ({ ...p, company: null })); }}
          placeholder="Company name"
          error={errors.company}
        />
        {errors.company ? <HelperText error>{errors.company}</HelperText> : (
          <HelperText>This is your core value to the network — students search by company.</HelperText>
        )}
      </div>

      {/* Industry */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel required>What industry are you in?</FieldLabel>
        <FieldSelect
          value={formData.industry || ''}
          onChange={e => { onUpdate({ industry: e.target.value }); setErrors(p => ({ ...p, industry: null })); }}
          placeholder="Select your industry"
          options={INDUSTRIES}
          error={errors.industry}
        />
        {errors.industry && <HelperText error>{errors.industry}</HelperText>}
      </div>

      {/* Intro willingness */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel>Are you open to making introductions for students?</FieldLabel>
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

      {/* Directory Visibility Toggle */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
          Directory Visibility
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
      <PrimaryButton onClick={handleContinue}>Continue →</PrimaryButton>

      <BackLink onClick={onBack} />
    </OnboardingShell>
  );
}