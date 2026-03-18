import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import ParentProfileNav from '@/components/profile/parent/ParentProfileNav';
import ParentHomeHero from '@/components/parent-home/ParentHomeHero';
import IntroRequestCard from '@/components/parent-home/IntroRequestCard';
import FastIQNudgeCard from '@/components/parent-home/FastIQNudgeCard';
import StudentInactiveCard from '@/components/parent-home/StudentInactiveCard';
import ProfileIncompleteCard from '@/components/parent-home/ProfileIncompleteCard';
import AllClearCard from '@/components/parent-home/AllClearCard';
import StudentProgressSection from '@/components/parent-home/StudentProgressCard';
import useParentHomeData from '@/components/parent-home/useParentHomeData';
import PullToRefresh from '@/components/common/PullToRefresh';

export default function ParentHome() {
  const { user } = useAuth();

  useEffect(() => {
    if (!document.getElementById('parent-home-fonts')) {
      const link = document.createElement('link');
      link.id = 'parent-home-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Redirect non-parents
  useEffect(() => {
    if (user && user.persona !== 'parent' && !user.roles?.includes('parent')) {
      navigate('Dashboard');
    }
  }, [user]);

  const {
    loading, refresh, pendingMatches, students,
    studentsNeedingFastIQ, inactiveStudents,
    profileScore, profileTotal, profileComplete, profileNudge, allClear,
  } = useParentHomeData(user);

  if (!user || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
        <ParentProfileNav user={user} currentPage="ParentHome" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(232,93,32,0.3)', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
      <ParentProfileNav user={user} currentPage="ParentHome" />

      <PullToRefresh onRefresh={refresh}>
        <main style={{ flex: 1, maxWidth: 640, margin: '0 auto', width: '100%', padding: '0 24px 80px' }}>
          <ParentHomeHero user={user} />

          {/* Priority 1 — Intro Requests */}
          {pendingMatches.length > 0 && (
            <IntroRequestCard matches={pendingMatches} onRespond={refresh} />
          )}

          {/* Priority 2 — FastIQ not activated */}
          {studentsNeedingFastIQ.length > 0 && (
            <FastIQNudgeCard studentsNeedingFastIQ={studentsNeedingFastIQ} />
          )}

          {/* Priority 3 — Student inactive */}
          {inactiveStudents.length > 0 && (
            <StudentInactiveCard inactiveStudents={inactiveStudents} parentName={user?.full_name} />
          )}

          {/* Priority 4 — Profile incomplete */}
          {!profileComplete && (
            <ProfileIncompleteCard profileScore={profileScore} profileTotal={profileTotal} profileNudge={profileNudge} />
          )}

          {/* Priority 5 — All clear */}
          {allClear && <AllClearCard students={students} />}

          {/* Student Progress — always shown */}
          <StudentProgressSection students={students} />
        </main>
      </PullToRefresh>
    </div>
  );
}