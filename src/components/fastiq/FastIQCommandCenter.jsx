import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';
import HeroSection from './HeroSection';
// HeroStatusLine is now inline inside HeroSection
import WeeklyBriefBanner from './WeeklyBriefBanner';
import InsightCard from './InsightCard';
import OpportunitiesSection from './OpportunitiesSection';
import PipelineBar from './PipelineBar';
import PipelineNudge from './PipelineNudge';
import TargetCompaniesSection from './TargetCompaniesSection';
import QuickActionsGrid from './QuickActionsGrid';
import WeeklyBriefCard from './WeeklyBriefCard';
import AddTargetsModal from './AddTargetsModal';
import LeaderboardCard from './LeaderboardCard';
import MyResumeSection from './MyResumeSection';

function buildStatusLines(pipelineData, newOpportunities, weeklyStats) {
  const lines = [];
  const staleCount = (pipelineData || []).filter(p => {
    if (p.status !== 'reached_out' || !p.reached_out_date) return false;
    return (Date.now() - new Date(p.reached_out_date).getTime()) > 3 * 24 * 60 * 60 * 1000;
  }).length;
  const identifiedCount = (pipelineData || []).filter(p => p.status === 'identified').length;
  const repliedCount = (pipelineData || []).filter(p => p.status === 'replied').length;
  const interviewCount = (pipelineData || []).filter(p => p.status === 'interview').length;
  if (staleCount > 0) lines.push(`⏰ ${staleCount} contact${staleCount > 1 ? 's' : ''} waiting for follow-up`);
  const studentRoles = (weeklyStats?.entryLevelRoles || 0) + (weeklyStats?.internRoles || 0);
  if (studentRoles > 0) {
    lines.push(`🔥 ${studentRoles} entry-level/intern role${studentRoles > 1 ? 's' : ''} found at your targets`);
  } else if ((newOpportunities || []).length > 0) {
    lines.push(`🔥 ${newOpportunities.length} new opportunit${newOpportunities.length > 1 ? 'ies' : 'y'} scouted this week`);
  }
  if (identifiedCount > 0) lines.push(`🔍 ${identifiedCount} alumni identified across your targets`);
  if (repliedCount > 0) lines.push(`💬 ${repliedCount} alumni have replied to your outreach`);
  if (interviewCount > 0) lines.push(`📅 ${interviewCount} interview${interviewCount > 1 ? 's' : ''} in your pipeline`);
  if (weeklyStats?.companiesScanned > 0) lines.push(`📊 ${weeklyStats.companiesScanned} companies scanned this week`);
  // topSignal is already validated against target companies in the data loader
  if (weeklyStats?.topSignal) lines.push(`🔥 ${weeklyStats.topSignal} is actively hiring right now`);
  if (lines.length === 0) {
    lines.push('⚡ FASTIQ is scanning the market for you');
    lines.push('🎯 Set your target companies to get personalized intel');
  }
  return lines;
}

