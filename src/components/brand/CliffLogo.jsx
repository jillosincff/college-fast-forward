/**
 * Reusable CLiFF Brand Name Component
 * Color hierarchy: CL (prestige) → i (bridge) → FF (forward motion)
 */
export function CliffLogo({ size = 'text-base' }) {
  return (
    <span className={`${size} font-black tracking-tight font-sans select-none`}>
      {/* CL for College */}
      <span className="text-slate-900">CL</span>
      
      {/* The intelligent bridge */}
      <span className="text-slate-400 font-medium">i</span>
      
      {/* FF for Fast Forward */}
      <span className="text-indigo-600">FF</span>
    </span>
  );
}