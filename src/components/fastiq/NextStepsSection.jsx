import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';

/**
 * SECTION 2 — YOUR NEXT STEPS
 * Alumni discovery is the #1 hero action. Finding PEOPLE is FASTIQ's superpower.
 * Shows 2-3 numbered, priority-ordered action items.
 */

function guessDomain(name) {
  const map = { 'amazon': 'amazon.com', 'google': 'google.com', 'meta': 'meta.com', 'apple': 'apple.com', 'microsoft': 'microsoft.com', 'salesforce': 'salesforce.com', 'netflix': 'netflix.com', 'adobe': 'adobe.com', 'spotify': 'spotify.com', 'tesla': 'tesla.com', 'nike': 'nike.com', 'disney': 'disney.com', 'airbnb': 'airbnb.com', 'uber': 'uber.com', 'deloitte': 'deloitte.com', 'jpmorgan': 'jpmorgan.com', 'goldman sachs': 'goldmansachs.com', 'nvidia': 'nvidia.com' };
  const lower = (name || '').toLowerCase();
  return map[lower] || `${lower.replace(/[^a-z0-9]/g, '')}.com`;
}

/* ─── HERO CARD: Alumni Discovery (Step 1) ─── */
function AlumniHeroCard({ targetCompanies, onOpenChat }) {
  const names = targetCompanies.slice(0, 3).join(', ');
  const allLabel = targetCompanies.length > 1
    ? `Find Alumni at All ${targetCompanies.length} Companies →`
    : `Find Alumni at ${targetCompanies[0]} →`;
  const firstCompany = targetCompanies[0];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F4FA 100%)',
      borderRadius: 14, border: '1px solid #BFDBFE', borderLeft: '5px solid #0021A5',
      padding: '22px 22px', display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#0021A5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0, marginTop: 2,
      }}>
        🎓
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: '#0021A5',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>1</span>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Find UF alumni at {names}
          </p>
        </div>
        <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 14px', lineHeight: 1.6 }}>
          One warm intro is worth more than 100 cold applications. Let's find people at your target companies who share your UF connection.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenChat(`Find UF alumni at all my target companies: ${targetCompanies.join(', ')}`)}
            style={{
              padding: '13px 18px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #0021A5 0%, #1a3a8f 100%)',
              color: '#fff', fontSize: 15, fontWeight: 800,
              cursor: 'pointer', minHeight: 'auto', width: '100%',
              boxShadow: '0 4px 16px rgba(0,33,165,0.35)',
              textAlign: 'center', letterSpacing: '0.01em',
            }}
          >
            Find My Warm Intros →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── HERO CARD: Alumni Found — show inline list ─── */
function AlumniFoundCard({ alumni, totalCount, onOpenChat }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? alumni : alumni.slice(0, 5);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F4FA 100%)',
      borderRadius: 14, border: '1px solid #BFDBFE', borderLeft: '5px solid #0021A5',
      padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', background: '#0021A5',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>1</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
          🎓 Your Warm Intros — {totalCount} UF Alumni Found
        </span>
      </div>
      <p style={{ fontSize: 12, color: '#475569', margin: '0 0 12px 32px', lineHeight: 1.5 }}>
        These UF alumni work at your target companies. Each one is a warm path in — no cold applications needed.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visible.map((a, i) => (
          <div key={a.id || i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0',
          }}>
            <img
              src={`https://logo.clearbit.com/${guessDomain(a.company)}`}
              alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'contain', background: '#F1F5F9' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.name || a.alumni_name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>
                  {a.role_title || a.alumni_role} at {titleCase(a.company)}
                </span>
                {a.greek_organization && (
                  <span style={{ fontSize: 10, color: '#8B5CF6', fontWeight: 600 }}>🏛️ {a.greek_organization}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => onOpenChat(`Draft a message to ${a.name || a.alumni_name} at ${a.company}`)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: '#0021A5', color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              Draft Intro →
            </button>
          </div>
        ))}
      </div>
      {totalCount > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: '#0021A5', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 0' }}
        >
          See all {totalCount} alumni →
        </button>
      )}
    </div>
  );
}

