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
  applied:      { bg: '#EFF6FF', color: '#1D4ED8' },
  in_review:    { bg: '#FFF7ED', color: '#C2410C' },
  interviewing: { bg: '#FAF5FF', color: '#7C3AED' },
  offered:      { bg: '#F0FDF4', color: '#15803D' },
  rejected:     { bg: '#FFF1F2', color: '#BE123C' },
};

const FORMAT_OPTIONS = ['Zoom', 'Phone', 'In-person', 'On-site', 'Teams', 'Other'];

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
  const [notes, setNotes] = useState(app.notes || '');
  const [activityOpen, setActivityOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(false);
  const [interviewDraft, setInterviewDraft] = useState(app.interview || {});

  const activityLog = buildActivityLog(app);
  const status = app.status;
  const isInterviewingOrHigher = ['interviewing', 'offered'].includes(status);
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.applied;
  const interview = app.interview;

  const saveInterview = () => {
    onUpdate({ ...app, interview: { ...interviewDraft, autoImported: interviewDraft.autoImported } });
    setEditingInterview(false);
  };

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (min-width: 640px) {
          .detail-panel {
            animation: slideInRight 0.3s ease !important;
            border-radius: 20px 0 0 20px !important;
            width: 460px !important;
            max-width: 460px !important;
            height: 100vh !important;
            max-height: 100vh !important;
            align-self: stretch !important;
          }
        }
        .detail-field-input {
          font-size: 13px;
          border: 1px solid #E0E0E0;
          border-radius: 7px;
          padding: 7px 10px;
          outline: none;
          font-family: ${dm};
          background: #fff;
          width: 100%;
          box-sizing: border-box;
          color: #1A1A1A;
          transition: border-color 0.15s;
        }
        .detail-field-input:focus { border-color: #7C3AED; }
      `}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.45)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        }}
        onClick={onClose}
      >
        {/* Panel */}
        <div
          className="detail-panel"
          style={{
            width: '100%', background: '#fff',
            borderRadius: '20px 20px 0 0',
            maxHeight: '94vh', height: '94vh',
            animation: 'slideUp 0.3s ease',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div style={{
            padding: '18px 20px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0,
            background: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, background: '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>
                  {app.logo}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{
                    fontFamily: pf, fontSize: 18, fontWeight: 700, color: '#1A1A1A',
                    margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {app.company} – {app.jobTitle}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#F3F4F6', border: 'none', borderRadius: '50%',
                  width: 30, height: 30, minHeight: 'auto', minWidth: 'auto', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 18, color: '#666', flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* ── Scrollable Body ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 28px' }}>

            {/* ── Top Info Bar ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
              <InfoTile label="Date Applied">
                {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </InfoTile>

              <InfoTile label="Resume">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {app.resumeVersion}
                  <button style={{
                    background: 'none', border: 'none', color: '#E85D20', cursor: 'pointer',
                    fontSize: 10, padding: 0, minHeight: 'auto', fontWeight: 700, fontFamily: dm,
                  }}>
                    View
                  </button>
                </span>
              </InfoTile>

              <InfoTile label="Status">
                <select
                  value={status}
                  onChange={e => onUpdate({ ...app, status: e.target.value })}
                  style={{
                    fontSize: 11, fontWeight: 700, border: 'none', borderRadius: 6,
                    padding: '3px 4px', width: '100%', outline: 'none', fontFamily: dm,
                    cursor: 'pointer', minHeight: 'auto',
                    background: statusColor.bg, color: statusColor.color,
                  }}
                >
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </InfoTile>
            </div>

            {/* ── Job Posting Link ── */}
            <div style={{ marginBottom: 20 }}>
              <JobPostingLinkSection application={app} onUpdate={onUpdate} />
            </div>

            {/* ── Interview Details ── */}
            {(isInterviewingOrHigher || interview) && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>📅</span>
                    <p style={{
                      fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase',
                      margin: 0, letterSpacing: '0.05em', fontFamily: dm,
                    }}>
                      Interview Details
                    </p>
                    {interview?.autoImported && (
                      <span style={{
                        fontSize: 9, background: '#EDE9FE', color: '#7C3AED',
                        borderRadius: 4, padding: '2px 7px', fontWeight: 700, fontFamily: dm,
                      }}>
                        Auto-imported from email
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (editingInterview) {
                        saveInterview();
                      } else {
                        setInterviewDraft(app.interview || {});
                        setEditingInterview(true);
                      }
                    }}
                    style={{
                      background: editingInterview ? '#7C3AED' : '#F5F3FF',
                      color: editingInterview ? '#fff' : '#7C3AED',
                      border: 'none', borderRadius: 6, padding: '5px 11px',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: dm, minHeight: 'auto',
                    }}
                  >
                    {editingInterview ? 'Save' : 'Edit'}
                  </button>
                </div>

                <div style={{
                  background: '#FAF5FF', border: '1px solid #DDD6FE',
                  borderRadius: 12, padding: '14px 16px',
                }}>
                  {editingInterview ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div>
                        <label style={labelStyle}>Date</label>
                        <input type="date" className="detail-field-input"
                          value={interviewDraft.date || ''}
                          onChange={e => setInterviewDraft(p => ({ ...p, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Time</label>
                        <input type="time" className="detail-field-input"
                          value={interviewDraft.time || ''}
                          onChange={e => setInterviewDraft(p => ({ ...p, time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Format</label>
                        <select className="detail-field-input"
                          value={interviewDraft.type || ''}
                          onChange={e => setInterviewDraft(p => ({ ...p, type: e.target.value }))}
                        >
                          <option value="">Select format…</option>
                          {FORMAT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Interviewer Name & Title</label>
                        <input type="text" className="detail-field-input"
                          placeholder="e.g. Sarah Chen – Marketing Manager"
                          value={interviewDraft.interviewer || ''}
                          onChange={e => setInterviewDraft(p => ({ ...p, interviewer: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Meeting Link</label>
                        <input type="url" className="detail-field-input"
                          placeholder="https://zoom.us/j/..."
                          value={interviewDraft.joinLink || ''}
                          onChange={e => setInterviewDraft(p => ({ ...p, joinLink: e.target.value }))}
                        />
                      </div>
                      <button
                        onClick={() => setEditingInterview(false)}
                        style={{
                          background: 'none', border: 'none', color: '#AAA',
                          fontSize: 12, cursor: 'pointer', fontFamily: dm,
                          padding: 0, minHeight: 'auto', textDecoration: 'underline',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : interview ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {interview.scheduledAt && (
                        <InterviewRow label="Scheduled" value={interview.scheduledAt} />
                      )}
                      {(interview.date || interview.time) && !interview.scheduledAt && (
                        <InterviewRow
                          label="Scheduled"
                          value={[
                            interview.date && new Date(interview.date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                            interview.time && formatTime(interview.time),
                          ].filter(Boolean).join(' at ')}
                        />
                      )}
                      {interview.type && <InterviewRow label="Format" value={interview.type} />}
                      {interview.interviewer && <InterviewRow label="Interviewer" value={interview.interviewer} />}
                      {interview.joinLink && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={rowLabelStyle}>Meeting Link</span>
                          <a
                            href={interview.joinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: '#7C3AED', color: '#fff', borderRadius: 6,
                              padding: '5px 12px', fontSize: 12, fontWeight: 700,
                              textDecoration: 'none', fontFamily: dm,
                            }}
                          >
                            Join {interview.type || 'Meeting'} ↗
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setInterviewDraft({}); setEditingInterview(true); }}
                      style={{
                        background: 'none', border: 'none', color: '#7C3AED',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        fontFamily: dm, minHeight: 'auto', padding: 0, textDecoration: 'underline',
                      }}
                    >
                      + Add interview details
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Notes ── */}
            <div style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase',
                margin: '0 0 8px', letterSpacing: '0.05em', fontFamily: dm,
              }}>
                Notes
              </p>
              <textarea
                placeholder="Add notes here — interview questions to prepare, salary expectations, recruiter feedback, things to remember, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={() => onUpdate({ ...app, notes })}
                style={{
                  width: '100%', minHeight: 100, fontSize: 13, border: '1px solid #E0E0E0',
                  borderRadius: 10, padding: 12, outline: 'none', fontFamily: dm,
                  resize: 'vertical', lineHeight: 1.6, color: '#1A1A1A',
                  boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
                onBlurCapture={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
              />
            </div>

            {/* ── Action Buttons ── */}
            <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
              {/* Primary: always shown */}
              <ActionButton
                color="#E85D20"
                hoverColor="#d44e14"
                label="✉️  Let the Agent Draft a Follow-up"
                onClick={onFollowUp}
              />

              {/* Secondary: only shown when interviewing or higher */}
              {isInterviewingOrHigher && (
                <ActionButton
                  color="#7C3AED"
                  hoverColor="#6D28D9"
                  label="✨  Let the Agent Draft Interview Prep Questions"
                />
              )}

              {/* Tertiary */}
              <button
                onClick={onReminder}
                style={{
                  background: '#FFF5F0', color: '#E85D20', border: '1.5px solid #E85D20',
                  borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: dm, minHeight: 'auto', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFEDE3')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FFF5F0')}
              >
                🔔  Add Follow-up Reminder
              </button>
            </div>

            {/* ── Activity Log (collapsible) ── */}
            {activityLog.length > 0 && (
              <div>
                <button
                  onClick={() => setActivityOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                    color: '#AAA', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    padding: '4px 0', minHeight: 'auto', fontFamily: dm,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  <span style={{
                    display: 'inline-block', fontSize: 8, transition: 'transform 0.2s',
                    transform: activityOpen ? 'rotate(90deg)' : 'rotate(0deg)',
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
                        <span style={{ fontSize: 12, color: '#555', fontFamily: dm, lineHeight: 1.4 }}>
                          {entry.text}
                        </span>
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

// ── Helpers ──────────────────────────────────────────
const labelStyle = {
  display: 'block', fontSize: 10, fontWeight: 700, color: '#888',
  textTransform: 'uppercase', letterSpacing: '0.04em',
  fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 4,
};

const rowLabelStyle = {
  color: '#888', minWidth: 100, fontWeight: 600, fontSize: 12,
  fontFamily: "'DM Sans', system-ui, sans-serif",
};

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function InfoTile({ label, children }) {
  return (
    <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '10px' }}>
      <p style={{
        fontSize: 9, fontWeight: 700, color: '#999', textTransform: 'uppercase',
        margin: '0 0 5px', letterSpacing: '0.05em',
      }}>
        {label}
      </p>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {children}
      </div>
    </div>
  );
}

function InterviewRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13, fontFamily: "'DM Sans', system-ui, sans-serif", alignItems: 'flex-start' }}>
      <span style={{ ...rowLabelStyle, paddingTop: 1 }}>{label}</span>
      <span style={{ color: '#1A1A1A', fontWeight: 500, lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

function ActionButton({ label, onClick, color, hoverColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hoverColor : color,
        color: '#fff', border: 'none', borderRadius: 10,
        padding: '13px', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
        minHeight: 'auto', transition: 'background 0.2s', textAlign: 'center',
      }}
    >
      {label}
    </button>
  );
}