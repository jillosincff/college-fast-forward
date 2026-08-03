import React from 'react';
import { dmSans, ORANGE } from './ParentOnboardingShell';

/**
 * Shows parents exactly what goes out under their name before they hit send —
 * removes the "what am I about to blast at my kid?" hesitation.
 */
export default function InvitePreview({ parentName, studentName }) {
  const parentFirst = (parentName || '').trim().split(' ')[0] || 'Your parent';
  const student = (studentName || '').trim() || 'your student';

  return (
    <div style={{
      background: '#F8FAFC', border: '1px solid #E2E8F0',
      borderRadius: 12, padding: '14px 16px', marginBottom: 24,
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, margin: '0 0 8px' }}>
        What they’ll receive
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 6px', lineHeight: 1.5 }}>
        {parentFirst} invited you to College Fast Forward
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>
        “Hi {student} — {parentFirst} set you up with CLIFF, an AI career assistant that finds internships,
        tailors your resume, and connects you to alumni. Create your profile to get started.”
      </p>
    </div>
  );
}