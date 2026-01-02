import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Message } from '@/entities/Message';
import { HelpOffer } from '@/entities/HelpOffer';
import { Intro } from '@/entities/Intro';
import { Opportunity } from '@/entities/Opportunity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Mail, 
  Loader2,
  User as UserIcon,
  HelpCircle,
  Briefcase,
  ArrowRight,
  Crown,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Link2
} from 'lucide-react';
import ParentActivityWidget from '@/components/dashboard/parent/MyActivityWidget';
import { trackEvent } from '@/components/utils/analytics';
import { errorReporter } from '@/components/utils/errorReporter';
import InviteGatorModal from '@/components/dashboard/InviteGatorModal';
import AddStudentModal from '@/components/dashboard/AddStudentModal';
import FamilyKarmaWidget from '@/components/karma/FamilyKarmaWidget';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import WelcomeModal from '@/components/WelcomeModal';
import FirstTimeUserDashboard from '@/components/dashboard/parent/FirstTimeUserDashboard';
import StudentLinkBanner from '@/components/dashboard/parent/StudentLinkBanner';

// Mobile Quick Action Card Component
function QuickActionCardMobile({ icon, label, onClick, color = 'blue' }) {
  const bgColor = color === 'orange' ? 'bg-orange-50 border-orange-200' : 'bg-white';
  const textColor = color === 'orange' ? 'text-[#FA4616]' : 'text-[#0021A5]';
  
  return (
    <button 
      onClick={onClick}
      className={`flex-shrink-0 w-24 ${bgColor} rounded-xl p-3 text-center shadow-sm border border-slate-200 active:scale-95 transition-transform`}
    >
      <span className="text-2xl block mb-1">{icon}</span>
      <span className={`text-xs font-semibold ${textColor} leading-tight block`}>{label}</span>
    </button>
  );
}

