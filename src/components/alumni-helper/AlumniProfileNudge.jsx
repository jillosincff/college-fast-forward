import React from 'react';
import { User } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function AlumniProfileNudge({ percent }) {
  if (percent >= 100) return null;

  return (
    <div
      onClick={() => navigate('ProfileEdit')}
      style={{
        background: '#fff', borderRadius: 16, padding: '24px',
        cursor: 'pointer', transition: 'box-shadow 0.2s',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: 'rgba(232,93,32,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User style={{ width: 22, height: 22, color: '#E85D20' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
            Complete your profile to get matched with more student questions
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 14 }}>
            Add your LinkedIn URL and a short bio — takes 2 minutes
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)' }}>
              <div style={{
                height: 6, borderRadius: 3, background: '#E85D20',
                width: `${percent}%`, transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#E85D20', flexShrink: 0 }}>
              {percent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}