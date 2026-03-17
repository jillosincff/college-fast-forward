import React from 'react';
import { Send } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const BADGES = ['Active recently', 'Likely to respond'];

export default function PeopleToContact({ contacts, onUseMessage }) {
  if (!contacts || contacts.length === 0) return null;

  return (
    <div style={{
      background: '#15171C', borderRadius: 16, border: '1px solid #23252B',
      padding: '28px 28px 24px',
    }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
          👥 People to reach out to
        </h2>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Start with these — highest likelihood of response.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {contacts.map((person, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid #1F2128',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {/* Avatar circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#23252B',
                  border: '1px solid #2A2D35',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                  flexShrink: 0,
                }}>
                  {person.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', display: 'block', lineHeight: 1.3 }}>
                    {person.name}
                  </span>
                  <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>
                    {person.role} · {person.company}
                  </span>
                </div>
              </div>
              {person.badge && (
                <span style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                  color: '#4CAF50', background: 'rgba(76,175,80,0.1)',
                  border: '0.5px solid rgba(76,175,80,0.25)',
                  borderRadius: 100, padding: '3px 10px',
                  display: 'inline-block', marginTop: 2,
                }}>
                  {person.badge}
                </span>
              )}
            </div>
            <button onClick={() => onUseMessage(person)} style={{
              background: '#4F8CFF', border: 'none', borderRadius: 8,
              padding: '8px 18px', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'background 0.15s', minHeight: 'auto', width: 'auto',
              flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3A7BEE'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#4F8CFF'; }}
            >
              <Send size={13} /> Use message
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}