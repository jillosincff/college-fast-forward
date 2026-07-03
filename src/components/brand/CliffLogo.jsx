/**
 * Reusable CLiFF Brand Name Component
 * Color hierarchy: CL (prestige) → i (bridge) → FF (forward motion)
 */
export function CliffLogo({ size = 'text-base' }) {
  return (
    <span className={`${size} font-black tracking-tight font-sans select-none`}>
      {/* C-F-F in brand purple; L and i in white to make "CFF" pop */}
      <span style={{ color: '#A5B4FC', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>C</span>
      <span style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>L</span>
      <span style={{ color: '#ffffff', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>i</span>
      <span style={{ color: '#A5B4FC', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>FF</span>
    </span>
  );
}