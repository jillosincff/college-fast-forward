import React from 'react';

/**
 * "This Week's Brief" — a detailed weekly summary (different from the "Since Last Visit" banner).
 * Only shows when there's meaningful weekly data that differs from the snapshot banner.
 */
export default function WeeklyBriefCard({ stats, pipelineCounts, onOpenChat, bannerDismissed }) {
  const { alumniFound = 0, companiesScanned = 0, topSignal, opportunities = 0,
          entryLevelRoles = 0, internRoles = 0, messagesDrafted = 0 } = stats || {};
  const { identified = 0, reached_out = 0, replied = 0 } = pipelineCounts || {};

  // If no targets, show fresh-start message
  const noTargets = stats?._noTargets;
  if (noTargets) {
    return (
      <div className="fiq-animate fiq-delay-7" style={{
        background: 'linear-gradient(135deg, #0A1628, #0021A5)',
        borderRadius: 18, padding: '28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -20, width: 150, height: 150,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,70,22,0.2), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#FA4616',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          }}>📊 Weekly Brief</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Your weekly brief is waiting
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            Add target companies and FASTIQ will start working for you — scanning for roles, finding alumni, and identifying opportunities every week.
          </div>
        </div>
      </div>
    );
  }

  // Build detailed summary parts — focus on actionable weekly data
  const parts = [];
  if (alumniFound > 0) {
    const companyCount = companiesScanned || 1;
    parts.push(`${alumniFound} alumni identified across ${companyCount} compan${companyCount > 1 ? 'ies' : 'y'}`);
  }
  if (messagesDrafted > 0) parts.push(`${messagesDrafted} outreach messages drafted`);
  const studentRoles = entryLevelRoles + internRoles;
  if (topSignal && studentRoles > 0) {
    parts.push(`${topSignal} actively hiring entry-level roles`);
  } else if (topSignal) {
    parts.push(`${topSignal} moved to Hot hiring`);
  }
  if (identified > 0 || reached_out > 0 || replied > 0) {
    const pipelineParts = [];
    if (identified > 0) pipelineParts.push(`${identified} identified`);
    if (reached_out > 0) pipelineParts.push(`${reached_out} reached out`);
    if (replied > 0) pipelineParts.push(`${replied} replied`);
    const nudge = reached_out === 0 && identified > 0 ? ' (time to make a move!)' : '';
    parts.push(`Your pipeline: ${pipelineParts.join(', ')}${nudge}`);
  }

  // If banner is still visible and content is basically the same, hide weekly brief to avoid duplication
  const hasMinimalContent = parts.length <= 1;
  if (!bannerDismissed && hasMinimalContent) return null;

  // If truly nothing to show
  if (parts.length === 0) return null;

  const summary = parts.join(' · ');

  return (
    <div className="fiq-animate fiq-delay-7" style={{
      background: 'linear-gradient(135deg, #0A1628, #0021A5)',
      borderRadius: 18, padding: '28px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -30, right: -20, width: 150, height: 150,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,70,22,0.2), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: '#FA4616',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
        }}>📊 This Week's Brief</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Here's what happened this week
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          {summary}
        </div>
        <button
          onClick={() => onOpenChat('Show me my full weekly brief — what happened with my targets this week?')}
          style={{
            marginTop: 18, background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', minHeight: 'auto', transition: 'all 0.2s',
          }}
        >
          View Detailed Brief →
        </button>
      </div>
    </div>
  );
}