/* ─── HERO CARD: All scanned, alumni identified but not contacted ─── */
function AlumniOutreachNudgeCard({ identifiedCount, onOpenChat }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F4FA 100%)',
      borderRadius: 14, border: '1px solid #BFDBFE', borderLeft: '5px solid #0021A5',
      padding: '22px 22px', display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#0021A5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0, marginTop: 2,
      }}>
        🎓
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: '#0021A5',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
          }}>1</span>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {identifiedCount} warm intros waiting — time to reach out
          </p>
        </div>
        <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 14px', lineHeight: 1.6 }}>
          The hardest part is the first message. Pick someone and I'll draft a warm, personalized intro for you — no cold applications needed.
        </p>
        <button
          onClick={() => onOpenChat('Show me my identified alumni so I can pick who to message')}
          style={{
            padding: '9px 18px', borderRadius: 10, border: 'none',
            background: '#0021A5', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', minHeight: 'auto',
            boxShadow: '0 2px 8px rgba(0,33,165,0.25)',
          }}
        >
          Choose an Alumni & Draft Intro →
        </button>
      </div>
    </div>
  );
}

/* ─── Standard step card for steps 2, 3 ─── */
function StepCard({ stepNumber, emoji, title, description, actions }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
      padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: '#0021A5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0, marginTop: 2,
      }}>
        {stepNumber}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{emoji}</span> {title}
        </p>
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
                whiteSpace: 'nowrap',
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

