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
    <div className="min-h-screen bg-slate-50">
      {/* Limited Mode Banner */}
      <LimitedModeBanner user={user} accessInfo={accessInfo} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white py-12 px-4" style={HERO_BG_GRADIENT}>
        {HERO_TEXTURE_OVERLAY}
        {HERO_GLOW_EFFECTS}
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {networkStats.spotsLeft > 0 && (
              <div className="mb-4">
                <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                  🔥 {networkStats.spotsLeft} founding member spots left out of 1,000
                </div>
              </div>
            )}

            <h1 className={HERO_HEADING_CLASSES}>
              Leverage Your Gator Network to Get Hired
            </h1>
            <p className={`${HERO_SUBHEADING_CLASSES} mb-6 max-w-2xl mx-auto mt-4`}>
              Connect with parents and Gators ready to help you succeed
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2">
                    💰 Want to earn money while spreading the word to Gators?
                  </h3>
                  <p className="text-white/90 text-lg">
                    Become a Brand Ambassador and get paid to help fellow Gators discover opportunities!
                  </p>
                </div>
                <Button
                  onClick={() => navigate('UFAmbassador')}
                  className="bg-white text-orange-600 hover:bg-white/90 font-bold px-8 py-6 shadow-lg"
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Campus Ambassador Widget */}
        <CampusAmbassadorWidget />
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            Start Here - Your Career Toolkit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
              onClick={() => {
                navigate('Opportunities');
                trackEvent('quick_action_clicked', { action: 'opportunities' });
              }}
            >
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">🟢 Find Opportunities</h3>
                <p className="text-slate-600">Jobs, internships, & student gigs</p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
              onClick={() => {
                navigate('Connections');
                trackEvent('quick_action_clicked', { action: 'connections' });
              }}
            >
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">🟣 Get Help from Gators</h3>
                <p className="text-slate-600">Parents + Gator intros</p>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
              onClick={() => {
                navigate('Roommates');
                trackEvent('quick_action_clicked', { action: 'roommates' });
              }}
            >
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">🟠 Find a Roommate</h3>
                <p className="text-slate-600">Connect with Gators looking for housing</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Superpower Parent Invite Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-4 border-orange-500 shadow-2xl bg-gradient-to-br from-orange-50 to-yellow-50 relative overflow-hidden">
            {/* Lightning bolt decorations */}
            <div className="absolute top-4 right-4 text-6xl animate-pulse">⚡</div>
            <div className="absolute bottom-4 left-4 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>⚡</div>
            <CardContent className="pt-8 pb-8 relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-extrabold text-slate-900 mb-3">
                  Invite Your Parent(s) – This Is Your Superpower ⚡
                </h3>
                <p className="text-lg text-slate-700 max-w-3xl mx-auto font-medium">
                  Parents get you warm intros, post jobs for you, and unlock your elite badges. 87% of students who invite a parent get help within 2 weeks.
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Button
                  onClick={() => setShowInviteModal(true)}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-10 py-7 text-lg shadow-xl border-2 border-orange-300"
                >
                  <UserPlus className="w-6 h-6 mr-2" />
                  Invite Parent 1
                </Button>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-10 py-7 text-lg shadow-xl border-2 border-orange-300"
                >
                  <UserPlus className="w-6 h-6 mr-2" />
                  Invite Parent 2
                </Button>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isSpotlightActive ? 0.25 : 0.3 }}
          className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">
            Quick Access to Your Career Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('MyMessages')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all relative"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              📬 My Messages
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              onClick={() => navigate('MyApplications')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              📋 My Applications
            </Button>
            <Button
              onClick={() => navigate('Opportunities')}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Target className="w-5 h-5 mr-2" />
              💼 Job Postings
            </Button>
          </div>
        </motion.div>



        {!loadingData && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isSpotlightActive ? 0.25 : 0.3 }}
          >
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-6 h-6 text-blue-600" />
                    Recent Messages
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('MyMessages')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {messages.slice(0, 3).map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                        !msg.is_read ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                      }`}
                      onClick={() => navigate('MyMessages')}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900">{msg.subject}</p>
                            {!msg.is_read && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{msg.body}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {messages.length > 3 && (
                  <Button
                    variant="link"
                    onClick={() => navigate('MyMessages')}
                    className="mt-4 text-blue-600 font-semibold w-full"
                  >
                    View All {messages.length} Messages →
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isSpotlightActive ? 0.3 : 0.35 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  Recommended For You
                </h3>
                <div className="space-y-3">
                  {opportunities.slice(0, 3).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate('Opportunities', { id: opp.id })}
                    >
                      <h4 className="font-bold text-slate-900 mb-1">{opp.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        {opp.org_name} {opp.salary_display && `• ${opp.salary_display}`}
                      </p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {opp.opportunity_type}
                        </span>
                        {opp.location_type && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {opp.location_type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="link"
                  onClick={() => navigate('Opportunities')}
                  className="mt-4 text-blue-600 font-semibold"
                >
                  View All Opportunities →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!loadingData && (stats.warmIntros > 0 || stats.opportunitiesMatched > 0 || stats.peerConnections > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isSpotlightActive ? 0.35 : 0.4 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Your Network in Action
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">{stats.parentsViewed}</div>
                    <p className="text-sm text-slate-600">👥 Network engagement{stats.parentsViewed !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-1">{stats.warmIntros}</div>
                    <p className="text-sm text-slate-600">💬 Warm intro{stats.warmIntros !== 1 ? 's' : ''} received</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">{stats.opportunitiesMatched}</div>
                    <p className="text-sm text-slate-600">🎯 Opportunit{stats.opportunitiesMatched !== 1 ? 'ies' : 'y'} available</p>
                  </div>
                </div>
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