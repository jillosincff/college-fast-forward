import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { dmSans, playfair, ORANGE, CARD_BG, BORDER, MUTED, GREEN } from './constants';

export default function AllClearCard({ students }) {
  // Find first active student for dynamic copy
  const activeStudent = students.find(s => s.status === 'active' && s.student);
  const studentName = activeStudent?.student?.full_name?.split(' ')[0] || 'Your student';

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
        {/* Large orange check icon */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(232,93,32,0.12)',
          border: `2px solid ${ORANGE}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <span style={{ fontSize: 26, color: ORANGE }}>✓</span>
        </div>

        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#fff', margin: '0 0 16px' }}>
          You're all caught up.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: GREEN, margin: 0 }}>✓ No intro requests waiting</p>
          {activeStudent && (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: GREEN, margin: 0 }}>
              ✓ {studentName} is active
            </p>
          )}
          <p style={{ fontFamily: dmSans, fontSize: 13, color: GREEN, margin: 0 }}>✓ Your profile is complete</p>
        </div>

        <p style={{ fontFamily: playfair, fontStyle: 'italic', fontSize: 14, color: ORANGE, margin: '0 0 20px', lineHeight: 1.5 }}>
          We'll notify you the moment a student needs your network.
        </p>

        <button onClick={() => navigate('Profile')} style={{
          background: 'none', border: 'none', padding: 0,
          fontFamily: dmSans, fontSize: 13, color: MUTED, cursor: 'pointer', minHeight: 'auto',
        }}>
          View your profile →
        </button>
      </div>
    </div>
  );
}