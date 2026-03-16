import React from 'react';
import { User } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function RGProfileNudge({ percent }) {
  return (
    <div
      onClick={() => navigate('ProfileEdit')}
      style={{
        background: '#fff', borderRadius: 16, padding: '20px 20px',
        cursor: 'pointer', border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: 'rgba(232,93,32,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User style={{ width: 18, height: 18, color: '#E85D20' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 2,
          }}>Complete your profile to get better matches</p>
          <p style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#888', margin: 0,
          }}>Add your LinkedIn, target role, and a short bio — takes 2 minutes</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flex: 1, height: 6, borderRadius: 3, background: '#f1f1f1', overflow: 'hidden',
        }}>
          <div style={{
            width: `${percent}%`, height: '100%', borderRadius: 3,
            background: '#E85D20', transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 700, color: '#E85D20',
        }}>{percent}%</span>
      </div>
    </div>
  );
}