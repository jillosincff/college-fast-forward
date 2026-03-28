import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const isFastIQ = (user) =>
  !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

function useRoadmapState(user) {
  const [pipelineCount, setPipelineCount] = useState(0);
  const [resumeCount, setResumeCount] = useState(0);
  const [hasOffer, setHasOffer] = useState(false);
  const fastiq = isFastIQ(user);

  useEffect(() => {
    if (!fastiq || !user?.email) return;
    Promise.all([
      base44.entities.NetworkingPipeline.filter({ user_email: user.email }),
      base44.entities.TailoredResume.filter({ user_email: user.email }),
    ]).then(([pipeline, resumes]) => {
      setPipelineCount(pipeline?.length || 0);
      setResumeCount(resumes?.length || 0);
      setHasOffer(pipeline?.some(p => p.status === 'offer') || false);
    }).catch(() => {});
  }, [user?.email, fastiq]);

  const goals = user?.career_goals;
  const targetCompanies = goals?.target_companies || user?.target_companies || [];
  const industries = goals?.industries || user?.target_industries || [];
  const goalsSaved = !!(goals?.saved_at);

  let step1 = 'not_started';
  if (goalsSaved) {
    const hasAll = goals.role && industries.length > 0 && (targetCompanies.length > 0 || goals.companies_skipped);
    step1 = hasAll ? 'done' : 'in_progress';
  }

  const companyViews = parseInt(typeof window !== 'undefined' ? (localStorage.getItem('cff_company_views') || '0') : '0');
  let step2 = 'not_started';
  if (companyViews >= 3) step2 = 'done';
  else if (companyViews >= 1) step2 = 'in_progress';

  let step3 = 'not_started';
  if (targetCompanies.length >= 3) step3 = 'done';
  else if (targetCompanies.length >= 1) step3 = 'in_progress';

  let step4 = fastiq ? (pipelineCount === 0 ? 'not_started' : pipelineCount >= targetCompanies.length && targetCompanies.length > 0 ? 'done' : 'in_progress') : 'locked';
  let step5 = fastiq ? (resumeCount === 0 ? 'not_started' : 'in_progress') : 'locked';
  let step6 = fastiq ? (pipelineCount === 0 ? 'not_started' : hasOffer ? 'done' : 'in_progress') : 'locked';

  const allStatuses = [step1, step2, step3, step4, step5, step6];
  const completedCount = allStatuses.filter(s => s === 'done').length;

  return { step1, step2, step3, step4, step5, step6, completedCount, targetCompanies, pipelineCount, resumeCount, hasOffer, fastiq };
}

function StepCircle({ status, number }) {
  if (status === 'done') return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <CheckCircle2 style={{ width: 16, height: 16, color: '#fff' }} />
    </div>
  );
  if (status === 'locked') return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0F0F0', border: '2px solid #CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 14 }}>🔒</span>
    </div>
  );
  if (status === 'in_progress') return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #E85D20', background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#E85D20' }}>{number}</span>
    </div>
  );
  return (
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #CCCCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#AAAAAA' }}>{number}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    done:        { label: 'Done ✓',            bg: '#DCFCE7', color: '#15803D' },
    in_progress: { label: 'In Progress',        bg: '#FFF5F0', color: '#E85D20' },
    not_started: { label: 'Not Started',        bg: '#F5F5F5', color: '#999999' },
    locked:      { label: 'Requires FastIQ 🔒', bg: '#1A1A1A', color: '#ffffff' },
  }[status] || {};
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0 }}>
      {cfg.label}
    </span>
  );
}

function CTAButton({ label, onClick, variant = 'outline', fullWidth = false }) {
  const base = { fontSize: 13, fontWeight: 600, borderRadius: 100, padding: '8px 18px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s', display: 'inline-block' };
  const solid   = { ...base, background: '#E85D20', color: '#fff', border: 'none' };
  const outline = { ...base, background: 'transparent', color: '#E85D20', border: '1.5px solid #E85D20' };
  const muted   = { ...base, background: 'none', border: 'none', color: '#999', textDecoration: 'underline', padding: '4px 0', fontSize: 12 };
  const style = { ...(variant === 'solid' ? solid : variant === 'muted' ? muted : outline) };
  if (fullWidth) style.width = '100%';
  return <button style={style} onClick={onClick}>{label}</button>;
}

