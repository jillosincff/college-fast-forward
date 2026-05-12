import React, { useState } from 'react';
import JobPostingLinkSection from '@/components/tracker/JobPostingLinkSection';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const STATUS_CONFIG = {
  applied:      { label: 'Applied',        color: '#2563EB', bg: '#EFF6FF' },
  in_review:    { label: 'In Review',      color: '#D97706', bg: '#FFFBEB' },
  interviewing: { label: 'Interviewing',   color: '#7C3AED', bg: '#F5F3FF' },
  offered:      { label: 'Offer Received', color: '#059669', bg: '#ECFDF5' },
  rejected:     { label: 'Rejected',       color: '#DC2626', bg: '#FEF2F2' },
};

function buildActivityLog(app) {
  const log = [];
  if (app.dateApplied) {
    const base = new Date(app.dateApplied);
    log.push({ date: base, text: 'Application added via email' });
  }
  if (app.status === 'interviewing' || app.status === 'offered' || app.status === 'rejected') {
    if (app.dateApplied) {
      const d = new Date(app.dateApplied);
      d.setDate(d.getDate() + 8);
      log.push({ date: d, text: 'Interview invite received' });
      const d2 = new Date(d);
      d2.setDate(d2.getDate() + 5);
      log.push({ date: d2, text: 'Status updated to Interviewing' });
    }
  }
  if (app.status === 'offered') {
    if (app.dateApplied) {
      const d = new Date(app.dateApplied);
      d.setDate(d.getDate() + 21);
      log.push({ date: d, text: 'Offer received 🎉' });
    }
  }
  if (app.status === 'rejected') {
    if (app.dateApplied) {
      const d = new Date(app.dateApplied);
      d.setDate(d.getDate() + 18);
      log.push({ date: d, text: 'Status changed to Rejected' });
    }
  }
  return log
    .sort((a, b) => a.date - b.date)
    .map(item => ({
      ...item,
      displayDate: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
}

export default function ApplicationDetailPanel({ app, onClose, onUpdate, onFollowUp, onReminder }) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [notes, setNotes] = useState(app.notes || '');
  const activityLog = buildActivityLog(app);
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
  const isMobile = window.innerWidth < 768;

  return (
    <>
      <style>{`
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .detail-panel-scroll::-webkit-scrollbar { width: 4px; }
        .detail-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .detail-panel-scroll::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 4px; }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div
        className="detail-panel-scroll"
        style={{
          position: 'fixed',
          ...(isMobile
            ? { bottom: 0, left: 0, right: 0, top: 'auto', borderRadius: '20px 20px 0 0', animation: 'slideUp 0.28s ease' }
            : { top: 0, right: 0, bottom: 0, width: 460, borderRadius: '20px 0 0 20px', animation: 'slideRight 0.28s ease' }
          ),
          background: '#fff',
          zIndex: 201,
          overflowY: 'auto',
          maxHeight: isMobile ? '92vh' : '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #F0F0F0', paddingBottom: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 32, flexShrink: 0 }}>{app.logo}</span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{
                  fontFamily: pf, fontSize: 17, fontWeight: 700, color: '#1A1A1A',
                  margin: '0 0 4px', lineHeight: 1.25,
                }}>
                  {app.company}
                </h2>
                <p style={{ fontFamily: dm, fontSize: 13, color: '#666', margin: 0, fontWeight: 500 }}>
                  {app.jobTitle}
                </p>
              </div>
            </div>
            {/* Close X */}
            <button
              onClick={onClose}
              style={{
                background: '#F5F5F5', border: 'none', borderRadius: '50%',
                width: 32, height: 32, minHeight: 32, minWidth: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#555', fontSize: 16, flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px 24px 32px', flex: 1, overflowY: 'auto' }}>

          {/* Top Info Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {/* Date Applied */}
            <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.06em', fontFamily: dm }}>
                Date Applied
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, fontFamily: dm }}>
                {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* Resume Version */}
            <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 4px', letterSpacing: '0.06em', fontFamily: dm }}>
                Resume Version
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', fontFamily: dm }}>{app.resumeVersion}</span>
                <button style={{
                  background: 'none', border: 'none', color: '#E85D20', cursor: 'pointer',
                  fontSize: 11, padding: 0, minHeight: 'auto', fontWeight: 700, fontFamily: dm, textDecoration: 'underline',
                }}>
                  View
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.06em', fontFamily: dm }}>
              Status
            </p>
            <div style={{ position: 'relative' }}>
              <select
                value={app.status}
                onChange={e => onUpdate({ ...app, status: e.target.value })}
                style={{
                  width: '100%', fontSize: 13, fontWeight: 600, fontFamily: dm,
                  border: `2px solid ${statusCfg.color}`,
                  borderRadius: 10, padding: '10px 36px 10px 14px',
                  outline: 'none', cursor: 'pointer',
                  background: statusCfg.bg,
                  color: statusCfg.color,
                  appearance: 'none', minHeight: 'auto',
                }}
              >
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val} style={{ color: '#1A1A1A', background: '#fff', fontWeight: 600 }}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: statusCfg.color, fontSize: 12 }}>
                ▾
              </span>
            </div>
          </div>

          {/* Interview Details */}
          {app.status === 'interviewing' && app.interview && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>📅</span>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', margin: 0, letterSpacing: '0.06em', fontFamily: dm }}>
                  Interview Details
                </p>
                {app.interview.autoImported && (
                  <span style={{
                    fontSize: 10, background: '#EDE9FE', color: '#7C3AED',
                    borderRadius: 4, padding: '2px 7px', fontWeight: 700, fontFamily: dm,
                  }}>
                    Auto-imported ✓
                  </span>
                )}
              </div>
              <div style={{ background: '#FAF5FF', border: '1.5px solid #DDD6FE', borderRadius: 12, padding: '14px 16px', display: 'grid', gap: 10 }}>
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
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, fontFamily: dm }}>
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
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.06em', fontFamily: dm }}>
              Notes
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes — interview questions to prepare, salary expectations, feedback received, etc."
              style={{
                width: '100%', minHeight: 100, fontSize: 13, fontFamily: dm,
                border: '1.5px solid #E8E8E8', borderRadius: 10,
                padding: '12px 14px', outline: 'none', resize: 'vertical',
                lineHeight: 1.6, color: '#1A1A1A', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E8E8E8')}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {/* Primary — context-aware */}
            {app.status === 'interviewing' ? (
              <button
                style={primaryBtn('#7C3AED')}
                onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
                onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}
              >
                ✦ Let the Agent Draft Interview Prep Questions
              </button>
            ) : (
              <button
                onClick={onFollowUp}
                style={primaryBtn('#E85D20')}
                onMouseEnter={e => (e.currentTarget.style.background = '#d44e14')}
                onMouseLeave={e => (e.currentTarget.style.background = '#E85D20')}
              >
                ✦ Let the Agent Draft a Follow-up
              </button>
            )}

            {/* Secondary — always shown for interviewing; follow-up reminder otherwise */}
            {app.status === 'interviewing' && (
              <button
                onClick={onFollowUp}
                style={primaryBtn('#E85D20')}
                onMouseEnter={e => (e.currentTarget.style.background = '#d44e14')}
                onMouseLeave={e => (e.currentTarget.style.background = '#E85D20')}
              >
                ✦ Let the Agent Draft a Follow-up
              </button>
            )}

            {/* Tertiary — reminder */}
            <button
              onClick={onReminder}
              style={{
                background: '#FFF8F5', color: '#E85D20',
                border: '1.5px solid #E85D20', borderRadius: 10,
                padding: '12px 16px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF0E8')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFF8F5')}
            >
              🔔 Add Follow-up Reminder
            </button>

            {/* Link to posting if missing */}
            {!app.jobPostingUrl && (
              <button
                onClick={() => document.getElementById('job-posting-link-trigger')?.click()}
                style={{
                  background: 'none', color: '#0021A5', border: 'none',
                  padding: '8px', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
                  textDecoration: 'underline', textAlign: 'center',
                }}
              >
                + Link to Job Posting
              </button>
            )}
          </div>

          {/* Activity Log */}
          {activityLog.length > 0 && (
            <div>
              <button
                onClick={() => setActivityOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, minHeight: 'auto', fontFamily: dm,
                  fontSize: 11, fontWeight: 700, color: '#AAA',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  width: '100%', marginBottom: activityOpen ? 10 : 0,
                }}
              >
                <span style={{
                  display: 'inline-block',
                  transform: activityOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s', fontSize: 9,
                }}>
                  ▶
                </span>
                Activity Log
              </button>

              {activityOpen && (
                <div style={{ paddingLeft: 14, borderLeft: '2px solid #F0F0F0' }}>
                  {activityLog.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 46, fontFamily: dm }}>
                        {entry.displayDate}
                      </span>
                      <span style={{ fontSize: 12, color: '#555', fontFamily: dm, lineHeight: 1.5 }}>{entry.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <span style={{ color: '#888', minWidth: 90, fontWeight: 600, fontSize: 12, paddingTop: 1 }}>{label}</span>
      <span style={{ color: '#1A1A1A', fontWeight: 500, lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

function primaryBtn(bg) {
  return {
    background: bg, color: '#fff', border: 'none', borderRadius: 10,
    padding: '13px 16px', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
    minHeight: 'auto', transition: 'background 0.2s', textAlign: 'left',
    letterSpacing: '-0.01em',
  };
}