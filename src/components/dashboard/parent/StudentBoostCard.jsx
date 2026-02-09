import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, ArrowUp, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const TIER_LABELS = {
  none: 'Getting Started',
  active: 'Active',
  engaged: 'Engaged',
  priority: 'Priority',
  champion: 'Champion'
};

const TIER_THRESHOLDS = {
  active: 1,
  engaged: 50,
  priority: 150,
  champion: 500
};

function getNextTierInfo(currentLevel, totalKarma) {
  const tiers = ['active', 'engaged', 'priority', 'champion'];
  const idx = tiers.indexOf(currentLevel);
  if (idx === -1 || idx >= tiers.length - 1) return null;
  const nextTier = tiers[idx + 1];
  return {
    name: TIER_LABELS[nextTier],
    threshold: TIER_THRESHOLDS[nextTier],
    remaining: TIER_THRESHOLDS[nextTier] - totalKarma,
    boostLabel: nextTier === 'engaged' ? '1x' : nextTier === 'priority' ? '2x' : '3x'
  };
}

export default function StudentBoostCard({ user, linkedStudent, familyKarma, karmaLevel, boostMultiplier, studentQuestionData }) {
  const [copied, setCopied] = useState(false);

  const studentName = linkedStudent?.full_name?.split(' ')[0] || 
                       linkedStudent?.email?.split('@')[0] || 
                       'Your student';

  const hasActiveQuestion = studentQuestionData?.hasActiveRequest;
  const position = studentQuestionData?.position;
  const totalQuestions = studentQuestionData?.totalQuestions || 40;
  
  const nextTier = getNextTierInfo(karmaLevel, familyKarma || 0);

  const progressPercent = nextTier 
    ? Math.min(100, ((familyKarma || 0) / nextTier.threshold) * 100)
    : 100;

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/#GatorAuth`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // State: Student has active questions
  if (hasActiveQuestion) {
    const estimatedJump = Math.max(1, Math.round(totalQuestions * 0.2 * (boostMultiplier || 0)));
    
    return (
      <section className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: 'rgba(250, 70, 22, 0.4)' }}>
        <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #FFF5F2 0%, #FEF3E7 100%)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5" style={{ color: '#FA4616' }} />
            <h3 className="font-bold text-gray-900">Your Student's Boost</h3>
          </div>
        </div>
        
        <div className="px-5 py-4 bg-white space-y-4">
          {/* Position info */}
          {position && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Position in feed</p>
                <p className="text-2xl font-black text-gray-900">#{position} <span className="text-sm font-normal text-gray-400">of {totalQuestions}</span></p>
              </div>
              {boostMultiplier > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold" style={{ backgroundColor: 'rgba(250, 70, 22, 0.1)', color: '#FA4616' }}>
                  <ArrowUp className="w-4 h-4" />
                  +{estimatedJump} from Karma
                </div>
              )}
            </div>
          )}

          {/* Tier + Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-500">
                🏆 {TIER_LABELS[karmaLevel] || 'Getting Started'} ({boostMultiplier || 0}x boost)
              </span>
              {nextTier && (
                <span className="text-gray-400">{familyKarma} / {nextTier.threshold}</span>
              )}
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full transition-all"
                style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #0021A5, #FA4616)' }}
              />
            </div>
            {nextTier && (
              <p className="text-xs text-gray-400 mt-1.5">
                {nextTier.remaining} more Karma to {nextTier.name} ({nextTier.boostLabel} boost)
              </p>
            )}
          </div>

          <Button
            onClick={() => navigate('Connections')}
            className="w-full font-semibold"
            style={{ backgroundColor: '#0021A5' }}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Answer a Question to Boost More
          </Button>
        </div>
      </section>
    );
  }

  // State: Student linked but no active questions
  return (
    <section className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: 'rgba(0, 33, 165, 0.3)' }}>
      <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 100%)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5" style={{ color: '#0021A5' }} />
          <h3 className="font-bold text-gray-900">Your Student's Boost</h3>
        </div>
      </div>
      
      <div className="px-5 py-4 bg-white space-y-3">
        <p className="text-sm text-gray-600">
          You've earned <strong>{familyKarma || 0} Family Karma</strong> ({TIER_LABELS[karmaLevel] || 'Getting Started'} tier, {boostMultiplier || 0}x boost).
        </p>
        <p className="text-sm text-gray-500">
          {studentName} hasn't posted any questions yet. When they do, their questions will automatically get boosted to the top of the feed!
        </p>
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-sm text-blue-700">
            💡 <strong>Nudge {studentName}:</strong> Share this link so they can post a question and get help from the Gator network.
          </p>
        </div>
        <Button variant="outline" onClick={handleCopyInvite} className="w-full">
          {copied ? <><Check className="w-4 h-4 mr-2 text-green-600" /> Copied!</> : <><Copy className="w-4 h-4 mr-2" /> Copy Invite Link for {studentName}</>}
        </Button>
      </div>
    </section>
  );
}