import React from 'react';

/**
 * Contextual nudge below the pipeline when there's a big drop-off between stages.
 * E.g. "15 identified → 0 reached out"
 */
export default function PipelineNudge({ pipelineCounts, onOpenChat }) {
  const { identified = 0, reached_out = 0, replied = 0, interview = 0 } = pipelineCounts || {};

  let nudgeText = '';
  let nudgeAction = '';
  let nudgePrompt = '';
  let nudgeEmoji = '';

  if (identified >= 3 && reached_out === 0) {
    nudgeText = `You've identified ${identified} alumni but haven't reached out yet — pick one and I'll draft the message.`;
    nudgeAction = 'Draft Outreach →';
    nudgePrompt = 'Draft an outreach message to the top alumni in my pipeline';
    nudgeEmoji = '✉️';
  } else if (reached_out >= 3 && replied === 0) {
    nudgeText = `You've reached out to ${reached_out} people but no replies yet. Let me draft a follow-up for your oldest outreach.`;
    nudgeAction = 'Draft Follow-up →';
    nudgePrompt = 'Draft a follow-up message';
    nudgeEmoji = '🔄';
  } else if (replied >= 2 && interview === 0) {
    nudgeText = `${replied} alumni have replied! Time to convert those into calls. Want me to help schedule?`;
    nudgeAction = 'Prep for Call →';
    nudgePrompt = 'Help me prepare for an informational interview';
    nudgeEmoji = '📞';
  }

  if (!nudgeText) return null;

  return (
    <div style={{
      background: 'rgba(245,158,11,0.08)',
      border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: 12,
      padding: '14px 18px',
      marginTop: -20,
      marginBottom: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{nudgeEmoji}</span>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#F59E0B', margin: 0, lineHeight: 1.5 }}>
          {nudgeText}
        </p>
      </div>
      <button
        onClick={() => onOpenChat(nudgePrompt)}
        style={{
          padding: '8px 16px', borderRadius: 10, border: 'none',
          background: '#F59E0B', color: '#fff', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#D97706'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#F59E0B'; }}
      >
        {nudgeAction}
      </button>
    </div>
  );
}