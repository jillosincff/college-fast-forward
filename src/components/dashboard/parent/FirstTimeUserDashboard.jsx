import React from 'react';
import { MessageCircle, Link2, User, ArrowRight, Sparkles, Briefcase, AlertTriangle, CheckCircle2, Zap, Clock } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FirstTimeUserDashboard({ 
  user, 
  linkedStudents = [],
  onBrowseQuestions, 
  onConnectStudent, 
  onCompleteProfile,
  onPostCareerRequest
}) {
  // Check if user is alumni
  const isAlumni = user?.persona === 'alumni' || user?.roles?.includes('alumni');
  const hasLinkedStudent = linkedStudents.length > 0;
  
  // Get karma info from user
  const karmaPoints = user?.karma_points || user?.karma_earned || 0;
  const karmaLevel = user?.karma_level || 'bronze';
  const lastKarmaEarnedAt = user?.last_karma_earned_at;
  
  // Calculate boost status for linked students
  const boostExpiresAt = linkedStudents[0]?.boost_expires_at;
  const boostLevel = linkedStudents[0]?.boost_level || 0;
  const boostActive = boostLevel > 0 && (!boostExpiresAt || new Date(boostExpiresAt) > new Date());
  
  // Calculate time remaining on boost
  let boostTimeRemaining = '';
  if (boostActive && boostExpiresAt) {
    const hoursLeft = Math.max(0, Math.floor((new Date(boostExpiresAt) - new Date()) / (1000 * 60 * 60)));
    boostTimeRemaining = hoursLeft > 24 ? `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h` : `${hoursLeft}h`;
  }
  
  // Fix name parsing - get first name properly (handles "LastName, FirstName" format)
  const getStudentFirstName = (student) => {
    if (!student) return 'your student';
    
    const fullName = student.full_name;
    if (!fullName?.trim()) {
      return student.email?.split('@')[0] || 'your student';
    }
    
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
  
  const studentName = getStudentFirstName(linkedStudents[0]);

  return (
    <div className="space-y-6">
      
      {/* Motivational Header */}
      <div className="text-center py-4">
        <h2 className="text-2xl md:text-4xl font-black leading-tight mb-2" style={{ color: '#0021A5' }}>
          Help More Students, Boost Your Own ⚡
        </h2>
        <p className="text-sm md:text-lg text-slate-600">
          {hasLinkedStudent 
            ? `Every action you take earns karma — directly boosting ${studentName}'s visibility.`
            : 'Every action you take earns karma — link your student to activate boosts.'
          }
        </p>
        {!hasLinkedStudent && (
          <p className="text-sm text-amber-600 mt-2 font-medium">
            ⚠️ Link your student to see their name here and activate boosts.
          </p>
        )}
      </div>

      {/* PRIMARY CTA - Answer Questions */}
      <div className="bg-gradient-to-br from-[#0021A5] to-[#001580] rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={28} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold bg-[#FA4616] px-2 py-0.5 rounded-full">
                YOUR FIRST STEP
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Answer a Student Question</h3>
            <p className="text-white/80 mb-4">
              Students are asking for career advice right now. Share your wisdom 
              and earn karma to boost your student's profile.
            </p>
            <button
              onClick={onBrowseQuestions}
              className="inline-flex items-center gap-2 bg-white text-[#0021A5] px-6 py-3 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Questions
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        
        {/* Karma Preview with Live Boost Status */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="font-medium">Your Karma: {karmaPoints} points</span>
            </div>
            <div className="flex items-center gap-2 group relative">
              <span className="text-sm text-white font-semibold">
                {karmaPoints >= 300 ? '🏆 Platinum' : 
                 karmaPoints >= 150 ? '🥇 Gold' : 
                 karmaPoints >= 50 ? '🥈 Silver' : 
                 `${karmaPoints}/50 to Silver 🥈`}
              </span>
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-semibold mb-1">Karma Level Benefits:</p>
                <p>• Silver (50+): 1x boost</p>
                <p>• Gold (150+): 2x boost</p>
                <p>• Platinum (300+): 3x boost</p>
              </div>
            </div>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (karmaPoints / 50) * 100)}%` }} 
            />
          </div>

          {/* Live Boost Status */}
          {hasLinkedStudent && (
            <div className={`rounded-lg p-3 ${boostActive ? 'bg-yellow-400/20' : 'bg-white/10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} className={boostActive ? 'text-yellow-300' : 'text-white/50'} />
                  <span className="text-sm font-semibold">
                    {boostActive 
                      ? `${studentName}'s requests: BOOSTED to top of feed` 
                      : `${studentName}'s boost: Inactive (earn karma to activate)`}
                  </span>
                </div>
                {boostActive && boostTimeRemaining && (
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Clock size={12} />
                    {boostTimeRemaining} left
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>

      {/* Alumni Career Request Card - Prominent Placement */}
      {isAlumni && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl border-2 border-amber-300 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-1">Need help with your next move?</h3>
                <p className="text-sm text-amber-800 mb-2">
                  Post privately — visible only to fellow parents and alumni.
                </p>
                <p className="text-sm text-amber-700">
                  Whether it's a new role search, industry shift, or business advice, the network has your back — just like you have theirs.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full text-xs font-medium text-amber-800 border border-amber-200">
                💼 New job search
              </span>
              <span className="inline-flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full text-xs font-medium text-amber-800 border border-amber-200">
                🔄 Career transition
              </span>
              <span className="inline-flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full text-xs font-medium text-amber-800 border border-amber-200">
                🌐 Industry shift
              </span>
              <span className="inline-flex items-center gap-1 bg-white/70 px-3 py-1.5 rounded-full text-xs font-medium text-amber-800 border border-amber-200">
                💡 Business advice
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100/50 rounded-lg px-3 py-2">
              <span>🔒</span>
              <span><strong>Privacy:</strong> Alumni requests are private — seen only by other parents and alumni.</span>
            </div>

            <button
              onClick={onPostCareerRequest || (() => navigate('PostRequest?type=alumni_career'))}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
            >
              Post a Career Request
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Post a Job Card - Higher Priority */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Briefcase size={28} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-900">Post a Job</h3>
              <p className="text-sm text-purple-700">Know of openings at your company? Students are looking!</p>
            </div>
          </div>
          <button
            onClick={() => navigate('PostOpportunity')}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Briefcase size={18} />
            Post Job
          </button>
        </div>
      </div>

      {/* Secondary Actions - Connect Student & Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Connect Your Student - Priority #1 */}
        <div className={`rounded-xl border-2 p-6 transition-all ${
          hasLinkedStudent 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 hover:border-amber-400 hover:shadow-lg relative'
        }`}>
          {!hasLinkedStudent && (
            <div className="absolute -top-2 -right-2">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                REQUIRED
              </span>
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              hasLinkedStudent ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {hasLinkedStudent && linkedStudents[0]?.profile_image ? (
                <img 
                  src={linkedStudents[0].profile_image} 
                  alt={studentName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <Link2 size={24} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-1">
                {hasLinkedStudent ? `✅ Linked to ${studentName}` : 'Connect Your Student'}
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                {hasLinkedStudent 
                  ? 'Your karma now boosts their visibility!'
                  : 'Link your student\'s account to boost their profile visibility'
                }
              </p>
              {!hasLinkedStudent && (
                <button
                  onClick={onConnectStudent}
                  className="text-sm font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 bg-amber-200 px-3 py-1.5 rounded-lg"
                >
                  Search & Link Student
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Complete Your Profile */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-[#0021A5] hover:shadow-md transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 text-[#FA4616] rounded-xl flex items-center justify-center flex-shrink-0">
              <User size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-1">Complete Your Profile</h3>
              <p className="text-sm text-slate-500 mb-3">
                Add your company & LinkedIn for a stronger profile
              </p>
              <button
                onClick={onCompleteProfile}
                className="text-sm font-semibold text-[#0021A5] hover:text-[#001580] inline-flex items-center gap-1"
              >
                Update Profile
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>



      {/* MY STUDENTS SECTION */}
      {hasLinkedStudent && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#0021A5' }}>
                👨‍🎓 My Students
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onConnectStudent}
                className="text-[#0021A5] hover:text-[#FA4616] hover:bg-blue-50 text-sm font-semibold"
              >
                <Link2 className="w-4 h-4 mr-1" />
                Link Another Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linkedStudents.map((student) => (
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

      {/* How Karma Works - More Direct */}
      <details className="bg-slate-100 rounded-xl" open={!hasLinkedStudent}>
        <summary className="px-6 py-4 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
          💡 How does Family Karma work?
        </summary>
        <div className="px-6 pb-4 text-sm text-slate-600 space-y-2">
          <p><strong>+10 points</strong> — Answer a student question</p>
          <p><strong>+5 points</strong> — Get upvoted by the community</p>
          <p><strong>+50 points</strong> — Student marks your answer as "Best"</p>
          <div className="pt-3 mt-3 border-t border-slate-200">
            <p className="font-semibold text-[#0021A5]">
              📌 Your karma pins your student's requests to the top of the feed for faster help.
            </p>
            {!hasLinkedStudent && (
              <p className="text-amber-600 mt-2 flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>Link your student first to activate these boosts!</span>
              </p>
            )}
          </div>
        </div>
      </details>

    </div>
  );
}