
function Badge({ children, tone = "indigo", icon }) {
  const toneMap = {
    indigo: "bg-gator-blue/10 text-gator-blue",
    orange: "bg-gator-orange/10 text-gator-orange",
    green:  "bg-gator-green/12 text-gator-green",
  };

  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-semibold ${toneMap[tone]}`}
    >
      {icon && <span className="leading-none">{icon}</span>}
      <span className="leading-none">{children}</span>
    </span>
  );
}

export function TopHelperRow({
  rank, name, avatar, intros, offers, badges = [], onThank
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      {/* Rank */}
      <div className="w-8 shrink-0 text-sm font-semibold text-ink-40">#{rank}</div>

      {/* Avatar */}
      <img
        src={avatar}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/5"
      />

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-ink">
            {name}
          </h3>

          {/* Badges */}
          <div className="flex items-center gap-1">
            {badges.includes("mentorOfMonth") && (
              <Badge tone="indigo" icon="🏆">Mentor of the Month</Badge>
            )}
            {badges.includes("risingStar") && (
              <Badge tone="orange" icon="⭐">Rising Star</Badge>
            )}
            {badges.includes("superHelper") && (
              <Badge tone="green" icon="🌟">Super Helper</Badge>
            )}
          </div>
        </div>

        <p className="mt-0.5 text-xs text-ink-40">
          {intros} intros <span className="mx-1">•</span> {offers} offers
        </p>
      </div>

      {/* Thank button */}
      <button
        onClick={onThank}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-ink-60
                   hover:border-gator-blue/40 hover:text-gator-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-gator-blue/30 transition-colors"
      >
        <span>👏</span> Thank
      </button>
    </div>
  );
}

export function TopHelpersList({ items, onThank }) {
  return (
    <div className="card divide-y divide-slate-100">
      {items.map((helper) => (
        <TopHelperRow 
          key={helper.rank} 
          rank={helper.rank}
          name={helper.user?.full_name || 'Anonymous Gator'}
          avatar={helper.user?.profile_image_url || `https://images.unsplash.com/photo-${500 + helper.rank}48767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face`}
          intros={helper.intros || 0}
          offers={helper.offers || 0}
          badges={helper.badges?.map(b => {
            if (b.badge_type === 'mentor_month') return 'mentorOfMonth';
            if (b.badge_type === 'rising_star') return 'risingStar';
            if (b.badge_type === 'super_helper') return 'superHelper';
            return null;
          }).filter(Boolean) || []}
          onThank={() => onThank(helper)}
        />
      ))}
      <div className="px-3 py-2 text-xs text-ink-40 bg-slate-50/50">
        🎉 <strong className="text-ink-60">{items.length}</strong> Gators stepped up this week!
      </div>
    </div>
  );
}