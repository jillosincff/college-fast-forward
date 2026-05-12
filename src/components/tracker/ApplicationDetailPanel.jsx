import React, { useState } from 'react';
import JobPostingLinkSection from '@/components/tracker/JobPostingLinkSection';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'in_review', label: 'In Review' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offer Received' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS = {
  applied: { bg: '#EFF6FF', color: '#1D4ED8' },
  in_review: { bg: '#FFF7ED', color: '#C2410C' },
  interviewing: { bg: '#FAF5FF', color: '#7C3AED' },
  offered: { bg: '#F0FDF4', color: '#15803D' },
  rejected: { bg: '#FFF1F2', color: '#BE123C' },
};

function buildActivityLog(app) {
  const log = [];
  if (app.dateApplied) log.push({ text: 'Application added', date: app.dateApplied, offset: 0 });
  if (app.interview?.autoImported) log.push({ text: 'Interview invite received from email', date: app.dateApplied, offset: 8 });
  if (app.status === 'interviewing') log.push({ text: 'Status updated to Interviewing', date: app.dateApplied, offset: 9 });
  if (app.status === 'offered') log.push({ text: 'Offer received 🎉', date: app.dateApplied, offset: 14 });
  if (app.status === 'rejected') log.push({ text: 'Status changed to Rejected', date: app.dateApplied, offset: 5 });

  return log.map(item => {
    const d = new Date(item.date);
    d.setDate(d.getDate() + item.offset);
    return { ...item, displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  });
}

export default function ApplicationDetailPanel({ app, onClose, onUpdate, onFollowUp, onReminder }) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [notes, setNotes] = useState(app.notes || '');
  const activityLog = buildActivityLog(app);
  const isInterviewing = app.status === 'interviewing';
  const statusColor = STATUS_COLORS[app.status] || STATUS_COLORS.applied;

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (min-width: 640px) {
          .detail-panel { animation: slideInRight 0.3s ease !important; border-radius: 20px 0 0 20px !important; width: 420px !important; max-width: 420px !important; align-self: stretch !important; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.45)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        }}
        onClick={onClose}
      >
        <div
          className="detail-panel"
          style={{
            width: '100%', background: '#fff',
            borderRadius: '20px 20px 0 0',
            maxHeight: '94vh', overflowY: 'auto',
            animation: 'slideUp 0.3s ease',
            display: 'flex', flexDirection: 'column',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '20px 20px 0', borderBottom: '1px solid #F0F0F0', paddingBottom: 16, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>
                  {app.logo}
                </div>
                <div>
                  <h2 style={{ fontFamily: pf, fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: 0, lineHeight: 1.2 }}>
                    {app.company}
                  </h2>
                  <p style={{ fontFamily: dm, fontSize: 13, color: '#666', margin: '2px 0 0', fontWeight: 500 }}>
                    {app.jobTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 16, color: '#666', flexShrink: 0, minHeight: 'auto', minWidth: 'auto', padding: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>

            {/* Top Info Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
              <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '10px 10px' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 5px', letterSpacing: '0.05em' }}>
                  Applied
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', margin: 0, fontFamily: dm }}>
                  {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </p>
              </div>

              <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '10px 10px' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 5px', letterSpacing: '0.05em' }}>
                  Resume
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', margin: 0, fontFamily: dm }}>
                  {app.resumeVersion}{' '}
                  <button style={{ background: 'none', border: 'none', color: '#E85D20', cursor: 'pointer', fontSize: 10, padding: 0, minHeight: 'auto', fontWeight: 700 }}>
                    View
                  </button>
                </p>
              </div>

              <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '10px 10px' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 5px', letterSpacing: '0.05em' }}>
                  Status
                </p>
                <select
                  value={app.status}
                  onChange={e => onUpdate({ ...app, status: e.target.value })}
                  style={{
                    fontSize: 10, fontWeight: 700, border: 'none', borderRadius: 6,
                    padding: '3px 4px', width: '100%', outline: 'none', fontFamily: dm,
                    cursor: 'pointer', minHeight: 'auto',
                    background: statusColor.bg, color: statusColor.color,
                  }}
                >
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interview Details — auto-filled from email */}
            {isInterviewing && app.interview && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 13 }}>📅</span>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em', fontFamily: dm }}>
                    Interview Details
                  </p>
                  {app.interview.autoImported && (
                    <span style={{ fontSize: 10, background: '#EDE9FE', color: '#7C3AED', borderRadius: 4, padding: '2px 7px', fontWeight: 700, fontFamily: dm }}>
                      Auto-imported
                    </span>
                  )}
                </div>
                <div style={{ background: '#FAF5FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '14px 16px', display: 'grid', gap: 10 }}>
                  {app.interview.scheduledAt && (
                    <Row label="Scheduled" value={app.interview.scheduledAt} />
                  )}
                  {app.interview.type && (
                    <Row label="Format" value={app.interview.type} />
                  )}
                  {app.interview.interviewer && (
                    <Row label="Interviewer" value={app.interview.interviewer} />
                  )}
                  {app.interview.joinLink && (
                    <div style={{ display: 'flex', gap: 8, fontSize: 13, fontFamily: dm, alignItems: 'center' }}>
                      <span style={{ color: '#888', minWidth: 90, fontWeight: 600, fontSize: 12 }}>Link</span>
                      <a
                        href={app.interview.joinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: '#7C3AED', color: '#fff', borderRadius: 6,
                          padding: '5px 12px', fontSize: 12, fontWeight: 700,
                          textDecoration: 'none', fontFamily: dm,
                        }}
                      >
                        Join Zoom Call ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Posting Link */}
            <JobPostingLinkSection application={app} onUpdate={onUpdate} />

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em', fontFamily: dm }}>
                Notes
              </p>
              <textarea
                placeholder="Add any notes — interview questions to prepare, salary expectations, feedback received, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={() => onUpdate({ ...app, notes })}
                style={{
                  width: '100%', minHeight: 90, fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 10,
                  padding: 12, outline: 'none', fontFamily: dm, resize: 'vertical', lineHeight: 1.6,
                  color: '#1A1A1A', boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              {isInterviewing ? (
                <>
                  <ActionButton
                    primary
                    color="#7C3AED"
                    hoverColor="#6D28D9"
                    label="✨  Let the Agent Draft Interview Prep Questions"
                  />
                  <ActionButton
                    primary
                    color="#E85D20"
                    hoverColor="#d44e14"
                    label="Let the Agent Draft a Thank You Note"
                  />
                </>
              ) : (
                <ActionButton
                  primary
                  color="#E85D20"
                  hoverColor="#d44e14"
                  label="Let the Agent Draft a Follow-up"
                  onClick={onFollowUp}
                />
              )}

              <button
                onClick={onReminder}
                style={{
                  background: '#FFF5F0', color: '#E85D20', border: '1.5px solid #E85D20', borderRadius: 10,
                  padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFEDE3')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FFF5F0')}
              >
                Add Follow-up Reminder
              </button>

              {!app.jobPostingUrl && (
                <button
                  onClick={() => document.getElementById('job-posting-link-trigger')?.click()}
                  style={{
                    background: 'none', color: '#0021A5', border: 'none', borderRadius: 8,
                    padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: dm,
                    minHeight: 'auto', textDecoration: 'underline',
                  }}
                >
                  + Link to Job Posting
                </button>
              )}
            </div>

            {/* Activity Log (collapsible) */}
            {activityLog.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <button
                  onClick={() => setActivityOpen(!activityOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                    color: '#999', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '4px 0',
                    minHeight: 'auto', fontFamily: dm, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  <span style={{
                    display: 'inline-block', fontSize: 8,
                    transform: activityOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s',
                  }}>▶</span>
                  Activity Log
                </button>
                {activityOpen && (
                  <div style={{ marginTop: 10, paddingLeft: 14, borderLeft: '2px solid #F0F0F0' }}>
                    {activityLog.map((entry, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 11, color: '#BBB', fontWeight: 700, whiteSpace: 'nowrap', minWidth: 48, fontFamily: dm }}>
                          {entry.displayDate}
                        </span>
                        <span style={{ fontSize: 12, color: '#555', fontFamily: dm, lineHeight: 1.4 }}>{entry.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, fontFamily: dm, alignItems: 'flex-start' }}>
      <span style={{ color: '#888', minWidth: 90, fontWeight: 600, fontSize: 12, paddingTop: 1 }}>{label}</span>
      <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ActionButton({ label, onClick, color, hoverColor, primary }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hoverColor : color,
        color: '#fff', border: 'none', borderRadius: 10,
        padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: dm,
        minHeight: 'auto', transition: 'background 0.2s', textAlign: 'center',
      }}
    >
      {label}
    </button>
  );
}