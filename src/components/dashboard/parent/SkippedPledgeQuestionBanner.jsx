import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { X, MessageSquare } from 'lucide-react';

export default function SkippedPledgeQuestionBanner({ user }) {
  const [dismissed, setDismissed] = useState(false);

  // Only show if parent skipped the post-pledge question during onboarding
  if (!user?.skipped_pledge_question) return null;
  if (dismissed) return null;
  if (localStorage.getItem('dismissed_skipped_pledge_banner')) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('dismissed_skipped_pledge_banner', 'true');
  };

  return (
    <div className="relative bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-4 sm:p-5">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm sm:text-base">
            Complete your first action — answer a student question!
          </p>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Earn 15 karma points and start boosting your student's visibility in the network.
          </p>
          <button
            onClick={() => navigate('Connections')}
            className="mt-3 inline-flex items-center gap-2 bg-[#FA4616] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-[#E03E14] transition"
          >
            Answer a Question Now
            <span className="text-white/70">+15 karma</span>
          </button>
        </div>
      </div>
    </div>
  );
}