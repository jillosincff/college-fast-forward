import React, { useState } from 'react';
import { parseJobEmail } from '@/functions/parseJobEmail';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const SAMPLE_EMAILS = [
  {
    id: 1,
    label: 'Email 1 — Application Confirmation',
    emoji: '📩',
    emailType: 'application_confirmation',
    subject: 'Thank you for applying to Marketing Intern',
    sent_date: '2025-03-11',
    body: `Dear Applicant,

Thank you for applying to the Marketing Intern position at Disney. We've received your application and our team is currently reviewing submissions.

We'll be in touch soon with next steps.

Best regards,
Disney Recruiting Team`,
    expected: {
      company_name: 'Disney',
      job_title: 'Marketing Intern',
      application_date: '2025-03-11',
      status: 'Applied',
      confidence: 0.95,
    },
  },
  {
    id: 2,
    label: 'Email 2 — Interview Invite',
    emoji: '📅',
    emailType: 'interview_invite',
    subject: 'Interview Invitation - Marketing Intern at Disney',
    sent_date: '2025-03-20',
    body: `Hi,

We'd love to schedule an interview with you on March 25 at 2 PM via Zoom with Sarah Chen, Marketing Manager.

Please use the following link to join: https://zoom.us/j/123456789

Looking forward to speaking with you!

Best,
Disney Talent Acquisition`,
    expected: {
      company_name: 'Disney',
      job_title: 'Marketing Intern',
      application_date: '2025-03-11',
      status: 'Interview Scheduled',
      interview_date: '2025-03-25',
      interview_time: '14:00',
      interview_format: 'Zoom',
      interviewer_name: 'Sarah Chen',
      confidence: 0.93,
    },
  },
  {
    id: 3,
    label: 'Email 3 — Rejection',
    emoji: '❌',
    emailType: 'rejection',
    subject: 'Update on your application – Google',
    sent_date: '2025-03-18',
    body: `Dear Applicant,

Thank you for your interest in the Software Engineer Intern position at Google. After careful review, we've decided to move forward with other candidates at this time.

We appreciate the time you took to apply and encourage you to apply for future opportunities.

Best regards,
Google Recruiting`,
    expected: {
      company_name: 'Google',
      job_title: 'Software Engineer Intern',
      application_date: '2025-03-09',
      status: 'Rejected',
      confidence: 0.90,
    },
  },
  {
    id: 4,
    label: 'Email 4 — Offer',
    emoji: '🎉',
    emailType: 'offer',
    subject: 'Congratulations! Offer for Product Manager Intern',
    sent_date: '2025-03-28',
    body: `Dear Applicant,

Congratulations! We are excited to extend a formal offer for the Product Manager Intern position at Airbnb.

Please find the attached offer letter with details including start date, compensation, and next steps. We hope you'll accept and join our team!

Best,
Airbnb People Team`,
    expected: {
      company_name: 'Airbnb',
      job_title: 'Product Manager Intern',
      status: 'Offer Received',
      confidence: 0.95,
    },
  },
];

const STATUS_COLORS = {
  'Applied': '#2563EB',
  'In Review': '#D97706',
  'Interview Scheduled': '#7C3AED',
  'Offer Received': '#059669',
  'Rejected': '#DC2626',
  'Other': '#6B7280',
};

function FieldRow({ label, expected, actual }) {
  if (actual === undefined || actual === null) return null;
  const match = String(expected ?? '') === String(actual ?? '');
  const hasExpected = expected !== undefined;
  return (
    <div style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid #F5F5F5', fontFamily: dm, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11, color: '#999', minWidth: 130, fontWeight: 600, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#1A1A1A', flex: 1, wordBreak: 'break-all' }}>{String(actual)}</span>
      {hasExpected && (
        <span style={{ fontSize: 11, flexShrink: 0, fontWeight: 700, color: match ? '#10B981' : '#F59E0B' }}>
          {match ? '✓' : '~'}
        </span>
      )}
    </div>
  );
}

