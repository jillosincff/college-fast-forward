import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Consulting', 'Healthcare', 'Law',
  'Marketing & Media', 'Real Estate', 'Engineering', 'Government & Policy',
  'Education', 'Non-Profit', 'Sports & Entertainment', 'Other',
];

const HELP_OPTIONS = [
  { value: 'networking_intros', label: 'Make introductions' },
  { value: 'career_advice', label: 'Career advice & guidance' },
  { value: 'resume_review', label: 'Resume / LinkedIn review' },
  { value: 'interview_prep', label: 'Interview prep' },
  { value: 'job_referrals', label: 'Job referrals' },
  { value: 'industry_insights', label: 'Industry insights' },
];

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {children}
      </div>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' }}>
      {children}{required && <span style={{ color: ORANGE }}> *</span>}
    </p>
  );
}

function Field({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, padding: '11px 14px', fontFamily: dmSans, fontSize: 14,
        color: '#fff', boxSizing: 'border-box', outline: 'none',
      }}
    />
  );
}

function PrimaryBtn({ onClick, disabled, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: '100%', background: disabled ? 'rgba(232,93,32,0.3)' : ORANGE,
        border: 'none', borderRadius: 100, padding: '14px 0',
        fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        minHeight: 'auto',
      }}
    >
      {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
      {children}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13,
      color: 'rgba(255,255,255,0.3)', cursor: 'pointer', marginTop: 14,
      display: 'block', width: '100%', textAlign: 'center', minHeight: 'auto',
    }}>← Back</button>
  );
}

function Heading({ children }) {
  return (
    <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 5vw, 32px)', color: '#fff', lineHeight: 1.2, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
      {children}
    </h1>
  );
}

function Sub({ children }) {
  return (
    <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 32px' }}>
      {children}
    </p>
  );
}

