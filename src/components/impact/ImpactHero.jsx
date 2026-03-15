import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function ImpactHero({ user }) {
  const firstName = (() => {
    const name = user?.full_name || '';
    if (name.includes(',')) {
      const parts = name.split(',').map(s => s.trim());
      return parts[1]?.split(/\s+/)[0] || 'there';
    }
    return name.split(/\s+/)[0] || 'there';
  })();

  return (
    <section style={{
      background: 'linear-gradient(135deg, #0d1117 0%, #0a1a6e 60%, #0821A5 100%)',
      padding: '48px 24px 52px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12,
        }}>
          MY IMPACT
        </p>
        <h1 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 32, color: '#fff',
          letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10,
        }}>
          You're making a difference,{' '}
          <span style={{ fontFamily: playfair, fontStyle: 'italic', color: '#E85D20' }}>{firstName}</span>.
        </h1>
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.6, maxWidth: 520, margin: 0,
        }}>
          Every question answered, every intro made — it all adds up.
        </p>
      </div>
    </section>
  );
}