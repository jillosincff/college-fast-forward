
export function Pill({
  children, tone="slate",
}) {
  const map = {
    slate:  "bg-slate-100 text-ink-60",
    blue:   "bg-gator-blue/10 text-gator-blue",
    orange: "bg-gator-orange/10 text-gator-orange",
    green:  "bg-gator-green/12 text-gator-green",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}