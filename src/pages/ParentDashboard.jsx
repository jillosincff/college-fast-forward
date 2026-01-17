import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Message } from '@/entities/Message';
import { HelpOffer } from '@/entities/HelpOffer';
import { Intro } from '@/entities/Intro';
import { Opportunity } from '@/entities/Opportunity';
import { JobRequest } from '@/entities/JobRequest';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Mail, 
  Loader2,
  User as UserIcon,
  Briefcase,
  Crown,
  AlertCircle,
  ChevronDown,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { errorReporter } from '@/components/utils/errorReporter';
import AddStudentModal from '@/components/dashboard/AddStudentModal';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import WelcomeModal from '@/components/WelcomeModal';

// School config for dynamic network names
const schoolConfig = {
  uf: { networkName: "UF Network", shortName: "UF" },
  psu: { networkName: "PSU Network", shortName: "PSU" },
  ucf: { networkName: "UCF Network", shortName: "UCF" },
  fsu: { networkName: "FSU Network", shortName: "FSU" },
  tulane: { networkName: "Tulane Network", shortName: "Tulane" },
  osu: { networkName: "OSU Network", shortName: "OSU" },
};

const getSchoolConfig = () => schoolConfig.uf; // Default to UF for now

export default function ParentDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const school = getSchoolConfig();
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [myStudents, setMyStudents] = useState([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [familyKarma, setFamilyKarma] = useState(0);
  const [karmaExpanded, setKarmaExpanded] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [activityTab, setActivityTab] = useState('messages');
  const [activityItems, setActivityItems] = useState([]);
  const [studentsHelped, setStudentsHelped] = useState(0);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Load all data in parallel
      const [helpOffers, intros, messages, opportunities, jobRequests] = await Promise.allSettled([
        HelpOffer.filter({ offerer_email: user.email }),
        Intro.filter({ helper_user_id: user.id }),
        Message.filter({ recipient_email: user.email }),
        Opportunity.filter({ created_by: user.email }),
        JobRequest.filter({ status: 'active' })
      ]);
      
      // Set questions count
      if (jobRequests.status === 'fulfilled') {
        setQuestionsCount(jobRequests.value?.length || 0);
      }
      
      // Set activity items from messages
      if (messages.status === 'fulfilled') {
        setActivityItems(messages.value?.slice(0, 5) || []);
      }
      
      // Calculate students helped
      const helpedCount = (helpOffers.status === 'fulfilled' ? helpOffers.value?.length || 0 : 0) +
                         (intros.status === 'fulfilled' ? intros.value?.length || 0 : 0);
      setStudentsHelped(helpedCount);
      
      // Load students via backend function (handles RLS permissions)
      try {
        const result = await base44.functions.invoke('getFamilyStudents', {});
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
    }
  }, [user]);

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
  
  // Helper to get student's first name (handles "LastName, FirstName" format)
  const getStudentFirstName = (student) => {
    if (!student) return 'your student';
    const fullName = student.full_name;
    if (!fullName?.trim()) return student.email?.split('@')[0] || 'your student';
    
    // Handle "LastName, FirstName" format
    if (fullName.includes(',')) {
      const afterComma = fullName.split(',')[1]?.trim().split(/\s+/)[0];
      if (afterComma && afterComma.length > 1) {
        return afterComma.charAt(0).toUpperCase() + afterComma.slice(1).toLowerCase();
      }
    }
    
    // Standard "FirstName LastName" format
    const firstName = fullName.trim().split(/\s+/)[0];
    if (firstName && firstName.length > 1) {
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    
    return student.email?.split('@')[0] || 'your student';
  };
  
  const firstName = getCapitalizedFirstName(user?.full_name);
  
  // Determine karma level
  const karmaPoints = user?.karma_points || familyKarma || 0;
  const karmaLevel = karmaPoints >= 100 ? 'Gold' : karmaPoints >= 50 ? 'Silver' : 'Bronze';
  const pointsToNextLevel = karmaPoints >= 100 ? 0 : karmaPoints >= 50 ? (100 - karmaPoints) : (50 - karmaPoints);
  const nextLevelName = karmaPoints >= 100 ? 'Gold' : karmaPoints >= 50 ? 'Gold' : 'Silver';
  const hasActivity = activityItems.length > 0;

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
        note: inviteName ? `${inviteName}, join College Fast Forward!` : `Join College Fast Forward to connect with students and parents!`
      });
      console.log('📧 Invite result:', result);
      
      // Check for errors in response
      if (result.data?.error) {
        throw new Error(result.data.details || result.data.error);
      }
      
      if (result.data?.sent?.length > 0) {
        toast({
          title: "Invite Sent! 📧",
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
        
        {/* SECTION 1: Consolidated Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome, {firstName}! 👋</h1>
                  {user?.is_founding_member && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-semibold">
                      <Crown className="w-3 h-3" />
                      Founder
                    </span>
                  )}
                </div>
                <p className="text-blue-100 mt-1">
                  Help students and get help back — your network works both ways
                </p>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                {/* Karma badge - compact */}
                <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                  <span className="text-2xl font-bold">{karmaPoints}</span>
                  <span className="text-sm block text-blue-100">Karma</span>
                </div>
                {/* Impact stat */}
                <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                  <span className="text-2xl font-bold">{studentsHelped}</span>
                  <span className="text-sm block text-blue-100">Students Helped</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* SECTION 2: Primary Action - Students Need Help */}
          <section className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="max-w-xl mx-auto">
              <span className="text-4xl mb-4 block">🎓</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Students Are Asking for Help
              </h2>
              <p className="text-gray-600 mb-6">
                {questionsCount} questions waiting for someone with your experience. 
                Each answer earns karma and boosts your own requests.
              </p>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('Connections')}
              >
                Browse Questions & Help Out →
              </Button>
            </div>
          </section>

          {/* SECTION 3: Secondary Actions - Equal Weight Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Complete Profile */}
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <UserIcon className="w-8 h-8 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add your company & LinkedIn for stronger connections
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('ProfileEdit')}>
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Post a Job */}
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <Briefcase className="w-8 h-8 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold mb-1">Share a Job Opportunity</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Know about openings? Help students find their next role
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('PostOpportunity')}>
                  Post Job
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Ask the Network */}
            <Card className="p-6 text-center hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <MessageCircle className="w-8 h-8 mx-auto text-purple-600 mb-3" />
                <h3 className="font-semibold mb-1">Need Help Yourself?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Post privately to fellow parents and alumni
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('PostRequest?type=parent')}>
                  Post Career Request
                </Button>
              </CardContent>
            </Card>

          </section>

          {/* SECTION 4: Karma Details - Collapsible */}
          <section className="bg-gray-50 rounded-xl p-4">
            <button 
              onClick={() => setKarmaExpanded(!karmaExpanded)}
              className="w-full flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">✨</span>
                <span className="font-medium">Your Karma: {karmaPoints} points</span>
                <Badge variant="secondary">{karmaLevel}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {pointsToNextLevel > 0 && (
                  <span>{pointsToNextLevel} points to {nextLevelName}</span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${karmaExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {karmaExpanded && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Answer a question</span>
                  <span className="text-green-600 font-medium">+10</span>
                </div>
                <div className="flex justify-between">
                  <span>Get upvoted</span>
                  <span className="text-green-600 font-medium">+5</span>
                </div>
                <div className="flex justify-between">
                  <span>Marked "Best Answer"</span>
                  <span className="text-green-600 font-medium">+50</span>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 5: Activity Feed - Conditional Render */}
          <section className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                My Activity
              </h3>
              <Tabs value={activityTab} onValueChange={setActivityTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
                  <TabsTrigger value="offers" className="text-xs">Help Offers</TabsTrigger>
                  <TabsTrigger value="jobs" className="text-xs">My Jobs</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="p-6">
              {hasActivity ? (
                <div className="space-y-3">
                  {activityItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.subject || 'New message'}</p>
                        <p className="text-xs text-gray-500">From: {item.sender_email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // COMPACT empty state
                <div className="text-center py-4 text-gray-500">
                  <Mail className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No activity yet. Start by helping a student!</p>
                </div>
              )}
            </div>
          </section>

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