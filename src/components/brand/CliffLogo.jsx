/**
 * Reusable CLiFF Brand Name Component
 * Color hierarchy: CL (prestige) → i (bridge) → FF (forward motion)
 */
export function CliffLogo({ size = 'text-base' }) {
  return (
    <span className={`${size} font-black tracking-tight font-sans select-none`}>
      {/* Unified brand color — CL, i, and FF all match */}
      <span style={{ color: '#A5B4FC', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>CL</span>
      <span style={{ color: '#A5B4FC', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>i</span>
      <span style={{ color: '#A5B4FC', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>FF</span>
    </span>
  );
}