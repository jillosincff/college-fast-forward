
export function Pill({ children, tone = 'info' }) {
  const dotColor = tone === 'new' ? 'bg-[var(--gator-green)]' : 'bg-[var(--gator-orange)]';
  
  return (
    <div className="inline-flex items-center gap-2 rounded-pill px-3 py-1 text-xs font-semibold text-[var(--gator-blue)] bg-white/90 ring-1 ring-[var(--gator-blue)]/20 shadow-sm">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {children}
    </div>
  );
}