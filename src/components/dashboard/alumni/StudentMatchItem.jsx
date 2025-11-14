
export default function StudentMatchItem({
  name,
  tag,
  subtitle,
  avatarUrl,
  isPriority = false,
  onDetails,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      {/* Left: Avatar + Text */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-blue-100 ring-1 ring-blue-200 flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-blue-700">
              {name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}
            </span>
          )}
        </div>

        {/* Name / Pill / Tag / Subtitle */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-gray-900">{name}</span>

            {isPriority && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FA4616]/10 px-2 py-0.5 text-xs font-semibold text-[#FA4616]">
                <span aria-hidden>⚡</span> Priority Match
              </span>
            )}

            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#0021A5]">
              {tag}
            </span>
          </div>

          <p className="mt-0.5 line-clamp-1 text-xs text-gray-600">{subtitle}</p>
        </div>
      </div>

      {/* Right: See Details */}
      <button
        onClick={onDetails}
        className="whitespace-nowrap text-sm font-medium text-[#0021A5] hover:underline"
      >
        See Details
      </button>
    </div>
  );
}