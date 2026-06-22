import React from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';

export default function ProfileFooter() {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid rgba(109,40,217,0.10)',
      padding: '20px 40px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      flexWrap: 'wrap', gap: 12,
    }}>
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>
        © {new Date().getFullYear()} College Fast Forward. All rights reserved.
      </span>
      <nav style={{ display: 'flex', gap: 24 }}>
        {[
          { label: 'Terms', href: '#Terms' },
          { label: 'Privacy', href: '#Privacy' },
          { label: 'Cookie Policy', href: '#CookiePolicy' },
        ].map(l => (
          <a key={l.label} href={l.href} style={{
            fontFamily: FONT, fontSize: 12, fontWeight: 500,
            color: '#6d28d9', textDecoration: 'none',
            transition: 'color 0.2s', minHeight: 'auto',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6d28d9'; }}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}