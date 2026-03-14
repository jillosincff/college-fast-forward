import React, { useState } from 'react';
import { dmSans, STAGES, AVATAR_COLORS, SOURCE_LABELS, getStage, daysSince, firstName } from './PipelineConstants';
import { navigate } from '@/components/utils/navigation';

function getNextAction(conn) {
  const name = firstName(conn.alumni_name);
  const stage = conn.status;
  const days = daysSince(conn.status_date);
  const repliedDays = daysSince(conn.replied_date);

  if (stage === 'matched' && !conn.reached_out_date) {
    const matchLabel = conn.alumni_source === 'top_match' ? "They're your top match" : "They're a strong match";
    return { type: 'orange', text: `You haven't messaged ${name} yet. ${matchLabel} — FASTIQ can write it for you.`, btn: `Message ${name} →`, action: 'message' };
  }
  if (stage === 'messaged' && days !== null && days >= 7) {
    return { type: 'orange', text: `No reply from ${name} after ${days} days. Try a different approach or move on.`, btn: 'Send Follow-up →', action: 'followup' };
  }
  if (stage === 'messaged') {
    return { type: 'gray', text: `Waiting for ${name} to reply. FASTIQ will nudge you if 7 days pass with no response.`, btn: null, wait: true };
  }
  if (stage === 'replied') {
    if (repliedDays !== null && repliedDays >= 7) {
      return { type: 'red', text: `${name} replied ${repliedDays} days ago and you haven't responded. Don't let this go cold.`, btn: 'Reply Now →', action: 'reply' };
    }
    return { type: 'orange', text: `${name} replied! Schedule a coffee chat to keep the momentum.`, btn: 'Reply Now →', action: 'reply' };
  }
  if (stage === 'coffee_chat') {
    const chatDays = daysSince(conn.interview_date || conn.status_date);
    return { type: 'orange', text: `You had a coffee chat ${chatDays || 'a few'} days ago. Send a follow-up thank you to keep the connection warm.`, btn: 'Send Follow-up →', action: 'followup' };
  }
  if (stage === 'intro_made') {
    return { type: 'green', text: `${name} introduced you to ${conn.company}. Did anything come of it?`, btn: 'Mark as Won →', action: 'mark_offer' };
  }
  if (stage === 'offer') {
    return { type: 'green', text: 'Congratulations — something came of this connection. 🎉', btn: null };
  }
  return { type: 'gray', text: 'No action needed right now.', btn: null };
}

const iconColors = { orange: 'rgba(232,93,32,0.1)', red: 'rgba(229,57,53,0.1)', green: 'rgba(76,175,80,0.1)', gray: 'rgba(0,0,0,0.04)' };
const iconStrokes = { orange: '#E85D20', red: '#e53935', green: '#4CAF50', gray: '#aaa' };

function ActionIcon({ type }) {
  const bg = iconColors[type] || iconColors.gray;
  const stroke = iconStrokes[type] || '#aaa';
  let path;
  if (type === 'orange') path = <path d="M12 9v4m0 4h.01M12 3l9.5 16.5H2.5L12 3z" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (type === 'red') path = <><circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5" fill="none" /><path d="M12 8v4m0 4h.01" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" /></>;
  else if (type === 'green') path = <><circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5" fill="none" /><path d="M9 12l2 2 4-4" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>;
  else path = <><circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.5" fill="none" /><path d="M12 7v5l3 3" stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>;

  return (
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="12" height="12" viewBox="0 0 24 24">{path}</svg>
    </div>
  );
}

export default function PipelineCard({ conn, index, onUpdateStage }) {
  const [showStages, setShowStages] = useState(false);
  const stage = getStage(conn.status);
  const action = getNextAction(conn);
  const initials = (conn.alumni_name || '??').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const sourceLabel = SOURCE_LABELS[conn.alumni_source] || 'Manual';

  const needsAction = action.type === 'orange' || action.type === 'red';
  const isOverdue = action.type === 'red';
  const leftBorder = isOverdue ? '3px solid #e53935' : needsAction ? '3px solid #E85D20' : 'none';

  const dateStr = conn.status_date ? new Date(conn.status_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: needsAction ? '0 14px 14px 0' : 14,
      borderLeft: leftBorder, padding: '16px 20px', marginBottom: 8,
      transition: 'all 0.2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Main row */}
      <div className="pipeline-card-main" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: avatarBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff', flexShrink: 0,
        }}>{initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>{conn.alumni_name}</div>
          <div style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {[conn.alumni_role, conn.company].filter(Boolean).join(' · ') || 'Connection'}
          </div>
        </div>

        <div className="pipeline-card-right" style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#E85D20', opacity: 0.5 }} />
            <span style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 400, color: '#bbb' }}>{sourceLabel}</span>
          </span>
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500, padding: '3px 10px',
            borderRadius: 100, whiteSpace: 'nowrap',
            background: stage.bg, color: stage.color, border: `0.5px solid ${stage.border}`,
          }}>{stage.label}</span>
          {dateStr && <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', whiteSpace: 'nowrap' }}>{dateStr}</span>}
        </div>
      </div>

      {/* Next action row */}
      <div className="pipeline-action-row" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '0.5px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <ActionIcon type={action.type} />
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#666', lineHeight: 1.5 }}>{action.text}</span>
        </div>
        <div style={{ flexShrink: 0, marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {action.btn && action.action === 'message' ? (
            <button onClick={() => navigate('MessageComposer', { to: conn.alumni_name })} style={{
              background: '#0d1117', color: '#fff', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
              borderRadius: 100, padding: '6px 14px', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E85D20'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0d1117'; }}
            >{action.btn}</button>
          ) : action.btn && action.action === 'mark_offer' ? (
            <button onClick={() => onUpdateStage(conn.id, 'offer')} style={{
              background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
              color: '#E85D20', cursor: 'pointer', minHeight: 'auto', width: 'auto', padding: 0,
            }}>{action.btn}</button>
          ) : action.btn ? (
            <button onClick={() => navigate('MyMessages')} style={{
              background: 'none', border: 'none', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
              color: '#E85D20', cursor: 'pointer', minHeight: 'auto', width: 'auto', padding: 0,
            }}>{action.btn}</button>
          ) : action.wait ? (
            <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#aaa' }}>Waiting...</span>
          ) : null}
        </div>
      </div>

      {/* Update stage link */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        {!showStages ? (
          <button onClick={() => setShowStages(true)} style={{
            background: 'none', border: 'none', fontFamily: dmSans, fontSize: 11, fontWeight: 400,
            color: '#bbb', cursor: 'pointer', minHeight: 'auto', width: 'auto', padding: 0,
          }}>Update stage →</button>
        ) : (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {STAGES.filter(s => s.key !== 'no_response').map(s => (
              <button key={s.key} onClick={() => { onUpdateStage(conn.id, s.key); setShowStages(false); }} style={{
                fontFamily: dmSans, fontSize: 10, fontWeight: 500, padding: '3px 10px',
                borderRadius: 100, cursor: 'pointer', minHeight: 'auto', width: 'auto',
                background: conn.status === s.key ? s.bg : 'rgba(0,0,0,0.03)',
                color: conn.status === s.key ? s.color : '#888',
                border: `0.5px solid ${conn.status === s.key ? s.border : 'rgba(0,0,0,0.08)'}`,
                transition: 'all 0.15s',
              }}>{s.label}</button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:768px) {
          .pipeline-card-right { flex-wrap: wrap !important; gap: 8px !important; }
          .pipeline-action-row { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .pipeline-action-row button { width: 100% !important; text-align: center !important; }
        }
      `}</style>
    </div>
  );
}