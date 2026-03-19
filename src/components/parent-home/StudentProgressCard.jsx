import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { dmSans, playfair, ORANGE, CARD_BG, BORDER, MUTED, AMBER, GREEN } from './constants';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import moment from 'moment';
import ParentProgressRings from '../fastiq/parent/ParentProgressRings';
import ParentPipelineSummary from '../fastiq/parent/ParentPipelineSummary';
import ParentTargetCompanies from '../fastiq/parent/ParentTargetCompanies';
import ParentNudgeButton from '../fastiq/parent/ParentNudgeButton';

function StatCell({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{value ?? '—'}</p>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: MUTED, marginTop: 2 }}>{label}</p>
    </div>
  );
}

function ActiveStudentCard({ student, daysSinceActive, profile, parentUser }) {
  const [showDetails, setShowDetails] = useState(false);
  const name = student?.full_name?.split(' ')[0] || 'Student';
  const uni = student?.university || '';
  const lastActive = daysSinceActive != null ? (daysSinceActive === 0 ? 'Today' : `${daysSinceActive} day${daysSinceActive > 1 ? 's' : ''} ago`) : 'Unknown';

  // Extract pipeline counts and companies from profile
  const pipelineCounts = profile?.pipeline_counts || {};
  const targetCompanies = profile?.target_companies || [];
  const hasTargets = targetCompanies.length > 0;

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{name}</span>
          {uni && <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>· {uni}</span>}
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, color: GREEN }}>Active</span>
        </div>
        {hasTargets && (
          <button onClick={() => setShowDetails(!showDetails)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto',
          }}>
            {showDetails ? <ChevronDown style={{ width: 16, height: 16, color: '#888' }} /> : <ChevronRight style={{ width: 16, height: 16, color: '#888' }} />}
          </button>
        )}
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: MUTED, marginBottom: 16 }}>Last active: {lastActive}</p>

      {/* Embedded progress rings */}
      {profile && <ParentProgressRings profile={profile} />}

      {/* Embedded pipeline summary */}
      {profile && <ParentPipelineSummary counts={pipelineCounts} studentName={name} />}

      {/* Expandable target companies */}
      {showDetails && hasTargets && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #2A2A2A' }}>
          <ParentTargetCompanies
            companies={targetCompanies}
            intelCache={{}}
            alumniCounts={{}}
          />
        </div>
      )}

      {/* Nudge button for stalled students */}
      {daysSinceActive > 7 && profile && parentUser && (
        <div style={{ marginTop: 16 }}>
          <ParentNudgeButton studentName={name} studentEmail={student?.email} parentUser={parentUser} />
        </div>
      )}

      <p style={{ fontFamily: playfair, fontStyle: 'italic', fontSize: 13, color: MUTED, marginTop: 12 }}>
        {name} is moving forward.
      </p>
    </div>
  );
}

function InactiveStudentCard({ student, daysSinceActive }) {
  const name = student?.full_name?.split(' ')[0] || 'Student';
  const uni = student?.university || '';
  const lastActive = daysSinceActive != null ? `${daysSinceActive} day${daysSinceActive > 1 ? 's' : ''} ago` : 'Unknown';

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{name}</span>
        {uni && <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>· {uni}</span>}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: AMBER, flexShrink: 0 }} />
        <span style={{ fontFamily: dmSans, fontSize: 11, color: AMBER }}>Inactive</span>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: AMBER, marginBottom: 12 }}>Last active: {lastActive}</p>
      <p style={{ fontFamily: dmSans, fontSize: 13, color: MUTED }}>No activity this week.</p>
    </div>
  );
}

function PendingStudentCard({ email }) {
  const name = email?.split('@')[0] || 'Student';
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{name}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: MUTED, flexShrink: 0 }} />
        <span style={{ fontFamily: dmSans, fontSize: 11, color: MUTED }}>Invitation Pending</span>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 12, color: MUTED, marginBottom: 8 }}>Invited · awaiting signup</p>
      <button onClick={() => navigate('ParentOnboarding', { step: 'invite' })} style={{
        background: 'none', border: 'none', padding: 0,
        fontFamily: dmSans, fontSize: 13, color: ORANGE, cursor: 'pointer', minHeight: 'auto',
      }}>Resend Invitation →</button>
    </div>
  );
}

function NoFastIQStudentCard({ student, email }) {
  const name = student?.full_name?.split(' ')[0] || email?.split('@')[0] || 'Student';
  const uni = student?.university || '';
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{name}</span>
        {uni && <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>· {uni}</span>}
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, flexShrink: 0 }} />
        <span style={{ fontFamily: dmSans, fontSize: 11, color: ORANGE }}>FastIQ not activated</span>
      </div>
      <button onClick={() => navigate('GatorWelcome')} style={{
        background: 'none', border: 'none', padding: 0, marginTop: 8,
        fontFamily: dmSans, fontSize: 13, color: ORANGE, cursor: 'pointer', minHeight: 'auto',
      }}>Activate FastIQ →</button>
    </div>
  );
}

export default function StudentProgressSection({ students }) {
  if (!students.length) {
    return (
      <div>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
          YOUR STUDENT'S PROGRESS
        </p>
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 16 }}>You haven't linked a student yet.</p>
          <button onClick={() => navigate('ParentOnboarding', { step: 'invite' })} style={{
            padding: '12px 24px', borderRadius: 100, border: 'none',
            background: ORANGE, color: '#fff', fontFamily: dmSans, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', minHeight: 'auto',
          }}>Find & Link Your Student →</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
        YOUR STUDENT'S PROGRESS
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {students.map(({ email, student, status, daysSinceActive, profile, parentUser }) => {
          if (status === 'active') return <ActiveStudentCard key={email} student={student} daysSinceActive={daysSinceActive} profile={profile} parentUser={parentUser} />;
          if (status === 'inactive') return <InactiveStudentCard key={email} student={student} daysSinceActive={daysSinceActive} />;
          if (status === 'no_fastiq' && student) return <NoFastIQStudentCard key={email} student={student} email={email} />;
          return <PendingStudentCard key={email} email={email} />;
        })}
      </div>
    </div>
  );
}