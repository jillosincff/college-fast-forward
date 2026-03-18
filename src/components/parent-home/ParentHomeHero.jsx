import React from 'react';
import { dmSans, playfair, ORANGE, MUTED } from './constants';

export default function ParentHomeHero({ user }) {
  const firstName = user?.full_name?.split(' ')[0] || user?.full_name || 'there';

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const dateLine = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()} · ${h12}:${minutes} ${ampm}`;

  return (
    <div style={{ padding: '36px 24px 20px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 5vw, 32px)', color: '#fff', lineHeight: 1.3, margin: 0 }}>
        Welcome back, <span style={{ fontStyle: 'italic', color: ORANGE }}>{firstName}.</span>
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 13, color: MUTED, marginTop: 8 }}>{dateLine}</p>
    </div>
  );
}