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
import FoundingMemberBanner from '@/components/shared/FoundingMemberBanner';
import GiftFastIQModal from '@/components/shared/GiftFastIQModal';

export default function ParentHome() {
  const { user, isLoadingAuth } = useAuth();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (!document.getElementById('parent-home-fonts')) {
      const link = document.createElement('link');
      link.id = 'parent-home-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Redirect non-parents (only after auth has loaded to avoid premature redirects)
  useEffect(() => {
    if (!isLoadingAuth && user && user.persona !== 'parent' && !user.roles?.includes('parent')) {
      navigate('Dashboard');
    }
  }, [user, isLoadingAuth]);

  const {
    loading, refresh, pendingMatches, students,
    studentsNeedingFastIQ, inactiveStudents,
    profileScore, profileTotal, profileComplete, profileNudge, allClear,
  } = useParentHomeData(user);

  const params = useParams();
  const offer = useFoundingOffer(user);
  const [showActivationConfirm, setShowActivationConfirm] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // Auto-open gift modal when linked from email CTA (?gift=open) or direct #GiftFastIQ hash
  useEffect(() => {
    if (params.gift === 'open') {
      setShowGiftModal(true);
      window.history.replaceState(null, '', window.location.origin + '/#ParentHome');
    }
  }, [params.gift]);

  useEffect(() => {
    if (window.location.hash === '#GiftFastIQ' && user?.persona === 'parent') {
      setShowGiftModal(true);
      window.history.replaceState(null, '', window.location.origin + '/#ParentHome');
    }
  }, [user]);

  // Detect payment success from Stripe redirect
  useEffect(() => {
    if (params.payment === 'success' && user) {
      setShowActivationConfirm(true);
      // Auto-fade after 8 seconds
      const t = setTimeout(() => setShowActivationConfirm(false), 8000);
      // Clean URL
      window.history.replaceState(null, '', window.location.origin + '/#ParentHome');
      return () => clearTimeout(t);
    }
  }, [params.payment, user]);

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

  // Only block render while auth is loading or user is absent.
  // Do NOT block on `loading` — data loads progressively and the page should render immediately.
  if (isLoadingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(232,93,32,0.3)', borderTopColor: '#E85D20', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('GatorAuth');
    return null;
  }

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
      <ParentProfileNav user={user} currentPage="ParentHome" />

      <FoundingMemberBanner
        show={showBanner && !isFastIQ}
        onUpgrade={() => navigate('FastIQDashboard')}
        onDismiss={() => setShowBanner(false)}
      />
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
            <FoundingOfferHomeCard display={offer.display} studentName={firstStudentName} user={user} />
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

          {/* Gift FastIQ CTA */}
          {!isFastIQ && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button
                onClick={() => setShowGiftModal(true)}
                style={{ background: 'none', border: '1.5px solid #E85D20', borderRadius: 12, padding: '14px 28px', fontSize: 14, fontWeight: 600, color: '#E85D20', cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: 'auto' }}
              >
                🎁 Give My Student FastIQ Free →
              </button>
            </div>
          )}

          {/* Student Progress — always shown */}
          <StudentProgressSection students={students} />
        </main>
      </PullToRefresh>
      {showGiftModal && <GiftFastIQModal user={user} onClose={() => setShowGiftModal(false)} />}
    </div>
  );
}