import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { dmSans, ORANGE, CARD_BG, BORDER, MUTED } from './constants';

export default function FastIQNudgeCard({ studentsNeedingFastIQ }) {
  if (!studentsNeedingFastIQ.length) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>
        YOUR STUDENT
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {studentsNeedingFastIQ.map(({ email, student }) => {
          const name = student?.full_name?.split(' ')[0] || email?.split('@')[0] || 'Your student';
          const uni = student?.university || '';
          return (
            <div key={email} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>{name}{uni ? ` · ${uni}` : ''}</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, flexShrink: 0 }} />
              </div>
              <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>
                {name} doesn't have FastIQ yet.
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '0 0 16px' }}>
                They're in the network but missing their career plan, alumni contacts, and personalized outreach. Activate FastIQ to give them the full system.
              </p>
              <button onClick={() => navigate('GatorWelcome')} style={{
                width: '100%', padding: '13px 20px', borderRadius: 100, border: 'none',
                background: ORANGE, color: '#fff', fontFamily: dmSans, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', minHeight: 'auto',
              }}>
                Activate FastIQ for {name} →
              </button>
              <p style={{ fontFamily: dmSans, fontSize: 11, color: '#666', textAlign: 'center', marginTop: 8 }}>
                $29/month or $249/year · 7-day free trial · Cancel anytime
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}