import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Message } from '@/entities/Message';
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
  TrendingUp,
  Sparkles,
  GraduationCap,
  Check,
  Inbox
} from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { errorReporter } from '@/components/utils/errorReporter';
import AddStudentModal from '@/components/dashboard/AddStudentModal';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import WelcomeModal from '@/components/WelcomeModal';

export default function ParentDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
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
  const [myJobs, setMyJobs] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [studentQueueStatus, setStudentQueueStatus] = useState({
    hasActiveRequest: false,
    position: null,
    pointsToNextPosition: null
  });

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Load all data in parallel
      const [messages, opportunities, jobRequests] = await Promise.allSettled([
        Message.filter({ recipient_email: user.email }),
        Opportunity.filter({ created_by: user.email }),
        JobRequest.filter({ status: 'active' })
      ]);
      
      // Set questions count and top questions
      if (jobRequests.status === 'fulfilled') {
        const questions = jobRequests.value || [];
        setQuestionsCount(questions.length);
        setTopQuestions(questions.slice(0, 2));
      }
      
      // Set my jobs
      if (opportunities.status === 'fulfilled') {
        setMyJobs(opportunities.value || []);
      }
      
      // Set activity items from messages
      if (messages.status === 'fulfilled') {
        setActivityItems(messages.value?.slice(0, 5) || []);
      }
      
      // Load students via backend function (handles RLS permissions)
      try {
        const result = await base44.functions.invoke('getFamilyStudents', {});
        if (result.data?.students) {
          setMyStudents(result.data.students);
          
          // Check if linked student has active request
          const studentEmails = result.data.students.map(s => s.email);
          if (studentEmails.length > 0 && jobRequests.status === 'fulfilled') {
            const studentRequest = jobRequests.value?.find(r => 
              studentEmails.includes(r.poster_email) && r.status === 'active'
            );
            if (studentRequest) {
              // Calculate position based on priority_score or creation date
              const allActive = jobRequests.value.filter(r => r.status === 'active');
              const position = allActive.findIndex(r => r.id === studentRequest.id) + 1;
              setStudentQueueStatus({
                hasActiveRequest: true,
                position: position,
                pointsToNextPosition: Math.max(1, Math.ceil((50 - (user?.karma_points || 0)) / 10))
              });
            }
          }
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
      
      // Calculate students helped from user data
      setStudentsHelped(user?.students_helped_count || 0);
      
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
    if (fullName.includes(',')) {
      const afterComma = fullName.split(',')[1]?.trim().split(/\s+/)[0];
      if (afterComma) return afterComma.charAt(0).toUpperCase() + afterComma.slice(1).toLowerCase();
    }
    const namePart = fullName.trim().split(/\s+/)[0];
    if (!namePart) return 'Parent';
    return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
  };
  
  const getStudentFirstName = (student) => {
    if (!student) return 'your student';
    const fullName = student.full_name;
    if (!fullName?.trim()) return student.email?.split('@')[0] || 'your student';
    
    if (fullName.includes(',')) {
      const afterComma = fullName.split(',')[1]?.trim().split(/\s+/)[0];
      if (afterComma && afterComma.length > 1) {
        return afterComma.charAt(0).toUpperCase() + afterComma.slice(1).toLowerCase();
      }
    }
    
    const firstName = fullName.trim().split(/\s+/)[0];
    if (firstName && firstName.length > 1) {
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    
    return student.email?.split('@')[0] || 'your student';
  };
  
  const firstName = getCapitalizedFirstName(user?.full_name);
  const studentFirstName = myStudents.length > 0 ? getStudentFirstName(myStudents[0]) : 'your student';
  
  // Karma calculations
  const karmaPoints = user?.karma_points || familyKarma || 0;
  const karmaLevel = karmaPoints >= 100 ? 'Gold' : karmaPoints >= 50 ? 'Silver' : 'Bronze';
  const karmaBadge = karmaPoints >= 100 ? '🥇' : karmaPoints >= 50 ? '🥈' : '🥉';
  const pointsToNextLevel = karmaPoints >= 100 ? 0 : karmaPoints >= 50 ? (100 - karmaPoints) : (50 - karmaPoints);
  const nextLevelName = karmaPoints >= 100 ? 'Gold' : karmaPoints >= 50 ? 'Gold' : 'Silver';
  const hasActivity = activityItems.length > 0 || myJobs.length > 0;
  
  // Profile completion
  const profileComplete = !!(user?.company && user?.linkedin_url);
  const profileCompletionPercent = [user?.company, user?.linkedin_url, user?.title, user?.profile_image].filter(Boolean).length * 25;
  const hasPostedJob = myJobs.length > 0;

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
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <WelcomeModal 
          userName={firstName}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}

      <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
        
        {/* SECTION 1: Header with Family Karma */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {firstName}! 👋</h1>
                  {user?.is_founding_member && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-semibold">
                      <Crown className="w-3 h-3" />
                      Founder
                    </span>
                  )}
                </div>
                <p className="text-blue-100 mt-1">
                  Help students, boost {studentFirstName}'s visibility
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Family Karma stat */}
                <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 text-center min-w-[100px]">
                  <span className="text-2xl font-bold block">{karmaPoints}</span>
                  <span className="text-xs text-blue-100">Family Karma</span>
                </div>
                
                {/* Students Helped stat */}
                <div className="bg-white/15 backdrop-blur rounded-lg px-4 py-3 text-center min-w-[100px]">
                  <span className="text-2xl font-bold block">{studentsHelped || '—'}</span>
                  <span className="text-xs text-blue-100">Students Helped</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* SECTION 2: Student Position Card (Conditional) */}
          {myStudents.length > 0 && studentQueueStatus.hasActiveRequest ? (
            <section className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {studentFirstName} has an active help request
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your karma determines their visibility to helpers
                    </p>
                  </div>
                </div>
                
                {/* Position indicator */}
                <div className="text-center bg-white rounded-lg px-4 py-2 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">#{studentQueueStatus.position}</div>
                  <p className="text-xs text-gray-500">in queue</p>
                </div>
              </div>
              
              {/* Progress hint */}
              <div className="mt-4 flex items-center gap-2 text-sm text-purple-700 bg-purple-100/50 rounded-lg px-3 py-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>
                  Answer {studentQueueStatus.pointsToNextPosition} more questions to move {studentFirstName} up in the queue
                </span>
              </div>
            </section>
          ) : myStudents.length > 0 ? (
            <section className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">
                    {studentFirstName} hasn't posted a help request yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    When they do, your karma will boost their visibility
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">
                      Link your student to activate karma boosts
                    </h3>
                    <p className="text-sm text-amber-700">
                      Your earned karma will directly boost their visibility in the help queue
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowSearchModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white whitespace-nowrap"
                >
                  Link Student
                </Button>
              </div>
            </section>
          )}

          {/* SECTION 3: Primary CTA — Help Students */}
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Students Are Asking for Help</h2>
              <p className="text-gray-500 text-sm mt-1">
                Each answer earns karma and boosts {studentFirstName}'s visibility
              </p>
            </div>
            
            {/* Question Preview Cards */}
            {topQuestions.length > 0 && (
              <div className="space-y-3 mb-6">
                {topQuestions.map((question) => (
                  <div 
                    key={question.id}
                    className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer"
                    onClick={() => navigate(`QuestionDetail?id=${question.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">{question.title || question.role}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{question.description?.slice(0, 80)}...</p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{question.target_industry}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('Connections')}
              >
                See All {questionsCount} Questions →
              </Button>
            </div>
          </section>

          {/* SECTION 4: Secondary Actions — TWO Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Complete Profile - State Aware */}
            <Card className={`p-6 text-center hover:shadow-md transition-shadow ${profileComplete ? 'bg-green-50 border-green-200' : ''}`}>
              <CardContent className="p-0">
                {profileComplete ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-800">Profile Complete</h3>
                    <p className="text-sm text-green-600 mt-1">Students can see your expertise</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 text-green-700"
                      onClick={() => navigate('Profile')}
                    >
                      View Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Complete Your Profile</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add your company & LinkedIn so students know your background
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 mb-3">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all" 
                        style={{ width: `${profileCompletionPercent}%` }}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('ProfileEdit')}
                    >
                      Update Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 2: Post a Job - State Aware */}
            <Card className={`p-6 text-center hover:shadow-md transition-shadow ${hasPostedJob ? 'bg-green-50 border-green-200' : ''}`}>
              <CardContent className="p-0">
                {hasPostedJob ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-800">Job Posted!</h3>
                    <p className="text-sm text-green-600 mt-1">
                      {myJobs.length} active {myJobs.length === 1 ? 'listing' : 'listings'}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 text-green-700"
                      onClick={() => navigate('Opportunities')}
                    >
                      Manage Jobs
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold">Share a Job Opportunity</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Know about openings? Help students find their next role
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => navigate('PostOpportunity')}
                    >
                      Post Job
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

          </section>

          {/* SECTION 5: Family Karma Bar */}
          <section className="bg-gray-50 rounded-xl p-4">
            <button 
              onClick={() => setKarmaExpanded(!karmaExpanded)}
              className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <div className="flex items-center gap-4">
                {/* Progress Ring */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                    <circle
                      cx="24" cy="24" r="20"
                      stroke="#3b82f6"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${Math.min((karmaPoints / 50) * 125.6, 125.6)} 125.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{karmaPoints}</span>
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Family Karma</span>
                    <Badge className="bg-amber-100 text-amber-700 text-xs">{karmaBadge} {karmaLevel}</Badge>
                  </div>
                  {pointsToNextLevel > 0 && (
                    <p className="text-sm text-gray-500">
                      {pointsToNextLevel} more to reach {karmaPoints >= 50 ? '🥇' : '🥈'} {nextLevelName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>How to earn</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${karmaExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {karmaExpanded && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between bg-white rounded-lg p-3">
                  <span>Answer a question</span>
                  <span className="text-green-600 font-medium">+10</span>
                </div>
                <div className="flex justify-between bg-white rounded-lg p-3">
                  <span>Get upvoted</span>
                  <span className="text-green-600 font-medium">+5</span>
                </div>
                <div className="flex justify-between bg-white rounded-lg p-3">
                  <span>Marked "Best Answer"</span>
                  <span className="text-green-600 font-medium">+50</span>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 6: Activity (Compact When Empty) */}
          {hasActivity ? (
            <section className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  My Activity
                </h3>
                <Tabs value={activityTab} onValueChange={setActivityTab}>
                  <TabsList className="h-8">
                    <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
                    <TabsTrigger value="jobs" className="text-xs">My Jobs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="p-4">
                {activityTab === 'messages' && (
                  <div className="space-y-3">
                    {activityItems.length > 0 ? activityItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.subject || 'New message'}</p>
                          <p className="text-xs text-gray-500">From: {item.sender_email}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
                    )}
                  </div>
                )}
                {activityTab === 'jobs' && (
                  <div className="space-y-3">
                    {myJobs.length > 0 ? myJobs.slice(0, 5).map((job, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.org_name}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-4">No jobs posted yet</p>
                    )}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between py-3 px-4 bg-gray-50 rounded-lg text-sm text-gray-500 gap-3">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                <span>Your activity will appear here once you start helping</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600"
                onClick={() => navigate('Connections')}
              >
                Browse Questions →
              </Button>
            </div>
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
                  <p>No students found. Try a different search.</p>
                </div>
              )}
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