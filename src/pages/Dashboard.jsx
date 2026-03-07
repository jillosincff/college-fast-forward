import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Users, MessageSquare, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import InviteParentModal from '@/components/dashboard/InviteParentModal';
import { base44 } from '@/api/base44Client';
import { getUserMessages } from '@/functions/getUserMessages';
import { getUserCount } from '@/functions/getUserCount';

// Components
import NewUserWelcome from '@/components/dashboard/student/NewUserWelcome';
import WaitingForMatches from '@/components/dashboard/student/WaitingForMatches';
import WaitingForResponses from '@/components/dashboard/student/WaitingForResponses';
import MoreMatchesPrompt from '@/components/dashboard/student/MoreMatchesPrompt';
import MatchesSection from '@/components/dashboard/student/MatchesSection';
import CompactOpportunities from '@/components/dashboard/student/CompactOpportunities';
import CompactChallenge from '@/components/dashboard/student/CompactChallenge';
import FamilyBoostStatus from '@/components/dashboard/student/FamilyBoostStatus';
import LogIntroModal from '@/components/challenge/LogIntroModal';
import FirstMessageNudgeModal from '@/components/onboarding/student/FirstMessageNudgeModal';
import FoundingMemberBanner from '@/components/dashboard/student/FoundingMemberBanner';
import DashboardHeader from '@/components/dashboard/student/DashboardHeader';
import AllCaughtUpState from '@/components/dashboard/student/states/AllCaughtUpState';
import WhatToDoNext from '@/components/dashboard/student/WhatToDoNext';
import FamilyKarmaCard from '@/components/karma/FamilyKarmaCard';
import ActivationWelcomeBannerStudent from '@/components/dashboard/student/ActivationWelcomeBannerStudent';
import StudentKarmaCard from '@/components/dashboard/student/StudentKarmaCard';
import HelpFellowGatorSection from '@/components/dashboard/student/HelpFellowGatorSection';
import ShareWhatYouLearnedCard from '@/components/dashboard/student/ShareWhatYouLearnedCard';
import ShareOfferDataCard from '@/components/dashboard/student/ShareOfferDataCard';
import PostJobGigCard from '@/components/dashboard/student/PostJobGigCard';
// New 1F/1G components
import RequestWithResponses from '@/components/dashboard/student/RequestWithResponses';
import InviteParentsCard from '@/components/dashboard/student/InviteParentsCard';
import ExploreSection from '@/components/dashboard/student/ExploreSection';
import PullToRefresh from '@/components/common/PullToRefresh';
import FastIQBanner from '@/components/dashboard/student/FastIQBanner';
import FastIQWeeklyBrief from '@/components/dashboard/student/FastIQWeeklyBrief';
import RecentFeedbackCard from '@/components/dashboard/student/RecentFeedbackCard';
import FamilyLeaderboard from '@/components/karma/FamilyLeaderboard';
import StudentKarmaExplainer from '@/components/karma/StudentKarmaExplainer';

