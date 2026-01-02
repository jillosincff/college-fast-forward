import React from 'react';
import { MessageCircle, Link2, User, ArrowRight, Sparkles, Briefcase, AlertTriangle } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function FirstTimeUserDashboard({ 
  user, 
  linkedStudents = [],
  onBrowseQuestions, 
  onConnectStudent, 
  onCompleteProfile 
}) {
  const hasLinkedStudent = linkedStudents.length > 0;
  
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
        
        {/* Karma Preview */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="font-medium">Earn +10 karma for each answer</span>
            </div>
            <div className="flex items-center gap-2 group relative">
              <span className="text-sm text-white/80 font-semibold">0/50 to Silver 🥈</span>
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-semibold mb-1">Silver Status Benefits:</p>
                <p>• Priority matching with students</p>
                <p>• Silver badge on your profile</p>
              </div>
            </div>
          </div>
          <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      {/* Secondary Actions - Connect Student FIRST if not linked */}
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

      {/* Post a Job Card */}
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