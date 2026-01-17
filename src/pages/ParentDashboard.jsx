import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Message } from '@/entities/Message';
import { Opportunity } from '@/entities/Opportunity';
import { JobRequest } from '@/entities/JobRequest';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle } from 'lucide-react';
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
  const [questionsCount, setQuestionsCount] = useState(0);
  const [studentsHelped, setStudentsHelped] = useState(0);
  const [myJobs, setMyJobs] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [studentPosition, setStudentPosition] = useState(12);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const [opportunities, jobRequests] = await Promise.allSettled([
        Opportunity.filter({ created_by: user.email }),
        JobRequest.filter({ status: 'active' })
      ]);
      
      if (jobRequests.status === 'fulfilled') {
        const questions = jobRequests.value || [];
        setQuestionsCount(questions.length);
        setTopQuestions(questions.slice(0, 3));
      }
      
      if (opportunities.status === 'fulfilled') {
        setMyJobs(opportunities.value || []);
      }
      
      try {
        const result = await base44.functions.invoke('getFamilyStudents', {});
        if (result.data?.students) {
          setMyStudents(result.data.students);
        }
      } catch (e) {
        console.error('Failed to load family students:', e);
      }
      
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
    if (!namePart) return 'Parent';
    return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
  };
  
  const getStudentFirstName = (student) => {
    if (!student) return 'Your Student';
    const fullName = student.full_name;
    if (!fullName?.trim()) return student.email?.split('@')[0] || 'Your Student';
    
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
    
    return student.email?.split('@')[0] || 'Your Student';
  };
  
  const firstName = getCapitalizedFirstName(user?.full_name);
  const studentFirstName = myStudents.length > 0 ? getStudentFirstName(myStudents[0]) : 'Emma';
  const karmaPoints = user?.karma_points || familyKarma || 0;
  const profilePercent = [user?.company, user?.linkedin_url, user?.title, user?.profile_image].filter(Boolean).length * 25;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await base44.functions.invoke('searchGatorStudents', { query: searchQuery });
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
      await base44.functions.invoke('linkStudentsToParent', { studentEmailsOrNames: [student.email] });
      setShowSearchModal(false);
      toast({ title: "Student Linked! 🎉", description: `${student.full_name || student.email} is now connected.` });
      await refreshUser();
      await loadDashboardData(true);
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

  const leaderboard = [
    { rank: 1, name: "Patricia M.", helped: 47, isYou: false },
    { rank: 2, name: "Robert S.", helped: 41, isYou: false },
    { rank: 3, name: "Jennifer L.", helped: 38, isYou: false },
    { rank: 4, name: "Michael T.", helped: 29, isYou: false },
    { rank: 5, name: "You", helped: studentsHelped, isYou: true },
  ];

  return (
    <>
      {showWelcomeModal && (
        <WelcomeModal userName={firstName} onClose={() => setShowWelcomeModal(false)} />
      )}

      <div className="min-h-screen bg-gray-100">
        
        {/* ========== HERO SECTION - UF BLUE ========== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0021A5 0%, #001878 50%, #0021A5 100%)' }}>
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(250, 70, 22, 0.15)' }} />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="relative z-10 px-6 py-12">
            <div className="max-w-4xl mx-auto">
              
              <div className="text-center text-white mb-10">
                <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: '#FA4616' }}>
                  You're Powering
                </p>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-3 text-white">
                  {studentFirstName}'s Career Launch
                </h1>
                <p className="text-xl opacity-90 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Every connection you make opens doors for {studentFirstName}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-center border border-white/20 hover:bg-white/15 transition">
                  <div className="relative inline-block mb-2">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse" style={{ backgroundColor: '#FA4616' }} />
                    <span className="relative text-5xl font-black text-white">{karmaPoints}</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Family Karma</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(250, 70, 22, 0.3)', color: '#FFA07A', borderColor: 'rgba(250, 70, 22, 0.5)', borderWidth: '1px' }}>
                    {karmaPoints >= 100 ? '🥇 Gold' : karmaPoints >= 50 ? '🥈 Silver' : '🥉 Bronze'}
                  </div>
                </div>

                <div className="backdrop-blur-xl rounded-3xl p-6 text-center border transition" style={{ background: 'linear-gradient(135deg, rgba(250, 70, 22, 0.3) 0%, rgba(250, 70, 22, 0.15) 100%)', borderColor: 'rgba(250, 70, 22, 0.5)' }}>
                  <div className="text-5xl font-black text-white mb-2">#{studentPosition}</div>
                  <p className="text-sm font-medium" style={{ color: '#FFA07A' }}>{studentFirstName}'s Position</p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(255, 160, 122, 0.7)' }}>in the help queue</p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-center border border-white/20 hover:bg-white/15 transition">
                  <div className="text-5xl font-black text-white mb-2">{studentsHelped}</div>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Students Helped</p>
                  <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>by your advice</p>
                </div>
                
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-5 py-3 text-white border border-white/20">
                  <span style={{ color: '#FA4616' }}>✨</span>
                  <span className="text-sm">Answer 2 more questions to move {studentFirstName} into the <strong>top 10</strong></span>
                  <span className="text-white/50">→</span>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* ========== LIVE ACTIVITY PULSE ========== */}
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#FA4616' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#FA4616' }} />
                </span>
                <span className="text-sm font-semibold text-gray-600">Live</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span><strong className="text-gray-700">Sarah M.</strong> just helped a Finance student</span>
                  <span className="text-gray-300">•</span>
                  <span><strong className="text-gray-700">David R.</strong> posted a Marketing role</span>
                </div>
              </div>
              <div className="hidden md:block text-sm text-gray-400">
                <strong style={{ color: '#0021A5' }}>127</strong> students helped this week
              </div>
            </div>
          </div>
        </section>

        {/* ========== MAIN CONTENT ========== */}
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          
          {/* ========== STUDENTS NEED HELP ========== */}
          <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            
            <div className="px-6 py-5 border-b" style={{ background: 'linear-gradient(90deg, #FFF5F2 0%, #FEF3E7 100%)', borderColor: 'rgba(250, 70, 22, 0.2)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)', boxShadow: '0 8px 16px rgba(250, 70, 22, 0.3)' }}>
                    <span className="text-white text-xl">🙋</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-gray-900">Students Need Your Expertise</h2>
                    <p className="text-gray-600 text-sm">
                      {questionsCount} questions waiting • <span className="font-semibold" style={{ color: '#FA4616' }}>12 new today</span>
                    </p>
                  </div>
                </div>
                <div className="hidden md:block font-semibold text-sm px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0, 33, 165, 0.1)', color: '#0021A5' }}>
                  +10 karma per answer
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {topQuestions.map((q, idx) => (
                <div 
                  key={q.id || idx}
                  className="group bg-gray-50 hover:bg-blue-50 rounded-2xl p-5 cursor-pointer transition-all border-2 border-transparent hover:border-blue-200 hover:shadow-md"
                  onClick={() => navigate(`QuestionDetail?id=${q.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)' }}>
                      {(q.poster_name || q.poster_first_name || 'S')[0]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900">{q.poster_first_name || 'Student'}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{q.student_major || 'Undeclared'}</span>
                      </div>
                      <p className="text-gray-800 font-medium leading-snug line-clamp-2">{q.title || q.role || q.description?.slice(0, 100)}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{q.target_industry || 'General'}</span>
                        {(q.answer_count || 0) === 0 && (
                          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(250, 70, 22, 0.15)', color: '#FA4616' }}>
                            🔥 No answers yet
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-lg"
                      style={{ backgroundColor: '#0021A5', boxShadow: '0 8px 16px rgba(0, 33, 165, 0.25)' }}
                    >
                      Help Out →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 bg-gray-50 border-t text-center">
              <button 
                onClick={() => navigate('Connections')}
                className="text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg transition hover:scale-105"
                style={{ backgroundColor: '#0021A5', boxShadow: '0 8px 20px rgba(0, 33, 165, 0.3)' }}
              >
                See All {questionsCount} Questions
              </button>
            </div>
            
          </section>

          {/* ========== LEADERBOARD ========== */}
          <section className="rounded-3xl p-6 text-white overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #0021A5 0%, #001052 50%, #0021A5 100%)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(250, 70, 22, 0.2)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    Top Parent Helpers This Week
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Climb the ranks by helping students</p>
                </div>
              </div>

              <div className="space-y-2">
                {leaderboard.map((p, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition ${
                      p.isYou ? 'border-2 shadow-lg' : 'bg-white/5 hover:bg-white/10'
                    }`}
                    style={p.isYou ? { backgroundColor: 'rgba(250, 70, 22, 0.2)', borderColor: 'rgba(250, 70, 22, 0.5)' } : {}}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      i === 0 ? 'text-yellow-900' : i === 1 ? 'text-gray-700' : i === 2 ? 'text-amber-100' : 'text-white/70'
                    }`} style={{
                      background: i === 0 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                 i === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)' :
                                 i === 2 ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' :
                                 'rgba(255,255,255,0.1)'
                    }}>
                      {p.rank}
                    </div>
                    <div className="flex-1 font-medium">
                      {p.name} {p.isYou && <span style={{ color: '#FFA07A' }} className="font-normal">(You)</span>}
                    </div>
                    <div>
                      <span className="font-bold text-lg">{p.helped}</span>
                      <span className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.6)' }}>helped</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== QUICK ACTIONS ========== */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-white rounded-3xl p-6 border border-gray-200 hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0, 33, 165, 0.1) 0%, rgba(0, 33, 165, 0.2) 100%)' }}>
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Complete Your Profile</h3>
                  <p className="text-gray-500 text-sm">Help students know your background</p>
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

            <div className="rounded-3xl p-6 border" style={{ background: myJobs.length > 0 ? 'linear-gradient(135deg, #FFF8F5 0%, #FEF5EF 100%)' : 'white', borderColor: myJobs.length > 0 ? 'rgba(250, 70, 22, 0.3)' : '#e5e7eb' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)', boxShadow: '0 8px 16px rgba(250, 70, 22, 0.3)' }}>
                    <span className="text-2xl">💼</span>
                  </div>
                  <div>
                    {myJobs.length > 0 ? (
                      <>
                        <h3 className="font-bold" style={{ color: '#C23A12' }}>Jobs Active!</h3>
                        <p className="text-sm" style={{ color: '#E5633A' }}>{myJobs.length} listings helping students</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold text-gray-900">Post a Job</h3>
                        <p className="text-gray-500 text-sm">Share opportunities with students</p>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => navigate(myJobs.length > 0 ? 'Opportunities' : 'PostOpportunity')}
                  className="border-2 font-semibold px-4 py-2 rounded-xl transition"
                  style={{ borderColor: 'rgba(250, 70, 22, 0.4)', color: '#FA4616' }}
                >
                  {myJobs.length > 0 ? 'Manage' : 'Post Job'}
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
        
        {/* Footer */}
        <footer className="text-gray-300 text-center py-8 mt-12" style={{ backgroundColor: '#0021A5' }}>
          <p className="text-sm">© 2026 College Fast Forward. All Rights Reserved.</p>
          <p className="text-xs mt-2 opacity-70">Terms of Service • Privacy Policy • Cookie Policy</p>
        </footer>
        
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
          await loadDashboardData(true);
        }}
      />
    </>
  );
}