export default function Dashboard() {
  const { user, isLoading, refreshUser } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLogIntroModal, setShowLogIntroModal] = useState(false);
  const [showFirstMessageNudge, setShowFirstMessageNudge] = useState(false);
  const [helpRequest, setHelpRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    totalUsers: 0,
    activeRequests: 0,
    spotsLeft: 0
  });
  const [myActiveQuestions, setMyActiveQuestions] = useState(0);
  const [linkedParents, setLinkedParents] = useState([]);
  
  const loadStartedRef = React.useRef(false);

  // Determine user journey state
  const getUserState = () => {
    if (!helpRequest && myActiveQuestions === 0) return 'new_user';
    if (helpRequest && matches.length === 0) return 'waiting_for_matches';
    if (matches.length > 0) {
      const messagedCount = matches.filter(m => 
        m.status === 'student_connected' || m.status === 'intro_made'
      ).length;
      if (messagedCount === 0) return 'has_matches_not_messaged';
      const unreadResponses = messages.filter(m => !m.is_read).length;
      if (unreadResponses > 0) return 'has_unread_responses';
      // Has messaged but no responses yet
      if (messagedCount > 0) return 'waiting_for_responses';
      return 'all_caught_up';
    }
    return 'new_user';
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate('LandingPage');
      return;
    }

    if (user.persona === 'parent') {
      navigate('ParentDashboard');
      return;
    } else if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
      navigate(user.alumni_intent === 'help_students' ? 'ParentDashboard' : 'AlumniDashboard');
      return;
    } else if (user.roles?.includes('admin')) {
      navigate('AdminDashboard');
      return;
    }

    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    
    localStorage.setItem('cff:seenDashboard', 'true');
    loadDashboardData();
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    
    // LOAD HELP REQUEST FIRST
    let foundRequest = null;
    
    try {
      const jobRequests = await base44.entities.JobRequest.filter(
        { created_by: user.email, status: 'active' },
        '-created_date',
        1
      );
      if (jobRequests?.length > 0) {
        foundRequest = jobRequests[0];
      }
    } catch (e) {
      console.error('JobRequest filter failed:', e);
    }
    
    if (!foundRequest) {
      try {
        const allAccessible = await base44.entities.HelpRequest.list('-created_date', 50);
        const activeOnes = (allAccessible || []).filter(r => 
          r.status === 'active' && 
          (r.student_email === user.email || r.created_by === user.email || r.student_id === user.id)
        );
        if (activeOnes.length > 0) {
          foundRequest = activeOnes[0];
        }
      } catch (e) {
        console.error('HelpRequest list failed:', e);
      }
    }
    
    setHelpRequest(foundRequest || null);
    
    // Count active questions
    let totalActiveQuestions = 0;
    try {
      const myJobRequests = await base44.entities.JobRequest.filter(
        { created_by: user.email, status: 'active' }
      );
      totalActiveQuestions += myJobRequests?.length || 0;
      
      const myJobRequestsByPoster = await base44.entities.JobRequest.filter(
        { poster_email: user.email, status: 'active' }
      );
      const jobRequestIds = new Set((myJobRequests || []).map(r => r.id));
      (myJobRequestsByPoster || []).forEach(r => {
        if (!jobRequestIds.has(r.id)) totalActiveQuestions++;
      });
      
      const myHelpRequests = await base44.entities.HelpRequest.filter(
        { student_email: user.email, status: 'active' }
      );
      totalActiveQuestions += myHelpRequests?.length || 0;
    } catch (e) {
      console.error('Failed to count active questions:', e);
    }
    setMyActiveQuestions(totalActiveQuestions);
    
    try {
      // Fetch user counts (with timeout to prevent hanging)
      try {
        const countPromise = getUserCount();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
        const response = await Promise.race([countPromise, timeoutPromise]);
        const data = response.data;
        setNetworkStats({
          totalUsers: data?.totalUsers || data?.count || 226,
          activeRequests: data?.activeRequests || 15,
          spotsLeft: data?.spotsLeft || 774
        });
      } catch (error) {
        console.error('Failed to fetch network stats:', error);
        setNetworkStats({ totalUsers: 226, activeRequests: 15, spotsLeft: 774 });
      }

      // Fetch messages (with timeout)
      try {
        const msgPromise = getUserMessages();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000));
        const { data: messagesResponse } = await Promise.race([msgPromise, timeoutPromise]);
        setMessages(messagesResponse?.messages || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
      }

      // Fetch opportunities
      try {
        const opps = await base44.entities.Opportunity.filter({ status: 'active' }, '-created_date', 3);
        setOpportunities(opps || []);
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
        setOpportunities([]);
      }

      // Fetch matches
      let studentMatches = [];
      try {
        studentMatches = await base44.entities.Match.filter(
          { student_email: user.email },
          '-match_score',
          50
        );
        
        if ((!studentMatches || studentMatches.length === 0) && foundRequest) {
          studentMatches = await base44.entities.Match.filter(
            { help_request_id: foundRequest.id },
            '-match_score',
            50
          );
        }
        
        if ((!studentMatches || studentMatches.length === 0) && foundRequest?.student_id) {
          studentMatches = await base44.entities.Match.filter(
            { student_id: foundRequest.student_id },
            '-match_score',
            50
          );
        }
        
        if ((!studentMatches || studentMatches.length === 0)) {
          studentMatches = await base44.entities.Match.filter(
            { student_id: user.id },
            '-match_score',
            50
          );
        }
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        studentMatches = [];
      }
      setMatches(studentMatches || []);

      // Load linked parents
      try {
        const parentsResult = await base44.functions.invoke('getLinkedParents', {});
        if (parentsResult.data?.parents) {
          setLinkedParents(parentsResult.data.parents);
        }
      } catch (e) {
        console.log('Could not load linked parents:', e);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingData(false);
      setInitialLoadComplete(true);
      
      // Check if should show first message nudge (has matches but hasn't messaged)
      if (studentMatches?.length > 0) {
        const hasMessaged = studentMatches.some(m => 
          m.status === 'student_connected' || m.status === 'intro_made'
        );
        if (!hasMessaged && !localStorage.getItem('firstMessageNudgeDismissed')) {
          // Small delay to let dashboard render first
          setTimeout(() => setShowFirstMessageNudge(true), 1000);
        }
      }
    }
  };

  if (isLoading || !user || !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userState = getUserState();
  const unreadMessages = messages.filter(m => !m.is_read);
  const unreadCount = unreadMessages.length;
  const messagedMatches = matches.filter(m => 
    m.status === 'student_connected' || m.status === 'intro_made'
  );
  const messagesSentCount = messagedMatches.length;
  const unmessagedMatches = matches.filter(m => 
    m.status !== 'student_connected' && m.status !== 'intro_made'
  );

  const firstName = user.first_name || (() => {
    const fn = user.full_name?.trim() || '';
    if (fn.includes(',')) {
      return fn.split(',')[1]?.trim().split(/\s+/)[0] || 'Gator';
    }
    return fn.split(/\s+/)[0] || 'Gator';
  })();

  const handlePullRefresh = async () => {
    loadStartedRef.current = false;
    await loadDashboardData();
  };

  return (
    <PullToRefresh onRefresh={handlePullRefresh} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 pb-24 md:pb-8 overflow-x-hidden">
      
      {/* Founding Member Banner */}
      <FoundingMemberBanner spotsLeft={networkStats.spotsLeft} />

      {/* FASTIQ Banner — always visible at top */}
      <FastIQBanner user={user} />

      {/* 1. HERO: Welcome + UF · Major · Class Year + Stats */}
      {userState !== 'new_user' && (
        <DashboardHeader 
          firstName={firstName}
          user={user}
          stats={{
            activeQuestions: myActiveQuestions,
            totalMatches: matches.length,
            messagesSent: messagesSentCount,
            unreadResponses: unreadCount,
            activeConversations: messagedMatches.length,
            studentKarma: user?.student_karma || 0,
          }}
          state={userState === 'waiting_for_matches' ? 'waiting_matches' : 
                 userState === 'all_caught_up' ? 'all_caught_up' : 'default'}
        />
      )}

      {/* Main Content — Ordered per 1G spec */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        
        {/* Activation Banner (if applicable) */}
        <ActivationWelcomeBannerStudent user={user} />

        {/* FASTIQ Weekly Scout Brief */}
        <FastIQWeeklyBrief user={user} />

        {/* New user state gets its own welcome flow */}
        {userState === 'new_user' && (
          <NewUserWelcome user={user} />
        )}

        {/* 2-3. YOUR HELP REQUEST + RESPONSES INLINE */}
        {helpRequest && (
          <RequestWithResponses helpRequest={helpRequest} user={user} />
        )}

        {/* Waiting states */}
        {userState === 'waiting_for_matches' && (
          <WaitingForMatches helpRequest={helpRequest} />
        )}
        {userState === 'waiting_for_responses' && (
          <WaitingForResponses messagedMatches={messagedMatches} />
        )}

        {/* Matches section when available */}
        {matches.length > 0 && userState === 'has_matches_not_messaged' && (
          <MatchesSection 
            matches={matches} 
            user={user}
            onMessageMatch={(match) => {
              const name = match.helper_name || match.parent_name || 'Helper';
              const email = match.helper_email || match.parent_email;
              navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
            }}
          />
        )}

        {/* More matches prompt */}
        {unmessagedMatches.length > 0 && (userState === 'waiting_for_responses' || userState === 'has_unread_responses') && (
          <MoreMatchesPrompt 
            unmessagedMatches={unmessagedMatches}
            totalMatches={matches.length}
            isWaitingForResponses={userState === 'waiting_for_responses'}
            onMessageMatch={(match) => {
              const name = match.helper_name || match.parent_name || 'Helper';
              const email = match.helper_email || match.parent_email;
              navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
            }}
          />
        )}

        {/* All caught up state */}
        {userState === 'all_caught_up' && (
          <AllCaughtUpState 
            conversations={messagedMatches}
            opportunities={opportunities}
            challenge={{
              introsLogged: user?.challenge_intros_logged || 0,
              goal: 3,
              daysRemaining: 30,
            }}
            student={user}
            unmessagedMatches={unmessagedMatches}
            totalMatches={matches.length}
            linkedParents={linkedParents}
            onMessageMatch={(match) => {
              const name = match.helper_name || match.parent_name || 'Helper';
              const email = match.helper_email || match.parent_email;
              navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
            }}
            onLogIntro={() => setShowLogIntroModal(true)}
            onInviteParent={() => setShowInviteModal(true)}
          />
        )}

        {/* Recent Feedback */}
        <RecentFeedbackCard user={user} />

        {/* Student Karma Explainer (first visit) */}
        <StudentKarmaExplainer user={user} />

        {/* Student Karma Card */}
        <StudentKarmaCard user={user} onInviteParent={() => setShowInviteModal(true)} />

        {/* 4. 💬 HELP A FELLOW GATOR (+5 karma) */}
        <HelpFellowGatorSection user={user} />

        {/* 5. 👨‍👩‍👧 INVITE YOUR PARENTS / Family Network */}
        <InviteParentsCard linkedParents={linkedParents} onInviteParent={() => setShowInviteModal(true)} />

        {/* Family Boost Status */}
        {(user?.boost_level > 0 || linkedParents.length > 0 || user?.family_group_id) && (
          <FamilyBoostStatus 
            boostLevel={user?.boost_level || user?.karma_boost || 0}
            boostExpiresAt={user?.boost_expires_at || user?.boosted_until}
            boostedByParentEmail={user?.boosted_by_parent_email || linkedParents?.[0]?.email}
            boostedByParentName={linkedParents?.[0]?.full_name}
            parentKarma={user?.family_karma || linkedParents?.[0]?.karma_points || 0}
            linkedParents={linkedParents}
          />
        )}

        {/* 6. 📝 SHARE WHAT YOU LEARNED (+10 karma) */}
        <ShareWhatYouLearnedCard user={user} />

        {/* 7. 💰 SHARE YOUR OFFER DATA (+25 karma) */}
        <ShareOfferDataCard user={user} />

        {/* 8. 💼 POST A JOB/GIG (+10 karma) */}
        <PostJobGigCard />

        {/* 9. EXPLORE */}
        <ExploreSection />

        {/* Family Karma (if applicable) */}
        {(user?.family_karma > 0 || linkedParents.length > 0) && (
          <FamilyKarmaCard user={user} viewMode="student" />
        )}

        {/* Family Leaderboard */}
        {(user?.family_group_id || linkedParents.length > 0) && (
          <FamilyLeaderboard user={user} />
        )}

        {/* 10. MORE TOOLS */}
        <details className="group bg-white rounded-xl shadow-lg border-2 border-slate-100 overflow-hidden">
          <summary className="cursor-pointer p-5 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">More Tools</h3>
            <ChevronDown className="w-5 h-5 text-slate-400 transform group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-5 pt-0 border-t border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button onClick={() => navigate('MyMessages')} variant="outline" className="justify-start h-auto py-4">
                <MessageSquare className="w-5 h-5 mr-2" /> My Messages
              </Button>
              <Button onClick={() => navigate('MyApplications')} variant="outline" className="justify-start h-auto py-4">
                <Users className="w-5 h-5 mr-2" /> My Applications
              </Button>
              <Button onClick={() => navigate('Profile')} variant="outline" className="justify-start h-auto py-4">
                <Users className="w-5 h-5 mr-2" /> My Profile
              </Button>
            </div>
          </div>
        </details>
      </div>

      {/* Modals */}
      <InviteParentModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={async () => {
          await refreshUser();
          loadStartedRef.current = false;
          await loadDashboardData();
        }}
      />

      {showLogIntroModal && (
        <LogIntroModal
          isOpen={showLogIntroModal}
          onClose={() => setShowLogIntroModal(false)}
          user={user}
          matches={matches}
          onSuccess={async () => {
            setShowLogIntroModal(false);
            await refreshUser();
            loadStartedRef.current = false;
            await loadDashboardData();
          }}
        />
      )}

      {/* First Message Nudge Modal */}
      {showFirstMessageNudge && unmessagedMatches.length > 0 && (
        <FirstMessageNudgeModal
          topMatch={unmessagedMatches[0]}
          allMatchesCount={matches.length}
          onMessage={(match) => {
            const name = match.helper_name || match.parent_name || 'Helper';
            const email = match.helper_email || match.parent_email;
            navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
          }}
          onBrowse={() => {
            document.querySelector('[class*="MatchesSection"]')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onClose={() => setShowFirstMessageNudge(false)}
        />
      )}
    </PullToRefresh>
  );
}