import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Loader2 } from 'lucide-react';
import { ensureFonts, BG } from '@/components/student-dashboard/constants';
import DashboardHero from '@/components/student-dashboard/DashboardHero';
import TabBar from '@/components/student-dashboard/TabBar';
import WelcomeCard from '@/components/student-dashboard/WelcomeCard';
import LockedTabModal from '@/components/student-dashboard/LockedTabModal';
import TabCompanyIntel from '@/components/student-dashboard/TabCompanyIntel';
import TabCareerPath from '@/components/student-dashboard/TabCareerPath';
import TabCareerCenter from '@/components/student-dashboard/TabCareerCenter';
import TabCareerGoals from '@/components/student-dashboard/TabCareerGoals';
import TabAlumniNetwork from '@/components/student-dashboard/TabAlumniNetwork';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('company-intel');
  const [lockedModal, setLockedModal] = useState(null);

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
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: BG }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#E85D20', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Determine if user has FastIQ (paid)
  const isPaid = user?.fastiq_active === true || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq';

  const handleUnlock = () => navigate('GetStarted');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company-intel': return <TabCompanyIntel user={user} />;
      case 'career-path': return <TabCareerPath />;
      case 'career-center': return <TabCareerCenter user={user} />;
      case 'career-goals': return <TabCareerGoals user={user} onGoalsSaved={() => {}} onUnlock={handleUnlock} isPaid={isPaid} />;
      case 'alumni-network': return <TabAlumniNetwork user={user} isPaid={isPaid} onUnlock={handleUnlock} onNavigateGoals={() => setActiveTab('career-goals')} />;
      // Paid-only tabs — placeholder content for now
      case 'alumni-contacts': return isPaid ? <div style={{ color: '#888', fontFamily: dmSans }}>Alumni Contacts — coming soon.</div> : null;
      case 'resume-tailoring': return isPaid ? <div style={{ color: '#888', fontFamily: dmSans }}>Resume Tailoring — coming soon.</div> : null;
      case 'linkedin-review': return isPaid ? <div style={{ color: '#888', fontFamily: dmSans }}>LinkedIn Review — coming soon.</div> : null;
      case 'job-search-crm': return isPaid ? <div style={{ color: '#888', fontFamily: dmSans }}>Job Search CRM — coming soon.</div> : null;
      case 'follow-up-alerts': return isPaid ? <div style={{ color: '#888', fontFamily: dmSans }}>Follow-up Alerts — coming soon.</div> : null;
      default: return <TabCompanyIntel user={user} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      {/* Hero */}
      <DashboardHero user={user} isPaid={isPaid} onUnlock={handleUnlock} />

      {/* Tabs + Content */}
      <div style={{ padding: '16px 0 0' }}>
        {/* Mobile tab bar */}
        <div className="md:hidden">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} isPaid={isPaid} onLockedClick={(id) => setLockedModal(id)} />
        </div>

        {/* Desktop: sidebar + content */}
        <div className="max-w-5xl mx-auto" style={{ display: 'flex', gap: 24, padding: '0 24px 80px' }}>
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} isPaid={isPaid} onLockedClick={(id) => setLockedModal(id)} />
          </div>

          {/* Content area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Welcome card for newly activated paid users */}
            {isPaid && (
              <WelcomeCard onBuildPlan={() => setActiveTab('career-goals')} />
            )}

            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Locked tab modal */}
      {lockedModal && (
        <LockedTabModal tabId={lockedModal} user={user} onClose={() => setLockedModal(null)} onUnlock={handleUnlock} />
      )}
    </div>
  );
}