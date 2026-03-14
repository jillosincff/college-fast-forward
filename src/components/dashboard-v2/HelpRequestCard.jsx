import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const dmSans = "'DM Sans', system-ui, sans-serif";

function SectionHeader({ title, actionText, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>{title}</span>
      {actionText && (
        <span
          onClick={onAction}
          style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20', cursor: 'pointer', transition: 'opacity 0.2s', minHeight: 'auto', width: 'auto' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >{actionText}</span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '28px 24px',
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#aaa', marginBottom: 4 }}>
        You haven't posted a help request yet.
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#bbb', marginBottom: 16 }}>
        Ask the network anything — career advice, industry questions, intro requests.
      </p>
      <button
        onClick={() => navigate('PostRequest')}
        style={{
          background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 13, fontWeight: 500,
          borderRadius: 100, padding: '10px 20px', border: 'none', cursor: 'pointer', transition: 'background 0.2s',
          display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 'auto', width: 'auto',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
      >Post a Help Request →</button>
    </div>
  );
}

export default function HelpRequestCard({ helpRequest, user }) {
  const [latestReply, setLatestReply] = useState(null);
  const [replyCount, setReplyCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!helpRequest) return;
    loadReplies();
  }, [helpRequest?.id]);

  const loadReplies = async () => {
    if (!helpRequest?.id) return;
    const isJob = helpRequest.role !== undefined;
    try {
      if (isJob) {
        const answers = await base44.entities.JobAnswer.filter({ job_request_id: helpRequest.id }, '-created_date', 50);
        setReplyCount(answers?.length || 0);
        if (answers?.[0]) setLatestReply(answers[0]);
      } else {
        const answers = await base44.entities.Answer.filter({ question_id: helpRequest.id }, '-created_date', 50);
        setReplyCount(answers?.length || 0);
        if (answers?.[0]) setLatestReply(answers[0]);
      }
    } catch { /* non-critical */ }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try {
      const isJob = helpRequest.role !== undefined;
      if (isJob) await base44.entities.JobRequest.delete(helpRequest.id);
      else await base44.entities.HelpRequest.delete(helpRequest.id);
      window.location.reload();
    } catch { /* non-critical */ }
  };

  const isJob = helpRequest?.role !== undefined;
  const questionText = helpRequest?.description || '';
  const postedAgo = helpRequest?.created_date ? moment(helpRequest.created_date).fromNow() : '';
  // Use live reply count from our query, fallback to entity counts
  const responseCount = replyCount || helpRequest?.answer_count || helpRequest?.offers_count || 0;
  const viewCount = (helpRequest?.view_count || helpRequest?.views_count || 0);
  const isActive = helpRequest?.status === 'active';

  // Reply info
  const replyName = latestReply?.responder_name || latestReply?.answerer_name || '';
  const replyRole = latestReply?.responder_title || latestReply?.answerer_title || '';
  const replyCompany = latestReply?.responder_company || latestReply?.answerer_company || '';
  const replyText = latestReply?.message || latestReply?.answer_text || '';
  const replyFirstName = replyName.split(/\s+/)[0] || 'them';
  const replyInitials = replyName ? replyName.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') : '?';

  const hasMultiple = (user?._activeQuestionCount || 0) > 1;

  return (
    <div>
      <SectionHeader
        title="Your Help Request"
        actionText={helpRequest ? (hasMultiple ? 'View all →' : 'Post a new one →') : 'Post a new one →'}
        onAction={() => navigate(helpRequest && hasMultiple ? 'MyRequests' : 'PostRequest')}
      />

      {!helpRequest ? <EmptyState /> : (
        <div className="hr-card" style={{
          background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 16, overflow: 'hidden',
        }}>
          <style>{`
            @media(max-width:768px) {
              .hr-card-header { flex-wrap: wrap !important; }
              .hr-card-actions { margin-top: 8px !important; width: 100% !important; justify-content: flex-start !important; }
            }
          `}</style>

          {/* Header */}
          <div className="hr-card-header" style={{
            padding: '16px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Status badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                padding: '3px 10px', borderRadius: 100,
                background: isActive ? 'rgba(76,175,80,0.08)' : 'rgba(0,0,0,0.04)',
                color: isActive ? '#2e7d32' : '#aaa',
                border: isActive ? '0.5px solid rgba(76,175,80,0.2)' : '0.5px solid rgba(0,0,0,0.1)',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? '#4CAF50' : '#aaa' }} />
                {isActive ? 'Active' : 'Resolved'}
              </span>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 12 }}>
                {responseCount > 0 && (
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#E85D20' }}>
                    {responseCount} response{responseCount !== 1 ? 's' : ''}
                  </span>
                )}
                {viewCount > 0 && (
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa' }}>
                    {viewCount} view{viewCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="hr-card-actions" style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => navigate(`QuestionDetail?id=${helpRequest.id}${isJob ? '&type=job' : ''}`)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#aaa', minHeight: 'auto', width: 'auto', padding: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#666'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; }}
              >Edit</button>
              <button
                onClick={handleDelete}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: confirmDelete ? '#e53935' : '#aaa', minHeight: 'auto', width: 'auto', padding: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => { if (!confirmDelete) e.currentTarget.style.color = '#e53935'; }}
                onMouseLeave={e => { if (!confirmDelete) e.currentTarget.style.color = '#aaa'; setConfirmDelete(false); }}
              >{confirmDelete ? 'Confirm delete?' : 'Delete'}</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            <p style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#444', lineHeight: 1.65, marginBottom: 10,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              "{questionText}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa' }}>
                Posted {postedAgo}
              </span>
              <span
                onClick={() => navigate(`QuestionDetail?id=${helpRequest.id}${isJob ? '&type=job' : ''}`)}
                style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#E85D20', marginLeft: 'auto', cursor: 'pointer', minHeight: 'auto', width: 'auto' }}
              >Read full question →</span>
            </div>
          </div>

          {/* Reply preview */}
          {latestReply && (
            <div style={{ padding: '14px 20px', background: 'rgba(232,93,32,0.02)' }}>
              <span style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bbb', display: 'block', marginBottom: 10,
              }}>Most recent reply</span>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#E85D20', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#fff',
                }}>{replyInitials}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 12, marginBottom: 3 }}>
                    <span style={{ fontWeight: 500, color: '#1a1a1a' }}>{replyName}</span>
                    {(replyRole || replyCompany) && (
                      <span style={{ fontWeight: 300, color: '#aaa' }}> · {[replyRole, replyCompany].filter(Boolean).join(' · ')}</span>
                    )}
                  </p>
                  <p style={{
                    fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#666', lineHeight: 1.55, marginBottom: 10,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{replyText}</p>

                  <button
                    onClick={() => navigate(`QuestionDetail?id=${helpRequest.id}${isJob ? '&type=job' : ''}`)}
                    style={{
                      background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 12, fontWeight: 500,
                      borderRadius: 100, padding: '8px 16px', border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                      display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 'auto', width: 'auto',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
                  >Reply to {replyFirstName} →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}