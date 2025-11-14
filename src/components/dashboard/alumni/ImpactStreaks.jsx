import { Badge } from '@/components/ui/badge';
import { navigate } from '@/components/utils/navigation';

export default function ImpactStreaks({ stats }) {
  if (!stats) return null;

  const handleViewTimeline = () => {
    navigate('MyImpact');
  };

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-lg relative overflow-hidden">
      {/* Gamification badge */}
      <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 rounded-bl-lg rounded-tr-2xl px-2 py-1 text-xs font-bold">
        🏅 Top 10% Helpers
      </Badge>
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Impact & Streaks</h3>
        <span className="rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-[#FA4616]">🔥 {stats.streakDays}-day streak</span>
      </div>
      <div className="mt-6 grid grid-cols-3 text-center gap-6">
        {[
          {label:"Students Helped", value:stats.helped},
          {label:"Intros Sent", value:stats.intros},
          {label:"Opportunities", value:stats.opps},
        ].map(i=>(
          <div key={i.label}>
            <div className="mx-auto h-14 w-14 rounded-full border-3 border-[#0021A5] grid place-items-center text-[#0021A5] font-bold text-xl">{i.value}</div>
            <div className="mt-3 text-xs text-gray-600 font-medium">{i.label}</div>
          </div>
        ))}
      </div>
      <button 
        onClick={handleViewTimeline}
        className="mt-6 w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
      >
        View Impact Timeline
      </button>
    </section>
  );
}