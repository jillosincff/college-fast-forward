import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function DarkFooter() {
  return (
    <footer style={{
      background: '#0d1117', padding: '20px 40px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 12,
    }}>
      <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.2)' }}>
        © {new Date().getFullYear()} College Fast Forward. All rights reserved.
      </span>
      <nav style={{ display: 'flex', gap: 24 }}>
        {[
          { label: 'Terms', href: '#Terms' },
          { label: 'Privacy', href: '#Privacy' },
          { label: 'Cookie Policy', href: '#CookiePolicy' },
        ].map(l => (
          <a key={l.label} href={l.href} style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 300,
            color: 'rgba(244,240,232,0.25)', textDecoration: 'none',
            transition: 'color 0.2s', minHeight: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.25)'; }}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}