import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const BORDER = '#2A2A2A';

function daysAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Determines student state:
 *  A = signed up + fastiq active
 *  C = signed up + fastiq NOT active but has some activity
 *  D = signed up + fastiq NOT active (no activity)
 *  B = not signed up (invitation pending)
 */
function getStudentState(student) {
  if (!student) return 'B'; // not signed up
  const hasFastIQ = student.fastiq_active === true || student.subscription_status === 'active' || student.membership_tier === 'fastiq';
  if (hasFastIQ) return 'A';
  // Check if they've done anything
  const hasActivity = student.onboarding_completed === true;
  if (hasActivity) return 'C';
  return 'D';
}

export default function StudentRow({ email, student, parentUser, onRemove }) {
  const [resending, setResending] = useState(false);
  const [nudging, setNudging] = useState(false);
  const state = getStudentState(student);
  const firstName = student?.full_name?.split(' ')[0] || email?.split('@')[0] || 'Student';
  const university = student?.university || '';
  const lastActive = daysAgo(student?.updated_date);

  const handleResend = async () => {
    setResending(true);
    const parentFirst = parentUser?.full_name?.split(' ')[0] || 'Your parent';
    await base44.functions.invoke('sendStudentInviteEmail', {
      student_email: email, student_name: firstName, parent_name: parentFirst,
    });
    setResending(false);
  };

  const handleNudge = async () => {
    setNudging(true);
    const parentFirst = parentUser?.full_name?.split(' ')[0] || 'Your parent';
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `${parentFirst} wants you to get started on FastIQ!`,
      body: `Hey ${firstName},\n\n${parentFirst} set up College Fast Forward for you. It takes 5 minutes to get started and could change your career search.\n\nLog in now to activate FastIQ.\n\n— College Fast Forward`,
    });
    setNudging(false);
  };

  const rowStyle = {
    background: '#111', border: `1px solid ${BORDER}`, borderRadius: 10,
    padding: '16px 20px',
  };

  // State A — Active with FastIQ
  if (state === 'A') {
    return (
      <div style={rowStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{firstName}</span>
          {university && <span style={{ fontFamily: dmSans, fontSize: 12, color: '#888' }}>· {university}</span>}
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
          <span style={{ fontFamily: dmSans, fontSize: 12, color: '#4CAF50' }}>Active</span>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#4CAF50', margin: '0 0 4px' }}>FastIQ Active ✓</p>
        {lastActive && <p style={{ fontFamily: dmSans, fontSize: 12, color: '#888', margin: 0 }}>Last active {lastActive}</p>}
      </div>
    );
  }

  // State B — Invitation pending
  if (state === 'B') {
    return (
      <div style={rowStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{firstName}</span>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#888', flexShrink: 0 }} />
          <span style={{ fontFamily: dmSans, fontSize: 12, color: '#888' }}>Invitation Pending</span>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#888', margin: '0 0 10px' }}>Invited — hasn't created their account yet.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button onClick={handleResend} disabled={resending} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: ORANGE,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto',
            opacity: resending ? 0.5 : 1,
          }}>{resending ? 'Sending…' : 'Resend Invitation →'}</button>
          {onRemove && (
            <button onClick={() => onRemove(email)} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#666',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto',
            }}>Cancel Invitation</button>
          )}
        </div>
      </div>
    );
  }

  // State C — Signed up, not started FastIQ
  if (state === 'C') {
    return (
      <div style={rowStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{firstName}</span>
          {university && <span style={{ fontFamily: dmSans, fontSize: 12, color: '#888' }}>· {university}</span>}
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
          <span style={{ fontFamily: dmSans, fontSize: 12, color: '#F59E0B' }}>Not yet started</span>
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: '#888', margin: '0 0 10px' }}>
          {student?.created_date ? `Joined on ${formatDate(student.created_date)}` : 'Joined'} — hasn't started FastIQ yet
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button onClick={handleNudge} disabled={nudging} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: ORANGE,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto',
            opacity: nudging ? 0.5 : 1,
          }}>{nudging ? 'Sending…' : 'Send a Nudge →'}</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontFamily: dmSans, fontSize: 13, color: '#888' }}>FastIQ not activated</span>
          <button onClick={() => navigate('GetStarted')} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
            background: ORANGE, border: 'none', borderRadius: 100,
            padding: '6px 16px', cursor: 'pointer', minHeight: 'auto',
          }}>Activate FastIQ →</button>
        </div>
      </div>
    );
  }

  // State D — Signed up, FastIQ not activated
  return (
    <div style={rowStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
        <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{firstName}</span>
        {university && <span style={{ fontFamily: dmSans, fontSize: 12, color: '#888' }}>· {university}</span>}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
        <span style={{ fontFamily: dmSans, fontSize: 12, color: '#F59E0B' }}>FastIQ not activated</span>
      </div>
      <button onClick={() => navigate('GetStarted')} style={{
        fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
        background: ORANGE, border: 'none', borderRadius: 100,
        padding: '10px 20px', cursor: 'pointer', width: '100%', minHeight: 'auto',
        marginTop: 8,
      }}>Activate FastIQ for {firstName} →</button>
    </div>
  );
}