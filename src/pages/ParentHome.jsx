import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate, useParams } from '@/components/utils/navigation';
import ParentProfileNav from '@/components/profile/parent/ParentProfileNav';
import ParentHomeHero from '@/components/parent-home/ParentHomeHero';
import IntroRequestCard from '@/components/parent-home/IntroRequestCard';
import FastIQNudgeCard from '@/components/parent-home/FastIQNudgeCard';
import StudentInactiveCard from '@/components/parent-home/StudentInactiveCard';
import ProfileIncompleteCard from '@/components/parent-home/ProfileIncompleteCard';
import AllClearCard from '@/components/parent-home/AllClearCard';
import StudentProgressSection from '@/components/parent-home/StudentProgressCard';
import useParentHomeData from '@/components/parent-home/useParentHomeData';
import useFoundingOffer from '@/components/founding-offer/useFoundingOffer';
import FoundingOfferHomeCard from '@/components/founding-offer/FoundingOfferHomeCard';
import PullToRefresh from '@/components/common/PullToRefresh';

export default function ParentHome() {
  const { user } = useAuth();

  useEffect(() => {
    if (!document.getElementById('parent-home-fonts')) {
      const link = document.createElement('link');
      link.id = 'parent-home-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap";
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

  const offer = useFoundingOffer(user);
  const [showActivationConfirm, setShowActivationConfirm] = useState(false);

  // Show first-visit-only: only when offer is active and parent hasn't seen it before on home
  const showFoundingHome = offer.active && studentsNeedingFastIQ.length > 0 && !user?.founding_offer_home_seen;

  // Mark home as seen on first render
  useEffect(() => {
    if (showFoundingHome && user && !user.founding_offer_home_seen) {
      base44.auth.updateMe({ founding_offer_home_seen: true }).catch(() => {});
    }
  }, [showFoundingHome]);

  // Get first student name for offer display
  const firstStudentName = studentsNeedingFastIQ[0]?.student?.full_name?.split(' ')[0] || null;

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

          {/* Activation confirmation toast */}
          {showActivationConfirm && (
            <div style={{
              background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)',
              borderRadius: 12, padding: '14px 20px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, color: '#fff' }}>
                Founding member rate locked in — $187/year. FastIQ is now active for {firstStudentName || 'your student'}.
              </span>
            </div>
          )}

          {/* Priority 1 — Intro Requests */}
          {pendingMatches.length > 0 && (
            <IntroRequestCard matches={pendingMatches} onRespond={refresh} />
          )}

          {/* Founding Member Offer — between intro requests and FastIQ nudge */}
          {showFoundingHome && (
            <FoundingOfferHomeCard display={offer.display} studentName={firstStudentName} />
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