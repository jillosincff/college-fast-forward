import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Message } from '@/entities/Message';
import { HelpOffer } from '@/entities/HelpOffer';
import { Intro } from '@/entities/Intro';
import { Opportunity } from '@/entities/Opportunity';
import { JobRequest } from '@/entities/JobRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Briefcase, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  Star,
  BookOpen,
  Users2,
  Crown,
  RefreshCw
} from 'lucide-react';
import JobMarketInsightsWidget from '@/components/dashboard/parent/JobMarketInsightsWidget';
import ParentActivityWidget from '@/components/dashboard/parent/MyActivityWidget';
import { trackEvent } from '@/components/utils/analytics';
import { errorReporter } from '@/components/utils/errorReporter';
import InviteGatorModal from '@/components/dashboard/InviteGatorModal';
import GenerateInviteModal from '@/components/dashboard/GenerateInviteModal';
import MembershipStatusCard from '@/components/dashboard/MembershipStatusCard';


export default function ParentDashboard() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studentsHelped: 0,
    jobsPosted: 0,
    messagesReceived: 0
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showParentInviteModal, setShowParentInviteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log('=== DASHBOARD DATA LOAD START ===');
      console.log('User:', user.email, 'ID:', user.id);
      console.log('Linked students:', user.linked_students);
      console.log('Force refresh:', forceRefresh);
      
      // Load data using entity SDK
      const [helpOffersResult, introsResult, messagesResult, jobsResult, allJobRequestsResult] = await Promise.allSettled([
        HelpOffer.filter({ offerer_email: user.email }),
        Intro.filter({ helper_user_id: user.id }),
        Message.filter({ recipient_email: user.email }),
        Opportunity.filter({ created_by: user.email }),
        JobRequest.list()
      ]);
      
      const helpOffers = helpOffersResult.status === 'fulfilled' ? (helpOffersResult.value || []) : [];
      const intros = introsResult.status === 'fulfilled' ? (introsResult.value || []) : [];
      const messages = messagesResult.status === 'fulfilled' ? (messagesResult.value || []) : [];
      const jobs = jobsResult.status === 'fulfilled' ? (jobsResult.value || []) : [];
      const allJobRequests = allJobRequestsResult.status === 'fulfilled' ? (allJobRequestsResult.value || []) : [];

      console.log('Fetched data:', {
        helpOffers: helpOffers.length,
        intros: intros.length,
        messages: messages.length,
        jobs: jobs.length,
        allJobRequests: allJobRequests.length
      });

      // Get linked student emails (normalized to lowercase)
      const linkedStudents = user.linked_students || [];
      const linkedStudentEmails = linkedStudents.map(s => s.email?.toLowerCase()).filter(Boolean);
      
      console.log('Linked student emails:', linkedStudentEmails);
      
      // Filter for currently boosted requests created by linked students
      const boostedRequestsByLinkedStudents = allJobRequests.filter(req => 
        req.is_boosted === true && 
        req.boost_expires_at &&
        new Date(req.boost_expires_at) > new Date() &&
        linkedStudentEmails.includes(req.created_by?.toLowerCase())
      );
      
      console.log('Boosted requests by linked students:', boostedRequestsByLinkedStudents.length, boostedRequestsByLinkedStudents);

      // Get unique student emails who have been boosted
      const boostedStudentEmails = boostedRequestsByLinkedStudents
        .map(req => req.created_by)
        .filter(Boolean);
      
      console.log('Boosted student emails:', boostedStudentEmails);

      // Calculate unique students helped (from help offers, intros, AND boosts)
      const uniqueStudentEmails = new Set([
        ...helpOffers.map(h => h.request_creator_email).filter(Boolean),
        ...intros.map(i => i.student_id).filter(Boolean),
        ...boostedStudentEmails
      ]);
      
      console.log('All unique student emails helped:', Array.from(uniqueStudentEmails));

      const newStats = {
        studentsHelped: uniqueStudentEmails.size,
        jobsPosted: jobs.length,
        messagesReceived: messages.length
      };
      
      console.log('=== FINAL STATS ===');
      console.log('Students helped:', newStats.studentsHelped);
      console.log('Jobs posted:', newStats.jobsPosted);
      console.log('Messages received:', newStats.messagesReceived);
      console.log('=== END ===');
      
      setStats(newStats);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      errorReporter.captureException(error, {
        context: 'ParentDashboard.loadDashboardData',
        userId: user?.id
      });
      // Set default stats on error
      setStats({
        studentsHelped: 0,
        jobsPosted: 0,
        messagesReceived: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    // Clear existing stats to force UI update
    setStats({ studentsHelped: 0, jobsPosted: 0, messagesReceived: 0 });
    
    // Small delay to ensure state clears
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force reload with cache bypass
    await loadDashboardData(true);
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Mark dashboard as seen on first visit
  useEffect(() => {
    if (user && user.has_seen_dashboard === false) {
      const markDashboardSeen = async () => {
        try {
          const { User } = await import('@/entities/User');
          await User.updateMyUserData({ 
            has_seen_dashboard: true,
            first_login: false 
          });
          await refreshUser();
        } catch (error) {
          console.error('Failed to update dashboard state:', error);
        }
      };
      markDashboardSeen();
    }
  }, [user, refreshUser]);

  // Track page view
  useEffect(() => {
    if (user?.id) {
      trackEvent('parent_dashboard_viewed', { userId: user.id });
    }
  }, [user?.id]);

  const getCapitalizedFirstName = (fullName) => {
    if (!fullName?.trim()) return 'Gator';
    const namePart = fullName.trim().split(' ')[0];
    if (!namePart) return 'Gator';
    return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
  };
  
  const firstName = getCapitalizedFirstName(user?.full_name);
  
  // Always show "Welcome" - no "Welcome back"
  const greeting = 'Welcome';

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Clean Header Section */}
      <div className="bg-white border-b border-slate-200 py-6 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-slate-900">
                  {greeting}, {firstName}! 🧡💙
                </h1>
                {user?.is_founding_member && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    <Crown className="w-3 h-3" />
                    Founder
                  </span>
                )}
              </div>
              <p className="text-slate-600">
                Your network opens doors for Gators everywhere
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0021A5] to-[#0033CC] flex items-center justify-center shadow-md">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-[#0021A5]">{stats.studentsHelped}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Students Helped</h3>
              <p className="text-xs text-slate-600">Through intros and connections</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FA4616] to-[#D32737] flex items-center justify-center shadow-md">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-[#FA4616]">{stats.jobsPosted}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Jobs Posted</h3>
              <p className="text-xs text-slate-600">Opportunities shared</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F2A900] to-[#FA4616] flex items-center justify-center shadow-md">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-[#F2A900]">{stats.messagesReceived}</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Messages</h3>
              <p className="text-xs text-slate-600">Active conversations</p>
            </CardContent>
          </Card>
        </div>

        {/* How Parent Boosts Work - Show for all parents */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Sparkles className="w-6 h-6 text-green-600" />
              Boost Your Gator's Request for Help
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg" aria-label="Step 1">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Link with Your Gator</h4>
                  <p className="text-sm text-slate-700">
                    {user.linked_students?.length > 0 ? (
                      `You're connected to ${user.linked_students.length} student${user.linked_students.length > 1 ? 's' : ''} – they're all set for a boost!`
                    ) : (
                      <>Add your student's email in your profile to activate the boost. <Button variant="link" className="p-0 h-auto text-blue-600 underline" onClick={() => navigate('ProfileEdit')}>Link now</Button></>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-lg" aria-label="Step 2">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Take Action: Help a Student or Post a Lead</h4>
                  <p className="text-sm text-slate-700 mb-2">
                    When you take any of these actions, you're making an impact:
                  </p>
                  <ul className="text-sm text-slate-700 space-y-1 ml-4">
                    <li>• Message a student</li>
                    <li>• Offer help on a student request</li>
                    <li>• Post or share a job/internship opportunity</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    Your Student's Request Gets Boosted! <span role="img" aria-label="rocket">🚀</span>
                  </h4>
                  <p className="text-sm text-slate-700">
                    For <strong>7 days</strong>, your linked student's help requests will be pinned to the top of the feed for everyone to see. Go Gators!
                  </p>
                  <p className="text-xs text-green-700 font-semibold mt-2 bg-green-100 rounded-lg px-3 py-2 border border-green-300">
                    <span role="img" aria-label="chart">📊</span> Parents who link students see 2× more responses to their requests
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Banners - Clean Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">Invite Your Gator Student</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Give them access to the network. Earn +100 points!
                  </p>
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    size="lg"
                    className="bg-[#0021A5] hover:bg-[#001580] text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Send Invite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
                  <Users2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">Invite Another UF Parent</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Grow the network. You both earn +100 points!
                  </p>
                  <Button
                    onClick={() => setShowParentInviteModal(true)}
                    size="lg"
                    className="bg-[#FA4616] hover:bg-[#D32737] text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Send Invite
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('Connections')}
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Help Students</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Browse student requests and offer your expertise
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  View Requests <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('PostOpportunity')}
                className="p-6 rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-orange-500 hover:shadow-lg transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                    🚀 Boost
                  </span>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                  Post a Job <Star className="w-4 h-4 text-yellow-500" />
                </h3>
                <p className="text-xs text-orange-600 font-semibold mb-2">
                  3 days priority visibility
                </p>
                <p className="text-sm text-slate-600 mb-3">
                  Share opportunities and boost your Gator's profile
                </p>
                <div className="flex items-center text-orange-600 text-sm font-medium">
                  Start Helping <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              <button
                onClick={() => navigate('GatorDirectory')}
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Network</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Connect with other parents and alumni in the Gator community
                </p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  Browse Directory <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide - Only show if they haven't done much yet */}
        {stats.studentsHelped === 0 && stats.jobsPosted === 0 && (
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                Getting Started as a Gator Parent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Complete Your Profile</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Add your company, industry, and how you can help students
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('Onboarding')}
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Browse Student Requests</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      See what students are looking for and offer your help
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('Connections')}
                    >
                      View Requests
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Share Opportunities</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Post jobs, internships, or networking opportunities
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('PostOpportunity')}
                    >
                      Post a Job
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Widget */}
          <div className="lg:col-span-1">
            <ParentActivityWidget />
          </div>

          {/* Job Market Insights */}
          <div className="lg:col-span-1">
            <JobMarketInsightsWidget />
          </div>
        </div>

        {/* Impact Message */}
        {stats.studentsHelped > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    You're Making a Difference! 🎉
                  </h3>
                  <p className="text-slate-700">
                    You've helped <strong>{stats.studentsHelped}</strong> student{stats.studentsHelped !== 1 ? 's' : ''} through 
                    the Gator network. Your support is opening doors and changing lives!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Student Invite Modal - NEW */}
      <InviteGatorModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Parent Invite Modal */}
      <GenerateInviteModal
        isOpen={showParentInviteModal}
        onClose={() => setShowParentInviteModal(false)}
        inviteType="parent_to_parent"
        userPersona="parent"
      />


    </div>
  );
}