function StepCard({ status, number, title, tag, description, children }) {
  const isLocked = status === 'locked';
  const isDone = status === 'done';
  const lineColor = isDone ? '#E85D20' : '#E0E0E0';

  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 16, flexShrink: 0 }}>
        <StepCircle status={status} number={number} />
        {number < 6 && (
          <div style={{ width: 2, flex: 1, minHeight: 16, background: lineColor, marginTop: 4 }} />
        )}
      </div>
      <div style={{ flex: 1, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: 16, marginBottom: 0, opacity: isLocked ? 0.92 : 1 }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{title}</p>
              <span style={{ fontSize: 10, fontWeight: 600, color: tag === 'Free' ? '#22C55E' : '#E85D20', background: tag === 'Free' ? '#DCFCE7' : '#FFF5F0', padding: '1px 7px', borderRadius: 100, letterSpacing: '0.05em' }}>
                {tag}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0', lineHeight: 1.5 }}>{description}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}

export default function CareerRoadmap({ user, onTabChange, onOpenUpgrade }) {
  const { step1, step2, step3, step4, step5, step6, completedCount, targetCompanies, pipelineCount, hasOffer } = useRoadmapState(user);
  const firstName = user?.full_name?.split(' ')[0] || 'You';
  const school = user?.school || user?.university || 'your school';
  const alumniCount = targetCompanies.length > 0 ? targetCompanies.length * 4 : 12;

  const allStatuses = [step1, step2, step3, step4, step5, step6];
  const nextActionable = allStatuses.map((s, i) => ({ s, i })).find(({ s }) => s !== 'done' && s !== 'locked');
  const stepTitles = ['Set Your Career Goals', 'Explore Companies', 'Choose Your Targets', 'Reach Out to Alumni', 'Optimize Your Profile', 'Follow Up & Track Everything'];

  const summaryText = completedCount === 0
    ? 'Your roadmap is ready. Step 1 starts now.'
    : nextActionable
    ? `You're on Step ${nextActionable.i + 1} of 6. ${stepTitles[nextActionable.i]}.`
    : `${completedCount} of 6 steps complete. Keep going.`;

  const trackCompanyView = () => {
    const curr = parseInt(localStorage.getItem('cff_company_views') || '0');
    localStorage.setItem('cff_company_views', String(curr + 1));
    onTabChange('company_intel');
  };

  const completedSteps = {
    1: !!(user?.career_goals?.target_roles?.length > 0),
    2: !!user?.resume_url,
    3: !!user?.company_intel_viewed,
    4: !!user?.alumni_search_used,
    5: !!user?.leads_viewed,
    6: fastiq,
  };

  const hasGoals = completedSteps[1];

  const unlockedSteps = {
    1: true,
    2: hasGoals,
    3: hasGoals,
    4: hasGoals,
    5: hasGoals,
    6: fastiq,
  };

  const currentStep = parseInt(Object.entries(completedSteps).find(([_, done]) => !done)?.[0] || '6');

  const upNextSteps = [
    { n: 2, label: 'Upload & Optimize Your Resume', tag: 'Free', tabKey: 'career_center' },
    { n: 3, label: 'Research Companies & Industries', tag: 'Free', tabKey: 'company_intel' },
    { n: 4, label: 'Find Alumni at Target Companies', tag: 'Free · 1 search', tabKey: 'alumni_search' },
    { n: 5, label: 'Get Matched with CFF Connections', tag: 'Free', tabKey: 'directory' },
    { n: 6, label: 'Draft Outreach & Track Replies', tag: 'FastIQ', tabKey: null },
  ];

  return (
    <section>
      {/* Soft intro */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, color: '#555',
          lineHeight: 1.7, margin: 0
        }}>
          Most students apply to 50 jobs and hear nothing back. That's not a you problem —
          it's a strategy problem. Here's your plan. Work through it in order.
        </p>
      </div>

      {/* Step 1 — Active hero card */}
      <div style={{
        background: '#fff',
        border: currentStep === 1 ? '2px solid #E85D20' : '1px solid #E0E0E0',
        borderRadius: 16,
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: completedSteps[1] ? '#22C55E' : '#E85D20',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, flexShrink: 0,
          fontFamily: "'DM Sans', sans-serif"
        }}>
          {completedSteps[1] ? '✓' : '1'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
              Set Your Career Goals
            </p>
            <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.05em' }}>FREE</span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: '0 0 16px', lineHeight: 1.6 }}>
            Takes 3 minutes. Tell us what you're studying, where you want to work,
            and what's holding you back. We'll build your plan around it.
          </p>
          <button
            onClick={() => onTabChange('career_goals')}
            style={{
              background: completedSteps[1] ? 'transparent' : '#E85D20',
              border: completedSteps[1] ? '1.5px solid #E85D20' : 'none',
              borderRadius: 10,
              padding: '12px 28px', fontSize: 14, fontWeight: 600,
              color: completedSteps[1] ? '#E85D20' : '#fff',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              minHeight: 'auto',
            }}
          >
            {completedSteps[1] ? 'Update Goals →' : "Let's do it →"}
          </button>
        </div>
      </div>

      {/* Up next — dimmed/clickable steps */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, color: '#AAAAAA',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          margin: '0 0 12px', fontWeight: 600
        }}>
          Up next — unlocks as you go
        </p>
        {upNextSteps.map(step => {
          const isCompleted = completedSteps[step.n];
          const isUnlocked = unlockedSteps[step.n];
          const isLocked = !isUnlocked;
          return (
            <div
              key={step.n}
              onClick={() => isUnlocked && step.tabKey && onTabChange(step.tabKey)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 0',
                borderBottom: '1px solid #F0F0F0',
                opacity: isLocked ? 0.35 : 1,
                cursor: isUnlocked && step.tabKey ? 'pointer' : 'default',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isCompleted ? '#E85D20' : '#F0F0F0',
                color: isCompleted ? '#fff' : '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
                fontFamily: "'DM Sans', sans-serif"
              }}>
                {isCompleted ? '✓' : step.n}
              </div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: isLocked ? '#AAAAAA' : isCompleted ? '#888' : '#1A1A1A',
                margin: 0, flex: 1,
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}>
                {step.label}
              </p>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: step.tag === 'FastIQ' ? '#E85D20' : '#22C55E',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'nowrap',
                opacity: isLocked ? 0.5 : 1,
              }}>
                {step.tag}
              </span>
            </div>
          );
        })}
      </div>

      {hasOffer && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <p style={{ fontSize: 28, marginBottom: 4 }}>🎉</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#E85D20', margin: '0 0 4px' }}>
            You did it, {firstName}.
          </p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: '#E85D20', margin: '0 0 8px' }}>
            Now go negotiate that offer.
          </p>
        </div>
      )}
    </section>
  );
}