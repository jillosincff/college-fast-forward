
export default function HeroStatsBar({
  stats = [
    { icon: "🚀", label: "Gators connected", value: 3142 },
    { icon: "📣", label: "Opportunities shared", value: 812 },
    { icon: "🤝", label: "Intros this week", value: 64 },
  ],
}) {
  return (
    <div className="mx-auto mt-6 w-full max-w-3xl">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/15 backdrop-blur"
          >
            <span className="shrink-0">{s.icon}</span>
            <span className="truncate opacity-90">{s.label}</span>
            <span className="font-semibold">
              {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}