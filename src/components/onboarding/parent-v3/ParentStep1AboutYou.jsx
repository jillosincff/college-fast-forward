import React from 'react';
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

export default function ParentStep1AboutYou({ formData, onUpdate, onNext, onBack, loading }) {
  const handleContinue = () => {
    onNext();
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

      {/* Framing card */}
      <div style={{ background: '#1A1A1A', borderLeft: '3px solid #E85D20', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: ORANGE, margin: '0 0 8px' }}>WHY WE ASK</p>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#fff', lineHeight: 1.65, margin: '0 0 8px' }}>
          Your professional background is your superpower here. When you complete your profile, students targeting your industry can find you and reach out directly for guidance or introductions.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, fontStyle: 'italic', color: ORANGE, margin: 0 }}>
          You decide how much you engage — but showing up here could change someone's life.
        </p>
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
        <FieldLabel required>What industry are you in?</FieldLabel>
        <FieldSelect
          value={formData.industry || ''}
          onChange={e => onUpdate({ industry: e.target.value })}
          placeholder="Select your industry"
          options={INDUSTRIES}
        />
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
      <PrimaryButton onClick={handleContinue} loading={loading} disabled={loading}>
        {loading ? 'Saving...' : 'Continue →'}
      </PrimaryButton>

      <BackLink onClick={onBack} />
    </OnboardingShell>
  );
}