export default function NextStepsSection({ profile, pipelineCounts, pipelineData, companyIntel, alumniData, onOpenChat, onAddTargets }) {
  const [staleContacts, setStaleContacts] = useState([]);

  useEffect(() => {
    if (!profile?.user_email) return;
    base44.entities.NetworkingPipeline.filter(
      { user_email: profile.user_email, status: 'reached_out' }, '-reached_out_date', 20
    ).then(data => {
      const stale = (data || []).filter(p => {
        if (!p.reached_out_date) return false;
        return (Date.now() - new Date(p.reached_out_date).getTime()) / (1000 * 60 * 60 * 24) >= 3;
      });
      setStaleContacts(stale);
    }).catch(() => {});
  }, [profile?.user_email]);

  const hasResume = !!profile?.resume_text;
  const targetCount = profile?.target_companies?.length || 0;
  const identified = pipelineCounts?.identified || 0;
  const reachedOut = pipelineCounts?.reached_out || 0;
  const targetCompanies = (profile?.target_companies || []).map(c => titleCase(c));

  // Determine unresearched companies
  const unresearchedCompanies = targetCompanies.filter(c => {
    const intel = companyIntel ? companyIntel[c.toLowerCase()] : null;
    return !intel;
  });

  // Alumni at current targets (from pipeline identified + from discovered alumni data)
  const alumniAtTargets = alumniData || [];
  const totalAlumniFound = alumniAtTargets.length;
  const allTargetsScanned = targetCount > 0 && unresearchedCompanies.length === 0;

  // ─── Determine Step 1 (Alumni Hero) ───
  let heroCard = null;

  if (targetCount === 0) {
    // No targets yet
    heroCard = null; // handled below as a regular step
  } else if (totalAlumniFound > 0 && identified === 0 && reachedOut === 0) {
    // Alumni found but all already contacted or none in pipeline "identified" — show found list
    heroCard = <AlumniFoundCard alumni={alumniAtTargets} totalCount={totalAlumniFound} onOpenChat={onOpenChat} />;
  } else if (identified > 0) {
    // Alumni in pipeline waiting to be contacted
    heroCard = <AlumniOutreachNudgeCard identifiedCount={identified} onOpenChat={onOpenChat} />;
  } else if (totalAlumniFound > 0) {
    // Alumni found — show them
    heroCard = <AlumniFoundCard alumni={alumniAtTargets} totalCount={totalAlumniFound} onOpenChat={onOpenChat} />;
  } else {
    // Targets exist but no alumni found yet — prompt to scan
    heroCard = <AlumniHeroCard targetCompanies={targetCompanies} onOpenChat={onOpenChat} />;
  }

  // ─── Build secondary steps (steps 2-3) ───
  const secondarySteps = [];

  // Stale follow-ups
  if (staleContacts.length > 0 && secondarySteps.length < 2) {
    const contact = staleContacts[0];
    const daysSince = Math.round((Date.now() - new Date(contact.reached_out_date).getTime()) / (1000 * 60 * 60 * 24));
    secondarySteps.push({
      emoji: '📬',
      title: `Follow up with ${contact.alumni_name} at ${titleCase(contact.company)}`,
      description: `You messaged them ${daysSince} days ago — a follow-up can double your response rate.${staleContacts.length > 1 ? ` (${staleContacts.length - 1} more waiting)` : ''}`,
      actions: [{ label: 'Draft Follow-Up →', onClick: () => onOpenChat(`Draft a follow-up message to ${contact.alumni_name} at ${contact.company}`) }],
    });
  }

  // Unresearched targets
  if (unresearchedCompanies.length > 0 && secondarySteps.length < 2) {
    const topTwo = unresearchedCompanies.slice(0, 2);
    secondarySteps.push({
      emoji: '🔍',
      title: `Research ${topTwo.join(' and ')} to see if they're hiring entry-level roles`,
      description: `Scan for openings and hiring signals at ${topTwo.length > 1 ? 'these companies' : 'this company'}.`,
      actions: topTwo.map(c => ({ label: `Research ${c} →`, onClick: () => onOpenChat(`Research ${c}`) })),
    });
  }

  // No resume
  if (!hasResume && secondarySteps.length < 2) {
    secondarySteps.push({
      emoji: '📄',
      title: 'Upload your resume to unlock smarter matches',
      description: 'Your resume powers tailored applications, personalized outreach, and interview prep.',
      actions: [
        { label: 'Upload Resume →', onClick: () => onOpenChat('Help me upload my resume') },
        { label: 'Build One With Me →', onClick: () => onOpenChat('Help me build a resume') },
      ],
    });
  }

  // Tailor resume
  if (hasResume && secondarySteps.length < 2) {
    secondarySteps.push({
      emoji: '📄',
      title: 'Tailor your resume for a specific role',
      description: 'Find a role that interests you and I\'ll customize your resume to match the job description.',
      actions: [{ label: 'Tailor for a Job →', onClick: () => onOpenChat('Tailor my resume for a new role') }],
    });
  }

  // General encouragement
  if (!heroCard && secondarySteps.length === 0) {
    // No targets — show add targets as the only step
    if (targetCount === 0) {
      secondarySteps.push({
        emoji: '🎯',
        title: 'Add target companies to get started',
        description: 'FASTIQ will find UF alumni, scan for openings, and build your personalized action plan.',
        actions: [{ label: 'Add Targets →', onClick: onAddTargets }],
      });
    } else {
      secondarySteps.push({
        emoji: '🚀',
        title: 'You\'re making great progress!',
        description: 'Explore career paths or prep for an upcoming interview.',
        actions: [
          { label: 'Explore Careers →', onClick: () => onOpenChat('Explore career paths for my major') },
          { label: 'Interview Prep →', onClick: () => onOpenChat('Prep me for an interview') },
        ],
      });
    }
  }

  return (
    <div className="fiq-animate fiq-delay-2" style={{
      marginBottom: 28, background: '#F0F4FA',
      borderRadius: 16, padding: '20px 18px', border: '1px solid #E2E8F0',
    }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: '#334155',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        🎯 Your Next Steps
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Step 1: Alumni Hero Card */}
        {heroCard}

        {/* No-targets fallback when heroCard is null */}
        {!heroCard && targetCount === 0 && secondarySteps.length > 0 && (
          <StepCard stepNumber={1} {...secondarySteps[0]} />
        )}

        {/* Steps 2-3 */}
        {(heroCard ? secondarySteps : secondarySteps.slice(1)).map((step, i) => {
          const base = (heroCard || targetCount === 0) ? 2 : 2;
          return <StepCard key={i} stepNumber={base + i} {...step} />;
        })}
      </div>
    </div>
  );
}