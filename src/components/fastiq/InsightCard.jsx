import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function InsightCard({ unmessagedAlumni, onOpenChat, onAddTargets, profile }) {
  const [staleCount, setStaleCount] = useState(0);
  const [recentInterviewCompany, setRecentInterviewCompany] = useState(null);

  useEffect(() => {
    const loadStale = async () => {
      const email = profile?.user_email;
      if (!email) return;
      const [reached, interviews] = await Promise.all([
        base44.entities.NetworkingPipeline.filter(
          { user_email: email, status: 'reached_out' }, '-reached_out_date', 50
        ).catch(() => []),
        base44.entities.NetworkingPipeline.filter(
          { user_email: email, status: 'interview' }, '-interview_date', 5
        ).catch(() => []),
      ]);
      const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;
      const stale = reached.filter(p => p.reached_out_date && new Date(p.reached_out_date).getTime() < fourDaysAgo);
      setStaleCount(stale.length);
      // Check for interviews from 1-7 days ago (post-interview thank-you window)
      const oneDayAgo = Date.now() - 1 * 24 * 60 * 60 * 1000;
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentInterview = interviews.find(p => {
        const d = p.interview_date ? new Date(p.interview_date).getTime() : 0;
        return d > sevenDaysAgo && d < oneDayAgo;
      });
      if (recentInterview) setRecentInterviewCompany(recentInterview.company);
    };
    loadStale();
  }, [profile?.user_email]);

  const hasUnmessaged = unmessagedAlumni > 0;
  const targets = profile?.target_companies?.length || 0;
  const hasResume = !!profile?.resume_text;

  let message, cta, emoji, onClick;

  // Priority -1: Post-interview thank-you nudge (highest priority)
  if (recentInterviewCompany) {
    emoji = '📝';
    message = (
      <>
        How did your interview at <span style={{ color: '#FA4616', fontWeight: 700 }}>{recentInterviewCompany}</span> go?
        {' '}Let me help you send a thank-you note — it makes a <span style={{ color: '#FA4616', fontWeight: 700 }}>big impression</span> and keeps you top of mind.
      </>
    );
    cta = 'Write Thank-You Note →';
    onClick = () => onOpenChat(`I had my interview at ${recentInterviewCompany} — help me write a thank-you note`);
  }
  // Priority 0: Resume upload (highest priority if missing)
  else if (!hasResume && staleCount === 0) {
    emoji = '📄';
    message = (
      <>
        Students who upload their resume get{' '}
        <span style={{ color: '#FA4616', fontWeight: 700 }}>2x more relevant company matches</span>.
        Upload yours to unlock the full FASTIQ experience — smarter outreach, tailored interview prep, and instant resume tailoring.
      </>
    );
    cta = 'Upload Resume →';
    onClick = () => onOpenChat('Help me build a resume');
  }
  // Priority 1: Follow-up reminders (stale outreach)
  else if (staleCount > 0) {
    emoji = '📬';
    message = (
      <>
        You have <span style={{ color: '#FA4616', fontWeight: 700 }}>{staleCount} contact{staleCount > 1 ? 's' : ''} waiting for follow-up</span>.
        Students who send a follow-up within 5 days get <span style={{ color: '#FA4616', fontWeight: 700 }}>3x more replies</span>.
      </>
    );
    cta = 'Draft Follow-Ups →';
    onClick = () => onOpenChat('Draft follow-up messages for contacts I reached out to but haven\'t heard back from');
  }
  // Priority 2: Unmessaged alumni
  else if (hasUnmessaged) {
    emoji = '💡';
    message = (
      <>
        Students who reach out within 48 hours of identifying an alumni get{' '}
        <span style={{ color: '#FA4616', fontWeight: 700 }}>3x more replies</span>.
        You have {unmessagedAlumni} alumni you haven't messaged yet — want me to draft something?
      </>
    );
    cta = 'Draft Messages →';
    onClick = () => onOpenChat('Draft outreach messages for alumni I haven\'t contacted yet');
  }
  // Priority 3: Need more targets
  else if (targets < 3) {
    emoji = '💡';
    message = (
      <>
        Students with <span style={{ color: '#FA4616', fontWeight: 700 }}>3+ target companies</span> get matched
        to 2x more alumni. Add more targets to expand your network.
      </>
    );
    cta = 'Add Targets →';
    onClick = () => onAddTargets?.();
  }
  // Default
  else {
    emoji = '💡';
    message = (
      <>
        Your pipeline is building. Students who follow up weekly see{' '}
        <span style={{ color: '#FA4616', fontWeight: 700 }}>5x more interview invites</span>.
        Keep the momentum going.
      </>
    );
    cta = 'View Pipeline →';
    onClick = () => onOpenChat('');
  }

  const isUrgent = staleCount > 0 || recentInterviewCompany;

  return (
    <div className="fiq-animate fiq-delay-2" style={{
      background: isUrgent
        ? 'linear-gradient(135deg, rgba(250,70,22,0.06), rgba(245,158,11,0.04))'
        : 'linear-gradient(135deg, rgba(0,33,165,0.06), rgba(250,70,22,0.04))',
      border: isUrgent ? '1px solid rgba(250,70,22,0.15)' : '1px solid rgba(0,33,165,0.1)',
      borderRadius: 16, padding: '20px 24px', marginBottom: 32,
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: isUrgent
          ? 'linear-gradient(135deg, rgba(250,70,22,0.12), rgba(245,158,11,0.08))'
          : 'linear-gradient(135deg, rgba(0,33,165,0.12), rgba(250,70,22,0.08))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>{emoji}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
          {recentInterviewCompany ? 'Post-Interview Action' : staleCount > 0 ? 'Follow-Up Needed' : 'FASTIQ Insight'}
        </div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{message}</div>
        <button
          onClick={onClick}
          style={{
            marginTop: 10,
            background: isUrgent ? '#FA4616' : 'none',
            border: isUrgent ? 'none' : '1.5px solid #0021A5',
            color: isUrgent ? '#fff' : '#0021A5',
            padding: '6px 16px', borderRadius: 8,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
            transition: 'all 0.2s',
          }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}