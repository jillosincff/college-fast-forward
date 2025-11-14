
const toneClasses = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200"
};

export function Token({ children, tone = 'slate', className = '' }) {
  const baseClasses = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border";
  const toneClass = toneClasses[tone] || toneClasses.slate;
  
  return (
    <span className={`${baseClasses} ${toneClass} ${className}`}>
      {children}
    </span>
  );
}

export function getRoleTone(roleType) {
  switch (roleType) {
    case "full_time": return "blue";
    case "internship": return "emerald";
    case "contract":
    case "part_time": return "purple";
    default: return "slate";
  }
}

export function getModeTone(workMode) {
  switch (workMode) {
    case "remote": return "amber";
    case "hybrid": return "cyan";
    case "on_site": return "rose";
    default: return "slate";
  }
}

export function formatLocation(request) {
  const parts = [request.location_city, request.location_state].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Location flexible';
}

export function formatRoleType(roleType) {
  switch (roleType) {
    case "full_time": return "Full-time";
    case "internship": return "Internship";
    case "part_time": return "Part-time";
    case "contract": return "Contract";
    default: return "Role";
  }
}

export function formatWorkMode(workMode) {
  switch (workMode) {
    case "remote": return "Remote";
    case "hybrid": return "Hybrid";
    case "on_site": return "On-site";
    default: return "Mode";
  }
}

export function formatStartTiming(startTiming) {
  if (!startTiming) return null;
  return startTiming.replace(/_/g, ' ');
}