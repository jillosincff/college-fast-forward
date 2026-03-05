import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Always-on insight card showing the single most important action for THIS student.
 * Priority: (a) stale follow-ups, (b) resume not uploaded, (c) alumni identified but none contacted,
 * (d) targets not researched, (e) general benchmarking tip
 */
export default function InsightCard({ unmessagedAlumni, onOpenChat, onAddTargets, profile, pipelineCounts }) {
  const [staleCount, setStaleCount] = useState(0);
  const [recentInterviewCompany, setRecentInterviewCompany] = useState(null);

  useEffect(() => {
    if (!profile?.user_email) return;
    // Fetch stale outreach
    base44.entities.NetworkingPipeline.filter({ user_email: profile.user_email, status: 'reached_out' }, '-reached_out_date', 20)
      .then(data => {
        const stale = (data || []).filter(p => {
          if (!p.reached_out_date) return false;
          return (Date.now() - new Date(p.reached_out_date).getTime()) > 3 * 24 * 60 * 60 * 1000;
        });
        setStaleCount(stale.length);
      }).catch(() => {});

    // Fetch recent interviews
    base44.entities.NetworkingPipeline.filter({ user_email: profile.user_email, status: 'interview' }, '-interview_date', 5)
      .then(data => {
        const recent = (data || []).find(p => {
          if (!p.interview_date) return false;
          const days = (Date.now() - new Date(p.interview_date).getTime()) / (1000 * 60 * 60 * 24);
          return days >= 1 && days <= 3;
        });
        if (recent) setRecentInterviewCompany(recent.company);
      }).catch(() => {});
  }, [profile?.user_email]);

  // Priority-ordered insight logic
  let emoji = '💡';
  let message = '';
  let cta = '';
  let prompt = '';
  let accentColor = '#0021A5';

  const hasResume = !!profile?.resume_text;
  const targetCount = profile?.target_companies?.length || 0;
  const companiesResearched = profile?.companies_researched || 0;
  const identified = pipelineCounts?.identified || 0;
  const reachedOut = pipelineCounts?.reached_out || 0;

  if (recentInterviewCompany) {
    // Post-interview: send thank-you
    emoji = '📝';
    message = `You recently interviewed at ${recentInterviewCompany}. Send a thank-you note within 24 hours to stand out.`;
    cta = 'Draft Thank-You →';
    prompt = `Write a thank-you note after my interview at ${recentInterviewCompany}`;
    accentColor = '#10B981';
  } else if (staleCount > 0) {
    // (a) Stale follow-ups
    emoji = '⏰';
    message = `${staleCount} contact${staleCount > 1 ? 's' : ''} haven't replied in 3+ days. A well-timed follow-up can double your response rate.`;
    cta = 'Draft Follow-Up →';
    prompt = 'Draft a follow-up message';
    accentColor = '#F59E0B';
  } else if (!hasResume) {
    // (b) Resume not uploaded
    emoji = '📄';
    message = 'Students with a resume get 2× more relevant company matches and personalized outreach. Upload or build yours now.';
    cta = 'Add Resume →';
    prompt = 'Help me upload my resume';
    accentColor = '#FA4616';
  } else if (identified >= 3 && reachedOut === 0) {
    // (c) Alumni identified but none contacted
    emoji = '✉️';
    message = `You've found ${identified} alumni but haven't reached out yet. The hardest part is the first message — let me draft it for you.`;
    cta = 'Draft Outreach →';
    prompt = 'Draft an outreach message to the top alumni in my pipeline';
    accentColor = '#0021A5';
  } else if (unmessagedAlumni > 0) {
    // Still have unmessaged alumni
    emoji = '🎯';
    message = `${unmessagedAlumni} alumni in your pipeline haven't been contacted yet. Each message is a chance at a warm intro.`;
    cta = 'Draft Message →';
    prompt = 'Draft an outreach message';
    accentColor = '#8B5CF6';
  } else if (targetCount > 0 && companiesResearched < targetCount) {
    // (d) Targets not researched
    emoji = '🔍';
    const unresearched = targetCount - companiesResearched;
    message = `${unresearched} of your target companies haven't been researched yet. Intel helps you stand out in outreach and interviews.`;
    cta = 'Research Companies →';
    prompt = 'Research my target companies';
    accentColor = '#0021A5';
  } else if (targetCount === 0) {
    // No targets set
    emoji = '🎯';
    message = 'Set your target companies to unlock personalized intel, alumni discovery, and weekly job scouting.';
    cta = 'Add Targets →';
    prompt = null; // Use onAddTargets instead
    accentColor = '#FA4616';
  } else {
    // (e) General benchmarking tip
    emoji = '📊';
    message = 'Students who reach out to 5+ alumni are 3× more likely to get a referral. Keep building your network.';
    cta = 'Find More Alumni →';
    prompt = 'Find UF alumni at my target companies';
    accentColor = '#10B981';
  }

  return (
    <div className="fiq-animate fiq-delay-2" style={{ marginBottom: 20 }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        border: `1.5px solid ${accentColor}30`,
        borderLeft: `4px solid ${accentColor}`,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        flexWrap: 'wrap',
        boxShadow: `0 2px 12px ${accentColor}08`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${accentColor}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            {emoji}
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#334155', margin: 0, lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            if (prompt) {
              onOpenChat(prompt);
            } else {
              onAddTargets();
            }
          }}
          style={{
            padding: '8px 18px', borderRadius: 10, border: 'none',
            background: accentColor, color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}