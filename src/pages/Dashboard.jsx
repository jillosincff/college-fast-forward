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

// New focused components
import NewUserWelcome from '@/components/dashboard/student/NewUserWelcome';
import WaitingForMatches from '@/components/dashboard/student/WaitingForMatches';
import WaitingForResponses from '@/components/dashboard/student/WaitingForResponses';
import UnreadResponsesSection from '@/components/dashboard/student/UnreadResponsesSection';
import MoreMatchesPrompt from '@/components/dashboard/student/MoreMatchesPrompt';
import MatchesSection from '@/components/dashboard/student/MatchesSection';
import CompactOpportunities from '@/components/dashboard/student/CompactOpportunities';
import CompactChallenge from '@/components/dashboard/student/CompactChallenge';
import FamilyBoostStatus from '@/components/dashboard/student/FamilyBoostStatus';
import LogIntroModal from '@/components/challenge/LogIntroModal';
import FirstMessageNudgeModal from '@/components/onboarding/student/FirstMessageNudgeModal';
// New UF-branded components
import FoundingMemberBanner from '@/components/dashboard/student/FoundingMemberBanner';
import DashboardHeader from '@/components/dashboard/student/DashboardHeader';
import StatsCards from '@/components/dashboard/student/StatsCards';
import AllCaughtUpState from '@/components/dashboard/student/states/AllCaughtUpState';
import ChallengeCard from '@/components/dashboard/student/ChallengeCard';
import FamilyCard from '@/components/dashboard/student/FamilyCard';
import ConversationsSection from '@/components/dashboard/student/ConversationsSection';
import ResponsesSection from '@/components/dashboard/student/ResponsesSection';
import WhatToDoNext from '@/components/dashboard/student/WhatToDoNext';
import FamilyKarmaCard from '@/components/karma/FamilyKarmaCard';
import ActivationWelcomeBannerStudent from '@/components/dashboard/student/ActivationWelcomeBannerStudent';
import StudentKarmaCard from '@/components/dashboard/student/StudentKarmaCard';
import HelpFellowGatorSection from '@/components/dashboard/student/HelpFellowGatorSection';
import ShareWhatYouLearnedCard from '@/components/dashboard/student/ShareWhatYouLearnedCard';
import ShareOfferDataCard from '@/components/dashboard/student/ShareOfferDataCard';

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
    totalUsers: 226,
    activeRequests: 0,
    spotsLeft: 774
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
      navigate('AlumniDashboard');
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
      // Fetch user counts
      try {
        const response = await getUserCount();
        const data = response.data;
        setNetworkStats({
          totalUsers: data?.totalUsers || data?.count || 226,
          activeRequests: data?.activeRequests || 15,
          spotsLeft: data?.spotsLeft || 774
        });
      } catch (error) {
        console.error('Failed to fetch network stats:', error);
      }

      // Fetch messages
      try {
        const { data: messagesResponse } = await getUserMessages();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 pb-24 md:pb-8 overflow-x-hidden">
      
      {/* Founding Member Banner */}
      <FoundingMemberBanner spotsLeft={networkStats.spotsLeft} />

      {/* Welcome Header with Stats - Only show when NOT new user */}
      {userState !== 'new_user' && (
        <DashboardHeader 
          firstName={firstName}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        
        {/* ========== ACTIVATION WELCOME BANNER ========== */}
        <ActivationWelcomeBannerStudent user={user} />

        {/* Student Karma Card */}
        <StudentKarmaCard user={user} onInviteParent={() => setShowInviteModal(true)} />

        {/* Help a Fellow Gator - Peer Q&A */}
        <HelpFellowGatorSection user={user} />

        {/* Share What You've Learned */}
        <ShareWhatYouLearnedCard user={user} />

        {/* Share Your Offer Data */}
        <ShareOfferDataCard user={user} />

        {/* Family Boost Status - Show when linked or has parent */}
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

        {/* Family Link Success Banner */}
        {linkedParents.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">
                  🎉 Linked to {linkedParents.map(p => p.full_name || p.email).join(', ')}
                </p>
                <p className="text-sm text-green-600">Their support boosts your visibility!</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STATE-BASED CONTENT - The core dynamic section                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* STATE 1: New User - No Question Posted */}
        {userState === 'new_user' && (
          <>
            <NewUserWelcome user={user} />
            <CompactOpportunities 
              opportunities={opportunities} 
              title="While you're here — Latest Opportunities"
            />
          </>
        )}

        {/* STATE 2: Question Posted - Waiting for Matches */}
        {userState === 'waiting_for_matches' && (
          <>
            <WaitingForMatches helpRequest={helpRequest} />
            <CompactOpportunities 
              opportunities={opportunities} 
              title="While you wait — Latest Opportunities"
            />
          </>
        )}

        {/* STATE 3: Has Matches - Hasn't Messaged (PRIMARY STATE) */}
        {userState === 'has_matches_not_messaged' && (
          <>
            {/* MATCHES FIRST - The star of the show */}
            <MatchesSection 
              matches={matches} 
              user={user}
              onMessageMatch={(match) => {
                const name = match.helper_name || match.parent_name || 'Helper';
                const email = match.helper_email || match.parent_email;
                navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
              }}
            />

            {/* What To Do Next - Engagement prompts */}
            <WhatToDoNext user={user} />

            {/* Opportunities - Compact */}
            <CompactOpportunities 
              opportunities={opportunities} 
              title={opportunities.length > 1 ? `${opportunities.length} New Opportunities` : "Latest Opportunities"}
            />

            {/* Challenge - At bottom, compact */}
            <CompactChallenge 
              user={user} 
              onLogIntro={() => setShowLogIntroModal(true)}
            />
          </>
        )}

        {/* STATE 4: Has Messaged - Waiting for Responses */}
        {userState === 'waiting_for_responses' && (
          <>
            {/* Waiting status */}
            <WaitingForResponses messagedMatches={messagedMatches} />

            {/* More matches to message */}
            {unmessagedMatches.length > 0 && (
              <MoreMatchesPrompt 
                unmessagedMatches={unmessagedMatches}
                totalMatches={matches.length}
                isWaitingForResponses={true}
                onMessageMatch={(match) => {
                  const name = match.helper_name || match.parent_name || 'Helper';
                  const email = match.helper_email || match.parent_email;
                  navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
                }}
              />
            )}

            {/* What To Do Next - Engagement prompts */}
            <WhatToDoNext user={user} />

            {/* Opportunities - Compact */}
            <CompactOpportunities 
              opportunities={opportunities} 
              title={opportunities.length > 1 ? `${opportunities.length} New Opportunities` : "Latest Opportunities"}
            />
          </>
        )}

        {/* STATE 5: Has Unread Responses (HIGHEST PRIORITY) */}
        {userState === 'has_unread_responses' && (
          <>
            {/* UNREAD RESPONSES FIRST - Top priority */}
            <ResponsesSection 
              responses={unreadMessages} 
              onReadResponse={(msg) => {
                if (msg.conversation_id) {
                  navigate(`MyMessages?id=${msg.conversation_id}`);
                } else {
                  navigate('MyMessages');
                }
              }}
            />

            {/* More matches available */}
            {unmessagedMatches.length > 0 && (
              <MoreMatchesPrompt 
                unmessagedMatches={unmessagedMatches}
                totalMatches={matches.length}
                onMessageMatch={(match) => {
                  const name = match.helper_name || match.parent_name || 'Helper';
                  const email = match.helper_email || match.parent_email;
                  navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
                }}
              />
            )}

            {/* Opportunities - Compact */}
            <CompactOpportunities 
              opportunities={opportunities} 
              title={opportunities.length > 1 ? `${opportunities.length} New Opportunities` : "Latest Opportunities"}
            />
          </>
        )}

        {/* STATE 6: All Caught Up - Explore Mode */}
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

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* COLLAPSED SECTIONS - Always available but not prominent         */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* Your Family's Karma - Student View */}
        {(user?.family_karma > 0 || linkedParents.length > 0) && (
          <FamilyKarmaCard 
            user={user}
            viewMode="student"
          />
        )}

        {/* Your Family - Collapsed (invite if no linked parents) */}
        {linkedParents.length === 0 && (
          <details className="group bg-white rounded-xl shadow-lg border-2 border-slate-100 overflow-hidden">
            <summary className="cursor-pointer p-5 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                👨‍👩‍👧 Your Family
              </h3>
              <ChevronDown className="w-5 h-5 text-slate-400 transform group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-5 pt-0 border-t border-slate-100">
              <p className="text-slate-600 mb-4">Invite your parents to join and unlock the full network!</p>
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-[#FA4616] hover:bg-orange-600"
              >
                <Users className="w-4 h-4 mr-2" />
                Invite a Parent
              </Button>
            </div>
          </details>
        )}

        {/* More Tools - Collapsed */}
        <details className="group bg-white rounded-xl shadow-lg border-2 border-slate-100 overflow-hidden">
          <summary className="cursor-pointer p-5 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">More Tools</h3>
            <ChevronDown className="w-5 h-5 text-slate-400 transform group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-5 pt-0 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            // Scroll to matches section
            document.querySelector('[class*="MatchesSection"]')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onClose={() => setShowFirstMessageNudge(false)}
        />
      )}
    </div>
  );
}