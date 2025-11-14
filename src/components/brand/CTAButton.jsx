
export function CTAButton({ variant = 'primary', className = '', children, ...rest }) {
  const base = "group rounded-pill px-7 py-3 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200 h-auto";
  
  const styles = variant === 'primary'
    ? "text-white bg-[linear-gradient(110deg,var(--gator-orange),var(--gator-orange-lite)_45%,var(--gator-orange))] bg-[length:200%_100%] hover:animate-shimmer shadow-cta focus-visible:ring-[var(--gator-orange)]"
    : "text-[var(--gator-blue)] border border-[var(--gator-blue)] hover:bg-[var(--gator-blue)]/5 focus-visible:ring-[var(--gator-blue)]";
  
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}