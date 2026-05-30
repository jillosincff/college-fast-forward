import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Sun, Snowflake, Plus, MessageSquare, Lightbulb, Search } from 'lucide-react';
import { getPersonalizedNetworkCarousel } from '@/functions/getPersonalizedNetworkCarousel';
import MatchDeepDiveModal from './MatchDeepDiveModal';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const LEAD_TIER_CONFIG = {
  hot: {
    icon: Zap,
    label: '🔥 HOT LEADS',
    subtitle: 'Backdoor Channels Active',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    ctaIcon: MessageSquare,
    ctaLabel: 'Draft Backdoor Message',
  },
  warm: {
    icon: Sun,
    label: '☀️ WARM LEADS',
    subtitle: 'Industry Connections Found',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    ctaIcon: Lightbulb,
    ctaLabel: 'Request Industry Insight',
  },
  cold: {
    icon: Snowflake,
    label: '❄️ COLD LEADS',
    subtitle: 'Hidden Board Discoveries',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    ctaIcon: Search,
    ctaLabel: 'View Role & Hunt Insiders',
  },
};

function LeadCard({ lead, onAddToPipeline, onSelect }) {
  const config = LEAD_TIER_CONFIG[lead.leadTier];
  const Icon = config.icon;
  const CTAIcon = config.ctaIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3"
    >
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${config.bgColor}/30 ${config.borderColor}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <h3 className="font-semibold text-base">{lead.company}</h3>
              </div>
              <p className="text-sm text-slate-700 font-medium">{lead.role}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onAddToPipeline(lead);
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Connection info based on tier */}
          {lead.leadTier === 'hot' && (
            <div className="text-xs text-slate-600 mb-2">
              🎓 {(lead.alumniCount || 0)} {lead.schoolName || 'UF'} {(lead.alumniCount || 0) === 1 ? 'Alum' : 'Alums'} work here
            </div>
          )}
          {lead.leadTier === 'warm' && (
            <div className="text-xs text-slate-600 mb-2">
              💡 {(lead.parentCount || 0)} {lead.schoolName || 'UF'} {(lead.parentCount || 0) === 1 ? 'Alum' : 'Alums'} in {lead.targetIndustry}
            </div>
          )}
          {lead.leadTier === 'cold' && (
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
              <Snowflake className="w-3 h-3" />
              Front door entry. No active network matches yet.
            </div>
          )}

          {/* Primary CTA */}
          <Button
            size="sm"
            className={`w-full h-9 text-xs font-medium ${
              lead.leadTier === 'hot' ? 'bg-orange-600 hover:bg-orange-700' :
              lead.leadTier === 'warm' ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={() => onSelect(lead)}
          >
            <CTAIcon className="w-3 h-3 mr-1.5" />
            {config.ctaLabel}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}



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
          {leads.map((lead, idx) => (
            <LeadCard
              key={idx}
              lead={lead}
              onAddToPipeline={onAddToPipeline}
              onSelect={onSelectLead}
            />
          ))}
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

  // Robust safety envelope: guarantee empty arrays instead of undefined/null
  const hotLeads = feedsData?.hotLeads || [];
  const warmLeads = feedsData?.warmLeads || [];
  const coldLeads = feedsData?.coldLeads || [];
  const totalCount = (hotLeads.length || 0) + (warmLeads.length || 0) + (coldLeads.length || 0);

  const handleAddToPipeline = async (lead) => {
    try {
      await base44.entities.Opportunity.create({
        opportunity_type: 'job',
        title: lead.role,
        org_name: lead.company,
        description: lead.jobDescription,
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