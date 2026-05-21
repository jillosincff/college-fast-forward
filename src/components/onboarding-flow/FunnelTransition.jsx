/**
 * Wraps screen content — simple passthrough, no animation to avoid opacity:0 render issues.
 */
export default function FunnelTransition({ screenKey, children }) {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {children}
    </div>
  );
}