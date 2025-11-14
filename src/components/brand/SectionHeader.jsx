
export function SectionHeader({ title, subtitle }) {
  return (
    <header className="py-6 border-b border-slate-200">
      <h1 className="text-[var(--gator-blue)] text-h2 font-extrabold [text-wrap:balance]">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-700 max-w-prose">{subtitle}</p>}
    </header>
  );
}