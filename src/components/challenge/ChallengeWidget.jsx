import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Trophy, Clock, PartyPopper, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
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

  // Progress dots
  const renderProgressDots = () => {
    return (
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              i < introsCount
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200'
                : 'bg-slate-200 border-2 border-slate-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-slate-700">
          {introsCount} of 3
          {isCompleted && <span className="text-green-600 ml-1">✓</span>}
        </span>
      </div>
    );
  };

  // COMPLETED STATE
  if (isCompleted) {
    const completedDays = user?.challenge_days_to_complete || daysElapsed;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  🏆 CHALLENGE COMPLETE!
                </h3>
                <p className="text-slate-600 mb-3">
                  You got {introsCount} intros in {completedDays} days. You're ahead of 90% of job seekers.
                </p>
                
                {renderProgressDots()}
                
                <p className="text-sm text-slate-500 mt-3">
                  Keep going — more intros = better odds.
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    onClick={() => navigate('Connections')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Find More Matches
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLogModal(true)}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    🎉 Log Another Intro
                  </Button>
                </div>
              </div>
            </div>

            {/* Intro History */}
            {introsHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Your Intros ({introsHistory.length})
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-2 overflow-hidden"
                    >
                      {introsHistory.map((intro, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-white/60 rounded-lg px-3 py-2">
                          <span className="text-green-500">●</span>
                          <span className="font-medium">{intro.company}</span>
                          <span className="text-slate-400">—</span>
                          <span>intro from {intro.helper_name}</span>
                          <span className="text-slate-400 ml-auto">
                            {new Date(intro.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        <LogIntroModal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          user={user}
          matches={matches}
          onSuccess={onIntroLogged}
        />
      </motion.div>
    );
  }

  // EXPIRED STATE
  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Target className="w-7 h-7 text-slate-500" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-700 mb-1">
                  🎯 CHALLENGE ENDED
                </h3>
                <p className="text-slate-600 mb-3">
                  You got {introsCount} intro{introsCount !== 1 ? 's' : ''} in 30 days. Not bad — but don't stop now.
                </p>
                
                {renderProgressDots()}
                
                <div className="mt-4">
                  <Button
                    onClick={() => navigate('Connections')}
                    className="bg-slate-700 hover:bg-slate-800"
                  >
                    Keep Going — Find Matches
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ACTIVE STATE (0-2 intros, within 30 days)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl overflow-hidden">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Target className="w-7 h-7 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                🎯 YOUR 30-DAY CHALLENGE
              </h3>
              <p className="text-slate-600 mb-4">
                Get 3 warm intros from parents & alumni.<br />
                <span className="font-semibold text-slate-700">Stop applying. Start connecting.</span>
              </p>
              
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                {renderProgressDots()}
                <div className="flex items-center gap-2 text-sm bg-white/70 px-3 py-1.5 rounded-full border border-blue-200">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-700">{daysLeft} days left</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowLogModal(true)}
                  className="bg-gradient-to-r from-[#FA4616] to-orange-500 hover:from-orange-600 hover:to-orange-600 shadow-lg text-base px-6"
                >
                  <PartyPopper className="w-5 h-5 mr-2" />
                  I Got an Intro!
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('Connections')}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Find More Matches
                </Button>
              </div>
            </div>
          </div>

          {/* Intro History */}
          {introsHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                Your Intros ({introsHistory.length})
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-2 overflow-hidden"
                  >
                    {introsHistory.map((intro, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-white/60 rounded-lg px-3 py-2">
                        <span className="text-green-500">●</span>
                        <span className="font-medium">{intro.company}</span>
                        <span className="text-slate-400">—</span>
                        <span>intro from {intro.helper_name}</span>
                        <span className="text-slate-400 ml-auto">
                          {new Date(intro.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      <LogIntroModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        user={user}
        matches={matches}
        onSuccess={onIntroLogged}
      />
    </motion.div>
  );
}