function TestCard({ email }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await parseJobEmail({
      subject: email.subject,
      body: email.body,
      sent_date: email.sent_date,
      send_notification: false,
    });
    if (res.data?.parsed) {
      setResult(res.data.parsed);
    } else {
      setError(res.data?.error || 'Unknown error');
    }
    setLoading(false);
  };

  const parsed = result;
  const statusColor = parsed ? STATUS_COLORS[parsed.status] || '#6B7280' : null;

  return (
    <div style={{
      background: '#fff', border: '1.5px solid #E8E8E8', borderRadius: 14,
      overflow: 'hidden', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Card Header */}
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>{email.emoji}</span>
            <div>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{email.label}</p>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#888', margin: '2px 0 0', fontStyle: 'italic' }}>{email.subject}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setExpanded(x => !x)}
              style={{
                background: '#F5F5F5', border: 'none', borderRadius: 6,
                padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                color: '#555', fontFamily: dm, minHeight: 'auto',
              }}
            >
              {expanded ? 'Hide Email' : 'View Email'}
            </button>
            <button
              onClick={runTest}
              disabled={loading}
              style={{
                background: loading ? '#ccc' : '#0021A5', color: '#fff', border: 'none', borderRadius: 6,
                padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: dm, minHeight: 'auto', transition: 'background 0.15s',
              }}
            >
              {loading ? '…Parsing' : '▶ Run Test'}
            </button>
          </div>
        </div>

        {/* Email preview */}
        {expanded && (
          <div style={{ marginTop: 12, background: '#F9F9F9', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#999', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Body
            </p>
            <pre style={{ fontFamily: dm, fontSize: 12, color: '#444', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {email.body}
            </pre>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 18px', background: '#FEF2F2', borderTop: '1px solid #FCA5A5' }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#DC2626', margin: 0 }}>⚠ Error: {error}</p>
        </div>
      )}

      {/* Result */}
      {parsed && (
        <div style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{
              background: statusColor + '18', color: statusColor,
              borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, fontFamily: dm,
            }}>
              {parsed.status}
            </span>
            <span style={{ fontSize: 12, color: '#AAA', fontFamily: dm }}>
              confidence: <strong style={{ color: parsed.confidence >= 0.85 ? '#10B981' : '#F59E0B' }}>
                {Math.round((parsed.confidence || 0) * 100)}%
              </strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <div>
              <FieldRow label="company_name" expected={email.expected.company_name} actual={parsed.company_name} />
              <FieldRow label="job_title" expected={email.expected.job_title} actual={parsed.job_title} />
              <FieldRow label="application_date" expected={email.expected.application_date} actual={parsed.application_date} />
              <FieldRow label="email_type" expected={email.emailType} actual={parsed.email_type} />
            </div>
            <div>
              {parsed.interview_date && <FieldRow label="interview_date" expected={email.expected.interview_date} actual={parsed.interview_date} />}
              {parsed.interview_time && <FieldRow label="interview_time" expected={email.expected.interview_time} actual={parsed.interview_time} />}
              {parsed.interview_format && <FieldRow label="interview_format" expected={email.expected.interview_format} actual={parsed.interview_format} />}
              {parsed.interviewer_name && <FieldRow label="interviewer_name" expected={email.expected.interviewer_name} actual={parsed.interviewer_name} />}
              {parsed.rejection_reason && <FieldRow label="rejection_reason" actual={parsed.rejection_reason} />}
              {parsed.job_posting_url && <FieldRow label="job_posting_url" actual={parsed.job_posting_url} />}
            </div>
          </div>

          {/* Legend */}
          <div style={{ marginTop: 10, display: 'flex', gap: 14, fontFamily: dm, fontSize: 11, color: '#AAA' }}>
            <span><span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> matches expected</span>
            <span><span style={{ color: '#F59E0B', fontWeight: 700 }}>~</span> close / partial match</span>
          </div>
        </div>
      )}

      {/* Expected output (always shown below result) */}
      <div style={{ padding: '10px 18px 14px', background: '#FAFAFA', borderTop: '1px solid #F0F0F0' }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#BBB', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
          Expected Output
        </p>
        <pre style={{
          fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: 11, color: '#666',
          margin: 0, background: 'transparent', whiteSpace: 'pre-wrap',
        }}>
          {JSON.stringify(email.expected, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function EmailParserTestPanel({ onClose }) {
  return (
    <div style={{ fontFamily: dm }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: pf, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Email Parser Tests
          </h2>
          <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
            4 sample emails — run each to verify AI extraction accuracy.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: '#F3F4F6', border: 'none', borderRadius: '50%',
              width: 32, height: 32, minHeight: 32, minWidth: 32,
              cursor: 'pointer', fontSize: 18, color: '#555',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Run all hint */}
      <div style={{
        background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10,
        padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <span style={{ fontSize: 14 }}>💡</span>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#1D4ED8', margin: 0, lineHeight: 1.5 }}>
          Click <strong>▶ Run Test</strong> on each card to send the sample email to the AI parser and compare the output against expected results. <code style={{ background: '#DBEAFE', borderRadius: 3, padding: '1px 4px' }}>send_notification: false</code> so no emails are sent during testing.
        </p>
      </div>

      {SAMPLE_EMAILS.map(email => (
        <TestCard key={email.id} email={email} />
      ))}
    </div>
  );
}