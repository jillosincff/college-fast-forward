import { useState, useEffect } from 'react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// One-time welcome line after a student starts using CLIFF — shown once,
// never permanent dashboard clutter.
export default function CliffingWelcome() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('cliffing_welcome_shown')) {
        setShow(true);
        localStorage.setItem('cliffing_welcome_shown', '1');
      }
    } catch {}
  }, []);

  if (!show) return null;
  return (
    <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 12, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 16 }}>✨</span>
      <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.4 }}>
        You're CLIFFing now. I'll keep the plan moving.
      </p>
    </div>
  );
}