import { Button } from '@/components/ui/button';

export function FeatureHeader({ 
  title, 
  subtitle, 
  primaryCta, 
  secondaryCta, 
  tertiaryLink, 
  pills = [],
  className = ""
}) {
  return (
    <section className={`relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6 ${className}`}>
      {/* Subtle brand wash card */}
      <div className="rounded-2xl bg-white/90 ring-1 ring-slate-200 backdrop-blur
                      shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                      bg-[radial-gradient(80rem_40rem_at_10%_-20%,rgba(0,51,160,0.06),transparent_60%),radial-gradient(80rem_40rem_at_110%_120%,rgba(250,70,22,0.06),transparent_60%)]">
        <div className="px-5 sm:px-8 py-8 sm:py-10 text-center">
          {/* Title + subhead */}
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold text-[#0033A0]
                         leading-[0.95] tracking-[-0.01em] [text-wrap:balance]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 mx-auto max-w-[60ch] text-slate-700 text-[clamp(16px,1.6vw,18px)] leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {primaryCta && (
              <Button
                onClick={primaryCta.onClick}
                className="group inline-flex items-center rounded-full px-6 py-3 font-semibold text-white h-auto
                           bg-[linear-gradient(110deg,#FA4616,#FF7A3E_45%,#FA4616)]
                           bg-[length:200%_100%] hover:animate-[shimmer_2.2s_linear_infinite]
                           shadow-[0_10px_24px_rgba(250,70,22,0.15)]
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FA4616]">
                <span className="mr-2 text-lg">＋</span> {primaryCta.label}
                <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
              </Button>
            )}

            {secondaryCta && (
              <Button
                onClick={secondaryCta.onClick}
                variant="outline"
                className="inline-flex items-center rounded-full px-6 py-3 font-semibold h-auto
                           text-[#0033A0] border border-[#0033A0] hover:bg-[#0033A0]/5
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0]">
                {secondaryCta.label}
              </Button>
            )}

            {tertiaryLink && (
              <Button
                onClick={tertiaryLink.onClick}
                variant="link"
                className="inline-flex items-center font-semibold text-[#0033A0] hover:underline p-0 h-auto group">
                {tertiaryLink.label}
                <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
              </Button>
            )}
          </div>

          {/* Meta pills */}
          {pills.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {pills.map((pill, index) => (
                <span key={index} className="inline-flex items-center gap-2 rounded-full px-3 py-1
                                             text-sm font-medium bg-white ring-1 ring-slate-200 text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-[#11A63A]" />
                  {pill.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[shimmer_2\\.2s_linear_infinite\\] { animation: none !important; }
          .group:hover .transition-transform { transform: none !important; }
        }
      `}</style>
    </section>
  );
}