export default function ParentDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [myStudents, setMyStudents] = useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [familyKarma, setFamilyKarma] = useState(0);
  const actionCardsRef = useRef([]);
  const headlineRef = useRef(null);

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
      // Basic data load - keeping it simple
      await Promise.allSettled([
        HelpOffer.filter({ offerer_email: user.email }),
        Intro.filter({ helper_user_id: user.id }),
        Message.filter({ recipient_email: user.email }),
        Opportunity.filter({ created_by: user.email })
      ]);
      
      // Load students via backend function (handles RLS permissions)
      try {
        console.log('📍 Loading students via getFamilyStudents function...');
        const result = await base44.functions.invoke('getFamilyStudents', {});
        console.log('📍 getFamilyStudents result:', result.data);
        if (result.data?.students) {
          setMyStudents(result.data.students);
        }
      } catch (e) {
        console.error('Failed to load family students:', e);
      }
      
      // Load family karma
      if (user.family_group_id) {
        try {
          const karmaResult = await base44.functions.invoke('getFamilyKarma', {
            family_group_id: user.family_group_id
          });
          setFamilyKarma(karmaResult.data?.total_karma || 0);
        } catch (e) {
          console.log('Could not load family karma:', e);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      errorReporter.captureException(error, {
        context: 'ParentDashboard.loadDashboardData',
        userId: user?.id
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    await loadDashboardData(true);
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  useEffect(() => {
    if (user?.id) {
      trackEvent('parent_dashboard_viewed', { userId: user.id });
    }
  }, [user?.id]);

  // Show welcome modal for first-time users
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('welcome_modal_seen');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);



  const getCapitalizedFirstName = (fullName) => {
    if (!fullName?.trim()) return 'Parent';
    // Handle "LastName, FirstName" format
    if (fullName.includes(',')) {
      const afterComma = fullName.split(',')[1]?.trim().split(/\s+/)[0];
      if (afterComma) return afterComma.charAt(0).toUpperCase() + afterComma.slice(1).toLowerCase();
    }
    const namePart = fullName.trim().split(/\s+/)[0];
    if (!namePart) return 'Parent';
    return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
  };
  
  const firstName = getCapitalizedFirstName(user?.full_name);
  
  // Determine if new user (0 karma)
  const karmaPoints = user?.karma_points || familyKarma || 0;
  const isNewUser = karmaPoints === 0;

  // Search for student
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await base44.functions.invoke('searchGatorStudents', {
        query: searchQuery
      });
      setSearchResults(results.data?.students || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkStudent = async (student) => {
    try {
      await base44.functions.invoke('linkStudentsToParent', {
        studentEmailsOrNames: [student.email]
      });
      
      setShowSearchModal(false);
      toast({
        title: "Student Linked! 🎉",
        description: `${student.full_name || student.email} is now connected to your account.`
      });
      
      // Refresh user data and reload dashboard to show linked student
      await refreshUser();
      await loadDashboardData(true);
    } catch (error) {
      console.error('Failed to link student:', error);
      toast({
        title: "Link Failed",
        description: "Could not link student. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsSending(true);
    try {
      console.log('📧 Sending invite to:', inviteEmail);
      const result = await base44.functions.invoke('sendGatorInvites', {
        emails: [inviteEmail],
        role: 'student',
        campus: 'UF',
        note: inviteName ? `${inviteName}, join College Fast Forward!` : `Join College Fast Forward to connect with the Gator community!`
      });
      console.log('📧 Invite result:', result);
      
      // Check for errors in response
      if (result.data?.error) {
        throw new Error(result.data.details || result.data.error);
      }
      
      if (result.data?.sent?.length > 0) {
        toast({
          title: "Invite Sent! 🐊",
          description: `We sent an invitation to ${inviteEmail}`
        });
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteName('');
      } else if (result.data?.alreadyUsers?.length > 0) {
        toast({
          title: "Already Registered",
          description: "This email is already registered. Try searching for them instead!",
          variant: "destructive"
        });
      } else {
        throw new Error('Failed to send invite');
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast({
        title: "Invite Failed",
        description: error.message || "Could not send invite. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

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
    <>
      {/* Welcome Modal - shows once for first-time users */}
      {showWelcomeModal && (
        <WelcomeModal 
          userName={firstName}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

      <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      {/* PRIORITY #1: Student Link Banner - Always at top */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <StudentLinkBanner 
          linkedStudents={myStudents}
          onLinkStudent={() => setShowSearchModal(true)}
          onRemindLater={() => {
            toast({
              title: "We'll remind you tomorrow",
              description: "Link your student anytime from your dashboard to unlock karma boosts."
            });
          }}
        />
      </div>

      {/* 1. Welcome Header - Mobile Optimized */}
      <div className="bg-[#0021A5] text-white py-5 md:py-6 mb-4 md:mb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl md:text-3xl font-bold" style={{ color: 'white' }}>
                  Welcome, {firstName}! 👋
                </h1>
                {user?.is_founding_member && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-semibold">
                    <Crown className="w-3 h-3" />
                    Founder
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm md:text-base">
                Your network opens doors for students everywhere
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="hidden md:flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {isNewUser ? (
          /* First-time user simplified dashboard */
          <FirstTimeUserDashboard 
            user={user}
            onBrowseQuestions={() => navigate('Connections')}
            onConnectStudent={() => setShowSearchModal(true)}
            onCompleteProfile={() => navigate('ProfileEdit')}
          />
        ) : (
          /* Returning user full dashboard */
          <>
            {/* Main Headline - Responsive */}
            <div ref={headlineRef} className="text-center px-2">
              <h2 
                className="text-2xl md:text-4xl font-black leading-tight mb-2 md:mb-3"
                style={{ color: '#0021A5' }}
              >
                Help More Students, Boost Your Own ⚡
              </h2>
              <p className="text-sm md:text-lg text-slate-600 max-w-3xl mx-auto">
                {myStudents.length > 0 
                  ? `Every action you take earns karma — directly boosting ${myStudents[0]?.full_name?.split(' ')[0] || 'your student'}'s visibility.`
                  : 'Every action you take earns karma — link your student to activate boosts.'
                }
              </p>
              {myStudents.length === 0 && (
                <p className="text-sm text-amber-600 mt-2 font-medium">
                  ⚠️ Link your student to see their name here and activate boosts.
                </p>
              )}
            </div>

            {/* MY STUDENTS SECTION */}
            {myStudents.length > 0 && (
              <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#0021A5' }}>
                    👨‍🎓 My Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white font-bold">
                          {student.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{student.full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 truncate">{student.email}</p>
                          {student.major && (
                            <p className="text-xs text-blue-600">{student.major}</p>
                          )}
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAMILY KARMA - HERO SECTION */}
            <FamilyKarmaWidget 
              user={user} 
              onSearchStudent={() => setShowSearchModal(true)}
              onInviteStudent={() => setShowInviteModal(true)}
            />

            {/* Connect Student Card - Priority #1 if no student linked */}
            {myStudents.length === 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    REQUIRED FOR KARMA BOOSTS
                  </span>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-900 mb-1">Connect Your Student</h3>
                    <p className="text-sm text-amber-700">
                      Link your student's account to boost their profile visibility. Your karma directly helps them get faster answers.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowSearchModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold whitespace-nowrap"
                  >
                    Search & Link Student →
                  </Button>
                </div>
              </div>
            )}

            {/* 4. Quick Actions - Horizontal Scroll on Mobile */}
            <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              <div className="flex gap-3" style={{ width: 'max-content' }}>
                {myStudents.length === 0 && (
                  <QuickActionCardMobile icon="🔗" label="Link Student" onClick={() => setShowSearchModal(true)} color="orange" />
                )}
                <QuickActionCardMobile icon="👤" label="Update Profile" onClick={() => navigate('ProfileEdit')} />
                <QuickActionCardMobile icon="💬" label="Answer Questions" onClick={() => navigate('Connections')} />
                <QuickActionCardMobile icon="❓" label="Ask Question" onClick={() => navigate('PostRequest?type=parent')} color="orange" />
                <QuickActionCardMobile icon="💼" label="Post Job" onClick={() => navigate('PostOpportunity')} />
              </div>
            </div>
            
            {/* Desktop: Four Action Cards Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Complete Profile */}
              <div 
                ref={el => actionCardsRef.current[0] = el}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
              >
                <div className="text-3xl mb-2">👤</div>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#0021A5' }}>
                  Complete Your Profile
                </h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Add company & LinkedIn.<br />
                  <span className="font-semibold">Stronger profile = more boost</span>
                </p>
                <Button
                  onClick={() => navigate('ProfileEdit')}
                  size="sm"
                  className="rounded-full px-4 py-1.5 font-bold text-xs"
                  style={{ backgroundColor: '#0021A5' }}
                >
                  Update Profile →
                </Button>
              </div>

              {/* Card 2: Answer Questions */}
              <div 
                ref={el => actionCardsRef.current[1] = el}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
              >
                <div className="text-3xl mb-2">💬</div>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#0021A5' }}>
                  Answer Questions
                </h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Help students with career advice.<br />
                  <span className="font-semibold">Your kid gets boosted!</span>
                </p>
                <Button
                  onClick={() => navigate('Connections')}
                  size="sm"
                  className="rounded-full px-4 py-1.5 font-bold text-xs"
                  style={{ backgroundColor: '#0021A5' }}
                >
                  Browse Questions →
                </Button>
              </div>

              {/* Card 3: Ask Your Own Question */}
              <div 
                ref={el => actionCardsRef.current[3] = el}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow border border-orange-200"
                style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
              >
                <div className="text-3xl mb-2">❓</div>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#FA4616' }}>
                  Ask a Question
                </h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Post your own question.<br />
                  <span className="font-semibold">Get support from the swamp.</span>
                </p>
                <Button
                  onClick={() => navigate('PostRequest?type=parent')}
                  size="sm"
                  className="rounded-full px-4 py-1.5 font-bold text-xs"
                  style={{ backgroundColor: '#FA4616' }}
                >
                  Ask Question →
                </Button>
              </div>

              {/* Card 4: Post Jobs */}
              <div 
                ref={el => actionCardsRef.current[2] = el}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}
              >
                <div className="text-3xl mb-2">💼</div>
                <h3 className="text-sm font-bold mb-1" style={{ color: '#0021A5' }}>
                  Post Opportunities
                </h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Know about job openings?<br />
                  <span className="font-semibold">Share them with students</span>
                </p>
                <Button
                  onClick={() => navigate('PostOpportunity')}
                  size="sm"
                  className="rounded-full px-4 py-1.5 font-bold text-xs"
                  style={{ backgroundColor: '#0021A5' }}
                >
                  Post Opportunity →
                </Button>
              </div>
              </div>

              {/* Standalone Post a Job Card */}
              <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">Post a Job</h3>
                      <p className="text-sm text-purple-700">Share job openings from your company with UF students</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('PostOpportunity')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </CardContent>
              </Card>

            {/* Activity Section - No duplicate header */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}>
              <ParentActivityWidget />
            </div>
          </>
        )}

      </div>

      {/* Search Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#0021A5' }}>Search for Your Student</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student's Email or Name</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="john.doe@ufl.edu or John Doe"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Results</Label>
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{student.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                    <Button size="sm" onClick={() => handleLinkStudent(student)}>
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-4 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>No students found. Try a different search or send them an invite.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setShowSearchModal(false);
                    setShowInviteModal(true);
                  }}
                >
                  Send an Invite Instead
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#FA4616' }}>Invite My Child to Join</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student's Name (optional)</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Student's Email *</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="john.doe@ufl.edu"
                type="email"
                className="mt-2"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                📧 We'll send them a secure invite to join the network. 
                Once they sign up, your profiles link automatically and their profile gets boosted!
              </p>
            </div>

            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || isSending}
              className="w-full"
              style={{ backgroundColor: '#FA4616' }}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSuccess={async () => {
          await refreshUser();
          await loadDashboardData(true);
        }}
      />
      </div>
    </>
  );
}