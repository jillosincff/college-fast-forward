import React, { useState } from 'react';
import moment from 'moment';

const dmSans = "'DM Sans', system-ui, sans-serif";

function formatIndustry(val) {
  if (!val || val === '' || val === null) return null;
  return val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getQuestionText(req) {
  const text = req.description || req.questionText || req.title || req.role || '';
  if (!text) return null;
  const trimmed = text.slice(0, 120);
  return `"${trimmed}${text.length > 120 ? '...' : ''}"`;
}

export default function RequestCard({ request, index, onEdit, onDelete, onRenew, onViewResponses }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status = request.status || 'active';
  const isActive = status === 'active';
  const isExpired = status === 'expired' || status === 'closed';

  const replyCount = request.answer_count || request.response_count || request.messages_count || request.comments_count || 0;
  const viewCount = request.view_count || request.views_count || 0;
  const questionText = getQuestionText(request);
  const industry = formatIndustry(request.industry || request.target_industry);
  const postedAgo = moment(request.created_date).fromNow();

  const leftBorder = isActive ? '3px solid #4CAF50' : '3px solid rgba(0,0,0,0.15)';

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(request.id, request);
  };

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: isActive || isExpired ? '0 14px 14px 0' : 14,
      borderLeft: leftBorder, padding: '20px 22px',
      transition: 'border-color 0.2s, transform 0.2s, opacity 0.25s',
      opacity: deleting ? 0 : 1, transform: deleting ? 'translateY(-8px)' : 'none',
      animation: `pipelineFadeUp 0.4s ease ${0.08 + index * 0.04}s both`,
    }}
      onMouseEnter={e => { if (!deleting) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { if (!deleting) { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; } }}
    >
      {/* Top row */}
      <div className="req-card-top" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
          {/* Status + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {isActive && (
              <span style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
                background: 'rgba(76,175,80,0.08)', color: '#2e7d32', border: '0.5px solid rgba(76,175,80,0.2)',
              }}>Active</span>
            )}
            {isExpired && (
              <span style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100,
                background: 'rgba(0,0,0,0.04)', color: '#aaa', border: '0.5px solid rgba(0,0,0,0.1)',
              }}>Expired</span>
            )}
            <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb' }}>Posted {postedAgo}</span>
          </div>

          {/* Question text */}
          {questionText ? (
            <p style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.6, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{questionText}</p>
          ) : (
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#aaa', fontStyle: 'italic', margin: 0 }}>
              Question content unavailable — Edit to add your question.
            </p>
          )}

          {/* Industry */}
          {industry && (
            <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#aaa', display: 'block', marginTop: 6 }}>
              Industry: {industry}
            </span>
          )}

          {/* Expiry notice */}
          {isExpired && (
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', fontStyle: 'italic', marginTop: 6, marginBottom: 0 }}>
              This request expired. Renew it to make it visible to the network again.
            </p>
          )}
        </div>

        {/* Right — action buttons */}
        <div className="req-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          {replyCount > 0 && (
            <button onClick={() => onViewResponses(request)} style={{
              background: 'rgba(232,93,32,0.08)', border: '0.5px solid rgba(232,93,32,0.2)',
              color: '#E85D20', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
              borderRadius: 100, padding: '6px 14px', cursor: 'pointer', transition: 'background 0.2s',
              minHeight: 'auto', width: 'auto', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,93,32,0.08)'; }}
            >View {replyCount} Response{replyCount !== 1 ? 's' : ''}</button>
          )}
          <button onClick={() => onEdit(request)} style={{
            background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
            color: '#888', fontFamily: dmSans, fontSize: 12, fontWeight: 400,
            borderRadius: 100, padding: '6px 14px', cursor: 'pointer', transition: 'all 0.2s',
            minHeight: 'auto', width: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#555'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#888'; }}
          >Edit</button>
          {isExpired && (
            <button onClick={() => onRenew(request)} style={{
              background: '#E85D20', border: 'none', color: '#fff',
              fontFamily: dmSans, fontSize: 12, fontWeight: 500,
              borderRadius: 100, padding: '6px 14px', cursor: 'pointer', transition: 'background 0.2s',
              minHeight: 'auto', width: 'auto',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
            >Renew</button>
          )}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{
              background: 'none', border: 'none', color: '#ccc',
              fontFamily: dmSans, fontSize: 12, fontWeight: 400, cursor: 'pointer',
              transition: 'color 0.2s', minHeight: 'auto', width: 'auto', padding: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e53935'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#ccc'; }}
            >Delete</button>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: '#888' }}>Sure?</span>
              <button onClick={handleDelete} style={{
                background: 'none', border: 'none', color: '#e53935', fontFamily: dmSans, fontSize: 12,
                fontWeight: 500, cursor: 'pointer', minHeight: 'auto', width: 'auto', padding: 0,
              }}>Delete</button>
              <button onClick={() => setConfirmDelete(false)} style={{
                background: 'none', border: 'none', color: '#aaa', fontFamily: dmSans, fontSize: 12,
                fontWeight: 400, cursor: 'pointer', minHeight: 'auto', width: 'auto', padding: 0,
              }}>Cancel</button>
            </span>
          )}
        </div>
      </div>

      {/* Bottom row — stats */}
      {(replyCount > 0 || viewCount > 0) && (
        <div className="req-card-bottom" style={{
          display: 'flex', alignItems: 'center', gap: 20, paddingTop: 12,
          borderTop: '0.5px solid rgba(0,0,0,0.05)', flexWrap: 'wrap',
        }}>
          {replyCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E85D20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#E85D20' }}>
                {replyCount} response{replyCount !== 1 ? 's' : ''}
              </span>
            </span>
          )}
          {viewCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#bbb' }}>{viewCount} views</span>
            </span>
          )}
        </div>
      )}

      <style>{`
        @media(max-width:768px) {
          .req-card-top { flex-direction: column !important; }
          .req-card-actions { margin-top: 12px !important; flex-wrap: wrap !important; gap: 6px !important; }
          .req-card-bottom { flex-wrap: wrap !important; }
        }
      `}</style>
    </div>
  );
}