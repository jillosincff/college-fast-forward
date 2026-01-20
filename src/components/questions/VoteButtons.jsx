import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';

export default function VoteButtons({ 
  item, 
  itemType = 'question', 
  onVote, 
  orientation = 'vertical',
  disabled = false 
}) {
  const [userVote, setUserVote] = useState(item.user_vote || null); // 'up', 'down', or null
  const [score, setScore] = useState((item.total_upvotes || item.upvote_count || 0) - (item.downvote_count || 0));
  const [isVoting, setIsVoting] = useState(false);
  
  const handleVote = async (e, voteType) => {
    e.stopPropagation();
    
    if (isVoting || disabled) return;
    
    setIsVoting(true);
    
    // Toggle vote if clicking same button
    const newVote = userVote === voteType ? null : voteType;
    
    // Calculate score delta
    let delta = 0;
    if (userVote === 'up') delta -= 1;
    if (userVote === 'down') delta += 1;
    if (newVote === 'up') delta += 1;
    if (newVote === 'down') delta -= 1;
    
    // Optimistic update
    setScore(prev => prev + delta);
    setUserVote(newVote);
    
    try {
      if (onVote) {
        await onVote(item.id, itemType, newVote);
      }
      
      trackEvent(`${itemType}_voted`, {
        item_id: item.id,
        vote_type: newVote,
        previous_vote: userVote
      });
    } catch (err) {
      // Revert on error
      setScore(prev => prev - delta);
      setUserVote(userVote);
      console.error('Vote failed:', err);
    }
    
    setIsVoting(false);
  };
  
  const containerClass = orientation === 'vertical'
    ? 'flex flex-col items-center gap-0.5'
    : 'flex items-center gap-1';
  
  return (
    <div className={containerClass} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => handleVote(e, 'up')}
        disabled={isVoting || disabled}
        className={`p-1 rounded-md transition-colors ${
          userVote === 'up'
            ? 'text-orange-500 bg-orange-50'
            : 'text-slate-400 hover:text-orange-500 hover:bg-slate-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
      </button>
      
      <span className={`font-bold text-sm min-w-[24px] text-center ${
        score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-slate-500'
      }`}>
        {score}
      </span>
      
      <button
        onClick={(e) => handleVote(e, 'down')}
        disabled={isVoting || disabled}
        className={`p-1 rounded-md transition-colors ${
          userVote === 'down'
            ? 'text-blue-500 bg-blue-50'
            : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}