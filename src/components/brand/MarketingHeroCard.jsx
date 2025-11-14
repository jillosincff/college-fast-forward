
export function MarketingHeroCard({ title, subtitle, children }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Gator Blue field */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--gator-blue-deep),var(--gator-blue))]" />
        <div className="absolute inset-0 bg-[radial-gradient(80rem_40rem_at_50%_20%,rgba(255,255,255,0.30),transparent_60%)]" />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl relative rounded-card bg-white/90 backdrop-blur ring-1 ring-slate-200 shadow-card
                        [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.7)] text-center drop-shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
          <div className="px-6 sm:px-10 py-10 sm:py-14">
            {title}
            {subtitle && <p className="mt-4 text-slate-800 text-[clamp(18px,1.7vw,22px)] leading-relaxed max-w-[48ch] mx-auto">{subtitle}</p>}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}