import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Loader2, Zap, RefreshCw } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { generateActionPlan } from '@/functions/generateActionPlan';

import WeeklyFocusCard from '@/components/action-plan/WeeklyFocusCard';
import WeeklyProgressGrid from '@/components/action-plan/WeeklyProgressGrid';
import MilestonesTimeline from '@/components/action-plan/MilestonesTimeline';
import ActivityLogSection from '@/components/action-plan/ActivityLogSection';
import FollowUpQueue from '@/components/action-plan/FollowUpQueue';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function ActionPlanTracker() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    loadData();
  }, [user?.email]);

  const loadData = async () => {
    setLoading(true);
    const [plans, logs] = await Promise.all([
      base44.entities.ActionPlan.filter({ student_email: user.email }),
      base44.entities.ActivityLog.filter({ student_email: user.email }, '-created_date', 100),
    ]);
    if (plans[0]) {
      setPlan(plans[0]);
    } else {
      // Auto-generate first plan
      try {
        const res = await generateActionPlan({});
        if (res.data?.plan) setPlan(res.data.plan);
      } catch (e) {
        console.error('Auto-generate plan failed:', e);
      }
    }
    setActivities(logs || []);
    setLoading(false);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await generateActionPlan({ force: true });
      if (res.data?.plan) setPlan(res.data.plan);
    } catch (e) {
      console.error('Regenerate failed:', e);
    }
    setRegenerating(false);
  };

  const handleMilestoneComplete = async (milestoneId) => {
    if (!plan) return;
    const updated = (plan.milestones || []).map(m =>
      m.id === milestoneId ? { ...m, status: 'complete', completed_at: new Date().toISOString() } : m
    );
    await base44.entities.ActionPlan.update(plan.id, { milestones: updated });
    setPlan(prev => ({ ...prev, milestones: updated }));
  };

  const handleFollowUpDone = async (activityId) => {
    await base44.entities.ActivityLog.update(activityId, { follow_up_complete: true });
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, follow_up_complete: true } : a));
  };

  const handleActivityAdded = (newActivity) => {
    setActivities(prev => [newActivity, ...prev]);
  };

  // Compute weekly progress from activities
  const getWeeklyProgress = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeek = activities.filter(a => new Date(a.created_date) >= startOfWeek);
    return {
      outreach: thisWeek.filter(a => a.type === 'outreach_sent' || a.type === 'follow_up_sent').length,
      conversations: thisWeek.filter(a => a.type === 'conversation_had' || a.type === 'reply_received').length,
      research: thisWeek.filter(a => a.type === 'company_researched').length,
      resumes: thisWeek.filter(a => a.type === 'resume_tailored').length,
    };
  };

  const pendingFollowUps = activities.filter(a =>
    a.follow_up_due_at && !a.follow_up_complete &&
    a.type !== 'follow_up_sent'
  );

  if (user === undefined) return null;

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <p style={{ fontFamily: dmSans, color: '#888' }}>Sign in to access your Action Plan</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
      </div>
    );
  }

  const weeklyProgress = getWeeklyProgress();
  const lastUpdated = plan?.last_reviewed_at ? new Date(plan.last_reviewed_at) : null;
  const hoursAgo = lastUpdated ? Math.round((Date.now() - lastUpdated.getTime()) / (60 * 60 * 1000)) : null;

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>
              My <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Action Plan</em>
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginTop: 4 }}>
              FASTIQ tracks everything and tells you what to do next.
            </p>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, minHeight: 'auto', width: 'auto',
              whiteSpace: 'nowrap', flexShrink: 0, marginTop: 8,
            }}
          >
            {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {hoursAgo !== null ? `Updated ${hoursAgo}h ago` : 'Generate'} · Regenerate →
          </button>
        </div>

        {/* Section 1 — This Week's Focus */}
        {plan?.current_focus && (
          <WeeklyFocusCard
            focusText={plan.current_focus}
            actionPrompt={plan.current_focus_action}
          />
        )}

        {/* Section 2 — Weekly Progress */}
        <WeeklyProgressGrid
          progress={weeklyProgress}
          goals={{
            outreach: plan?.weekly_goal_outreach || 3,
            conversations: plan?.weekly_goal_conversations || 1,
            research: plan?.weekly_goal_research || 2,
            resumes: plan?.weekly_goal_resumes || 1,
          }}
        />

        {/* Section 3 — Milestones */}
        {plan?.milestones?.length > 0 && (
          <MilestonesTimeline
            milestones={plan.milestones}
            onComplete={handleMilestoneComplete}
          />
        )}

        {/* Section 4 — Follow-Up Queue */}
        {pendingFollowUps.length > 0 && (
          <FollowUpQueue
            followUps={pendingFollowUps}
            onDone={handleFollowUpDone}
          />
        )}

        {/* Section 5 — Activity Log */}
        <ActivityLogSection
          activities={activities}
          userEmail={user.email}
          onActivityAdded={handleActivityAdded}
        />
      </div>
    </div>
  );
}