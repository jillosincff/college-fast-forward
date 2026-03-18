import React from 'react';
import { dmSans, CARD_BG, ORANGE, BORDER, MUTED } from './constants';
import { CalendarPlus } from 'lucide-react';

const SAMPLE_EVENTS = [
  { name: 'Spring Career Fair', date: 'Mar 25, 2026 · 10:00 AM', location: 'Reitz Union Ballroom', desc: 'Meet 100+ employers across all industries. Bring your resume.' },
  { name: 'Resume Workshop', date: 'Mar 28, 2026 · 2:00 PM', location: 'Virtual (Zoom)', desc: 'Get your resume reviewed by career center professionals.' },
  { name: 'Mock Interview Day', date: 'Apr 2, 2026 · 9:00 AM', location: 'Career Connections Center', desc: 'Practice interviews with real employers and get feedback.' },
  { name: 'LinkedIn Headshot Day', date: 'Apr 5, 2026 · 11:00 AM', location: 'Library West Lawn', desc: 'Free professional headshots for your LinkedIn profile.' },
];

export default function TabCareerCenter({ user }) {
  const school = user?.school || user?.university;

  if (!school) {
    return (
      <div>
        <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>What's happening at your Career Center.</h2>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 32 }}>Events, deadlines, and resources from your school — all in one place.</p>
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: MUTED, marginBottom: 16 }}>Add your university to see events from your career center.</p>
          <button onClick={() => {}} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '10px 24px', cursor: 'pointer', minHeight: 'auto' }}>
            Add Your School →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>What's happening at {school} Career Center.</h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 24 }}>Events, deadlines, and resources from your school — all in one place.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SAMPLE_EVENTS.map((evt, i) => (
          <div key={i} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{evt.name}</p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: ORANGE, fontWeight: 500, marginBottom: 2 }}>{evt.date}</p>
                <p style={{ fontFamily: dmSans, fontSize: 13, color: '#666', marginBottom: 8 }}>{evt.location}</p>
                <p style={{ fontFamily: dmSans, fontSize: 14, color: '#aaa', lineHeight: 1.5 }}>{evt.desc}</p>
              </div>
              <button style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: ORANGE, background: 'none', border: `1px solid rgba(232,93,32,0.3)`, borderRadius: 100, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap' }}>
                <CalendarPlus size={14} />
                Add to Calendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}