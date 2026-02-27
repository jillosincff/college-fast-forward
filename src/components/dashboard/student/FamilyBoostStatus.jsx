import React, { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Component for student dashboard showing their boost status from parent karma
 */
export default function FamilyBoostStatus({ 
  boostLevel = 0, 
  boostExpiresAt = null,
  boostedByParentEmail = null,
  boostedByParentName = null,
  parentKarma = 0,
  linkedParents = []
}) {
  const [positionData, setPositionData] = useState(null);

  useEffect(() => {
    loadPositionData();
  }, [boostLevel]);

  const loadPositionData = async () => {
    try {
      const res = await base44.functions.invoke('getStudentPositionData', {});
      if (res?.data?.success && res.data.current_position) {
        setPositionData(res.data);
      }
    } catch (e) {
      console.log('Position data unavailable:', e.message);
    }
  };

  const now = new Date();
  const expiresAt = boostExpiresAt ? new Date(boostExpiresAt) : null;
  const isExpired = expiresAt && expiresAt <= now;
  const isActive = boostLevel > 0 && !isExpired;
  
  // Derive parent name from multiple sources
  const parentDisplayName = boostedByParentName || 
    linkedParents?.[0]?.full_name?.split(',').reverse().map(s => s.trim()).join(' ') ||
    linkedParents?.[0]?.email?.split('@')[0] ||
    'your parent';
  
  const effectiveKarma = parentKarma || linkedParents?.[0]?.karma_points || 0;
  
  // If linked parents exist but no boost, show the linked+pending state
  const hasLinkedParent = linkedParents?.length > 0 || boostedByParentEmail;
  
  if (!hasLinkedParent && !isActive) {
    // No linked parent at all — encourage linking
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">🚀 Unlock Family Boost!</h4>
            <p className="text-sm text-blue-700 mb-2">
              Ask your parent to join CFF — when they help students, <strong>YOUR questions get boosted to the top of the feed!</strong>
            </p>
            <p className="text-xs text-blue-600 bg-blue-100 rounded-lg px-3 py-1.5 inline-block">
              💡 <strong>Tell them:</strong> "Sign up on College Fast Forward to boost my visibility!"
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (hasLinkedParent && !isActive) {
    // Parent linked but no active boost — parent needs to earn more karma
    return (
      <div className="rounded-xl border-2 border-blue-200 p-4" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 100%)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0021A5, #003DCE)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 mb-1">
              ⚡ {parentDisplayName} earned {effectiveKarma} Family Karma
            </h4>
            <p className="text-sm text-slate-600 mb-2">
              {effectiveKarma > 0 
                ? `Your questions get a ${boostLevel > 0 ? `+${boostLevel}x` : 'boost'} from your parent's karma. The more they help, the higher you go!`
                : `When ${parentDisplayName} helps students on CFF, your questions will get boosted in the feed.`
              }
            </p>
            {effectiveKarma > 0 && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Post a question to activate the boost!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Active boost!
  const tierName = boostLevel >= 5 ? 'Champion Family' : boostLevel >= 3 ? 'Priority Family' : boostLevel >= 2 ? 'Engaged Family' : 'Active Family';
  
  return (
    <div className="rounded-xl border-2 p-4 relative overflow-hidden"
         style={{
           borderColor: 'rgba(250, 70, 22, 0.4)',
           background: boostLevel >= 3 
             ? 'linear-gradient(135deg, #FFF5F2 0%, #FEF3E7 100%)' 
             : boostLevel >= 2 
               ? 'linear-gradient(135deg, #FFF5F2 0%, #FEF3E7 100%)'
               : 'linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 100%)'
         }}>
      {/* Animated sparkles for high boost */}
      {boostLevel >= 2 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-2 right-4 w-4 h-4 text-orange-400 animate-pulse" />
          <Star className="absolute bottom-3 right-12 w-3 h-3 text-orange-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      )}
      
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
             style={{ background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)' }}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-slate-800">⚡ Your Questions Are Boosted!</h4>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ background: '#FA4616' }}>
              +{boostLevel}x • {tierName}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 mb-2">
            {parentDisplayName} earned <strong>{effectiveKarma} Family Karma</strong> — your questions are <strong>+{boostLevel}x boosted</strong> in the feed. You're more likely to get help faster!
          </p>
          
          {positionData && (
            <div className="bg-white/80 rounded-lg border border-slate-200 p-3 mb-2">
              <p className="text-sm font-semibold text-slate-800">
                Your help request is at position <span className="text-blue-600">#{positionData.current_position}</span> of {positionData.total_requests}
              </p>
              {positionData.slots_gained > 0 && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  +{positionData.slots_gained} slots from Family Karma
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Boosted to top of feed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}