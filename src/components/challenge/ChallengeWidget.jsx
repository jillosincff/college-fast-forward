import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, PartyPopper, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import LogIntroModal from './LogIntroModal';

export default function ChallengeWidget({ user, matches, onIntroLogged }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Calculate challenge state
  const challengeStart = user?.challenge_start_date ? new Date(user.challenge_start_date) : null;
  const introsCount = user?.challenge_intros_count || 0;
  const isCompleted = user?.challenge_completed || introsCount >= 3;
  const introsHistory = user?.challenge_intros || [];

  // Calculate days left
  const now = new Date();
  const daysElapsed = challengeStart ? Math.floor((now - challengeStart) / (1000 * 60 * 60 * 24)) : 0;
  const daysLeft = Math.max(0, 30 - daysElapsed);
  const isExpired = daysLeft === 0 && !isCompleted;

  // Compact progress dots
  const renderProgressDots = () => (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full ${
            i < introsCount
              ? 'bg-green-500'
              : 'bg-slate-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-slate-600">
        {introsCount}/3
      </span>
    </div>
  );

  // COMPLETED STATE - Compact banner
  if (isCompleted) {
    return (
      <>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏆</span>
              <span className="font-semibold text-green-800">Challenge Complete!</span>
              {renderProgressDots()}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLogModal(true)}
              className="border-green-300 text-green-700 hover:bg-green-100 h-8"
            >
              Log Another
            </Button>
          </div>
          
          {/* Expandable history */}
          {introsHistory.length > 0 && (
            <>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 text-xs text-green-600 mt-2 hover:text-green-700"
              >
                View intros ({introsHistory.length})
                {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {introsHistory.map((intro, idx) => (
                      <div key={idx} className="text-xs text-slate-600 bg-white/60 rounded px-2 py-1">
                        <span className="text-green-500">●</span> {intro.company} — {intro.helper_name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        <LogIntroModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          user={user}
          matches={matches}
          onSuccess={onIntroLogged}
        />
      </>
    );
  }

  // EXPIRED STATE - Compact
  if (isExpired) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-lg">🎯</span>
            <span className="font-medium text-slate-600">Challenge ended</span>
            {renderProgressDots()}
          </div>
          <span className="text-xs text-slate-500">Keep connecting below ↓</span>
        </div>
      </div>
    );
  }

  // ACTIVE STATE - Compact single-row banner
  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left: Title + Progress */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg">🎯</span>
            <span className="font-semibold text-slate-800">30-Day Challenge</span>
            {renderProgressDots()}
          </div>
          
          {/* Right: Button + Timer */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => setShowLogModal(true)}
              className="bg-gradient-to-r from-[#FA4616] to-orange-500 hover:from-orange-600 hover:to-orange-600 h-8 px-3"
            >
              <PartyPopper className="w-4 h-4 mr-1" />
              I Got an Intro!
            </Button>
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{daysLeft}d</span>
            </div>
          </div>
        </div>
        
        {/* Expandable history */}
        {introsHistory.length > 0 && (
          <>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs text-blue-600 mt-2 hover:text-blue-700"
            >
              View intros ({introsHistory.length})
              {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-2 space-y-1 overflow-hidden"
                >
                  {introsHistory.map((intro, idx) => (
                    <div key={idx} className="text-xs text-slate-600 bg-white/60 rounded px-2 py-1">
                      <span className="text-green-500">●</span> {intro.company} — {intro.helper_name}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <LogIntroModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        user={user}
        matches={matches}
        onSuccess={onIntroLogged}
      />
    </>
  );
}