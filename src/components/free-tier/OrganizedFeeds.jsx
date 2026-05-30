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

const EMPTY_STATE_MESSAGES = {
  hot: {
    title: 'Monitoring synced networks...',
    body: 'CLiFF is actively scanning your synced corporate networks. No new openings detected this morning. Expanding radar to industry backdoor channels below.',
    icon: '📡',
  },
  warm: {
    title: 'Scanning alumni industry network...',
    body: 'Searching for roles at companies where your school\'s alumni are active. Results populate as matches are confirmed.',
    icon: '🔍',
  },
  cold: {
    title: 'Querying niche job boards...',
    body: 'Hunting for target-matched openings on Lever, Greenhouse, Ashby, and Workable. This feed fills automatically.',
    icon: '🌐',
  },
};

function LeadSection({ tier, leads, onAddToPipeline, onSelectLead }) {
  const config = LEAD_TIER_CONFIG[tier];
  const Icon = config.icon;
  const empty = EMPTY_STATE_MESSAGES[tier];

  return (
    <div className="mb-6">
      <div className={`flex items-center gap-2 mb-3 ${config.bgColor} ${config.borderColor} border rounded-lg px-3 py-2`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div>
          <h2 className={`font-bold text-sm ${config.color}`}>{config.label} ({leads?.length || 0})</h2>
          <p className="text-xs text-slate-600">{config.subtitle}</p>
        </div>
      </div>

      {(!leads || leads.length === 0) ? (
        <div className="flex items-start gap-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg px-4 py-3">
          <span className="text-lg mt-0.5">{empty.icon}</span>
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-0.5">{empty.title}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{empty.body}</p>
          </div>
        </div>
      ) : (
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
      )}
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

  const totalLabel = totalCount > 0 ? `${totalCount} opportunities identified` : 'Scanning live networks now...';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">🚀 CLiFF's Live Target Matches</h1>
      <p className="text-sm text-slate-600 mb-6">{totalLabel}</p>

      {/* 🔥 HOT LEADS — always shown */}
      <LeadSection
        tier="hot"
        leads={hotLeads}
        onAddToPipeline={handleAddToPipeline}
        onSelectLead={setSelectedLead}
      />

      {/* ☀️ WARM LEADS — always shown */}
      <LeadSection
        tier="warm"
        leads={warmLeads}
        onAddToPipeline={handleAddToPipeline}
        onSelectLead={setSelectedLead}
      />

      {/* ❄️ COLD LEADS — always shown */}
      <LeadSection
        tier="cold"
        leads={coldLeads}
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