export default function FastIQCommandCenter({ user, profile, onOpenChat, onProfileUpdated, highlightAlerts }) {
  const [companyIntel, setCompanyIntel] = useState({});
  const [alumniCounts, setAlumniCounts] = useState({});
  const [pipelineCounts, setPipelineCounts] = useState({ identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0, no_response: 0 });
  const [pipelineData, setPipelineData] = useState([]);
  const [newOpportunities, setNewOpportunities] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [unmessagedAlumni, setUnmessagedAlumni] = useState(0);
  const [showAddTargets, setShowAddTargets] = useState(false);
  const [noResponseContacts, setNoResponseContacts] = useState([]);
  const alertsRef = useRef(null);
  const weeklyBriefRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (highlightAlerts && alertsRef.current) {
      setTimeout(() => alertsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
  }, [highlightAlerts]);

  // Load all data in parallel
  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      const targetCompanyNames = (profile?.target_companies || []).map(c => titleCase(c));

      const [intelRaw, alumniRaw, pipelineRaw, oppsRaw, activityRaw] = await Promise.all([
        targetCompanyNames.length > 0
          ? base44.entities.CompanyIntelCache.filter({}, '-created_date', 50).catch(() => [])
          : Promise.resolve([]),
        base44.entities.DiscoveredAlumni.filter({}, '-created_date', 100).catch(() => []),
        base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 200).catch(() => []),
        base44.entities.ScoutedOpportunity.filter({ user_email: user.email, is_new: true }, '-scouted_date', 10).catch(() => []),
        base44.entities.ProActivityLog.filter({ user_email: user.email }, '-timestamp', 50).catch(() => []),
      ]);

      const relevantIntel = targetCompanyNames.length > 0
        ? intelRaw.filter(i => targetCompanyNames.some(tc => tc.toLowerCase() === (i.company_name || '').toLowerCase()))
        : intelRaw;
      const iMap = {};
      relevantIntel.forEach(i => { iMap[i.company_name?.toLowerCase()] = i; });
      setCompanyIntel(iMap);

      const aMap = {};
      alumniRaw.forEach(a => { const k = a.company?.toLowerCase(); if (k) aMap[k] = (aMap[k] || 0) + 1; });
      setAlumniCounts(aMap);

      const pc = { identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0, no_response: 0 };
      pipelineRaw.forEach(p => { if (pc[p.status] !== undefined) pc[p.status]++; });
      setPipelineCounts(pc);
      setPipelineData(pipelineRaw);

      setNoResponseContacts(pipelineRaw.filter(p => p.status === 'no_response'));

      const identifiedOnly = pipelineRaw.filter(p => p.status === 'identified').length;
      setUnmessagedAlumni(identifiedOnly);

      setNewOpportunities(oppsRaw);

      // Strict company name validation: must be in target list OR pass rigorous checks
      const targetNamesLower = targetCompanyNames.map(n => n.toLowerCase());
      const JUNK_WORDS = ['experience','identify','relevant','more','week','undefined','null','company',
        'the','and','for','with','your','this','that','from','have','been','about','into','each',
        'find','search','apply','submit','check','browse','explore','discover','learn','view'];
      
      const isValidCompanyName = (name) => {
        if (!name || typeof name !== 'string') return false;
        const trimmed = name.trim();
        if (trimmed.length < 2) return false;
        // If it's in the student's target list, always valid
        if (targetNamesLower.includes(trimmed.toLowerCase())) return true;
        // Reject single lowercase/underscore words (field names)
        if (/^[a-z_]+$/i.test(trimmed)) return false;
        // Reject if the name IS a common English word
        if (JUNK_WORDS.includes(trimmed.toLowerCase())) return false;
        // Reject if name contains only common words (multi-word junk like "Experience More")
        const words = trimmed.toLowerCase().split(/\s+/);
        if (words.every(w => JUNK_WORDS.includes(w))) return false;
        return true;
      };

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekOps = oppsRaw.filter(o => o.scouted_date && new Date(o.scouted_date) >= oneWeekAgo).length;
      const weekActivity = activityRaw.filter(a => a.timestamp && new Date(a.timestamp) >= oneWeekAgo);
      const companiesScanned = new Set(weekActivity.filter(a => a.action_type === 'company_search').map(a => a.target_name)).size;
      const alumniFound = weekActivity.filter(a => a.action_type === 'alumni_view').length;
      
      // Only show "moved to Hot" for companies in the student's actual target list
      const hotTargetCompany = relevantIntel.find(i => 
        i.hiring_signal === 'hot' && targetNamesLower.includes((i.company_name || '').toLowerCase())
      );
      const topSignalName = hotTargetCompany ? titleCase(String(hotTargetCompany.company_name || '').trim()) : null;
      
      // Compute entry-level role counts across target companies for the banner
      let entryLevelTotal = 0;
      let internTotal = 0;
      Object.values(iMap).forEach(i => {
        entryLevelTotal += (i.entry_level_roles_count || 0);
        internTotal += (i.intern_roles_count || 0);
      });

      setWeeklyStats({
        opportunities: weekOps || oppsRaw.length,
        alumniFound: alumniFound || alumniRaw.length,
        companiesScanned: companiesScanned || Object.keys(iMap).length,
        topSignal: isValidCompanyName(topSignalName) ? topSignalName : null,
        entryLevelRoles: entryLevelTotal,
        internRoles: internTotal,
      });
    };
    load();
  }, [user?.email, profile?.target_companies, refreshKey]);

  const targetCompanies = (profile?.target_companies || []).map(c => titleCase(c));
  const rawName = user?.full_name || '';
  const userFirstName = rawName.includes(',')
    ? rawName.split(',')[1]?.trim().split(' ')[0] || rawName.split(' ')[0] || 'Student'
    : rawName.split(' ')[0] || 'Student';

  const statValues = {
    targets: profile?.target_companies?.length || 0,
    insiders: profile?.alumni_discovered || 0,
    messages: profile?.messages_drafted || 0,
    warmPaths: profile?.roadmaps_generated || 0,
  };

  return (
    <div className="fiq-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Space+Mono:wght@400;700&display=swap');
        
        .fiq-root { font-family: 'DM Sans', sans-serif; background: #F8FAFC; min-height: 100vh; }
        .fiq-root * { box-sizing: border-box; }
        .fiq-mono { font-family: 'Space Mono', monospace; }
        
        @keyframes fiq-fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fiq-pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes fiq-heroGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes fiq-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fiq-ringPulse {
          0%, 100% { filter: drop-shadow(0 0 2px transparent); }
          50% { filter: drop-shadow(0 0 8px currentColor); }
        }
        
        .fiq-animate { animation: fiq-fadeSlideUp 0.6s ease-out both; }
        .fiq-delay-1 { animation-delay: 0.15s; }
        .fiq-delay-2 { animation-delay: 0.3s; }
        .fiq-delay-3 { animation-delay: 0.45s; }
        .fiq-delay-4 { animation-delay: 0.6s; }
        .fiq-delay-5 { animation-delay: 0.75s; }
        .fiq-delay-6 { animation-delay: 0.9s; }
        .fiq-delay-7 { animation-delay: 1.05s; }
        
        @media (max-width: 640px) {
          .fiq-rings-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .fiq-actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fiq-root h1 { font-size: 24px !important; }
        }
      `}</style>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 50%, #1a3a8f 100%)', position: 'relative', overflow: 'hidden' }}>
        <HeroSection
          userName={userFirstName}
          user={user}
          profile={profile}
          statValues={statValues}
          onOpenChat={onOpenChat}
          statusLines={buildStatusLines(pipelineData, newOpportunities, weeklyStats)}
        />
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* 2. WEEKLY BRIEF BANNER */}
        <WeeklyBriefBanner
          weeklyStats={weeklyStats}
          onViewBrief={() => {
            if (weeklyBriefRef.current) {
              weeklyBriefRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        />

        {/* 3. INSIGHT CARD — always-on, priority-ordered */}
        <InsightCard
          unmessagedAlumni={unmessagedAlumni}
          onOpenChat={onOpenChat}
          onAddTargets={() => setShowAddTargets(true)}
          profile={profile}
          pipelineCounts={pipelineCounts}
        />

        {/* 8. CONSOLIDATED RESUME SECTION */}
        <MyResumeSection profile={profile} onOpenChat={onOpenChat} />

        {newOpportunities.length > 0 && (
          <div ref={alertsRef} className="fiq-animate fiq-delay-3">
            <OpportunitiesSection
              opportunities={newOpportunities}
              onOpenChat={onOpenChat}
              onDismiss={async (id) => {
                await base44.entities.ScoutedOpportunity.update(id, { is_new: false, status: 'dismissed' });
                setNewOpportunities(prev => prev.filter(o => o.id !== id));
              }}
            />
          </div>
        )}

        {/* 4. PIPELINE + NUDGE */}
        <PipelineBar counts={pipelineCounts} noResponseContacts={noResponseContacts} />
        <PipelineNudge pipelineCounts={pipelineCounts} onOpenChat={onOpenChat} />

        {/* 5. TARGET COMPANIES — visual hierarchy handled in TargetCompaniesSection */}
        <TargetCompaniesSection
          companies={targetCompanies}
          companyIntel={companyIntel}
          alumniCounts={alumniCounts}
          onOpenChat={onOpenChat}
          onAddTargets={() => setShowAddTargets(true)}
        />

        {/* 6. COMPETITIVE ELEMENT */}
        <LeaderboardCard profile={profile} onOpenChat={onOpenChat} />

        {/* 7. QUICK ACTIONS — hover enhancements handled in QuickActionsGrid */}
        <QuickActionsGrid onOpenChat={onOpenChat} />

        {weeklyStats && (
          <div ref={weeklyBriefRef}>
            <WeeklyBriefCard stats={weeklyStats} onOpenChat={onOpenChat} />
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '40px 0 10px', fontSize: 12, color: '#94A3B8' }}>
          FASTIQ™ by College Fast Forward · Because applying isn't a strategy.
        </div>
      </div>

      {showAddTargets && (
        <AddTargetsModal
          profile={profile}
          onClose={() => setShowAddTargets(false)}
          onSaved={(newCompanies) => {
            setShowAddTargets(false);
            if (onProfileUpdated) {
              onProfileUpdated({ ...profile, target_companies: newCompanies });
            }
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}