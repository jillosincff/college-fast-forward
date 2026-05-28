/**
 * Reusable CLiFF Brand Name Component
 * Color hierarchy: CL (prestige) → i (bridge) → FF (forward motion)
 */
export function CliffLogo({ size = 'text-base' }) {
  return (
    <span className={`${size} font-black tracking-tight font-sans select-none`}>
      {/* CL for College */}
      <span className="text-slate-900">CL</span>
      
      {/* The intelligent bridge — uses brighter violet on dark backgrounds */}
      <span style={{ color: '#A78BFA', fontWeight: 500 }}>i</span>
      
      {/* FF for Fast Forward */}
      <span style={{ color: '#818CF8' }}>FF</span>
    </span>
  );
}