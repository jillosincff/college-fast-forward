import { navigate } from '@/components/utils/navigation';
import { Share2, Plus } from 'lucide-react';

export default function ImpactStats({ stats }) {
  const hasImpact = stats.helped > 0 || stats.intros > 0 || stats.opps > 0;

  const handleShareBadge = () => {
    // TODO: Implement badge sharing functionality
    alert('Badge sharing coming soon!');
  };

  const handlePostOpportunity = () => {
    navigate('PostOpportunity');
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {hasImpact ? "Here’s the difference you’ve made" : "Your impact starts here"}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {hasImpact
            ? "Your intros, messages, and opportunities are opening doors for Gators."
            : "Take your first step by posting an opportunity or replying to a student."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0021A5]">{stats.helped}</div>
          <div className="mt-1 text-sm text-gray-600">Students Helped</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0021A5]">{stats.intros}</div>
          <div className="mt-1 text-sm text-gray-600">Intros Sent</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0021A5]">{stats.opps}</div>
          <div className="mt-1 text-sm text-gray-600">Opportunities Shared</div>
        </div>
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#FA4616]">
            {stats.streak > 0 ? `${stats.streak}-day` : "0-day"}
          </div>
          <div className="mt-1 text-sm text-gray-600">Streak</div>
        </div>
      </div>

      {/* CTA Row */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleShareBadge}
          className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Badge
        </button>
        <button
          onClick={handlePostOpportunity}
          className="inline-flex items-center rounded-xl bg-[#FA4616] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post an Opportunity
        </button>
      </div>
    </section>
  );
}