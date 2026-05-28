/**
 * Reusable CLiFF Brand Name Component
 * Color hierarchy: CL (prestige) → i (bridge) → FF (forward motion)
 */
export function CliffLogo({ size = 'text-base' }) {
  return (
    <span className={`${size} font-black tracking-tight font-sans select-none`}>
      {/* CL for College — bright white for visibility on dark backgrounds */}
      <span style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>CL</span>
      
      {/* The intelligent bridge — uses brighter violet on dark backgrounds */}
      <span style={{ color: '#C4B5FD', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>i</span>
      
      {/* FF for Fast Forward — bright indigo */}
      <span style={{ color: '#A5B4FC', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>FF</span>
    </span>
  );
}