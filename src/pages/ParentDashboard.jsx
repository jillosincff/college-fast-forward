import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import { useParentDashboardData } from '@/components/dashboard/parent/useParentDashboardData';
import LinkStudentModal from '@/components/dashboard/parent/LinkStudentModal';
import PullToRefresh from '@/components/common/PullToRefresh';

import ParentDashboardHero from '@/components/parent-dashboard/ParentDashboardHero';
import ParentProfileBanner from '@/components/parent-dashboard/ParentProfileBanner';
import ParentQuestionsSection from '@/components/parent-dashboard/ParentQuestionsSection';
import ParentLinkStudentCard from '@/components/parent-dashboard/ParentLinkStudentCard';

export default function ParentDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { loading, data, refresh } = useParentDashboardData(user);
  const [showLinkStudentModal, setShowLinkStudentModal] = useState(false);

  // Track visit
  useEffect(() => {
    if (user?.id) trackEvent('parent_dashboard_viewed', { userId: user.id });
  }, [user?.id]);

  // Redirect if onboarding not completed
  const needsOnboarding = user && user.onboarding_completed === false &&
    (user.persona === 'parent' || (user.persona === 'alumni' && user.alumni_intent === 'help_students'));

  useEffect(() => {
    if (needsOnboarding) navigate('ParentOnboarding');
  }, [needsOnboarding]);

  if (!user || loading || needsOnboarding) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(232,93,32,0.3)', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const profilePercent = [user?.company, user?.linkedin_url, user?.title || user?.job_title, user?.profile_image, user?.bio].filter(Boolean).length * 20;
  const hasLinkedStudent = !!data.linkedStudent;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes pdSectionFade { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
      `}</style>

      <PullToRefresh onRefresh={refresh}>
        {/* Hero */}
        <ParentDashboardHero
          user={user}
          data={data}
          onLinkStudentClick={() => setShowLinkStudentModal(true)}
        />

        {/* Body */}
        <div style={{ background: '#f4f2ee', minHeight: '60vh' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 60px' }}>

            {/* Profile Completion Banner */}
            <div style={{ animation: 'pdSectionFade 0.4s ease both', animationDelay: '0.06s' }}>
              <ParentProfileBanner user={user} profilePercent={profilePercent} />
            </div>

            {/* Questions Section */}
            <div style={{ animation: 'pdSectionFade 0.4s ease both', animationDelay: '0.1s' }}>
              <ParentQuestionsSection data={data} user={user} />
            </div>

            {/* Link Student Card — only shown if NOT linked */}
            {!hasLinkedStudent && (
              <div style={{ animation: 'pdSectionFade 0.4s ease both', animationDelay: '0.18s' }}>
                <ParentLinkStudentCard
                  linkedStudent={null}
                  onLinkClick={() => setShowLinkStudentModal(true)}
                />
              </div>
            )}
          </div>
        </div>
      </PullToRefresh>

      {/* Link Student Modal */}
      <LinkStudentModal
        open={showLinkStudentModal}
        onOpenChange={setShowLinkStudentModal}
        onLinked={async () => {
          await refreshUser();
          await refresh();
        }}
      />
    </>
  );
}