function Step1({ form, onUpdate, onNext }) {
  const valid = form.gradYear && (form.company.trim() || form.jobTitle.trim());
  return (
    <>
      <Heading>Tell us about yourself.</Heading>
      <Sub>This helps students understand your background when they reach out.</Sub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <Label required>What year did you graduate?</Label>
          <select
            value={form.gradYear}
            onChange={e => onUpdate({ gradYear: e.target.value })}
            style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 14px', fontFamily: dmSans, fontSize: 14, color: form.gradYear ? '#fff' : 'rgba(255,255,255,0.3)', boxSizing: 'border-box' }}
          >
            <option value="" style={{ background: '#1a1a1a' }}>Select year</option>
            {Array.from({ length: 40 }, (_, i) => 2025 - i).map(y => (
              <option key={y} value={y} style={{ background: '#1a1a1a' }}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>What was your major?</Label>
          <Field value={form.major} onChange={e => onUpdate({ major: e.target.value })} placeholder="e.g. Finance, Computer Science" />
        </div>
        <div>
          <Label required>Where do you work now?</Label>
          <Field value={form.company} onChange={e => onUpdate({ company: e.target.value })} placeholder="Company name" />
        </div>
        <div>
          <Label>Your title</Label>
          <Field value={form.jobTitle} onChange={e => onUpdate({ jobTitle: e.target.value })} placeholder="e.g. Product Manager" />
        </div>
        <div>
          <Label>LinkedIn URL (optional)</Label>
          <Field value={form.linkedinUrl} onChange={e => onUpdate({ linkedinUrl: e.target.value })} placeholder="linkedin.com/in/yourname" />
        </div>
      </div>
      <PrimaryBtn onClick={onNext} disabled={!valid}>Continue →</PrimaryBtn>
    </>
  );
}

function Step2({ form, onUpdate, onNext, onBack }) {
  return (
    <>
      <Heading>What's your industry?</Heading>
      <Sub>Students will use this to find you when looking for relevant contacts.</Sub>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {INDUSTRIES.map(ind => {
          const selected = form.industry === ind;
          return (
            <button
              key={ind}
              onClick={() => onUpdate({ industry: ind })}
              style={{
                background: selected ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${selected ? ORANGE : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 100, padding: '8px 16px',
                fontFamily: dmSans, fontSize: 13, color: selected ? ORANGE : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
              }}
            >{ind}</button>
          );
        })}
      </div>
      <PrimaryBtn onClick={onNext} disabled={!form.industry}>Continue →</PrimaryBtn>
      <BackBtn onClick={onBack} />
    </>
  );
}

function Step3({ form, onUpdate, onNext, onBack }) {
  const toggle = (val) => {
    const current = form.helpTypes || [];
    onUpdate({ helpTypes: current.includes(val) ? current.filter(v => v !== val) : [...current, val] });
  };
  return (
    <>
      <Heading>How would you like to help?</Heading>
      <Sub>Pick everything that applies. Students will see this on your profile.</Sub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {HELP_OPTIONS.map(opt => {
          const selected = (form.helpTypes || []).includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              style={{
                background: selected ? 'rgba(232,93,32,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${selected ? ORANGE : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: '13px 18px',
                fontFamily: dmSans, fontSize: 14, color: selected ? '#fff' : 'rgba(255,255,255,0.55)',
                cursor: 'pointer', textAlign: 'left', minHeight: 'auto', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${selected ? ORANGE : 'rgba(255,255,255,0.2)'}`, background: selected ? ORANGE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      <PrimaryBtn onClick={onNext} disabled={(form.helpTypes || []).length === 0}>Continue →</PrimaryBtn>
      <BackBtn onClick={onBack} />
    </>
  );
}

export default function AlumniOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gradYear: '', major: '', company: '', jobTitle: '', linkedinUrl: '',
    industry: '', helpTypes: [],
  });

  const update = (updates) => setForm(prev => ({ ...prev, ...updates }));

  const handleFinish = async () => {
    setSaving(true);
    try {
      const updateData = {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        alumni_intent: 'help_students',
        persona: 'alumni',
        roles: ['alumni'],
        visible_in_directory: true,
      };
      if (form.gradYear) updateData.graduation_year = parseInt(form.gradYear);
      if (form.major.trim()) updateData.major = form.major.trim();
      if (form.company.trim()) { updateData.company = form.company.trim(); updateData.current_company = form.company.trim(); }
      if (form.jobTitle.trim()) { updateData.job_title = form.jobTitle.trim(); updateData.current_position = form.jobTitle.trim(); }
      if (form.linkedinUrl.trim()) {
        const match = form.linkedinUrl.match(/linkedin\.com\/in\/([a-zA-Z0-9\-_]+)/i);
        updateData.linkedin_url = match ? `https://linkedin.com/in/${match[1]}` : form.linkedinUrl.trim();
      }
      if (form.industry) { updateData.industry = form.industry; updateData.industries = [form.industry]; }
      if (form.helpTypes.length > 0) { updateData.ways_to_help = form.helpTypes; updateData.help_types = form.helpTypes; }

      await base44.auth.updateMe(updateData);
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');
      if (refreshUser) await refreshUser();
      navigate('AlumniAllSet');
    } catch (err) {
      console.error('Alumni onboarding save failed:', err);
      setSaving(false);
    }
  };

  // Step 4: auto-save
  useEffect(() => {
    if (step === 4) handleFinish();
  }, [step]);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: ORANGE, boxShadow: `0 0 16px ${ORANGE}99`, marginBottom: 32 }} />
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: ORANGE, margin: '0 0 24px' }}>
          Alumni · Step {Math.min(step, 3)} of 3
        </p>

        {step === 1 && <Step1 form={form} onUpdate={update} onNext={() => setStep(2)} />}
        {step === 2 && <Step2 form={form} onUpdate={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3 form={form} onUpdate={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 size={32} style={{ color: ORANGE, margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>Setting up your profile…</p>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}