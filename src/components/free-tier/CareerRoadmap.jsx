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

  return (
    <section>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#999', marginBottom: 12 }}>
        {summaryText}
      </p>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 8 }}>
        YOUR CAREER ROADMAP
      </p>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
        Here's exactly what you need to do.
      </h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 1.5 }}>
        Most students guess. You have a plan. Follow these six steps — in order — until you land your role.
      </p>

      <div className="space-y-4">

        <StepCard status={step1} number={1} title="Set Your Career Goals" tag="Free"
          description="Tell us your major, target industries, company size preference, and where you want to work.">
          {step1 === 'done'
            ? <CTAButton label="Update Goals →" variant="muted" onClick={() => onTabChange('career_goals')} />
            : <CTAButton label="Set My Career Goals →" variant="outline" onClick={() => onTabChange('career_goals')} />}
        </StepCard>

        <StepCard status={step2} number={2} title="Explore Companies" tag="Free"
          description="Research who's hiring in your target industries, what roles exist, and what the culture is like.">
          {step2 === 'done'
            ? <CTAButton label="View Your Industries →" variant="muted" onClick={trackCompanyView} />
            : step2 === 'in_progress'
            ? <CTAButton label="Continue Exploring →" variant="outline" onClick={trackCompanyView} />
            : <CTAButton label="Explore Company Intel →" variant="outline" onClick={trackCompanyView} />}
        </StepCard>

        <StepCard status={step3} number={3} title="Choose Your Target Companies" tag="Free"
          description="Narrow your list to 3–5 companies you're serious about. Quality over quantity — focus wins.">
          {step3 === 'done' ? (
            <div>
              <CTAButton label="Update Targets →" variant="muted" onClick={() => onTabChange('career_goals')} />
              {targetCompanies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {targetCompanies.slice(0, 5).map((c, i) => (
                    <span key={i} style={{ background: '#F5F5F5', color: '#666', fontSize: 11, padding: '2px 8px', borderRadius: 100, border: '1px solid #E0E0E0' }}>{c}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <CTAButton label="Add Target Companies →" variant="outline" onClick={() => onTabChange('career_goals')} />
          )}
        </StepCard>

        {/* Step 4 — PRIMARY conversion moment: solid orange CTA */}
        <StepCard status={step4} number={4} title="Reach Out to Alumni" tag="FastIQ"
          description={user?.career_goals?.archetype
            ? `As ${user.career_goals.archetype}, your warmest paths come through direct alumni contact. FastIQ finds the right people and writes the outreach for you.`
            : 'Find alumni at your target companies and send personalized warm outreach — the warm path that cold applications never create.'}>
          {step4 === 'locked' ? (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontStyle: 'italic', color: '#E85D20', textAlign: 'center', margin: '8px 0' }}>
                {alumniCount}+ alumni from {school} work at companies like yours. One message could change everything.
              </p>
              <div className="space-y-2 mt-3">
                <CTAButton label="Unlock FastIQ →" variant="solid" fullWidth onClick={onOpenUpgrade} />
                <CTAButton label="Ask My Parent to Activate →" variant="outline" fullWidth onClick={onOpenUpgrade} />
              </div>
            </div>
          ) : step4 === 'in_progress' ? (
            <CTAButton label={`Continue Outreach → (${pipelineCount} contacted)`} variant="solid" onClick={() => onTabChange('home')} />
          ) : step4 === 'done' ? (
            <CTAButton label="View Pipeline →" variant="muted" onClick={() => onTabChange('home')} />
          ) : (
            <CTAButton label="Find Alumni + Draft Outreach →" variant="solid" onClick={() => onTabChange('home')} />
          )}
        </StepCard>

        {/* Step 5 — secondary: outlined CTA */}
        <StepCard status={step5} number={5} title="Optimize Your Profile" tag="FastIQ"
          description="Tailor your resume for each role and get your LinkedIn profile recruiter-ready. First impressions happen before the interview.">
          {step5 === 'locked' ? (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '8px 0', lineHeight: 1.5 }}>
                FastIQ tailors your resume for each specific role — ATS-optimized and matched to the job description.
              </p>
              <div className="space-y-2 mt-3">
                <CTAButton label="Unlock FastIQ →" variant="outline" fullWidth onClick={onOpenUpgrade} />
                <button onClick={onOpenUpgrade} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#999', textDecoration: 'underline', minHeight: 'auto', padding: '4px 0', width: '100%' }}>Ask My Parent to Activate →</button>
              </div>
            </div>
          ) : (
            <CTAButton label="Tailor My Resume →" variant="solid" onClick={() => onTabChange('career_center')} />
          )}
        </StepCard>

        {/* Step 6 — tertiary: outlined CTA */}
        <StepCard status={step6} number={6} title="Follow Up & Track Everything" tag="FastIQ"
          description="Never let a conversation go cold. Track every application, every conversation, and every follow-up in your job search CRM.">
          {step6 === 'locked' ? (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '8px 0', lineHeight: 1.5 }}>
                FastIQ reminds you when to follow up and drafts the message for you — so momentum never stalls.
              </p>
              <div className="space-y-2 mt-3">
                <CTAButton label="Unlock FastIQ →" variant="outline" fullWidth onClick={onOpenUpgrade} />
                <button onClick={onOpenUpgrade} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#999', textDecoration: 'underline', minHeight: 'auto', padding: '4px 0', width: '100%' }}>Ask My Parent to Activate →</button>
              </div>
            </div>
          ) : (
            <CTAButton label="Open My Job Search CRM →" variant="solid" onClick={() => onTabChange('home')} />
          )}
        </StepCard>

      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        {hasOffer ? (
          <div>
            <p style={{ fontSize: 28, marginBottom: 4 }}>🎉</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#E85D20', margin: '0 0 4px' }}>
              You did it, {firstName}.
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: '#E85D20', margin: '0 0 8px' }}>
              Now go negotiate that offer.
            </p>
            <button onClick={() => onTabChange('home')} style={{ fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', minHeight: 'auto', padding: 0 }}>
              FastIQ can help you negotiate →
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 16, color: '#E85D20', margin: '0 0 6px' }}>
              Rinse and repeat until you find your role.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA' }}>
              Students who work through all six steps report significantly better results than those who apply cold.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}