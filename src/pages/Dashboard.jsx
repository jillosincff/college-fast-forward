import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Briefcase, Users, MessageSquare, Mail, ArrowRight, ChevronDown } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import InviteParentModal from '@/components/dashboard/InviteParentModal';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { getUserMessages } from '@/functions/getUserMessages';
import { getUserCount } from '@/functions/getUserCount';
import StudentHelpRequestCard from '@/components/dashboard/StudentHelpRequestCard';
import StudentParentMatchesWidget from '@/components/dashboard/StudentParentMatchesWidget';

export default function Dashboard() {
  const { user, isLoading, refreshUser } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [helpRequest, setHelpRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    totalUsers: 226,
    activeRequests: 0,
    spotsLeft: 774
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

    localStorage.setItem('cff:seenDashboard', 'true');
    loadDashboardData();
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    setLoadingData(true);
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
      const { data: messagesResponse } = await getUserMessages();
      setMessages(messagesResponse?.messages || []);

      // Fetch opportunities
      const opps = await base44.entities.Opportunity.filter({ status: 'active' }, '-created_date', 3);
      setOpportunities(opps || []);

      // Fetch user's help request (students have ONE active request)
      let myHelpRequest = await base44.entities.HelpRequest.filter(
        { student_id: user.id, status: 'active' },
        '-created_date',
        1
      );
      
      if (!myHelpRequest || myHelpRequest.length === 0) {
        myHelpRequest = await base44.entities.HelpRequest.filter(
          { student_email: user.email, status: 'active' },
          '-created_date',
          1
        );
      }
      
      if (myHelpRequest && myHelpRequest.length > 0) {
        setHelpRequest(myHelpRequest[0]);
      }

      // Fetch matches for this student
      const studentMatches = await base44.entities.Match.filter(
        { student_id: user.id },
        '-match_score',
        50
      );
      const activeMatches = (studentMatches || []).filter(m => 
        m.status === 'pending' || m.status === 'student_connected'
      );
      setMatches(activeMatches);

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

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
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
  const parentMatches = matches.filter(m => m.match_type === 'parent' || !m.match_type);
  const responseCount = matches.filter(m => m.status === 'student_connected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      
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

      {/* Welcome Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Welcome back, {user.first_name || user.full_name?.split(' ')[0] || 'Gator'}! 👋
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Your Active Help Request */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StudentHelpRequestCard
            helpRequest={helpRequest}
            matchCount={parentMatches.length}
            responseCount={responseCount}
            parentMatches={parentMatches}
            onRefresh={loadDashboardData}
          />
        </motion.div>

        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{networkStats.activeRequests}</div>
              <p className="text-sm text-slate-600">Active Help Requests</p>
              <p className="text-xs text-slate-500">(All students)</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{parentMatches.length}</div>
              <p className="text-sm text-slate-600">Parents Matched</p>
              <p className="text-xs text-slate-500">to You</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{responseCount}</div>
              <p className="text-sm text-slate-600">Responses</p>
              <p className="text-xs text-slate-500">Received</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Parent Matches */}
        {parentMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StudentParentMatchesWidget
              user={user}
              matches={parentMatches}
              onRefresh={loadDashboardData}
            />
          </motion.div>
        )}

        {/* Recent Messages */}
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
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                        {unreadCount} unread
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
                        !msg.is_read ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                      }`}
                      onClick={() => navigate('MyMessages')}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        <p className="font-semibold text-sm text-slate-900">{msg.sender_email?.split('@')[0]}</p>
                        <span className="text-xs text-slate-400">
                          {new Date(msg.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium line-clamp-1">{msg.subject}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{msg.body}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Opportunities */}
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
                    💼 Latest Opportunities from Gator Parents
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

        {/* Your Family - Collapsed */}
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