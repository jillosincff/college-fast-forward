import React, { useState } from 'react';

const CAMPUS_DATA = [
  { key: 'uf',     label: 'UF',         name: 'University of Florida',        count: 847,  color: '#0021A5', accent: '#FA4616' },
  { key: 'fsu',    label: 'FSU',        name: 'Florida State University',      count: 712,  color: '#782F40', accent: '#CEB888' },
  { key: 'ucf',    label: 'UCF',        name: 'Univ. of Central Florida',      count: 634,  color: '#000000', accent: '#FFC904' },
  { key: 'osu',    label: 'Ohio St.',   name: 'Ohio State University',         count: 1103, color: '#BB0000', accent: '#666666' },
  { key: 'umich',  label: 'Michigan',   name: 'University of Michigan',        count: 988,  color: '#00274C', accent: '#FFCB05' },
  { key: 'psu',    label: 'Penn State', name: 'Penn State University',         count: 756,  color: '#1E407C', accent: '#FFFFFF' },
  { key: 'usc',    label: 'USC',        name: 'Univ. of South Carolina',       count: 581,  color: '#73000A', accent: '#FFC72C' },
  { key: 'uga',    label: 'UGA',        name: 'University of Georgia',         count: 623,  color: '#BA0C2F', accent: '#000000' },
];

export default function CampusVaultWidget({ go, onSchoolSelect, FONT, TEXT, TEXT2, TEXT3, CARD, BG, BLUE, BLUE_LIGHT, BLUE_BORDER, GREEN, GREEN_LIGHT, GREEN_BORDER, SHADOW, SHADOW_MD, R }) {
  const [selected, setSelected] = useState(null);

  const active = selected ? CAMPUS_DATA.find(c => c.key === selected) : null;

  const handleSchoolClick = (campus) => {
    setSelected(campus.key);
    // Short delay so user sees the selection flash, then launch onboarding
    setTimeout(() => {
      if (onSchoolSelect) onSchoolSelect(campus.name);
    }, 320);
  };

  return (
    <div style={{ padding: '80px 24px', background: BG }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>
          Live Campus Vault Status
        </p>
        <h2 style={{ fontFamily: FONT, fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', textAlign: 'center', margin: '0 0 12px', lineHeight: 1.2 }}>
          Pick your school. See who's locked in.
        </h2>
        <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, textAlign: 'center', margin: '0 0 40px' }}>
          Real-time alumni &amp; parent counts actively synced on top-tier hiring teams.
        </p>

        {/* School grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          {CAMPUS_DATA.map(campus => (
            <button
              key={campus.key}
              onClick={() => handleSchoolClick(campus)}
              style={{
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                color: selected === campus.key ? '#fff' : TEXT,
                background: selected === campus.key ? campus.color : CARD,
                border: `2px solid ${selected === campus.key ? campus.color : '#E2E8F0'}`,
                borderRadius: 10,
                padding: '10px 18px',
                cursor: 'pointer',
                minHeight: 'auto',
                transition: 'all 0.15s ease',
                boxShadow: selected === campus.key ? `0 6px 18px ${campus.color}44` : SHADOW,
              }}
              onMouseEnter={e => { if (selected !== campus.key) { e.currentTarget.style.borderColor = campus.color; e.currentTarget.style.color = campus.color; } }}
              onMouseLeave={e => { if (selected !== campus.key) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = TEXT; } }}
            >
              {campus.label}
            </button>
          ))}
        </div>

        {/* Result card */}
        {active ? (
          <div style={{
            background: CARD,
            borderRadius: 16,
            border: `2px solid ${active.color}33`,
            boxShadow: `0 12px 32px ${active.color}18`,
            padding: '32px 28px',
            textAlign: 'center',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${active.color}12`, border: `1px solid ${active.color}33`, borderRadius: 100, padding: '5px 16px', marginBottom: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: active.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Grid Active</span>
            </div>
            <h3 style={{ fontFamily: FONT, fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: active.color, margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {active.count.toLocaleString()}
            </h3>
            <p style={{ fontFamily: FONT, fontSize: 'clamp(14px, 1.8vw, 18px)', fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>
              Active Parents &amp; Alumni Synced
            </p>
            <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, margin: '0 0 28px', lineHeight: 1.6 }}>
              {active.name} insiders are on top-tier hiring teams right now — and your profile isn't in front of them yet.
            </p>
            <button
              onClick={go}
              style={{
                fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#fff',
                background: active.color,
                border: 'none', borderRadius: 12, padding: '14px 32px',
                cursor: 'pointer', minHeight: 'auto',
                boxShadow: `0 8px 24px ${active.color}44`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              ⚡ Tap Into the {active.label} Grid
            </button>
          </div>
        ) : (
          <div style={{
            background: BLUE_LIGHT, border: `1px dashed ${BLUE_BORDER}`,
            borderRadius: 16, padding: '32px 24px', textAlign: 'center',
          }}>
            <p style={{ fontFamily: FONT, fontSize: 28, margin: '0 0 8px' }}>☝️</p>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>Select your school above</p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>See the live alumni count locked in on real hiring teams</p>
          </div>
        )}
      </div>
    </div>
  );
}