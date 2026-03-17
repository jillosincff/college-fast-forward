import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

import OnboardingProgress from '@/components/onboarding-fastiq/OnboardingProgress';
import StepWelcome from '@/components/onboarding-fastiq/StepWelcome';
import StepSchool from '@/components/onboarding-fastiq/StepSchool';
import StepInterests from '@/components/onboarding-fastiq/StepInterests';
import StepCompanies from '@/components/onboarding-fastiq/StepCompanies';
import StepLoading from '@/components/onboarding-fastiq/StepLoading';
import StepResults from '@/components/onboarding-fastiq/StepResults';

const dmSans = "'DM Sans', system-ui, sans-serif";

const ALUMNI_NAMES = [
  'Sarah Chen', 'Michael Ross', 'David Klein', 'Priya Patel', 'Daniel Green',
  'Alex Martinez', 'Jordan Blake', 'Emily Carter', 'Ryan Goldberg', 'Hannah Lee',
  'Kevin Shah', 'Lauren Brooks', 'Marcus Rivera', 'Nicole Tran', 'Tyler Moreno',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Map interests to companies
const INTEREST_COMPANIES = {
  'Consulting': ['Deloitte', 'McKinsey', 'Bain', 'Accenture', 'BCG'],
  'Finance': ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Citi', 'Bank of America'],
  'Marketing': ['Nike', 'Spotify', 'Ogilvy', 'PepsiCo', 'Lululemon'],
  'Tech / Product': ['Google', 'Apple', 'Meta', 'Stripe', 'Notion'],
  'Startups': ['Stripe', 'Notion', 'Figma', 'Vercel', 'Linear'],
  'Not sure yet': ['Google', 'Deloitte', 'Nike', 'JPMorgan', 'Spotify'],
};

const ROLES_BY_INTEREST = {
  'Consulting': ['Consultant', 'Business Analyst', 'Strategy Associate', 'Associate Consultant'],
  'Finance': ['Financial Analyst', 'Investment Banking Analyst', 'Equity Research Associate', 'Risk Analyst'],
  'Marketing': ['Brand Marketing Coordinator', 'Marketing Associate', 'Account Executive', 'Growth Manager'],
  'Tech / Product': ['Product Manager', 'Software Engineer', 'UX Designer', 'Data Analyst'],
  'Startups': ['Operations Associate', 'Growth Lead', 'Product Associate', 'BDR'],
  'Not sure yet': ['Associate', 'Analyst', 'Coordinator', 'Associate Consultant'],
};

function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('fiq-onb-fonts')) return;
  const link = document.createElement('link');
  link.id = 'fiq-onb-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

export default function FastIQOnboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0=welcome, 1=school, 2=interests, 3=companies, 4=loading, 5=results
  const [school, setSchool] = useState(user?.school || '');
  const [interests, setInterests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [plan, setPlan] = useState(null);

  useEffect(() => { ensureFonts(); }, []);

  const buildPlan = useCallback(() => {
    setStep(4); // loading

    // Determine target companies
    const userCompanies = companies.map(c => ({ name: c, userTyped: true }));
    const interestCompanies = new Set();
    interests.forEach(interest => {
      (INTEREST_COMPANIES[interest] || []).forEach(c => {
        if (!companies.includes(c)) interestCompanies.add(c);
      });
    });
    const suggested = [...interestCompanies].slice(0, 5 - userCompanies.length);
    const allCompanies = [...userCompanies, ...suggested.map(c => ({ name: c, userTyped: false }))].slice(0, 6);

    // Generate contacts
    const names = shuffle(ALUMNI_NAMES);
    const primaryInterest = interests[0] || 'Not sure yet';
    const roles = ROLES_BY_INTEREST[primaryInterest] || ROLES_BY_INTEREST['Not sure yet'];

    const contacts = allCompanies.slice(0, 4).map((c, i) => ({
      name: names[i],
      company: c.name,
      role: roles[i % roles.length],
      badge: i === 0 ? 'Active recently' : i === 1 ? 'Likely to respond' : null,
    }));

    // Build outreach message
    const firstName = user?.full_name?.split(/[\s,]+/)[0] || 'Student';
    const firstContact = contacts[0];
    const outreachMessage = `Hi ${firstContact.name.split(' ')[0]},

I'm a student at ${school || 'university'} interested in ${primaryInterest.toLowerCase()}. I noticed you're at ${firstContact.company} and would love to hear how you got started there.

Would you have 15 minutes for a quick call? I'd really appreciate any advice.

Thanks so much,
${firstName}`;

    setPlan({ companies: allCompanies, contacts, outreachMessage });
  }, [companies, interests, school, user]);

  const handleLoadingComplete = useCallback(() => {
    setStep(5);

    // Save to FastTrackProProfile
    if (user?.email && plan) {
      base44.entities.FastTrackProProfile.filter({ user_email: user.email }).then(profiles => {
        const data = {
          user_email: user.email,
          target_companies: plan.companies.map(c => c.name || c),
          target_industries: interests,
        };
        if (profiles?.[0]) {
          base44.entities.FastTrackProProfile.update(profiles[0].id, data).catch(() => {});
        } else {
          base44.entities.FastTrackProProfile.create(data).catch(() => {});
        }
      }).catch(() => {});
    }

    // Save school to user
    if (user && school) {
      base44.auth.updateMe({ school, onboarding_completed: true }).catch(() => {});
    }
  }, [user, plan, interests, school]);

  const handleGoToPlan = () => {
    navigate('Dashboard');
  };

  const handleEdit = () => {
    setStep(1);
  };

  // Show progress for steps 1-3
  const showProgress = step >= 1 && step <= 3;

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0F',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Close button */}
      {step < 4 && (
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => navigate('Dashboard')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: dmSans, fontSize: 13, fontWeight: 400,
            color: 'rgba(255,255,255,0.25)', minHeight: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
          >
            Skip for now
          </button>
        </div>
      )}

      {/* Progress */}
      {showProgress && (
        <div style={{ marginBottom: 20 }}>
          <OnboardingProgress current={step} total={3} />
        </div>
      )}

      {/* Content area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: step === 5 ? '40px 0 60px' : '0 0 80px',
      }}>
        <div style={{
          width: '100%',
          opacity: 1,
          transition: 'opacity 0.3s ease',
        }}>
          {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
          {step === 1 && <StepSchool value={school} onChange={setSchool} onNext={() => setStep(2)} />}
          {step === 2 && <StepInterests selected={interests} onChange={setInterests} onNext={() => setStep(3)} />}
          {step === 3 && <StepCompanies selected={companies} onChange={setCompanies} onBuild={buildPlan} />}
          {step === 4 && <StepLoading onComplete={handleLoadingComplete} />}
          {step === 5 && plan && <StepResults plan={plan} onGoToPlan={handleGoToPlan} onEdit={handleEdit} />}
        </div>
      </div>
    </div>
  );
}