import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

const INDUSTRIES = [
  'Accounting & Finance', 'Advertising & Marketing', 'Architecture & Design',
  'Consulting', 'Education', 'Engineering & Technology', 'Entertainment & Media',
  'Fashion & Retail', 'Government & Public Policy', 'Healthcare & Life Sciences',
  'Hospitality & Tourism', 'Investment Banking & Private Equity', 'Law & Legal Services',
  'Manufacturing & Operations', 'Non-Profit & Social Impact', 'Real Estate',
  'Sales & Business Development', 'Sports & Athletics', 'Supply Chain & Logistics', 'Other',
];

const HELP_TYPES = [
  { value: 'networking_intros', label: 'Making introductions' },
  { value: 'career_advice', label: 'Career advice' },
  { value: 'resume_review', label: 'Resume / LinkedIn review' },
  { value: 'interview_prep', label: 'Interview prep' },
  { value: 'job_referrals', label: 'Job referrals' },
  { value: 'industry_insights', label: 'Industry insights' },
];

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid #2A2A2A',
  borderRadius: 10,
  padding: '12px 14px',
  fontFamily: dmSans,
  fontSize: 14,
  color: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontFamily: dmSans,
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: ORANGE,
  marginBottom: 8,
};

export default function AlumniOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [gradYear, setGradYear] = useState('');
  const [school, setSchool] = useState('');
  const [industry, setIndustry] = useState('');
  const [helpTypes, setHelpTypes] = useState([]);

  const toggleHelp = (val) => {
    setHelpTypes(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    setError(null);
    try {
      await base44.auth.updateMe({
        persona: 'alumni',
        roles: ['alumni'],
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        graduation_year: gradYear,
        school: school.trim(),
        school_name: school.trim(),
        university: school.trim(),
        industry,
        ways_to_help: helpTypes,
        help_types: helpTypes,
        visible_in_directory: true,
        directory_consent_given: true,
      });

      // Send welcome email
      try {
        await base44.functions.invoke('sendWelcomeEmail', {
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.full_name,
          firstName: user?.full_name?.split(' ')[0] || '',
          persona: 'alumni',
          alumniIntent: user?.alumni_intent || 'giving_help',
          schoolName: school.trim(),
        });
      } catch (err) {
        console.error('sendWelcomeEmail error:', err);
      }

      if (refreshUser) {
        try { await refreshUser(); } catch (e) { /* non-blocking */ }
      }

      navigate('AlumniAllSet');
    } catch (err) {
      console.error('AlumniOnboarding save failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const Dot = ({ active }) => (
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? ORANGE : 'rgba(255,255,255,0.15)' }} />
  );

  // ── Step 1: School + Grad Year + Industry ──
  if (step === 1) {
    const canContinue = gradYear.trim().length === 4 && school.trim() && industry;
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
            <Dot active /> <Dot active={false} />
          </div>

          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '40px 32px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: ORANGE, margin: '0 0 16px' }}>
              Alumni Onboarding
            </p>
            <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 4vw, 28px)', color: '#fff', lineHeight: 1.3, margin: '0 0 8px' }}>
              Tell us about yourself.
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
              This helps students find and connect with you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Your School / University</label>
                <SchoolSearchInput value={school} onChange={setSchool} />
              </div>

              <div>
                <label style={labelStyle}>Graduation Year</label>
                <input
                  value={gradYear}
                  onChange={e => setGradYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g. 2018"
                  maxLength={4}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = ORANGE; }}
                  onBlur={e => { e.target.style.borderColor = '#2A2A2A'; }}
                />
              </div>

              <div>
                <label style={labelStyle}>Your Industry</label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', color: industry ? '#fff' : '#666' }}
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind} style={{ background: '#1A1A1A' }}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canContinue}
              style={{
                width: '100%', marginTop: 32, padding: '14px 24px', borderRadius: 100,
                border: 'none', background: canContinue ? ORANGE : 'rgba(232,93,32,0.3)',
                color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                cursor: canContinue ? 'pointer' : 'not-allowed', minHeight: 'auto',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: How can you help? ──
  const canFinish = helpTypes.length > 0;
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <Dot active={false} /> <Dot active />
        </div>

        <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '40px 32px' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: ORANGE, margin: '0 0 16px' }}>
            Alumni Onboarding
          </p>
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 4vw, 28px)', color: '#fff', lineHeight: 1.3, margin: '0 0 8px' }}>
            How can you help?
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', margin: '0 0 28px', lineHeight: 1.6 }}>
            Select all that apply. Students will see this on your profile.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {HELP_TYPES.map(({ value, label }) => {
              const selected = helpTypes.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleHelp(value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: `1.5px solid ${selected ? ORANGE : '#2A2A2A'}`,
                    background: selected ? 'rgba(232,93,32,0.12)' : 'transparent',
                    color: selected ? '#fff' : '#aaa',
                    fontFamily: dmSans, fontSize: 14, fontWeight: selected ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                    transition: 'all 0.15s',
                  }}
                >
                  {selected ? '✓ ' : ''}{label}
                </button>
              );
            })}
          </div>

          {error && (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#f87171', marginTop: 16 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                padding: '14px 20px', borderRadius: 100, border: '1px solid #2A2A2A',
                background: 'transparent', color: '#888', fontFamily: dmSans, fontSize: 14,
                cursor: 'pointer', minHeight: 'auto',
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={!canFinish || saving}
              style={{
                flex: 1, padding: '14px 24px', borderRadius: 100, border: 'none',
                background: canFinish && !saving ? ORANGE : 'rgba(232,93,32,0.3)',
                color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                cursor: canFinish && !saving ? 'pointer' : 'not-allowed', minHeight: 'auto',
              }}
            >
              {saving ? 'Setting up...' : "I'm in →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}