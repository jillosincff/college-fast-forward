import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function StatPill({ label, count, variant = 'dark' }) {
  const bg = variant === 'orange' ? '#E85D20' : 'rgba(255,255,255,0.08)';
  const border = variant === 'orange' ? 'rgba(232,93,32,0.4)' : 'rgba(255,255,255,0.12)';
  const labelColor = variant === 'orange' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)';

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      borderRadius: 100, padding: '12px 28px', textAlign: 'center',
      minWidth: 100,
    }}>
      <p style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff',
        lineHeight: 1, marginBottom: 4, letterSpacing: '-0.02em',
      }}>
        {count != null && count > 0 ? count : '--'}
      </p>
      <p style={{
        fontFamily: dmSans, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: labelColor, margin: 0,
      }}>
        {label}
      </p>
    </div>
  );
}

export default function DirectoryHero({ stats, loading }) {
  return (
    <section style={{
      backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
      backgroundColor: '#0d1117',
      padding: '48px 24px 56px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 16,
        }}>
          MEMBER DIRECTORY
        </p>
        <h1 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 36, color: '#fff',
          letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 12,
        }}>
          Your Network is Bigger Than You Think.
        </h1>
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.6, maxWidth: 520, margin: '0 auto 32px',
        }}>
          Parents, alumni, and students — all here to open doors for each other.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <StatPill label="Members" count={loading ? null : stats.members} variant="dark" />
          <StatPill label="Students" count={loading ? null : stats.students} variant="dark" />
          <StatPill label="Parents" count={loading ? null : stats.parents} variant="orange" />
          <StatPill label="Alumni" count={loading ? null : stats.alumni} variant="dark" />
        </div>
      </div>
    </section>
  );
}