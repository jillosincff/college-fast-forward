import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

import PlanNav from '@/components/your-plan/PlanNav';
import TargetCompanies from '@/components/your-plan/TargetCompanies';
import PeopleToContact from '@/components/your-plan/PeopleToContact';
import OutreachMessage from '@/components/your-plan/OutreachMessage';
import WhatToDoNext from '@/components/your-plan/WhatToDoNext';
import NetworkEdge from '@/components/your-plan/NetworkEdge';
import EmptyPlan from '@/components/your-plan/EmptyPlan';

const dmSans = "'DM Sans', system-ui, sans-serif";

// Dynamic alumni name pool
const ALUMNI_NAMES = [
  'Sarah Chen', 'Michael Ross', 'David Klein', 'Priya Patel', 'Daniel Green',
  'Alex Martinez', 'Jordan Blake', 'Emily Carter', 'Ryan Goldberg', 'Hannah Lee',
  'Kevin Shah', 'Lauren Brooks', 'Marcus Rivera', 'Nicole Tran', 'Chris Walker',
  'Tyler Moreno', 'Rachel Adams', 'Brandon Kim', 'Mia Gonzalez', 'Jake Williams',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('yourplan-fonts')) return;
  const link = document.createElement('link');
  link.id = 'yourplan-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [plan, setPlan] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const loadStartedRef = useRef(false);

  useEffect(() => { ensureFonts(); }, []);

  // Route guards
  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate('LandingPage'); return; }
    if (user.persona === 'parent') { navigate('ParentDashboard'); return; }
    if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
      if (user.alumni_seniority === 'recent_grad') navigate('RecentGradDashboard');
      else navigate('AlumniDashboard');
      return;
    }
    if (user.roles?.includes('admin') && !user.email?.toLowerCase().endsWith('@ufl.edu')) {
      navigate('AdminDashboard');
      return;
    }
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    loadPlanData();
  }, [user, isLoading]);

  const loadPlanData = async () => {
    setLoadingData(true);
    try {
      // Check for FastTrackProProfile for target companies
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
      const profile = profiles?.[0];
      
      if (profile && profile.target_companies?.length > 0) {
        // Generate contacts from alumni pool
        const shuffledNames = shuffle(ALUMNI_NAMES);
        const companies = profile.target_companies.slice(0, 6);
        const contacts = companies.slice(0, 4).map((company, i) => ({
          name: shuffledNames[i],
          company: typeof company === 'string' ? company : company.name,
          role: ['Marketing Manager', 'Senior Analyst', 'Product Lead', 'Account Executive'][i % 4],
          badge: i < 2 ? ['Active recently', 'Likely to respond'][i] : null,
        }));
        
        // Generate sample outreach
        const firstContact = contacts[0];
        const outreachMessage = firstContact ? `Hi ${firstContact.name.split(' ')[0]},

I'm a student at ${user.school || 'university'} exploring careers in your field. I noticed you're at ${firstContact.company} and would love to hear how you got started there.

Would you have 15 minutes for a quick call? I'd really appreciate any advice.

Thanks so much,
${user.full_name?.split(' ')[0] || 'Student'}` : null;

        setPlan({
          companies: companies.map((c, i) => typeof c === 'string' ? { name: c, userTyped: i === 0 } : c),
          contacts,
          outreachMessage,
          recipientName: firstContact?.name,
          actions: [
            'Reach out to 3 people today',
            'Follow up with 2 contacts',
            'Apply to 1 targeted role',
            'Update LinkedIn summary',
          ],
        });
        setSelectedCompany(companies[0]?.name || companies[0]);
        setSelectedPerson(firstContact);
      } else {
        setPlan(null);
      }
    } catch (error) {
      console.error('Failed to load plan:', error);
      setPlan(null);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setHasInteracted(true);
  };

  const handleViewContacts = (company) => {
    setHasInteracted(true);
    // Scroll to contacts
    document.getElementById('contacts-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerateOutreach = (company) => {
    setHasInteracted(true);
    navigate(`FastIQ?company=${encodeURIComponent(company)}`);
  };

  const handleUseMessage = (person) => {
    setSelectedPerson(person);
    setHasInteracted(true);
    document.getElementById('message-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading || !user || loadingData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0B0B0F' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#4F8CFF', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>
            Loading your plan...
          </p>
        </div>
      </div>
    );
  }

  const hasPlan = plan && plan.companies?.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0F' }}>
      <PlanNav user={user} currentPage="Dashboard" />

      {/* Header */}
      <div style={{ padding: '32px 24px 0', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: dmSans, fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
          Your Plan
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>
          FastIQ is guiding you step-by-step.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 80px' }}>
        {!hasPlan ? (
          <EmptyPlan />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Section 1: Target Companies */}
            <TargetCompanies
              companies={plan.companies}
              selectedCompany={selectedCompany}
              onSelect={handleSelectCompany}
              onViewContacts={handleViewContacts}
              onGenerateOutreach={handleGenerateOutreach}
            />

            {/* Section 2: People to Contact */}
            <div id="contacts-section">
              <PeopleToContact
                contacts={plan.contacts}
                onUseMessage={handleUseMessage}
              />
            </div>

            {/* Section 3: Outreach Message */}
            <div id="message-section">
              <OutreachMessage
                message={plan.outreachMessage}
                recipientName={selectedPerson?.name || plan.recipientName}
              />
            </div>

            {/* Section 4: What to Do Next */}
            <WhatToDoNext actions={plan.actions} />

            {/* Section 5: Network Edge - shows after interaction */}
            <NetworkEdge
              visible={hasInteracted}
              company={selectedCompany}
              userSchool={user?.school}
            />
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:768px) {
          h1 { font-size: 24px !important; }
        }
      `}</style>
    </div>
  );
}