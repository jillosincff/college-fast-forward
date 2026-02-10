import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import AddStudentModal from '@/components/dashboard/AddStudentModal';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import WelcomeModal from '@/components/WelcomeModal';
import { useParentDashboardData } from '@/components/dashboard/parent/useParentDashboardData';
import QuestionCard from '@/components/dashboard/parent/QuestionCard';
import KarmaExplainerCard from '@/components/dashboard/parent/KarmaExplainerCard';
import KarmaQuickActions from '@/components/dashboard/parent/KarmaQuickActions';
import ImpactDashboard from '@/components/dashboard/parent/ImpactDashboard';
import WeeklyStatsPanel from '@/components/dashboard/WeeklyStatsPanel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LinkStudentCard from '@/components/dashboard/parent/LinkStudentCard';
import StudentBoostCard from '@/components/dashboard/parent/StudentBoostCard';
import ActivationWelcomeBanner from '@/components/dashboard/parent/ActivationWelcomeBanner';

export default function ParentDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { loading, data, refresh } = useParentDashboardData(user);
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      trackEvent('parent_dashboard_viewed', { userId: user.id });
    }
  }, [user?.id]);

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
    return namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase() : 'Parent';
  };
  
  const getStudentFirstName = (student) => {
    if (!student) return null;
    const fullName = student.full_name;
    if (!fullName?.trim()) return student.email?.split('@')[0] || null;
    
    if (fullName.includes(',')) {
      const afterComma = fullName.split(',')[1]?.trim().split(/\s+/)[0];
      if (afterComma?.length > 1) {
        return afterComma.charAt(0).toUpperCase() + afterComma.slice(1).toLowerCase();
      }
    }
    
    const firstName = fullName.trim().split(/\s+/)[0];
    return firstName?.length > 1 
      ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
      : null;
  };
  
  const firstName = getCapitalizedFirstName(user?.full_name);
  const studentFirstName = getStudentFirstName(data.linkedStudent);
  const hasLinkedStudent = !!data.linkedStudent;
  const hasActiveRequest = data.studentQueueStatus.hasActiveRequest;
  const studentPosition = data.studentQueueStatus.position;
  
  const karmaPoints = data.familyKarma;
  // New tier system
  const getKarmaTier = (pts) => {
    if (pts >= 1000) return { level: 'Champion', badge: '🏆', color: '#F97316' };
    if (pts >= 500) return { level: 'Priority', badge: '🌟', color: '#F59E0B' };
    if (pts >= 300) return { level: 'Engaged', badge: '⭐⭐', color: '#8B5CF6' };
    if (pts >= 100) return { level: 'Active', badge: '⭐', color: '#3B82F6' };
    return { level: 'Getting Started', badge: '📊', color: '#6B7280' };
  };
  const karmaTier = getKarmaTier(karmaPoints);
  const karmaLevel = karmaTier.level;
  const karmaBadge = karmaTier.badge;
  
  const profilePercent = [user?.company, user?.linkedin_url, user?.title, user?.profile_image].filter(Boolean).length * 25;

  // Dynamic header text based on parent's industry
  const expertiseText = data.parentIndustry ? `Your ${data.parentIndustry} Expertise` : 'Your Expertise';
  const questionSubtext = data.matchedCount > 0 
    ? `${data.matchedCount} questions match your background • ${data.newTodayCount} new today`
    : `${data.allQuestionsCount} questions waiting • ${data.newTodayCount} new today`;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      console.log('[ParentDashboard] Searching for:', searchQuery);
      const results = await base44.functions.invoke('searchGatorStudents', { query: searchQuery });
      console.log('[ParentDashboard] Search results:', results);
      const students = results?.data?.students || results?.students || [];
      console.log('[ParentDashboard] Parsed students:', students);
      setSearchResults(students);
    } catch (error) {
      console.error('Search failed:', error);
      toast({ title: "Search Error", description: error.message || "Failed to search", variant: "destructive" });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkStudent = async (student) => {
    try {
      await base44.functions.invoke('linkStudentsToParent', { studentEmailsOrNames: [student.email] });
      setShowSearchModal(false);
      toast({ title: "Student Linked! 🎉", description: `${student.full_name || student.email} is now connected.` });
      await refreshUser();
      await refresh();
    } catch (error) {
      console.error('Failed to link student:', error);
      toast({ title: "Link Failed", description: "Could not link student.", variant: "destructive" });
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {showWelcomeModal && (
        <WelcomeModal userName={firstName} onClose={() => setShowWelcomeModal(false)} />
      )}

      <div className="min-h-screen bg-gray-100 overflow-x-hidden">
        <style>{`
          @keyframes nudgePulse {
            0% { box-shadow: 0 0 0 0 rgba(232, 77, 32, 0.6); transform: scale(1); }
            50% { box-shadow: 0 0 20px 8px rgba(232, 77, 32, 0.35); transform: scale(1.02); }
            100% { box-shadow: 0 0 0 0 rgba(232, 77, 32, 0.6); transform: scale(1); }
          }
        `}</style>
        
        {/* ========== HERO SECTION ========== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0021A5 0%, #001878 50%, #0021A5 100%)' }}>
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(250, 70, 22, 0.15)' }} />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-12">
            <div className="max-w-4xl mx-auto">
              
              {/* Dynamic headline based on student link status */}
              <div className="text-center text-white mb-8 sm:mb-10">
                <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 sm:mb-3" style={{ color: '#FA4616' }}>
                  {hasLinkedStudent ? "You're Powering" : "Join the Network"}
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 text-white">
                  {hasLinkedStudent 
                    ? `${studentFirstName}'s Career Launch`
                    : "Help Students Succeed"
                  }
                </h1>
                <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-lg mx-auto px-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {hasLinkedStudent 
                    ? `Every connection you make opens doors for ${studentFirstName}`
                    : "Link your student to boost their visibility with every action you take"
                  }
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                
                {/* Family Karma */}
                <TooltipProvider delayDuration={0}>
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center border border-white/20 hover:bg-white/15 transition">
                  <div className="relative inline-block mb-2">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse" style={{ backgroundColor: '#FA4616' }} />
                    <span className="relative text-3xl sm:text-4xl md:text-5xl font-black text-white">{karmaPoints}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-xs sm:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Family Karma</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-white/40 hover:text-white/70 transition" aria-label="What is Family Karma?">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[220px] text-center">
                        <p className="text-xs">Help students, earn karma. More karma = more visibility for your student in match results.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                </TooltipProvider>

                {/* Student Queue Position - Dynamic */}
                <div className="backdrop-blur-xl rounded-3xl p-6 text-center border transition" style={{ background: 'linear-gradient(135deg, rgba(250, 70, 22, 0.3) 0%, rgba(250, 70, 22, 0.15) 100%)', borderColor: 'rgba(250, 70, 22, 0.5)' }}>
                  {hasLinkedStudent && hasActiveRequest ? (
                    <>
                      <div className="text-5xl font-black text-white mb-2">#{studentPosition}</div>
                      <p className="text-sm font-medium" style={{ color: '#FFA07A' }}>{studentFirstName}'s Position</p>
                      <p className="text-xs mt-2" style={{ color: 'rgba(255, 160, 122, 0.7)' }}>in the help queue</p>
                    </>
                  ) : hasLinkedStudent ? (
                    <>
                      <div className="text-4xl mb-2">💤</div>
                      <p className="text-sm font-medium" style={{ color: '#FFA07A' }}>{studentFirstName}</p>
                      <p className="text-xs mt-2" style={{ color: 'rgba(255, 160, 122, 0.7)' }}>No active request yet</p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🔗</div>
                      <p className="text-sm font-medium" style={{ color: '#FFA07A' }}>Link Student</p>
                      <p className="text-xs mt-2" style={{ color: 'rgba(255, 160, 122, 0.7)' }}>to activate boosts</p>
                    </>
                  )}
                </div>

                {/* Students Helped */}
                <div className="rounded-3xl p-6 text-center border border-white/20" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="text-5xl font-black text-white mb-2">{data.studentsHelped}</div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Students Helped</p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>all time</p>
                </div>
                
              </div>

              {/* Quick karma action buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <KarmaQuickActions />
              </div>

              {/* Motivational nudge - Dynamic */}
              <div className="mt-4 text-center">
                {hasLinkedStudent && hasActiveRequest ? (
                  (() => {
                    const pos = studentPosition;
                    let milestoneText;
                    if (pos <= 1) {
                      milestoneText = <span className="text-sm">{studentFirstName} is <strong>#1</strong> in the feed! Keep it up 🔥</span>;
                    } else if (pos <= 5) {
                      milestoneText = <span className="text-sm">Answer 1 more question to push {studentFirstName} to <strong>#1</strong></span>;
                    } else if (pos <= 10) {
                      milestoneText = <span className="text-sm">Answer 2 more questions to move {studentFirstName} into the <strong>top 5</strong></span>;
                    } else {
                      milestoneText = <span className="text-sm">Answer 2 more questions to move {studentFirstName} into the <strong>top 10</strong></span>;
                    }
                    return (
                      <div 
                        className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-5 py-3 text-white"
                        style={{ animation: 'nudgePulse 2s ease-in-out infinite', border: '1px solid rgba(232, 77, 32, 0.5)' }}
                      >
                        <span style={{ color: '#FA4616' }}>✨</span>
                        {milestoneText}
                        {pos > 1 && <span className="text-white/50">→</span>}
                      </div>
                    );
                  })()
                ) : hasLinkedStudent ? (
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-5 py-3 text-white border border-white/20">
                    <span style={{ color: '#FA4616' }}>💡</span>
                    <span className="text-sm">When {studentFirstName} posts a question, your karma will boost their visibility</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowSearchModal(true)}
                    className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full px-6 py-3 text-white border border-white/30 transition"
                  >
                    <span>🔗</span>
                    <span className="text-sm font-semibold">Link your student to activate karma boosts</span>
                    <span>→</span>
                  </button>
                )}
              </div>
              
            </div>
          </div>
        </section>

        {/* Profile completion banner — shown below hero if < 50% */}
        {profilePercent < 50 && (
          <section className="bg-gradient-to-r from-blue-50 to-orange-50 border-b border-blue-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
              <button
                onClick={() => navigate('ProfileEdit')}
                className="w-full flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">👤</span>
                  <span className="text-sm text-slate-700 truncate">
                    <strong>Complete your profile</strong> to get matched with more student questions
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(0, 33, 165, 0.1)', color: '#0021A5' }}>
                    {profilePercent}%
                  </span>
                  <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform text-sm">→</span>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* ========== MAIN CONTENT ========== */}
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          
          {/* ========== ACTIVATION WELCOME BANNER ========== */}
          <ActivationWelcomeBanner user={user} />

          {/* ========== STUDENTS NEED HELP - Personalized (PRIMARY ACTION) ========== */}
          <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            
            <div className="px-6 py-5 border-b" style={{ background: 'linear-gradient(90deg, #FFF5F2 0%, #FEF3E7 100%)', borderColor: 'rgba(250, 70, 22, 0.2)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)', boxShadow: '0 8px 16px rgba(250, 70, 22, 0.3)' }}>
                    <span className="text-white text-xl">🙋</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-900">
                      Students Need {expertiseText}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {questionSubtext}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block font-semibold text-sm px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0, 33, 165, 0.1)', color: '#0021A5' }}>
                  +15 karma per answer
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {data.matchedQuestions.length > 0 ? (
                data.matchedQuestions.slice(0, 3).map((q) => {
                  const studentEmails = data.linkedStudent 
                    ? [data.linkedStudent.email?.toLowerCase()].filter(Boolean) 
                    : [];
                  const isOwn = studentEmails.includes(q.poster_email?.toLowerCase()) || 
                                studentEmails.includes(q.created_by?.toLowerCase());
                  return (
                    <QuestionCard 
                      key={q.id} 
                      question={q} 
                      showMatchIndicator={!!data.parentIndustry}
                      isOwnStudent={isOwn}
                    />
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions yet. Check back soon!</p>
                </div>
              )}
            </div>

            <div className="px-6 py-5 bg-gray-50 border-t text-center">
              <button 
                onClick={() => navigate('Connections')}
                className="text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg transition hover:scale-105"
                style={{ backgroundColor: '#0021A5', boxShadow: '0 8px 20px rgba(0, 33, 165, 0.3)' }}
              >
                See All {data.allQuestionsCount} Questions{data.unansweredCount > 0 ? ` — ${data.unansweredCount} still need answers` : ''}
              </button>
            </div>
            
          </section>

          {/* ========== LINK STUDENT or BOOST CARD ========== */}
          {!hasLinkedStudent ? (
            <LinkStudentCard 
              user={user} 
              familyKarma={karmaPoints}
              onLinked={async () => {
                await refreshUser();
                await refresh();
              }}
            />
          ) : (
            <StudentBoostCard
              user={user}
              linkedStudent={data.linkedStudent}
              familyKarma={karmaPoints}
              karmaLevel={data.familyKarmaLevel || karmaTier.level?.toLowerCase()}
              boostMultiplier={data.familyBoostMultiplier || 0}
              studentQuestionData={data.studentQueueStatus}
            />
          )}

          {/* ========== WEEKLY STATS ========== */}
          <WeeklyStatsPanel />

          {/* ========== YOUR IMPACT ========== */}
          <ImpactDashboard user={user} />

          {/* ========== KARMA EXPLAINER (dismissible) ========== */}
          <KarmaExplainerCard />

          {/* ========== QUICK ACTIONS ========== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Complete Profile card — only show if still incomplete */}
            {profilePercent < 100 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 hover:shadow-lg transition">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0, 33, 165, 0.1) 0%, rgba(0, 33, 165, 0.2) 100%)' }}>
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Complete Your Profile</h3>
                    <p className="text-gray-500 text-sm">Better matching with students</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Profile strength</span>
                    <span className="font-bold" style={{ color: '#0021A5' }}>{profilePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all shadow-sm"
                      style={{ width: `${profilePercent}%`, background: 'linear-gradient(90deg, #0021A5 0%, #003DCE 100%)' }}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => navigate('ProfileEdit')}
                  className="w-full text-white font-semibold py-3 rounded-xl transition"
                  style={{ backgroundColor: '#0021A5' }}
                >
                  Complete Profile
                </button>
              </div>
            )}

            <div className="rounded-3xl p-6 border" style={{ background: data.myJobs.length > 0 ? 'linear-gradient(135deg, #FFF8F5 0%, #FEF5EF 100%)' : 'white', borderColor: data.myJobs.length > 0 ? 'rgba(250, 70, 22, 0.3)' : '#e5e7eb' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)', boxShadow: '0 8px 16px rgba(250, 70, 22, 0.3)' }}>
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    {data.myJobs.length > 0 ? (
                      <>
                        <h3 className="font-bold" style={{ color: '#C23A12' }}>Jobs Active!</h3>
                        <p className="text-sm" style={{ color: '#E5633A' }}>{data.myJobs.length} listings helping students</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold text-gray-900">Post a Job</h3>
                        <p className="text-gray-500 text-sm">Share opportunities</p>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => navigate(data.myJobs.length > 0 ? 'Opportunities' : 'PostOpportunity')}
                  className="border-2 font-semibold px-4 py-2 rounded-xl transition"
                  style={{ borderColor: 'rgba(250, 70, 22, 0.4)', color: '#FA4616' }}
                >
                  {data.myJobs.length > 0 ? 'Manage' : 'Post Job'}
                </button>
              </div>
            </div>
            
          </section>

          {/* ========== PIONEER BADGE ========== */}
          {user?.is_founding_member && (
            <section 
              className="rounded-3xl p-5 text-white flex items-center justify-between shadow-lg"
              style={{ background: 'linear-gradient(90deg, #FA4616 0%, #FF6B3D 50%, #FA4616 100%)', boxShadow: '0 8px 24px rgba(250, 70, 22, 0.35)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <p className="font-bold text-lg">You're a Founding Member</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>One of the first parents to join the network</p>
                </div>
              </div>
              <div className="bg-white/20 text-white font-semibold px-4 py-2 rounded-full border border-white/30">
                🏅 Pioneer
              </div>
            </section>
          )}

        </div>
        
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
                  <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <p className="font-medium">{student.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                    <Button size="sm" onClick={() => handleLinkStudent(student)}>Link</Button>
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
      
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSuccess={async () => {
          await refreshUser();
          await refresh();
        }}
      />
    </>
  );
}