import React from 'react';
import { navigate } from '@/components/utils/navigation';
import { dmSans, playfair, ORANGE, MUTED } from './constants';

export default function ParentHomeHero({ user }) {
  // Handle "Last, First" format (e.g. "Gosinoff, Greg" → "Greg")
  const rawName = user?.full_name || '';
  const cleanedName = rawName.includes(',') ? rawName.split(',').reverse().map(s => s.trim()).join(' ') : rawName;
  const firstName = cleanedName.split(' ')[0] || 'there';

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const dateLine = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()} · ${h12}:${minutes} ${ampm}`;

  return (
    <div style={{ padding: '16px 0 20px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 5vw, 32px)', color: '#fff', lineHeight: 1.3, margin: 0 }}>
        Welcome back, <span style={{ fontStyle: 'italic', color: ORANGE }}>{firstName}.</span>
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 13, color: MUTED, marginTop: 8, marginBottom: 20 }}>{dateLine}</p>
      <button
        onClick={() => navigate('Directory')}
        style={{
          background: ORANGE, border: 'none', borderRadius: 100,
          padding: '13px 28px', fontSize: 14, fontWeight: 600,
          color: '#fff', cursor: 'pointer', fontFamily: dmSans,
          minHeight: 'auto', display: 'inline-block',
        }}
      >
        Browse the Directory →
      </button>
    </div>
  );
}