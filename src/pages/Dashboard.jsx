import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Briefcase, Users, MessageSquare, Mail, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import InviteParentModal from '@/components/dashboard/InviteParentModal';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { getUserMessages } from '@/functions/getUserMessages';
import { getUserCount } from '@/functions/getUserCount';
import StudentHelpRequestCard from '@/components/dashboard/StudentHelpRequestCard';
import StudentParentMatchesWidget from '@/components/dashboard/StudentParentMatchesWidget';
import ChallengeWidget from '@/components/challenge/ChallengeWidget';

// CACHE BUSTER v3 - 2026-01-02 - Fixed layout flashing
export default function Dashboard() {
  const { user, isLoading, refreshUser } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [helpRequest, setHelpRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    totalUsers: 226,
    activeRequests: 0,
    spotsLeft: 774
  });
  const [myActiveQuestions, setMyActiveQuestions] = useState(0);
  const [linkedParents, setLinkedParents] = useState([]);
  
  // Track if we've already started loading to prevent duplicate calls
  const loadStartedRef = React.useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate('LandingPage');
      return;
    }

    if (user.persona === 'parent') {
      navigate('ParentDashboard');
      return;
    } else if (user.roles?.includes('admin')) {
      navigate('AdminDashboard');
      return;
    }

    // Prevent duplicate load calls
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    
    localStorage.setItem('cff:seenDashboard', 'true');
    loadDashboardData();
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    console.log('🚀🚀🚀 loadDashboardData STARTING for:', user?.email, 'user.id:', user?.id);
    
    // LOAD HELP REQUEST FIRST - most important (check both HelpRequest and JobRequest)
    let foundRequest = null;
    console.log('🔍 Loading question for:', user?.email);
    
    // Strategy 1: Check JobRequest first (newer entity type)
    try {
      const jobRequests = await base44.entities.JobRequest.filter(
        { created_by: user.email, status: 'active' },
        '-created_date',
        1
      );
      console.log('🔍 JobRequest by created_by:', jobRequests?.length || 0);
      if (jobRequests?.length > 0) {
        foundRequest = jobRequests[0];
      }
    } catch (e) {
      console.error('🔍 JobRequest filter failed:', e);
    }
    
    // Strategy 2: Check HelpRequest if no JobRequest found
    if (!foundRequest) {
      try {
        const allAccessible = await base44.entities.HelpRequest.list('-created_date', 50);
        console.log('🔍 All accessible HelpRequests via list():', allAccessible?.length || 0);
        
        const activeOnes = (allAccessible || []).filter(r => 
          r.status === 'active' && 
          (r.student_email === user.email || r.created_by === user.email || r.student_id === user.id)
        );
        console.log('🔍 Active HelpRequests for this user:', activeOnes?.length || 0);
        
        if (activeOnes.length > 0) {
          foundRequest = activeOnes[0];
        }
      } catch (e) {
        console.error('🔍 HelpRequest list() failed:', e);
      }
    }
    
    // Strategy 3: Try direct filter by student_email (backup)
    if (!foundRequest) {
      try {
        const byEmail = await base44.entities.HelpRequest.filter(
          { student_email: user.email, status: 'active' },
          '-created_date',
          1
        );
        console.log('🔍 HelpRequest by email filter:', byEmail?.length || 0);
        if (byEmail?.length > 0) {
          foundRequest = byEmail[0];
        }
      } catch (e) {
        console.error('🔍 HelpRequest email filter failed:', e);
      }
    }
    
    console.log('🔍 FINAL question:', foundRequest ? foundRequest.id : 'NONE', foundRequest?.description?.substring(0, 50));
    setHelpRequest(foundRequest || null);
    
    // Count ALL active questions for this user (JobRequests + HelpRequests)
    let totalActiveQuestions = 0;
    try {
      const myJobRequests = await base44.entities.JobRequest.filter(
        { created_by: user.email, status: 'active' }
      );
      totalActiveQuestions += myJobRequests?.length || 0;
      
      // Also check poster_email for JobRequests (anonymous posts)
      const myJobRequestsByPoster = await base44.entities.JobRequest.filter(
        { poster_email: user.email, status: 'active' }
      );
      // Dedupe by ID
      const jobRequestIds = new Set((myJobRequests || []).map(r => r.id));
      (myJobRequestsByPoster || []).forEach(r => {
        if (!jobRequestIds.has(r.id)) totalActiveQuestions++;
      });
      
      const myHelpRequests = await base44.entities.HelpRequest.filter(
        { student_email: user.email, status: 'active' }
      );
      totalActiveQuestions += myHelpRequests?.length || 0;
      
      console.log('📊 My active questions count:', totalActiveQuestions);
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

      // Fetch matches - try multiple strategies to handle user ID mismatches
      let studentMatches = [];
      
      // Strategy 1: By student_email (most reliable - added to RLS)
      console.log('📊 Fetching matches for student_email:', user.email);
      studentMatches = await base44.entities.Match.filter(
        { student_email: user.email },
        '-match_score',
        50
      );
      console.log('📊 Matches by student_email:', studentMatches?.length || 0);
      
      // Strategy 2: By help_request_id if we have a request
      if ((!studentMatches || studentMatches.length === 0) && foundRequest) {
        console.log('📊 Trying help_request_id:', foundRequest.id);
        studentMatches = await base44.entities.Match.filter(
          { help_request_id: foundRequest.id },
          '-match_score',
          50
        );
        console.log('📊 Matches by help_request_id:', studentMatches?.length || 0);
      }
      
      // Strategy 3: Try by student_id from the request
      if ((!studentMatches || studentMatches.length === 0) && foundRequest?.student_id) {
        console.log('📊 Trying student_id from request:', foundRequest.student_id);
        studentMatches = await base44.entities.Match.filter(
          { student_id: foundRequest.student_id },
          '-match_score',
          50
        );
        console.log('📊 Matches by request.student_id:', studentMatches?.length || 0);
      }
      
      // Strategy 4: Try by current user.id
      if ((!studentMatches || studentMatches.length === 0)) {
        studentMatches = await base44.entities.Match.filter(
          { student_id: user.id },
          '-match_score',
          50
        );
        console.log('📊 Matches by user.id fallback:', studentMatches?.length || 0);
      }
      
      // Don't filter by status - show ALL matches for this user so they see accurate count
      console.log('📊 Dashboard final matches (all):', studentMatches?.length || 0, 'for user:', user.email);
      setMatches(studentMatches || []);

      // Count active requests for stats
      const allActiveRequests = await base44.entities.HelpRequest.filter(
        { status: 'active' },
        undefined,
        100
      );
      setNetworkStats(prev => ({
        ...prev,
        activeRequests: allActiveRequests?.length || 15
      }));

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
    }
  };

  // Show loading state until BOTH auth is complete AND initial data load is done
  // This prevents layout flashing by keeping a single loading screen
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

  const unreadCount = messages.filter(m => !m.is_read).length;
  // Show all matches (not filtering by type since most don't have match_type set)
  const parentMatches = matches;
  const responseCount = matches.filter(m => m.status === 'student_connected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20 pb-24 md:pb-8">
      
      {/* Founding Member Banner */}
      {networkStats.spotsLeft > 0 && networkStats.spotsLeft <= 800 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#FA4616] via-orange-500 to-orange-600 text-white py-4 px-4"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <span className="font-bold">You're a Founding Member!</span>
                <span className="text-white/90 ml-2">FREE FOREVER</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <span className="text-2xl font-bold text-yellow-300">{networkStats.spotsLeft}</span>
              <span className="text-white/90 ml-2">founding spots remaining</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Family Link Success Banner */}
      {linkedParents.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 mx-4 mt-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">
                🎉 You're linked to {linkedParents.map(p => p.full_name || p.email).join(', ')}
              </p>
              <p className="text-sm text-green-600">Their support boosts your visibility in the network!</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header - Mobile Optimized */}
      <div className="bg-[#0021A5] text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Welcome back, {user.first_name || (() => {
              const fn = user.full_name?.trim() || '';
              if (fn.includes(',')) {
                // "Osinoff, Lindsey M." -> "Lindsey"
                return fn.split(',')[1]?.trim().split(/\s+/)[0] || 'Gator';
              }
              return fn.split(/\s+/)[0] || 'Gator';
            })()}! 👋
          </h1>
          <p className="text-white/80 text-sm mt-1 md:hidden">
            Parents and alumni are ready to help
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* 1. 30-Day Intro Challenge Widget - compact, motivational */}
        <ChallengeWidget
          user={user}
          matches={parentMatches}
          onIntroLogged={async () => {
            await refreshUser();
            loadStartedRef.current = false;
            await loadDashboardData();
          }}
        />

        {/* 2. People Who Can Help - THE STAR SECTION */}
        {parentMatches.length > 0 && (
          <StudentParentMatchesWidget
            user={user}
            matches={parentMatches}
            onRefresh={() => {
              loadStartedRef.current = false;
              loadDashboardData();
            }}
          />
        )}
        
        {/* 3. Stats Bar */}
        {/* Network Stats - Compact on Mobile */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 md:border-2">
            <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center px-2">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-0.5">{myActiveQuestions}</div>
              <p className="text-xs md:text-sm text-slate-600 leading-tight">Active Questions</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 md:border-2">
            <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center px-2">
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-0.5">{parentMatches.length}</div>
              <p className="text-xs md:text-sm text-slate-600 leading-tight">Matches</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 md:border-2">
            <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 text-center px-2">
              <div className="text-2xl md:text-3xl font-bold text-green-600 mb-0.5">{responseCount}</div>
              <p className="text-xs md:text-sm text-slate-600 leading-tight">Responses</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. Messages Section */}
        {messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2 border-slate-200 shadow-lg">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="bg-red-600 text-white text-sm font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('MyMessages')}
                    className="text-blue-600"
                  >
                    View All Messages
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {messages.slice(0, 3).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                        !msg.is_read 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 border-l-4 border-l-blue-500' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                      onClick={() => navigate('MyMessages')}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.is_read && (
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></span>
                        )}
                        <p className={`font-semibold text-sm ${!msg.is_read ? 'text-blue-900' : 'text-slate-900'}`}>
                          {msg.sender_email?.split('@')[0]}
                        </p>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.created_date).toLocaleDateString()}
                        </span>
                        {!msg.is_read && (
                          <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">NEW</span>
                        )}
                      </div>
                      <p className={`text-sm font-medium line-clamp-1 ${!msg.is_read ? 'text-blue-800' : 'text-slate-700'}`}>{msg.subject}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{msg.body}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 5. Latest Opportunities */}
        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-slate-200 shadow-lg">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    💼 Latest Opportunities from UF Parents
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('Opportunities')}
                    className="text-purple-600"
                  >
                    Browse All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {opportunities.slice(0, 2).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md cursor-pointer transition-all"
                      onClick={() => navigate(`Opportunities?id=${opp.id}`)}
                    >
                      <h4 className="font-semibold text-slate-900">{opp.title}</h4>
                      <p className="text-sm text-slate-600">
                        {opp.company} • Posted {new Date(opp.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 6. Ask Another Question - small link if they have matches */}
        {!loadingData && parentMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <Button
              variant="outline"
              onClick={() => navigate('PostRequest')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Ask Another Question →
            </Button>
          </motion.div>
        )}

        {/* 7. Your Family - Collapsed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
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
        </motion.div>

        {/* More Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <details className="group bg-white rounded-xl shadow-lg border-2 border-slate-100 overflow-hidden">
            <summary className="cursor-pointer p-5 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">More Tools</h3>
              <ChevronDown className="w-5 h-5 text-slate-400 transform group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-5 pt-0 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => navigate('MyMessages')}
                  variant="outline"
                  className="justify-start h-auto py-4"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  My Messages
                </Button>
                <Button
                  onClick={() => navigate('MyApplications')}
                  variant="outline"
                  className="justify-start h-auto py-4"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  My Applications
                </Button>
                <Button
                  onClick={() => navigate('Profile')}
                  variant="outline"
                  className="justify-start h-auto py-4"
                >
                  <Users className="w-5 h-5 mr-2" />
                  My Profile
                </Button>
              </div>
            </div>
          </details>
        </motion.div>
      </div>

      <InviteParentModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={async () => {
          await refreshUser();
          await loadDashboardData();
        }}
      />
    </div>
  );
}