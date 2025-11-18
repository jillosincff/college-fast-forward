import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Message } from '@/entities/Message';
import { HelpOffer } from '@/entities/HelpOffer';
import { Intro } from '@/entities/Intro';
import { Opportunity } from '@/entities/Opportunity';
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

  const loadDashboardData = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Load all stats in parallel with individual error handling
      const [helpOffersResult, introsResult, messagesResult, jobsResult] = await Promise.allSettled([
        HelpOffer.filter({ offerer_email: user.email }),
        Intro.filter({ helper_user_id: user.id }),
        Message.filter({ recipient_email: user.email }),
        Opportunity.filter({ created_by: user.email })
      ]);

      const helpOffers = helpOffersResult.status === 'fulfilled' ? (helpOffersResult.value || []) : [];
      const intros = introsResult.status === 'fulfilled' ? (introsResult.value || []) : [];
      const messages = messagesResult.status === 'fulfilled' ? (messagesResult.value || []) : [];
      const jobs = jobsResult.status === 'fulfilled' ? (jobsResult.value || []) : [];

      // Calculate unique students helped (from both help offers and intros)
      const uniqueStudentEmails = new Set([
        ...helpOffers.map(h => h.request_creator_email).filter(Boolean),
        ...intros.map(i => i.student_id).filter(Boolean)
      ]);

      setStats({
        studentsHelped: uniqueStudentEmails.size,
        jobsPosted: jobs.length,
        messagesReceived: messages.length
      });

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
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Update user dashboard state
  useEffect(() => {
    if (user && (user.first_login || !user.has_seen_dashboard)) {
      (async () => {
        try {
          const { User } = await import('@/entities/User');
          await User.updateMyUserData({ 
            has_seen_dashboard: true,
            first_login: false 
          });
          await refreshUser();
        } catch (error) {
          console.error('Failed to update user state:', error);
        }
      })();
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
  
  // Determine if user is new (first time on dashboard)
  const isNewUser = user?.first_login === true || user?.has_seen_dashboard === false;
  const greeting = isNewUser ? 'Welcome' : 'Welcome back';

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
      {/* Hero Banner - Compact */}
      <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] py-8 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {greeting}, {firstName}! 🧡💙
              </h1>
              <p className="text-white/90">
                Your network opens doors for Gators everywhere
              </p>
            </div>
            {stats.studentsHelped > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 text-white">
                <div className="text-3xl font-bold">{stats.studentsHelped}</div>
                <div className="text-sm">Student{stats.studentsHelped !== 1 ? 's' : ''} Helped</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Membership Status Card - NEW */}
        <MembershipStatusCard />
        
        {/* Quick Stats - Simplified to 3 key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Students Helped</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.studentsHelped}</p>
            <p className="text-xs text-gray-500 mt-2">
              Through intros, advice, and connections
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Jobs Posted</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.jobsPosted}</p>
            <p className="text-xs text-gray-500 mt-2">
              Opportunities shared with students
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Messages</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{stats.messagesReceived}</p>
            <p className="text-xs text-gray-500 mt-2">
              Conversations with students
            </p>
          </div>
        </div>

        {/* Invite Student Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="w-6 h-6" />
                <h3 className="text-xl font-bold">🔑 Invite Your Gator Student</h3>
              </div>
              <p className="text-white/90">
                Give them exclusive access to our private network. Earn +100 points!
              </p>
            </div>
            <Button
              onClick={() => setShowInviteModal(true)}
              variant="secondary"
              className="bg-white text-blue-700 hover:bg-white hover:text-blue-800 font-bold px-8 py-6 shadow-lg border-0"
            >
              Invite My Student
            </Button>
          </div>
        </div>

        {/* NEW: Invite Another Parent Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="w-6 h-6" />
                <h3 className="text-xl font-bold">👨‍👩‍👧‍👦 Invite Another UF Parent</h3>
              </div>
              <p className="text-white/90">
                Grow the parent network! They get access, you both earn +100 points.
              </p>
            </div>
            <Button
              onClick={() => setShowParentInviteModal(true)}
              variant="secondary"
              className="bg-white text-orange-700 hover:bg-white hover:text-orange-800 font-bold px-8 py-6 shadow-lg border-0"
            >
              Invite UF Parent
            </Button>
          </div>
        </div>

        {/* Parent Power Boost Blurb - NEW */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-2xl p-6 shadow-xl border-2 border-orange-400">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                🚀 Post a job or share a lead — your Gator goes to the top
              </h3>
              <p className="text-white text-lg mb-2">
                Every time you help another Gator, your kid's request gets <strong className="text-yellow-200">starred and pinned at the top for 14 days</strong>.
              </p>
              <p className="text-white/90 text-base font-semibold">
                Your action = your kid seen first.
              </p>
            </div>
          </div>
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
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Post a Job</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Share internships and job opportunities with students
                </p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  Create Posting <ArrowRight className="w-4 h-4 ml-1" />
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
                      onClick={() => navigate('ProfileEdit')}
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