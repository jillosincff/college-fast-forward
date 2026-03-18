import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { dmSans, ORANGE, CARD_BG, BORDER, MUTED, AMBER, GREEN } from './constants';

export default function StudentInactiveCard({ inactiveStudents, parentName }) {
  const [nudgedEmails, setNudgedEmails] = useState({});

  if (!inactiveStudents.length) return null;

  const sendNudge = async (studentEmail, studentName) => {
    setNudgedEmails(prev => ({ ...prev, [studentEmail]: 'sending' }));
    const firstName = parentName?.split(' ')[0] || 'Your parent';
    await base44.integrations.Core.SendEmail({
      to: studentEmail,
      subject: `${firstName} wanted us to check in 💙`,
      body: `<div style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #374151; max-width: 500px; margin: 0 auto; padding: 20px;">
        <p>Hi ${studentName},</p>
        <p>${firstName} wanted to make sure you're staying on track with your career search.</p>
        <p>Your FastIQ plan is waiting — log back in and keep your momentum going.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://www.collegefastforward.com/#Dashboard" style="background-color: #E85D20; color: white; padding: 12px 24px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 15px;">Log in to FastIQ →</a>
        </div>
        <p style="color: #888; font-size: 13px;">— The College Fast Forward Team</p>
      </div>`,
      from_name: 'College Fast Forward',
    }).catch(() => {});
    setNudgedEmails(prev => ({ ...prev, [studentEmail]: 'sent' }));
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
        YOUR STUDENT
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {inactiveStudents.map(({ email, student, daysSinceActive }) => {
          const name = student?.full_name?.split(' ')[0] || email?.split('@')[0] || 'Your student';
          const uni = student?.university || '';
          const nudgeState = nudgedEmails[email];
          return (
            <div key={email} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>{name}{uni ? ` · ${uni}` : ''}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: AMBER, flexShrink: 0 }} />
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: AMBER, margin: '0 0 8px' }}>
                {name} hasn't logged into FastIQ in {daysSinceActive || '7+'} days.
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '0 0 16px' }}>
                A quick nudge from you might be all they need to get moving again.
              </p>
              {nudgeState === 'sent' ? (
                <>
                  <button disabled style={{
                    width: '100%', padding: '12px 20px', borderRadius: 100,
                    background: 'transparent', border: `1px solid ${GREEN}`, color: GREEN,
                    fontFamily: dmSans, fontSize: 14, fontWeight: 500, cursor: 'default', minHeight: 'auto', opacity: 0.8,
                  }}>Nudge sent ✓</button>
                  <p style={{ fontFamily: dmSans, fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>
                    We'll let you know if they log in.
                  </p>
                </>
              ) : (
                <>
                  <button onClick={() => sendNudge(email, name)} disabled={nudgeState === 'sending'} style={{
                    width: '100%', padding: '12px 20px', borderRadius: 100,
                    background: 'transparent', border: `1.5px solid ${ORANGE}`, color: ORANGE,
                    fontFamily: dmSans, fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 'auto',
                    opacity: nudgeState === 'sending' ? 0.5 : 1,
                  }}>
                    {nudgeState === 'sending' ? 'Sending...' : `Send ${name} a Nudge →`}
                  </button>
                  <p style={{ fontFamily: dmSans, fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 8 }}>
                    We'll send them a friendly reminder — it comes from you, not us.
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}