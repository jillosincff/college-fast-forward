import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';

/**
 * SECTION 2 — YOUR NEXT STEPS
 * Shows 1-3 personalized, priority-ordered action items.
 * Every card has a clear action button.
 */

function StepCard({ emoji, title, description, actions }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
      padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14,
      transition: 'all 0.15s',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: '#F8FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: '0 0 3px' }}>{title}</p>
        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 10px', lineHeight: 1.5 }}>{description}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none',
                background: i === 0 ? '#0021A5' : '#F1F5F9',
                color: i === 0 ? '#fff' : '#475569',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NextStepsSection({ profile, pipelineCounts, pipelineData, onOpenChat, onAddTargets }) {
  const [staleContacts, setStaleContacts] = useState([]);

  useEffect(() => {
    if (!profile?.user_email) return;
    base44.entities.NetworkingPipeline.filter(
      { user_email: profile.user_email, status: 'reached_out' }, '-reached_out_date', 20
    ).then(data => {
      const stale = (data || []).filter(p => {
        if (!p.reached_out_date) return false;
        const days = (Date.now() - new Date(p.reached_out_date).getTime()) / (1000 * 60 * 60 * 24);
        return days >= 3;
      });
      setStaleContacts(stale);
    }).catch(() => {});
  }, [profile?.user_email]);

  const hasResume = !!profile?.resume_text;
  const targetCount = profile?.target_companies?.length || 0;
  const identified = pipelineCounts?.identified || 0;
  const reachedOut = pipelineCounts?.reached_out || 0;

  // Find unresearched companies
  const targetCompanies = (profile?.target_companies || []).map(c => titleCase(c));
  const companiesResearched = profile?.companies_researched || 0;
  const unresearchedCompanies = targetCompanies.length > companiesResearched
    ? targetCompanies.slice(companiesResearched)
    : [];

  // Build priority-ordered steps (show top 2-3)
  const steps = [];

  // Priority 1: Stale follow-ups
  if (staleContacts.length > 0) {
    const contact = staleContacts[0];
    const daysSince = Math.round((Date.now() - new Date(contact.reached_out_date).getTime()) / (1000 * 60 * 60 * 24));
    steps.push({
      emoji: '📬',
      title: `Time to follow up with ${contact.alumni_name}`,
      description: `You messaged ${contact.alumni_name} at ${titleCase(contact.company)} ${daysSince} days ago — a well-timed follow-up can double your response rate.${staleContacts.length > 1 ? ` (${staleContacts.length - 1} more waiting)` : ''}`,
      actions: [
        { label: 'Draft Follow-Up →', onClick: () => onOpenChat(`Draft a follow-up message to ${contact.alumni_name} at ${contact.company}`) },
      ],
    });
  }

  // Priority 2: Alumni identified but not contacted
  if (identified > 0 && steps.length < 3) {
    const firstIdentified = (pipelineData || []).find(p => p.status === 'identified');
    const name = firstIdentified ? firstIdentified.alumni_name : 'an alumni';
    const company = firstIdentified ? titleCase(firstIdentified.company) : 'your targets';
    steps.push({
      emoji: '✉️',
      title: `${identified} alumni identified — time to reach out`,
      description: `You have ${identified} alumni in your pipeline who haven't been contacted yet. Pick one — I'll draft the message.`,
      actions: [
        { label: `Message ${name} →`, onClick: () => onOpenChat(`Draft an outreach message to ${name} at ${company}`) },
        ...(identified > 1 ? [{ label: 'Choose Alumni', onClick: () => onOpenChat('Show me my identified alumni so I can pick who to message') }] : []),
      ],
    });
  }

  // Priority 3: Unresearched targets
  if (unresearchedCompanies.length > 0 && steps.length < 3) {
    const topTwo = unresearchedCompanies.slice(0, 2);
    steps.push({
      emoji: '🔍',
      title: `${topTwo.join(' and ')} haven't been researched yet`,
      description: `Let's see if they're hiring and find UF alumni who can open doors.`,
      actions: topTwo.map(c => ({
        label: `Research ${c} →`,
        onClick: () => onOpenChat(`Research ${c}`),
      })),
    });
  }

  // Priority 4: No resume
  if (!hasResume && steps.length < 3) {
    steps.push({
      emoji: '📄',
      title: 'Upload your resume to unlock smarter matches',
      description: 'Your resume powers tailored applications, personalized outreach, and smarter interview prep.',
      actions: [
        { label: 'Upload Resume →', onClick: () => onOpenChat('Help me upload my resume') },
        { label: 'Build One With Me →', onClick: () => onOpenChat('Help me build a resume') },
      ],
    });
  }

  // Priority 5: Resume not tailored
  if (hasResume && steps.length < 3) {
    // Check if any tailored resumes exist — we assume no if companies researched but no tailored
    steps.push({
      emoji: '✨',
      title: 'Tailor your resume for a specific role',
      description: 'Find a role that interests you and I\'ll customize your resume to match the job description.',
      actions: [
        { label: 'Tailor for a Job →', onClick: () => onOpenChat('Tailor my resume for a new role') },
      ],
    });
  }

  // Priority 6: No targets
  if (targetCount === 0 && steps.length < 3) {
    steps.push({
      emoji: '🎯',
      title: 'Add target companies to get started',
      description: 'FASTIQ will scan for openings, find alumni, and build your personalized action plan.',
      actions: [
        { label: 'Add Targets →', onClick: onAddTargets },
      ],
    });
  }

  // Priority 7: General encouragement (only if nothing else)
  if (steps.length === 0) {
    steps.push({
      emoji: '🚀',
      title: 'You\'re making great progress!',
      description: 'Keep building momentum — explore career paths or prep for an upcoming interview.',
      actions: [
        { label: 'Explore Careers →', onClick: () => onOpenChat('Explore career paths for my major') },
        { label: 'Interview Prep →', onClick: () => onOpenChat('Prep me for an interview') },
      ],
    });
  }

  // Take top 3
  const visibleSteps = steps.slice(0, 3);

  return (
    <div className="fiq-animate fiq-delay-2" style={{ marginBottom: 28 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#334155',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        🎯 Your Next Steps
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleSteps.map((step, i) => (
          <StepCard key={i} {...step} />
        ))}
      </div>
    </div>
  );
}