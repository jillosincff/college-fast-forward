import React from 'react';
import { MessageCircle, Link2, User, ArrowRight, Sparkles } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function FirstTimeUserDashboard({ 
  user, 
  onBrowseQuestions, 
  onConnectStudent, 
  onCompleteProfile 
}) {
  return (
    <div className="space-y-6">
      
      {/* Motivational Header */}
      <div className="text-center py-4">
        <h2 className="text-2xl md:text-4xl font-black leading-tight mb-2" style={{ color: '#0021A5' }}>
          Help More Gators, Boost Your Own ⚡
        </h2>
        <p className="text-sm md:text-lg text-slate-600">
          Every action unlocks more opportunities for your student
        </p>
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
            <h3 className="text-xl font-bold mb-2">Answer a Student Question</h3>
            <p className="text-white/80 mb-4">
              Students are asking for career advice right now. Share your wisdom 
              and earn karma to boost your student's profile.
            </p>
            <button
              onClick={onBrowseQuestions}
              className="inline-flex items-center gap-2 bg-white text-[#0021A5] px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
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
            <span className="text-sm text-white/60">0/50 to Silver</span>
          </div>
          <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>
      </div>

      {/* Secondary Actions - 2 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Connect Your Student */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-[#0021A5] hover:shadow-md transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 text-[#0021A5] rounded-xl flex items-center justify-center flex-shrink-0">
              <Link2 size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-1">Connect Your Gator</h3>
              <p className="text-sm text-slate-500 mb-3">
                Link your student's account to boost their profile visibility
              </p>
              <button
                onClick={onConnectStudent}
                className="text-sm font-semibold text-[#0021A5] hover:text-[#001580] inline-flex items-center gap-1"
              >
                Search & Link
                <ArrowRight size={14} />
              </button>
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

      {/* How Karma Works - Collapsed/Subtle */}
      <details className="bg-slate-100 rounded-xl">
        <summary className="px-6 py-4 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
          💡 How does Family Karma work?
        </summary>
        <div className="px-6 pb-4 text-sm text-slate-600 space-y-2">
          <p><strong>+10 points</strong> — Answer a student question</p>
          <p><strong>+5 points</strong> — Get upvoted by the community</p>
          <p><strong>+50 points</strong> — Student marks your answer as "Best"</p>
          <p className="pt-2 text-slate-500">
            Your karma boosts your student's questions to the top of the feed, 
            getting them more visibility and better answers!
          </p>
        </div>
      </details>

    </div>
  );
}