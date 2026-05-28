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
              🎓 {lead.alumniCount} UF {lead.alumniCount === 1 ? 'Alum' : 'Alums'} work here
            </div>
          )}
          {lead.leadTier === 'warm' && (
            <div className="text-xs text-slate-600 mb-2">
              💡 {lead.parentCount} UF {lead.parentCount === 1 ? 'Alum' : 'Alums'} in {lead.targetIndustry}
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

function LeadSection({ tier, leads, onAddToPipeline, onSelectLead }) {
  const config = LEAD_TIER_CONFIG[tier];
  const Icon = config.icon;

  if (!leads || leads.length === 0) return null;

  return (
    <div className="mb-6">
      <div className={`flex items-center gap-2 mb-3 ${config.bgColor} ${config.borderColor} border rounded-lg px-3 py-2`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div>
          <h2 className={`font-bold text-sm ${config.color}`}>{config.label} ({leads.length})</h2>
          <p className="text-xs text-slate-600">{config.subtitle}</p>
        </div>
      </div>
      <div>
        {leads.map((lead, idx) => (
          <LeadCard
            key={idx}
            lead={lead}
            onAddToPipeline={onAddToPipeline}
            onSelect={onSelectLead}
          />
        ))}
      </div>
    </div>
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
          onClick={() => window.dispatchEvent(new CustomEvent('cff:open-goals-modal'))}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Update Career Goals →
        </button>
      </div>
    );
  }

  if (!feedsData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading your opportunities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">🚀 CLiFF's Live Target Matches</h1>
      <p className="text-sm text-slate-600 mb-6">
        Your personalized feed of {feedsData.hotLeads?.length + feedsData.warmLeads?.length + feedsData.coldLeads?.length} opportunities
      </p>

      {/* 🔥 HOT LEADS */}
      <LeadSection
        tier="hot"
        leads={feedsData.hotLeads || []}
        onAddToPipeline={handleAddToPipeline}
        onSelectLead={setSelectedLead}
      />

      {/* ☀️ WARM LEADS */}
      <LeadSection
        tier="warm"
        leads={feedsData.warmLeads || []}
        onAddToPipeline={handleAddToPipeline}
        onSelectLead={setSelectedLead}
      />

      {/* ❄️ COLD LEADS */}
      <LeadSection
        tier="cold"
        leads={feedsData.coldLeads || []}
        onAddToPipeline={handleAddToPipeline}
        onSelectLead={setSelectedLead}
      />

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