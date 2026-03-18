import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

export default function ParentStudentCard({ user }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const emails = user?.student_emails || [];
      if (emails.length === 0) { setLoading(false); return; }
      try {
        const users = await base44.entities.User.filter({ email: emails[0] });
        if (users?.length) setStudent(users[0]);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user?.student_emails]);

  const studentName = student?.full_name || user?.student_emails?.[0] || null;
  const isFastIQ = student?.fastiq_active === true || student?.subscription_status === 'active' || student?.membership_tier === 'fastiq';

  const handleResend = async () => {
    const email = user?.student_emails?.[0];
    if (!email) return;
    const parentFirst = user?.full_name?.split(' ')[0] || 'Your parent';
    await base44.functions.invoke('sendStudentInviteEmail', {
      student_email: email, student_name: studentName || '', parent_name: parentFirst,
    });
  };

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>Your Student</p>
      <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Who you're here for.</p>

      {loading ? (
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888' }}>Loading…</p>
      ) : student ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff' }}>{student.full_name || student.email}</span>
            {student.university && <span style={{ fontFamily: dmSans, fontSize: 12, color: '#888' }}>· {student.university}</span>}
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
            <span style={{ fontFamily: dmSans, fontSize: 12, color: '#4CAF50' }}>Active</span>
          </div>
          {isFastIQ ? (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#4CAF50', marginBottom: 0 }}>FastIQ Active ✓</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span style={{ fontFamily: dmSans, fontSize: 13, color: '#888' }}>FastIQ not activated</span>
              <button onClick={() => navigate('GetStarted')} style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: ORANGE,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto',
              }}>Activate FastIQ →</button>
            </div>
          )}
        </div>
      ) : user?.student_emails?.length ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>{user.student_emails[0]}</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#888', flexShrink: 0 }} />
            <span style={{ fontFamily: dmSans, fontSize: 12, color: '#888' }}>Invitation pending</span>
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', marginBottom: 12 }}>They haven't created their account yet.</p>
          <button onClick={handleResend} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: ORANGE,
            background: 'transparent', border: `1px solid ${ORANGE}`, borderRadius: 100,
            padding: '8px 20px', cursor: 'pointer', minHeight: 'auto',
          }}>Resend Invitation →</button>
        </div>
      ) : (
        <div>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 12 }}>You haven't linked a student yet.</p>
          <button onClick={() => navigate('ProfileEdit')} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
            background: ORANGE, border: 'none', borderRadius: 100,
            padding: '10px 24px', cursor: 'pointer', minHeight: 'auto',
          }}>Find & Link Your Student →</button>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#666', marginTop: 8 }}>Search by name or email. If they haven't signed up yet, we'll connect you automatically when they do.</p>
        </div>
      )}
    </div>
  );
}