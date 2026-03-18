import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import StudentRow from './StudentRow';
import AddStudentForm from './AddStudentForm';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';
const MAX_STUDENTS = 4;

export default function ParentStudentCard({ user }) {
  const { refreshUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');

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

  const handleRemoveStudent = async (emailToRemove) => {
    const updated = emails.filter(e => e !== emailToRemove);
    await base44.auth.updateMe({ student_emails: updated });
    setStudents(prev => prev.filter(s => s.email !== emailToRemove));
    if (refreshUser) await refreshUser();
  };

  const handleStudentAdded = (newEmail, firstName) => {
    setStudents(prev => [...prev, { email: newEmail, student: null }]);
    setShowAddForm(false);
    setConfirmMsg(`Invitation sent to ${firstName} ✓`);
    setTimeout(() => setConfirmMsg(''), 3000);
    if (refreshUser) refreshUser();
  };

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>
        Your Student{emails.length !== 1 ? 's' : ''}
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Who you're here for.</p>

      {loading ? (
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888' }}>Loading…</p>
      ) : students.length === 0 && !showAddForm ? (
        <div>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 12 }}>You haven't linked a student yet.</p>
          <button onClick={() => setShowAddForm(true)} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: ORANGE,
            background: 'transparent', border: `1.5px dashed ${ORANGE}`, borderRadius: 12,
            padding: '14px 20px', cursor: 'pointer', width: '100%', minHeight: 'auto',
            textAlign: 'center',
          }}>+ Add a Student</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {students.map(({ email, student }) => (
            <StudentRow
              key={email}
              email={email}
              student={student}
              parentUser={user}
              onRemove={!student ? handleRemoveStudent : undefined}
            />
          ))}

          {/* Confirmation message */}
          {confirmMsg && (
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#4CAF50', textAlign: 'center', margin: '4px 0 0' }}>{confirmMsg}</p>
          )}

          {/* Add another or max reached */}
          {!showAddForm && students.length < MAX_STUDENTS && (
            <button onClick={() => setShowAddForm(true)} style={{
              fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: ORANGE,
              background: 'transparent', border: `1.5px dashed ${ORANGE}`, borderRadius: 12,
              padding: '14px 20px', cursor: 'pointer', width: '100%', minHeight: 'auto',
              textAlign: 'center', marginTop: 4,
            }}>+ Add Another Student</button>
          )}

          {!showAddForm && students.length >= MAX_STUDENTS && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 }}>
              You've reached the maximum of {MAX_STUDENTS} linked students.
            </p>
          )}
        </div>
      )}

      {showAddForm && (
        <div style={{ marginTop: students.length > 0 ? 12 : 0 }}>
          <AddStudentForm
            parentUser={user}
            onAdded={handleStudentAdded}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
    </div>
  );
}