import React from 'react';
import {
  OnboardingShell, ProgressDots, FieldLabel, FieldInput,
  HelperText, PrimaryButton, BackLink, dmSans, playfair, ORANGE,
} from './ParentOnboardingShell';
import IndustryMultiSelect from './IndustryMultiSelect';

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

/**
 * Step 2 — everything optional. Framed as "make your profile stronger" rather
 * than more required work, so the required fields in step 1 stay short.
 */
export default function ParentStep1bProfile({ formData, onUpdate, onNext, onBack, loading }) {
  const visible = formData.directoryVisible ?? true;

  return (
    <OnboardingShell>
      <ProgressDots current={1} total={3} />

      <h1 style={{ fontFamily: playfair, fontWeight: 800, fontSize: 26, color: '#0f172a', textAlign: 'center', lineHeight: 1.3, marginBottom: 8, letterSpacing: '-0.02em' }}>
        Make your profile stronger.
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#475569', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
        All optional — but each one makes it easier for the right student to find you.
      </p>

      {/* LinkedIn — highest-signal optional field, so it leads */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel>
          LinkedIn Profile{' '}
          <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
        </FieldLabel>
        <FieldInput
          value={formData.linkedinUrl || ''}
          onChange={e => onUpdate({ linkedinUrl: e.target.value })}
          placeholder="https://linkedin.com/in/yourname"
        />
        <HelperText>Parents with LinkedIn get significantly more intro requests from students.</HelperText>
      </div>

      {/* Industries — multi-select */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel>
          What industries are you in or have you worked in?{' '}
          <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
        </FieldLabel>
        <IndustryMultiSelect
          options={INDUSTRIES}
          selected={formData.industries || []}
          onChange={industries => onUpdate({ industries })}
        />
        <HelperText>Select all that apply — more industries means more students can find you.</HelperText>
      </div>

      {/* Career Background */}
      <div style={{ marginBottom: 24 }}>
        <FieldLabel>
          Career Background{' '}
          <span style={{ color: '#94a3b8', fontWeight: 400, textTransform: 'none', fontSize: 11 }}>(optional)</span>
        </FieldLabel>
        <FieldInput
          value={formData.careerBackground || ''}
          onChange={e => onUpdate({ careerBackground: e.target.value })}
          placeholder="e.g. 20 years in finance, former marketing exec, retired teacher..."
        />
        <HelperText>This helps students understand your background even if you’re between roles or retired.</HelperText>
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
                  border: `1.5px solid ${selected ? ORANGE : '#E2E8F0'}`,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <HelperText>You can change this anytime in your profile settings.</HelperText>
      </div>

      {/* Directory Visibility — dark text on the light card (was unreadable white) */}
      <div style={{
        marginBottom: 28, padding: '16px 18px',
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12,
      }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, margin: '0 0 8px' }}>
          Directory Visibility
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#475569', margin: '0 0 14px', lineHeight: 1.5 }}>
          This is what allows students to find and reach out to you.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#0f172a', lineHeight: 1.5 }}>
            Make my profile visible to students and parents in the network
          </span>
          <button
            type="button"
            onClick={() => onUpdate({ directoryVisible: !visible })}
            aria-pressed={visible}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: visible ? ORANGE : '#CBD5E1',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0, minHeight: 'auto', minWidth: 44,
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, left: visible ? 23 : 3,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
        <HelperText>
          {visible
            ? 'Visible by default — students targeting your industry can find and contact you. Toggle off to stay hidden.'
            : "Your profile is hidden — you won't appear in search results or receive intro requests."}
        </HelperText>
      </div>

      <PrimaryButton onClick={onNext} loading={loading} disabled={loading}>
        {loading ? 'Saving...' : 'Continue — help students find me →'}
      </PrimaryButton>

      <BackLink onClick={onBack} />
    </OnboardingShell>
  );
}