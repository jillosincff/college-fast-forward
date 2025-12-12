import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Briefcase, Users, Home, Target, MessageSquare, Mail, ArrowRight, Star, Sparkles } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import InviteParentModal from '@/components/dashboard/InviteParentModal';
import TalentSpotlightSetupModal from '@/components/dashboard/TalentSpotlightSetupModal';
import { UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getUserMessages } from '@/functions/getUserMessages';
import { getUserCount } from '@/functions/getUserCount';
import MembershipStatusCard from '@/components/dashboard/MembershipStatusCard';
import DraftRequestBanner from '@/components/dashboard/DraftRequestBanner';
import FullAccessUpgradeCard from '@/components/dashboard/FullAccessUpgradeCard';
import CampusAmbassadorWidget from '@/components/dashboard/CampusAmbassadorWidget';
import { HERO_BG_GRADIENT, HERO_TEXTURE_OVERLAY, HERO_GLOW_EFFECTS, HERO_HEADING_CLASSES, HERO_SUBHEADING_CLASSES } from '@/components/home/HeroStyles';
import { useAccessControl } from '@/components/access/useAccessControl';
import LimitedModeBanner from '@/components/access/LimitedModeBanner';

export default function Dashboard() {
  const { user, isLoading, refreshUser } = useAuth();
  const accessInfo = useAccessControl(user);
  const [opportunities, setOpportunities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSpotlightModal, setShowSpotlightModal] = useState(false);
  const [networkStats, setNetworkStats] = useState({
    totalUsers: 226,
    totalStudents: 66,
    spotsLeft: 774
  });
  
  const [stats, setStats] = useState({
    parentsViewed: 0,
    peerConnections: 0,
    warmIntros: 0,
    opportunitiesMatched: 0
  });

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

    loadDashboardData();
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch user counts from backend
      try {
        console.log('🔍 Dashboard: Fetching user count...');
        const response = await getUserCount();
        const data = response.data;
        
        console.log('📊 Dashboard: Received data:', data);
        
        setNetworkStats({
          totalUsers: data?.totalUsers || data?.count || 226,
          totalStudents: data?.gatorCount || data?.studentCount || 66,
          spotsLeft: data?.spotsLeft || 774
        });
      } catch (error) {
        console.error('❌ Dashboard: Failed to fetch network stats:', error);
      }

      const { data: messagesResponse } = await getUserMessages();
      const myMessages = messagesResponse?.messages || [];
      setMessages(myMessages);

      const opps = await base44.entities.Opportunity.filter({ status: 'active' }, '-created_date', 5);
      setOpportunities(opps || []);

      const reqs = await base44.entities.JobRequest.filter({ status: 'active' }, '-created_date', 3);
      setRequests(reqs || []);

      await loadStudentStats(myMessages, opps);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadStudentStats = async (myMessages, opps) => {
    try {
      const myRequests = await base44.entities.JobRequest.filter(
        { created_by: user.email },
        '-created_date'
      );

      let helpOffersCount = 0;
      if (myRequests && myRequests.length > 0) {
        const requestIds = myRequests.map(req => req.id);
        const allHelpOffers = await base44.entities.HelpOffer.list();
        helpOffersCount = allHelpOffers.filter(offer => 
          requestIds.includes(offer.job_request_id)
        ).length;
      }

      const intros = await base44.entities.Intro.filter(
        { student_id: user.id }
      );
      const introsCount = intros?.length || 0;

      const parentMessages = myMessages.filter(msg => {
        return msg.sender_email !== user.email;
      });
      const parentsViewedCount = Math.max(parentMessages.length, helpOffersCount);

      const peerConnectionsCount = helpOffersCount + introsCount;

      const matchedOpps = opps?.length || 0;

      setStats({
        parentsViewed: parentsViewedCount,
        peerConnections: peerConnectionsCount,
        warmIntros: introsCount,
        opportunitiesMatched: matchedOpps
      });
    } catch (error) {
      console.error('Failed to load student stats:', error);
      setStats({
        parentsViewed: 0,
        peerConnections: 0,
        warmIntros: 0,
        opportunitiesMatched: 0
      });
    }
  };

  const handleSpotlightSuccess = async () => {
    await refreshUser();
    await loadDashboardData();
  };

  if (isLoading || !user) {
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
  const isSpotlightActive = user?.talent_spotlight_enabled && user?.spotlight_enabled_date;

  console.log('📊 Dashboard displaying:', networkStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Limited Mode Banner */}
      <LimitedModeBanner user={user} accessInfo={accessInfo} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-16 px-4 mb-12" style={{
        background: 'linear-gradient(135deg, #0021A5 0%, #0033A0 35%, #FA4616 100%)',
        boxShadow: '0 4px 20px rgba(0, 33, 165, 0.15)'
      }}>
        {HERO_TEXTURE_OVERLAY}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 text-9xl">🐊</div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {user?.full_name && (
              <div className="mb-4">
                <p className="text-white/90 text-lg font-medium">Welcome back,</p>
                <p className="text-2xl font-bold text-white">{user.full_name.split(' ')[0]}! 🎓</p>
              </div>
            )}

            {networkStats.spotsLeft > 0 && (
              <div className="mb-6">
                <div className="inline-block bg-[#FA4616] text-white px-8 py-3 rounded-full font-extrabold text-base shadow-2xl animate-pulse">
                  🔥 {networkStats.spotsLeft} founding member spots left out of 1,000
                </div>
              </div>
            )}

            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight" style={{ 
              textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              Get Hired Through Warm Introductions
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-6 max-w-2xl mx-auto font-semibold" style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
              <span className="text-3xl font-extrabold text-yellow-300">70,000+</span> Gator alumni and parents connect you directly to hiring managers
            </p>

            {!loadingData && (
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span>🎓 {networkStats.totalStudents} students in network</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span>👥 {networkStats.totalUsers} total Gators</span>
                </div>
                {stats.parentsViewed > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span>👨‍💼 {stats.parentsViewed} parent{stats.parentsViewed !== 1 ? 's' : ''} reached out</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Draft Request Banner */}
        <DraftRequestBanner user={user} />
        
        {/* Full Access Upgrade Card (for free-tier students without linked parent) */}
        <FullAccessUpgradeCard user={user} />
        
        {/* Brand Ambassador Promotion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="bg-gradient-to-r from-[#FA4616] to-red-600 border-0 shadow-2xl hover:shadow-3xl transition-all">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                    <span className="text-4xl">💰</span>
                    <h3 className="text-2xl md:text-3xl font-extrabold">
                      Earn While You Share
                    </h3>
                  </div>
                  <p className="text-white/95 text-lg font-medium leading-relaxed">
                    Become a Brand Ambassador and get paid to help fellow Gators discover opportunities!
                  </p>
                </div>
                <Button
                  onClick={() => navigate('UFAmbassador')}
                  className="bg-white text-[#FA4616] hover:bg-slate-50 font-bold px-10 py-7 text-lg shadow-2xl rounded-xl transition-all hover:scale-105"
                >
                  Learn More →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Campus Ambassador Widget */}
        <CampusAmbassadorWidget />
        
        {/* Primary CTA - Find Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-500 via-emerald-500 to-emerald-600 border-0 shadow-2xl"
            onClick={() => {
              navigate('Opportunities');
              trackEvent('quick_action_clicked', { action: 'opportunities' });
            }}
          >
            <CardContent className="pt-10 pb-10 text-center">
              <div className="w-24 h-24 bg-white/25 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                <Briefcase className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight" style={{
                fontFamily: "'Inter', sans-serif"
              }}>Find Your Next Opportunity</h2>
              <p className="text-white/95 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-medium leading-relaxed">Browse jobs, internships, and student gigs posted by Gator parents and employers</p>
              <div className="inline-flex items-center gap-3 bg-white text-green-700 px-10 py-5 rounded-2xl font-extrabold text-xl hover:bg-slate-50 hover:shadow-2xl transition-all">
                View Opportunities
                <ArrowRight className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 border-2 border-purple-100"
              onClick={() => {
                navigate('Connections');
                trackEvent('quick_action_clicked', { action: 'connections' });
              }}
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2" style={{
                      fontFamily: "'Inter', sans-serif"
                    }}>Get Help from Gators</h3>
                    <p className="text-base text-slate-700 font-medium">Connect with parents and alumni for warm intros</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-50 via-orange-50 to-red-50 border-2 border-orange-100"
              onClick={() => {
                navigate('Roommates');
                trackEvent('quick_action_clicked', { action: 'roommates' });
              }}
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FA4616] to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2" style={{
                      fontFamily: "'Inter', sans-serif"
                    }}>Find a Roommate</h3>
                    <p className="text-base text-slate-700 font-medium">Connect with Gators for housing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Parent Invite - Contextual Power Move */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-3 border-[#FA4616] shadow-2xl bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 hover:shadow-3xl transition-all">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">🚀</span>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900" style={{
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      Supercharge Your Job Search
                    </h3>
                  </div>
                  <p className="text-slate-800 text-lg mb-4 leading-relaxed font-medium">
                    <strong className="text-[#FA4616]">Parents provide warm introductions to hiring managers.</strong> When your parent joins, they can see your profile and post opportunities specifically for you. <span className="font-bold text-green-700">87% of students get help within 2 weeks.</span>
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 px-4 py-2 rounded-full font-bold shadow-sm">✨ Warm Intros</span>
                    <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 px-4 py-2 rounded-full font-bold shadow-sm">💼 Job Posts</span>
                    <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-900 px-4 py-2 rounded-full font-bold shadow-sm">🏆 Elite Badges</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-gradient-to-r from-[#FA4616] to-orange-600 hover:from-orange-600 hover:to-red-600 text-white font-extrabold px-10 py-7 text-lg shadow-2xl whitespace-nowrap rounded-2xl hover:scale-105 transition-all"
                  >
                    <UserPlus className="w-6 h-6 mr-2" />
                    Invite a Parent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {!isSpotlightActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <CardContent className="pt-6 pb-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-7 h-7 text-slate-900 drop-shadow-md" />
                      <h3 className="text-2xl font-bold text-slate-900" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        ⭐ Get Featured in Talent Spotlight
                      </h3>
                    </div>
                    <p className="text-slate-900 font-medium text-lg mb-2" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      70,000+ alumni & parents are looking to hire. Get discovered for 30 days!
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="bg-slate-900/80 text-white backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                        <Sparkles className="w-4 h-4" />
                        Profile + Skills
                      </span>
                      <span className="bg-slate-900/80 text-white backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                        💼 Projects
                      </span>
                      <span className="bg-slate-900/80 text-white backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                        🎥 Video Intro
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowSpotlightModal(true)}
                    size="lg"
                    className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8 py-6 text-lg shadow-xl"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Set Up Spotlight
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isSpotlightActive ? 0.2 : 0.25 }}
        >
          <MembershipStatusCard />
        </motion.div>

        {/* More Tools Section - Collapsed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isSpotlightActive ? 0.25 : 0.3 }}
        >
          <details className="group bg-white rounded-2xl shadow-lg border-2 border-slate-100 overflow-hidden">
            <summary className="cursor-pointer p-6 hover:bg-slate-50 transition-colors list-none flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">More Tools</h3>
              <ArrowRight className="w-5 h-5 text-slate-400 transform group-open:rotate-90 transition-transform" />
            </summary>
            <div className="p-6 pt-0 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => navigate('MyMessages')}
                  variant="outline"
                  className="justify-start relative h-auto py-4"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  My Messages
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
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
                  <Target className="w-5 h-5 mr-2" />
                  My Profile
                </Button>
              </div>
            </div>
          </details>
        </motion.div>

        {/* Network Activity - Consolidated */}
        {(!loadingData && (messages.length > 0 || stats.warmIntros > 0 || stats.parentsViewed > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isSpotlightActive ? 0.3 : 0.35 }}
          >
            <Card className="border-2 border-blue-100 shadow-lg">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Your Network Activity
                </h3>

                {/* Stats */}
                {(stats.warmIntros > 0 || stats.parentsViewed > 0) && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-md">
                      <div className="text-3xl font-extrabold text-blue-600 mb-1">{stats.parentsViewed}</div>
                      <p className="text-sm text-slate-700 font-semibold">Network reach</p>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-md">
                      <div className="text-3xl font-extrabold text-purple-600 mb-1">{stats.warmIntros}</div>
                      <p className="text-sm text-slate-700 font-semibold">Warm intros</p>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-md">
                      <div className="text-3xl font-extrabold text-green-600 mb-1">{opportunities.length}</div>
                      <p className="text-sm text-slate-700 font-semibold">Available jobs</p>
                    </div>
                  </div>
                )}

                {/* Recent Messages */}
                {messages.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Recent Messages
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                            {unreadCount}
                          </span>
                        )}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('MyMessages')}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {messages.slice(0, 2).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                            !msg.is_read ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                          }`}
                          onClick={() => navigate('MyMessages')}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm text-slate-900 line-clamp-1">{msg.subject}</p>
                            {!msg.is_read && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">New</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">{msg.body}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <InviteParentModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={async () => {
          await refreshUser();
          await loadDashboardData();
        }}
      />

      <TalentSpotlightSetupModal
        isOpen={showSpotlightModal}
        onClose={() => setShowSpotlightModal(false)}
        user={user}
        onSuccess={handleSpotlightSuccess}
        />
    </div>
  );
}