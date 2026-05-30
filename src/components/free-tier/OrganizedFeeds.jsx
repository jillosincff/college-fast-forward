import { useState } from 'react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import HotJobCard from './HotJobCard';
import ColdJobCard from './ColdJobCard';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const SECTION_META = {
  insiders: {
    emoji: '🔥',
    label: 'COMPANY INSIDERS',
    badge: 'Verified Alumni & Parent Advisors',
    badgeClass: 'bg-red-50 text-red-600',
    emptyIcon: '🛰️',
    emptyTitle: 'CLiFF is scanning for insiders at your target companies.',
    emptyBody: 'No verified alumni or parent advisors at exact matching companies yet. Check Targeted Leads below — CLiFF is actively hunting insider connections.',
  },
  targets: {
    emoji: '☀️',
    label: 'TARGETED HIDDEN LEADS',
    badge: 'Insider Hunt Active',
    badgeClass: 'bg-amber-50 text-amber-700',
    emptyIcon: '🌐',
    emptyTitle: 'No target-matched openings surfaced today.',
    emptyBody: 'Try updating your career goals to surface more hidden market opportunities.',
  },
};

function LeadSection({ tier, leads, onAddToPipeline, onSelectLead }) {
  const meta = SECTION_META[tier];
  const CardComponent = tier === 'insiders' ? HotJobCard : ColdJobCard;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <span className="text-xl">{meta.emoji}</span>
        <h3 className="text-lg font-bold text-gray-900">{meta.label} ({leads?.length || 0})</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badgeClass}`}>{meta.badge}</span>
      </div>

      {(!leads || leads.length === 0) ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 text-center">
          <p className="text-sm text-gray-500 font-medium">{meta.emptyIcon} {meta.emptyTitle}</p>
          <p className="text-xs text-gray-400 mt-1">{meta.emptyBody}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead, idx) => (
            <CardComponent key={idx} lead={lead} onAddToPipeline={onAddToPipeline} onSelect={onSelectLead} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function OrganizedFeeds({ user }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const { target_industries, target_role } = user.career_goals || {};
  
  const { data: feedsData, isLoading } = useQuery({
    queryKey: ['organizedFeeds', target_industries, target_role],
    queryFn: () => getPersonalizedNetworkCarousel({
      target_industries: target_industries || [],
      target_role: target_role || '',
    }),
    enabled: true, // Always run the query
  });

  const payload = feedsData?.data || feedsData;
  const priorityInsiders    = Array.isArray(payload?.priorityInsiders)    ? payload.priorityInsiders    : [];
  const targetedDiscoveries = Array.isArray(payload?.targetedDiscoveries) ? payload.targetedDiscoveries : [];
  const totalCount = priorityInsiders.length + targetedDiscoveries.length;

  const handleAddToPipeline = async (lead) => {
    try {
      await base44.entities.Opportunity.create({
        opportunity_type: 'job',
        title: lead.role || lead.title,
        org_name: lead.company || lead.companyName,
        description: lead.jobDescription || lead.description,
        status: 'active',
        created_by_role: user.persona || 'student',
      });
      alert('✅ Added to your pipeline!');
    } catch (error) {
      console.error('Failed to add to pipeline:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show helpful message if no career goals set
  if (!target_industries?.length) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Set Your Career Goals</h3>
        <p className="text-slate-600 mb-4 max-w-md">
          Tell us what you're looking for and CLiFF will surface Company Insiders and Targeted Hidden Leads tailored to your goals.
        </p>
        <button
          onClick={() => {
            console.log('Button clicked, dispatching event');
            window.dispatchEvent(new CustomEvent('cff:open-goals-modal'));
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          Update Career Goals →
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🚀 CLiFF's Live Target Matches
        </h2>
        <p className="text-gray-600 mt-1">
          Your personalized feed of{' '}
          <span className="font-semibold text-purple-600">{totalCount}</span> opportunities
        </p>
      </div>

      <div className="space-y-10">
        <LeadSection tier="insiders" leads={priorityInsiders}    onAddToPipeline={handleAddToPipeline} onSelectLead={setSelectedLead} />
        <LeadSection tier="targets"  leads={targetedDiscoveries} onAddToPipeline={handleAddToPipeline} onSelectLead={setSelectedLead} />
      </div>

      {/* Deep Dive Modal */}
      {selectedLead && (
        <MatchDeepDiveModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}