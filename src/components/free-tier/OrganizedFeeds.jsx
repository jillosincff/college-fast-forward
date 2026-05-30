import { useState, useEffect } from 'react';
import { Zap, Sun, Snowflake } from 'lucide-react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import HotJobCard from './HotJobCard';
import WarmJobCard from './WarmJobCard';
import ColdJobCard from './ColdJobCard';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const LEAD_TIER_CONFIG = {
  hot:  { icon: Zap,      color: 'text-orange-600' },
  warm: { icon: Sun,      color: 'text-yellow-600' },
  cold: { icon: Snowflake, color: 'text-blue-600'  },
};



const SECTION_META = {
  hot:  { emoji: '🔥', label: 'HOT LEADS',  badge: 'Backdoor Channels Active',  badgeClass: 'bg-red-50 text-red-600',    emptyIcon: '🛰️', emptyTitle: 'CLiFF is actively monitoring your synchronized corporate networks...', emptyBody: 'No active target openings found inside your exact network today. Expanding search radius below.' },
  warm: { emoji: '☀️', label: 'WARM LEADS', badge: 'Industry Connections Found', badgeClass: 'bg-amber-50 text-amber-600', emptyIcon: '🔍', emptyTitle: 'Scanning alumni industry network...', emptyBody: 'Searching for roles at companies where your school\'s alumni are active. Results populate as matches are confirmed.' },
  cold: { emoji: '❄️', label: 'COLD LEADS', badge: 'Hidden Board Discoveries',   badgeClass: 'bg-blue-50 text-blue-600',   emptyIcon: '🌐', emptyTitle: 'Querying niche job boards...', emptyBody: 'Hunting for target-matched openings on Lever, Greenhouse, Ashby, and Workable. This feed fills automatically.' },
};

function LeadSection({ tier, leads, onAddToPipeline, onSelectLead }) {
  const meta = SECTION_META[tier];

  return (
    <section className="space-y-4">
      {/* Section header */}
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
          {leads.map((lead, idx) => {
            const props = { key: idx, lead, onAddToPipeline, onSelect: onSelectLead };
            if (tier === 'hot')  return <HotJobCard  {...props} />;
            if (tier === 'warm') return <WarmJobCard {...props} />;
            return <ColdJobCard {...props} />;
          })}
        </div>
      )}
    </section>
  );
}

export default function OrganizedFeeds({ user }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const { target_industries, target_role } = user.career_goals || {};
  
  // Listen for goals modal open event
  useEffect(() => {
    const handleOpenGoals = () => {
      // Dispatch custom event that parent components can listen to
      window.dispatchEvent(new CustomEvent('cff:open-goals-modal'));
    };
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const { data: feedsData, isLoading } = useQuery({
    queryKey: ['organizedFeeds', target_industries, target_role],
    queryFn: () => getPersonalizedNetworkCarousel({
      target_industries: target_industries || [],
      target_role: target_role || '',
    }),
    enabled: true, // Always run the query
  });

  // The function returns { data: { success, hotLeads, warmLeads, coldLeads } }
  const payload = feedsData?.data || feedsData;
  const hotLeads = payload?.hotLeads || [];
  const warmLeads = payload?.warmLeads || [];
  const coldLeads = payload?.coldLeads || [];
  const totalCount = (hotLeads.length || 0) + (warmLeads.length || 0) + (coldLeads.length || 0);

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
          Tell us what you're looking for and we'll show you HOT, WARM, and COLD leads tailored to your interests.
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
        <LeadSection tier="hot"  leads={hotLeads}  onAddToPipeline={handleAddToPipeline} onSelectLead={setSelectedLead} />
        <LeadSection tier="warm" leads={warmLeads} onAddToPipeline={handleAddToPipeline} onSelectLead={setSelectedLead} />
        <LeadSection tier="cold" leads={coldLeads} onAddToPipeline={handleAddToPipeline} onSelectLead={setSelectedLead} />
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