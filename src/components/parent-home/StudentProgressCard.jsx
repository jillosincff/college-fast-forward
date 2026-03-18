import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { dmSans, playfair, ORANGE, CARD_BG, BORDER, MUTED, AMBER, GREEN } from './constants';
import moment from 'moment';

function StatCell({ label, value }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{value ?? '—'}</p>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: MUTED, marginTop: 2 }}>{label}</p>
    </div>
  );
}

function ActiveStudentCard({ student, daysSinceActive }) {
  const name = student?.full_name?.split(' ')[0] || 'Student';
  const uni = student?.university || '';
  const lastActive = daysSinceActive != null ? (daysSinceActive === 0 ? 'Today' : `${daysSinceActive} day${daysSinceActive > 1 ? 's' : ''} ago`) : 'Unknown';

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{name}</span>
          {uni && <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>· {uni}</span>}
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
          <span style={{ fontFamily: dmSans, fontSize: 11, color: GREEN }}>Active</span>
        </div>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: MUTED, marginBottom: 16 }}>Last active: {lastActive}</p>

      <div style={{ display: 'flex', gap: 8, padding: '12px 0', borderTop: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
        <StatCell label="Companies targeted" value={student?.targeted_companies_count || 0} />
        <StatCell label="Messages this week" value={student?.messages_sent_this_week || 0} />
        <StatCell label="Responses" value={student?.responses_received || 0} />
      </div>

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
        {students.map(({ email, student, status, daysSinceActive }) => {
          if (status === 'active') return <ActiveStudentCard key={email} student={student} daysSinceActive={daysSinceActive} />;
          if (status === 'inactive') return <InactiveStudentCard key={email} student={student} daysSinceActive={daysSinceActive} />;
          if (status === 'no_fastiq' && student) return <NoFastIQStudentCard key={email} student={student} email={email} />;
          return <PendingStudentCard key={email} email={email} />;
        })}
      </div>
    </div>
  );
}