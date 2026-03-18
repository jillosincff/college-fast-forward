import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

function getStudentStatus(student) {
  if (!student) return { label: 'Invitation Pending', color: '#888', dot: '#888' };
  const hasFastIQ = student.fastiq_active === true || student.subscription_status === 'active' || student.membership_tier === 'fastiq';
  if (hasFastIQ || student.onboarding_completed === true) return { label: 'Active', color: '#4CAF50', dot: '#4CAF50' };
  return { label: 'Not yet started', color: '#F59E0B', dot: '#F59E0B' };
}

function StudentStatusRow({ email, student }) {
  const firstName = student?.full_name?.split(' ')[0] || email?.split('@')[0] || 'Student';
  const university = student?.university || '';
  const status = getStudentStatus(student);
  const uniLabel = university ? ` at ${university}` : '';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0' }}>
      <span style={{ color: status.dot === '#4CAF50' ? '#4CAF50' : status.dot, fontSize: 14, marginTop: 1, flexShrink: 0 }}>
        {status.dot === '#4CAF50' ? '✓' : '•'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#fff', margin: 0, lineHeight: 1.5 }}>
          Invitation sent to <strong>{firstName}</strong>{uniLabel}
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: status.color, margin: '2px 0 0', lineHeight: 1.4 }}>
          {status.label} {status.dot === '#4CAF50' && '✓'}
        </p>
      </div>
    </div>
  );
}

export default function ParentStudentCard({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const emails = user?.student_emails || [];

  useEffect(() => {
    const load = async () => {
      if (emails.length === 0) { setLoading(false); return; }
      const results = [];
      for (const email of emails) {
        try {
          const found = await base44.entities.User.filter({ email });
          results.push({ email, student: found?.length ? found[0] : null });
        } catch {
          results.push({ email, student: null });
        }
      }
      setStudents(results);
      setLoading(false);
    };
    load();
  }, [emails.join(',')]);

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>
        Your Student{emails.length !== 1 ? 's' : ''}
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Who you're here for.</p>

      {loading ? (
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888' }}>Loading…</p>
      ) : students.length === 0 ? (
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 12 }}>You haven't linked a student yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12 }}>
          {students.map(({ email, student }) => (
            <StudentStatusRow key={email} email={email} student={student} />
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('ParentOnboarding', { step: 'invite' })}
        style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: ORANGE,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          minHeight: 'auto', marginTop: 8,
        }}
      >
        Need to invite another student? Go to Invitations →
      </button>
    </div>
  );
}