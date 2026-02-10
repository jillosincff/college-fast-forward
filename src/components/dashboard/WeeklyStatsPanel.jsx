import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Users, Handshake, HelpCircle } from 'lucide-react';

export default function WeeklyStatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyStats();
  }, []);

  const loadWeeklyStats = async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekStart = oneWeekAgo.toISOString();

      // Get recent answers, karma transactions, and unanswered questions in parallel
      const [recentAnswers, recentTransactions, activeQuestions] = await Promise.all([
        base44.entities.Answer.list('-created_date', 200).catch(() => []),
        base44.entities.KarmaTransaction.list('-created_date', 200).catch(() => []),
        base44.entities.JobRequest.filter({ status: 'active' }, '-created_date', 200).catch(() => [])
      ]);

      // Filter to this week
      const weekAnswers = (recentAnswers || []).filter(a => a.created_date >= weekStart);
      const weekTransactions = (recentTransactions || []).filter(t => t.created_date >= weekStart);

      // Unique students helped this week (unique question_ids answered)
      const studentQuestionIds = new Set(weekAnswers.map(a => a.question_id).filter(Boolean));

      // Intros made (referral_given transactions this week)
      const intros = weekTransactions.filter(t => t.action_type === 'referral_given');

      // Questions still waiting (active with 0 answers)
      const unanswered = (activeQuestions || []).filter(q => (q.answer_count || 0) === 0);

      setStats({
        questionsAnswered: weekAnswers.length,
        studentsHelped: studentQuestionIds.size,
        introsMade: intros.length,
        waitingForAnswers: Math.min(unanswered.length, 99)
      });
    } catch (err) {
      console.error('Failed to load weekly stats:', err);
      setStats({ questionsAnswered: 0, studentsHelped: 0, introsMade: 0, waitingForAnswers: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#0021A5] to-[#001878] rounded-2xl p-5 animate-pulse">
        <div className="h-5 bg-white/20 rounded w-1/3 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-12 bg-white/10 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const allItems = [
    { icon: MessageSquare, value: stats.questionsAnswered, label: 'questions answered', color: 'text-blue-300', alwaysShow: true },
    { icon: Users, value: stats.studentsHelped, label: 'students helped', color: 'text-green-300', alwaysShow: true },
    { icon: Handshake, value: stats.introsMade, label: 'warm intros made', color: 'text-orange-300', alwaysShow: false },
    { icon: HelpCircle, value: stats.waitingForAnswers, label: 'still waiting for answers', color: 'text-yellow-300', alwaysShow: true },
  ];

  // Only show metrics with value > 0, unless they're marked as alwaysShow
  const items = allItems.filter(item => item.alwaysShow || item.value > 0);

  return (
    <section className="bg-gradient-to-r from-[#0021A5] to-[#001878] rounded-2xl p-5 text-white">
      <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-white">
        🐊 This Week at UF
      </h3>
      <div className={`grid gap-3 ${items.length <= 3 ? 'grid-cols-3 max-w-2xl mx-auto' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <Icon className={`w-4 h-4 mx-auto mb-1 ${item.color}`} />
              <div className="text-xl font-bold">{item.value}</div>
              <div className="text-xs opacity-70">{item.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}