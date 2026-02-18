import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ThumbsUp, CheckCircle, Flame, TrendingUp } from 'lucide-react';
import moment from 'moment';

const TIER_LABELS = {
  none: 'Getting Started',
  active: 'Active',
  engaged: 'Engaged',
  priority: 'Priority',
  champion: 'Champion'
};

export default function ImpactDashboard({ user }) {
  const [stats, setStats] = useState({ studentsHelped: 0, answersGiven: 0, introsMade: 0 });
  const [familyKarma, setFamilyKarma] = useState(0);
  const [karmaLevel, setKarmaLevel] = useState('none');
  const [boostMultiplier, setBoostMultiplier] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadImpactData();
  }, [user?.id]);

  const loadImpactData = async () => {
    try {
      const [transactions, karmaRecords] = await Promise.all([
        base44.entities.KarmaTransaction.filter({ parent_email: user.email }, '-created_date', 50),
        base44.entities.FamilyKarma.filter({ family_group_id: user.family_group_id }, undefined, 1)
      ]);

      // Compute stats from transactions
      const answers = transactions.filter(t => t.action_type === 'answer');
      const intros = transactions.filter(t => t.action_type === 'referral_given');

      // Count unique students helped (dedupe by reference_id to avoid double-counting)
      const uniqueStudentRefs = new Set(answers.map(a => a.reference_id).filter(Boolean));
      const uniqueStudentsHelped = uniqueStudentRefs.size || answers.length;

      setStats({
        studentsHelped: uniqueStudentsHelped,
        answersGiven: answers.length,
        introsMade: intros.length
      });

      // Family karma
      if (karmaRecords.length > 0) {
        setFamilyKarma(karmaRecords[0].total_karma || 0);
        setKarmaLevel(karmaRecords[0].karma_level || 'none');
        setBoostMultiplier(karmaRecords[0].boost_multiplier || 0);
      } else {
        setFamilyKarma(user.karma_points || 0);
        setKarmaLevel(user.karma_level || 'none');
      }

      // Recent activity (last 5 transactions with descriptions)
      setRecentActivity(
        transactions.slice(0, 5).map(t => ({
          description: t.description || `Earned ${t.points} karma for ${t.action_type.replace(/_/g, ' ')}`,
          timeAgo: moment(t.created_date).fromNow(),
          points: t.points,
          type: t.action_type
        }))
      );
    } catch (err) {
      console.error('Failed to load impact data:', err);
    } finally {
      setLoading(false);
    }
  };

  const actionIcons = {
    answer: '💬',
    upvote_received: '👍',
    best_answer: '🏆',
    outcome_reported: '🎉',
    salary_submitted: '💰',
    interview_question_submitted: '📝',
    message_responded: '✉️',
    referral_given: '🤝',
    onboarding_complete: '✅'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-orange-50">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0021A5]" />
          Your Impact
        </h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <Users className="w-5 h-5 text-[#0021A5] mx-auto mb-1" />
            <div className="text-2xl font-black text-[#0021A5]">{stats.studentsHelped}</div>
            <div className="text-xs text-slate-500 font-medium">Students Helped</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <ThumbsUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-green-600">{stats.answersGiven}</div>
            <div className="text-xs text-slate-500 font-medium">Answers Given</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-[#FA4616] mx-auto mb-1" />
            <div className="text-2xl font-black text-[#FA4616]">{stats.introsMade}</div>
            <div className="text-xs text-slate-500 font-medium">Introductions Made</div>
          </div>
        </div>

        {/* Karma Summary */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-slate-700">Family Karma: {familyKarma}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {TIER_LABELS[karmaLevel] || karmaLevel} tier • {boostMultiplier > 0 ? `+${boostMultiplier}x boost` : 'No boost yet'}
            </p>
          </div>
          <div className="text-2xl">
            {karmaLevel === 'champion' ? '🏆' : karmaLevel === 'priority' ? '🌟' : karmaLevel === 'engaged' ? '⭐' : karmaLevel === 'active' ? '💪' : '📊'}
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="text-base mt-0.5">{actionIcons[item.type] || '✨'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 truncate">{item.description}</p>
                    <p className="text-xs text-slate-400">{item.timeAgo}</p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 whitespace-nowrap">+{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}