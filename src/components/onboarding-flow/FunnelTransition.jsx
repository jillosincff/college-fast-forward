import { useEffect, useState } from 'react';

/**
 * Wraps screen content with a smooth 300ms fade-in on mount.
 * Each new `screenKey` triggers a re-fade, giving app-like transitions.
 */
export default function FunnelTransition({ screenKey, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [screenKey]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 300ms ease, transform 300ms ease',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {children}
    </div>
  );
}