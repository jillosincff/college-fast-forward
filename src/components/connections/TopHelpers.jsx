
// Aliased to prevent naming conflict with custom Badge component
import { Pill } from '@/components/Pill';

function Badge({ children, tone="blue", icon }) {
  const toneMap = {
    blue:   "bg-gator-blue/10 text-gator-blue",
    orange: "bg-gator-orange/10 text-gator-orange",
    green:  "bg-gator-green/12 text-gator-green",
  };
  
  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold ${toneMap[tone]}`}>
      {icon && <span className="leading-none">{icon}</span>}
      <span className="leading-none">{children}</span>
    </span>
  );
}

function TopHelperRow({ rank, name, avatar, intros, offers, badges=[], onThank }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-6 shrink-0 text-[13px] font-semibold text-ink-40">#{rank}</div>
      <img src={avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-black/5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{name}</span>
          <div className="flex items-center gap-1">
            {badges.includes("mentorOfMonth") && <Badge tone="blue" icon="🏆">Mentor of the Month</Badge>}
            {badges.includes("risingStar") && <Badge tone="orange" icon="⭐">Rising Star</Badge>}
            {badges.includes("superHelper") && <Badge tone="green" icon="🌟">Super Helper</Badge>}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Pill tone="slate">{intros} intros</Pill>
          <Pill tone="slate">{offers} offers</Pill>
        </div>
      </div>
      <button
        onClick={onThank}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-ink-60
                   transition hover:-translate-y-0.5 hover:border-gator-blue/40 hover:text-gator-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-gator-blue/30"
        aria-label={`Give kudos to ${name}`}
      >
        👏 <span>Kudos</span>
      </button>
    </div>
  );
}

export function TopHelpersList({ items, onThank }) {
  return (
    <aside className="card p-3">
      <h4 className="mb-2 text-sm font-semibold text-ink">Top Helpers</h4>
      <div className="divide-y divide-slate-100">
        {items.map((h) => (
          <TopHelperRow 
            key={h.rank} 
            rank={h.rank}
            name={h.user?.full_name || 'Anonymous Gator'}
            avatar={h.user?.profile_image_url || `https://images.unsplash.com/photo-${500 + h.rank}48767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face`}
            intros={h.intros || 0}
            offers={h.offers || 0}
            badges={h.badges?.map(b => {
              if (b.badge_type === 'mentor_month') return 'mentorOfMonth';
              if (b.badge_type === 'rising_star') return 'risingStar';
              if (b.badge_type === 'super_helper') return 'superHelper';
              return null;
            }).filter(Boolean) || []}
            onThank={() => onThank(h)}
          />
        ))}
      </div>
      <div className="pt-2 text-xs text-ink-40">🎉 {items.length} Gators stepped up this week!</div>
    </aside>
  );
}
