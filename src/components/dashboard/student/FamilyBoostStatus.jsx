import React from 'react';
import { Zap, Clock, TrendingUp, Star } from 'lucide-react';

/**
 * Component for student dashboard showing their boost status from parent karma
 */
export default function FamilyBoostStatus({ 
  boostLevel = 0, 
  boostExpiresAt = null,
  boostedByParentEmail = null
}) {
  const now = new Date();
  const expiresAt = boostExpiresAt ? new Date(boostExpiresAt) : null;
  const isActive = boostLevel > 0 && (!expiresAt || expiresAt > now);
  
  // Calculate time remaining
  let timeRemaining = '';
  let hoursLeft = 0;
  if (expiresAt && isActive) {
    hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60 * 60)));
    if (hoursLeft > 24) {
      timeRemaining = `${Math.floor(hoursLeft / 24)} days, ${hoursLeft % 24} hours`;
    } else if (hoursLeft > 0) {
      timeRemaining = `${hoursLeft} hours`;
    } else {
      const minutesLeft = Math.max(0, Math.floor((expiresAt - now) / (1000 * 60)));
      timeRemaining = `${minutesLeft} minutes`;
    }
  }
  
  const levelName = boostLevel >= 3 ? 'Platinum' : boostLevel >= 2 ? 'Gold' : boostLevel >= 1 ? 'Silver' : 'None';
  const levelColor = boostLevel >= 3 ? 'purple' : boostLevel >= 2 ? 'amber' : boostLevel >= 1 ? 'gray' : 'slate';
  
  if (!isActive) {
    // No active boost - show encouragement to ask parent
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">🚀 Unlock Family Boost!</h4>
            <p className="text-sm text-blue-700 mb-2">
              Ask your parent to help a student — it unlocks a <strong>Family Boost</strong> that pins your requests to the top of the feed!
            </p>
            <p className="text-xs text-blue-600 bg-blue-100 rounded-lg px-3 py-1.5 inline-block">
              💡 <strong>Tell them:</strong> "Answer one question on Gator Network to boost my requests!"
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-gradient-to-r from-${levelColor}-50 to-${levelColor}-100 rounded-xl border-2 border-${levelColor}-200 p-4 relative overflow-hidden`}
         style={{
           background: boostLevel >= 3 
             ? 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)' 
             : boostLevel >= 2 
               ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
               : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
         }}>
      {/* Animated sparkles for high boost */}
      {boostLevel >= 2 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-2 right-4 w-4 h-4 text-yellow-400 animate-pulse" />
          <Star className="absolute bottom-3 right-12 w-3 h-3 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      )}
      
      <div className="relative z-10 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
             style={{
               background: boostLevel >= 3 
                 ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)' 
                 : boostLevel >= 2 
                   ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                   : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
             }}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-slate-800">⚡ Your Requests Are Boosted!</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold`}
                  style={{
                    background: boostLevel >= 3 ? '#9333ea' : boostLevel >= 2 ? '#f59e0b' : '#6b7280',
                    color: 'white'
                  }}>
              {levelName}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 mb-2">
            Your parent's karma is boosting your requests to the <strong>top of the feed</strong> — 
            you're more likely to get help faster!
          </p>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeRemaining} remaining</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pinned to top of feed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}