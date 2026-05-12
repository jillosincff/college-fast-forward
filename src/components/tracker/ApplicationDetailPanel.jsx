import React, { useState } from 'react';
import JobPostingLinkSection from '@/components/tracker/JobPostingLinkSection';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const STATUS_LABELS = {
  applied: 'Applied',
  in_review: 'In Review',
  interviewing: 'Interviewing',
  offered: 'Offer Received',
  rejected: 'Rejected',
};

// Simulated activity log based on app data
function buildActivityLog(app) {
  const log = [];
  if (app.dateApplied) {
    log.push({ date: app.dateApplied, text: 'Application added' });
  }
  if (app.status === 'interviewing') {
    log.push({ date: app.dateApplied, text: 'Status changed to Interviewing', offset: 7 });
  }
  if (app.status === 'offered') {
    log.push({ date: app.dateApplied, text: 'Offer received 🎉', offset: 14 });
  }
  if (app.status === 'rejected') {
    log.push({ date: app.dateApplied, text: 'Status changed to Rejected', offset: 5 });
  }
  return log.map((item, i) => {
    const base = new Date(item.date);
    base.setDate(base.getDate() + (item.offset || 0));
    return {
      ...item,
      displayDate: base.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });
}

export default function ApplicationDetailPanel({ app, onClose, onUpdate, onFollowUp, onReminder }) {
  const [activityOpen, setActivityOpen] = useState(false);
  const activityLog = buildActivityLog(app);

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 100,
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 440, background: '#fff',
          borderRadius: '20px 20px 0 0', padding: 24,
          maxHeight: '92vh', overflowY: 'auto',
          animation: 'slideUp 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>{app.logo}</span>
            <h2 style={{ fontFamily: pf, fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0, lineHeight: 1.2 }}>
              {app.company} – {app.jobTitle}
            </h2>
          </div>
        </div>

        {/* Key Info Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {/* Date Applied */}
          <div style={{ background: '#F9F9F9', borderRadius: 10, padding: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 5px', letterSpacing: '0.05em' }}>
              Date Applied
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
            </p>
          </div>

          {/* Resume Version */}
          <div style={{ background: '#F9F9F9', borderRadius: 10, padding: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 5px', letterSpacing: '0.05em' }}>
              Resume Version
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {app.resumeVersion}{' '}
              <button style={{ background: 'none', border: 'none', color: '#E85D20', cursor: 'pointer', fontSize: 10, padding: 0, minHeight: 'auto', fontWeight: 700 }}>
                View
              </button>
            </p>
          </div>

          {/* Status */}
          <div style={{ background: '#F9F9F9', borderRadius: 10, padding: 10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 5px', letterSpacing: '0.05em' }}>
              Status
            </p>
            <select
              value={app.status}
              onChange={e => onUpdate({ ...app, status: e.target.value })}
              style={{
                fontSize: 11, fontWeight: 600, border: '1px solid #E0E0E0', borderRadius: 6,
                padding: '3px 4px', width: '100%', outline: 'none', fontFamily: dm,
                cursor: 'pointer', minHeight: 'auto', background: '#fff', color: '#1A1A1A',
              }}
            >
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Interview Details — shown when status is interviewing */}
        {app.status === 'interviewing' && app.interview && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 14 }}>📅</span>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
                Interview Details
              </p>
              {app.interview.autoImported && (
                <span style={{ fontSize: 10, background: '#EDE9FE', color: '#7C3AED', borderRadius: 4, padding: '2px 6px', fontWeight: 600, fontFamily: dm }}>
                  Auto-imported
                </span>
              )}
            </div>
            <div style={{ background: '#FAF5FF', border: '1px solid #DDD6FE', borderRadius: 10, padding: 14, display: 'grid', gap: 8 }}>
              {app.interview.scheduledAt && (
                <div style={{ display: 'flex', gap: 8, fontSize: 13, fontFamily: dm }}>
                  <span style={{ color: '#888', minWidth: 90, fontWeight: 600 }}>Scheduled</span>
                  <span style={{ color: '#1A1A1A' }}>{app.interview.scheduledAt}</span>
                </div>
              )}
              {app.interview.type && (
                <div style={{ display: 'flex', gap: 8, fontSize: 13, fontFamily: dm }}>
                  <span style={{ color: '#888', minWidth: 90, fontWeight: 600 }}>Type</span>
                  <span style={{ color: '#1A1A1A' }}>{app.interview.type}</span>
                </div>
              )}
              {app.interview.interviewer && (
                <div style={{ display: 'flex', gap: 8, fontSize: 13, fontFamily: dm }}>
                  <span style={{ color: '#888', minWidth: 90, fontWeight: 600 }}>Interviewer</span>
                  <span style={{ color: '#1A1A1A' }}>{app.interview.interviewer}</span>
                </div>
              )}
              {app.interview.joinLink && (
                <div style={{ display: 'flex', gap: 8, fontSize: 13, fontFamily: dm }}>
                  <span style={{ color: '#888', minWidth: 90, fontWeight: 600 }}>Link</span>
                  <a
                    href={app.interview.joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Join Meeting ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Posting Link Section */}
        <JobPostingLinkSection
          application={app}
          onUpdate={onUpdate}
        />

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>
            Notes
          </p>
          <textarea
            placeholder="Add notes about this application (interview questions, salary expectations, things to remember, etc.)"
            defaultValue={app.notes || ''}
            style={{
              width: '100%', minHeight: 90, fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 8,
              padding: 12, outline: 'none', fontFamily: dm, resize: 'vertical', lineHeight: 1.5, color: '#1A1A1A',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
          />
        </div>

        {/* Action Buttons — context-aware based on status */}
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {app.status === 'interviewing' ? (
            <>
              <button
                style={{
                  background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: dm,
                  minHeight: 'auto', transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
              >
                Let the Agent Draft Prep Questions
              </button>
              <button
                style={{
                  background: '#E85D20', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm,
                  minHeight: 'auto', transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#d44e14')}
                onMouseLeave={e => (e.currentTarget.style.background = '#E85D20')}
              >
                Let the Agent Draft a Thank You Note
              </button>
            </>
          ) : (
            <button
              onClick={onFollowUp}
              style={{
                background: '#E85D20', color: '#fff', border: 'none', borderRadius: 8,
                padding: '13px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm,
                minHeight: 'auto', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#d44e14')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E85D20')}
            >
              Let the Agent Draft a Follow-up
            </button>
          )}

          <button
            onClick={onReminder}
            style={{
              background: '#FFF5F0', color: '#E85D20', border: '1.5px solid #E85D20', borderRadius: 8,
              padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
            }}
          >
            Add Follow-up Reminder
          </button>

          {!app.jobPostingUrl && (
            <button
              onClick={() => document.getElementById('job-posting-link-trigger')?.click()}
              style={{
                background: 'none', color: '#0021A5', border: 'none', borderRadius: 8,
                padding: '10px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: dm,
                minHeight: 'auto', textDecoration: 'underline',
              }}
            >
              + Link to Job Posting
            </button>
          )}
        </div>

        {/* Activity Log (collapsible) */}
        {activityLog.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setActivityOpen(!activityOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                color: '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0,
                minHeight: 'auto', fontFamily: dm, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              <span style={{ transform: activityOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block', fontSize: 10 }}>▶</span>
              Activity Log
            </button>
            {activityOpen && (
              <div style={{ marginTop: 10, paddingLeft: 16, borderLeft: '2px solid #F0F0F0' }}>
                {activityLog.map((entry, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, color: '#999', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 50 }}>
                      {entry.displayDate}
                    </span>
                    <span style={{ fontSize: 12, color: '#555' }}>{entry.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: '100%', background: 'none', border: 'none', color: '#AAA',
            fontSize: 13, cursor: 'pointer', fontFamily: dm, minHeight: 'auto', padding: 8,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}