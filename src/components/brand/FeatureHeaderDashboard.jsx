
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import InviteGatorButton from '../viral/InviteGatorButton'; // Import the functional button

export default function FeatureHeaderDashboard({
  online = 3214,
  newOpps = 27,
  progress = 62,
}) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6">
      {/* subtle brand wash + card */}
      <div className="rounded-2xl bg-white/90 ring-1 ring-slate-200 backdrop-blur
                      shadow-[0_8px_30px_rgba(0,0,0,0.06)]
                      bg-[radial-gradient(80rem_40rem_at_10%_-20%,rgba(0,51,160,0.06),transparent_60%),radial-gradient(80rem_40rem_at_110%_120%,rgba(250,70,22,0.06),transparent_60%)]">
        <div className="px-5 sm:px-8 py-8 sm:py-10 text-center">
          {/* Title + subhead */}
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold text-[#0033A0]
                         leading-[0.95] tracking-[-0.01em] [text-wrap:balance]">
            Unlock Your Future with Gator Connections
          </h1>
          <p className="mt-3 mx-auto max-w-[66ch] text-slate-700 text-[clamp(16px,1.6vw,18px)] leading-relaxed">
            Your central hub to find opportunities, ask for help, and track your progress—with the people who care about you.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate('PostRequest')}
              className="group inline-flex items-center rounded-full px-6 py-3 font-semibold text-white h-auto
                         bg-[linear-gradient(110deg,#FA4616,#FF7A3E_45%,#FA4616)]
                         bg-[length:200%_100%] hover:animate-[shimmer_2.2s_linear_infinite]
                         shadow-[0_10px_24px_rgba(250,70,22,0.15)]
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FA4616]">
              <span className="mr-2 text-lg">＋</span> Post a Request
              <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
            </Button>

            <Button
              onClick={() => navigate('PostOpportunity')}
              variant="outline"
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold h-auto
                         text-[#0033A0] border border-[#0033A0] hover:bg-[#0033A0]/5
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0033A0]">
              Share an Opportunity
            </Button>

            <InviteGatorButton
              from="dashboard_header"
              variant="link"
              className="font-semibold text-[#0033A0] hover:underline p-0 h-auto group"
            >
              Invite a Gator
              <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
            </InviteGatorButton>
          </div>

          {/* Meta row */}
          <ul className="mt-5 flex flex-wrap justify-center gap-3 text-[15px] text-slate-700">
            <li className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#11A63A]" /> {online.toLocaleString()} online now
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5">
              ⭐ <span className="font-semibold">{newOpps}</span> new opportunities today
            </li>
            <li className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1.5">
              📊 Progress
              <span className="relative inline-block h-2 w-28 rounded-full bg-slate-200 align-middle mx-2">
                <span
                  className="absolute left-0 top-0 h-2 rounded-full bg-[#0033A0] transition-all duration-300"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                />
              </span>
              <span className="font-semibold">{progress}%</span>
            </li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .hover\\:animate-\\[shimmer_2\\.2s_linear_infinite\\]:hover,
          .group:hover .transition-transform { 
            animation: none !important; 
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
