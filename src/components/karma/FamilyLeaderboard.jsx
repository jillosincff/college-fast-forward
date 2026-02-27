import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import FamilyKarmaBadge from './FamilyKarmaBadge';

export default function FamilyLeaderboard({ user }) {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.FamilyKarma.list('-total_karma', 100);
      setFamilies(all || []);
    } catch (e) {
      console.log('Could not load leaderboard:', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded" />)}
        </div>
      </div>
    );
  }

  if (families.length === 0) return null;

  const userFamilyGroupId = user?.family_group_id;
  const myRank = families.findIndex(f => f.family_group_id === userFamilyGroupId) + 1;
  const myFamily = families.find(f => f.family_group_id === userFamilyGroupId);
  const displayFamilies = expanded ? families.slice(0, 20) : families.slice(0, 5);

  // Check if user's family is outside displayed range
  const userInView = myRank > 0 && myRank <= displayFamilies.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Family Leaderboard
        </h3>
        {myRank > 0 && (
          <span className="text-sm font-medium text-slate-500">
            Your family: #{myRank} of {families.length}
          </span>
        )}
      </div>

      <div className="divide-y divide-gray-50">
        {displayFamilies.map((fam, idx) => {
          const rank = idx + 1;
          const isMe = fam.family_group_id === userFamilyGroupId;
          return (
            <div
              key={fam.id}
              className={`flex items-center gap-3 px-5 py-3 ${isMe ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            >
              <span className={`w-7 text-center font-bold text-sm ${
                rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-gray-400'
              }`}>
                {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                  {fam.family_group_id?.replace(/_/g, ' ') || `Family #${rank}`}
                  {isMe && <span className="ml-1 text-xs text-blue-500">(You)</span>}
                </p>
              </div>
              <FamilyKarmaBadge karma={fam.total_karma} tier={fam.karma_level} size="sm" />
              <span className="text-sm font-bold text-gray-700 w-16 text-right">{fam.total_karma || 0}</span>
            </div>
          );
        })}

        {/* Show user's family if outside top display */}
        {myFamily && !userInView && (
          <>
            <div className="px-5 py-1 text-center text-xs text-gray-400">• • •</div>
            <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border-l-4 border-blue-500">
              <span className="w-7 text-center font-bold text-sm text-gray-400">#{myRank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-blue-700">
                  {myFamily.family_group_id?.replace(/_/g, ' ') || 'Your Family'}
                  <span className="ml-1 text-xs text-blue-500">(You)</span>
                </p>
              </div>
              <FamilyKarmaBadge karma={myFamily.total_karma} tier={myFamily.karma_level} size="sm" />
              <span className="text-sm font-bold text-gray-700 w-16 text-right">{myFamily.total_karma || 0}</span>
            </div>
          </>
        )}
      </div>

      {families.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1 border-t border-gray-100"
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4" /> Show Less</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Show Top 20</>
          )}
        </button>
      )}
    </div>
  );
}