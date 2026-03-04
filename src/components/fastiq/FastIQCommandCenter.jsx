import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';
import LiveTickerBar from './LiveTickerBar';
import HeroSection from './HeroSection';
import InsightCard from './InsightCard';
import OpportunitiesSection from './OpportunitiesSection';
import PipelineBar from './PipelineBar';
import TargetCompaniesSection from './TargetCompaniesSection';
import QuickActionsGrid from './QuickActionsGrid';
import WeeklyBriefCard from './WeeklyBriefCard';

export default function FastIQCommandCenter({ user, profile, onOpenChat, highlightAlerts }) {
  const [companyIntel, setCompanyIntel] = useState({});
  const [alumniCounts, setAlumniCounts] = useState({});
  const [pipelineCounts, setPipelineCounts] = useState({ identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0 });
  const [newOpportunities, setNewOpportunities] = useState([]);
  const [tickerItems, setTickerItems] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [unmessagedAlumni, setUnmessagedAlumni] = useState(0);
  const alertsRef = useRef(null);

  useEffect(() => {
    if (highlightAlerts && alertsRef.current) {
      setTimeout(() => alertsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
  }, [highlightAlerts]);

  // Load all data in parallel
  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      const [intelRaw, alumniRaw, pipelineRaw, oppsRaw, activityRaw] = await Promise.all([
        base44.entities.CompanyIntelCache.filter({}, '-created_date', 50).catch(() => []),
        base44.entities.DiscoveredAlumni.filter({}, '-created_date', 100).catch(() => []),
        base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 200).catch(() => []),
        base44.entities.ScoutedOpportunity.filter({ user_email: user.email, is_new: true }, '-scouted_date', 10).catch(() => []),
        base44.entities.ProActivityLog.filter({ user_email: user.email }, '-timestamp', 50).catch(() => []),
      ]);

      // Intel map
      const iMap = {};
      intelRaw.forEach(i => { iMap[i.company_name?.toLowerCase()] = i; });
      setCompanyIntel(iMap);

      // Alumni counts
      const aMap = {};
      alumniRaw.forEach(a => { const k = a.company?.toLowerCase(); if (k) aMap[k] = (aMap[k] || 0) + 1; });
      setAlumniCounts(aMap);

      // Pipeline
      const pc = { identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0 };
      pipelineRaw.forEach(p => { if (pc[p.status] !== undefined) pc[p.status]++; });
      setPipelineCounts(pc);

      // Unmessaged alumni (identified but not reached_out)
      const identifiedOnly = pipelineRaw.filter(p => p.status === 'identified').length;
      setUnmessagedAlumni(identifiedOnly);

      // New opportunities
      setNewOpportunities(oppsRaw);

      // Build ticker items from real data
      const tItems = [];
      if (intelRaw.length > 0) {
        const recent = intelRaw[0];
        tItems.push(`FASTIQ scanned ${recent.company_name || 'your targets'} recently`);
        if (recent.open_roles_count > 0) tItems.push(`${recent.company_name} has ${recent.open_roles_count} open roles`);
      }
      if (alumniRaw.length > 0) {
        const companies = [...new Set(alumniRaw.slice(0, 3).map(a => a.company).filter(Boolean))];
        companies.forEach(c => {
          const count = aMap[c.toLowerCase()] || 0;
          if (count > 0) tItems.push(`${count} UF alumni found at ${titleCase(c)}`);
        });
      }
      if (oppsRaw.length > 0) {
        tItems.push(`${oppsRaw.length} new opportunities matched to your profile`);
      }
      // Fallback placeholders
      if (tItems.length < 3) {
        tItems.push('FASTIQ scanned your targets 12 min ago');
        tItems.push('New roles posted at target companies this week');
        tItems.push('FASTIQ continuously monitors hiring signals for you');
      }
      setTickerItems(tItems);

      // Weekly stats
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekOps = oppsRaw.filter(o => o.scouted_date && new Date(o.scouted_date) >= oneWeekAgo).length;
      const weekActivity = activityRaw.filter(a => a.timestamp && new Date(a.timestamp) >= oneWeekAgo);
      const companiesScanned = new Set(weekActivity.filter(a => a.action_type === 'company_search').map(a => a.target_name)).size;
      const alumniFound = weekActivity.filter(a => a.action_type === 'alumni_view').length;
      setWeeklyStats({
        opportunities: weekOps || oppsRaw.length,
        alumniFound: alumniFound || alumniRaw.length,
        companiesScanned: companiesScanned || Object.keys(iMap).length,
        topSignal: intelRaw.find(i => i.hiring_signal === 'hot')?.company_name || null,
      });
    };
    load();
  }, [user?.email, profile?.target_companies]);

  const targetCompanies = (profile?.target_companies || []).map(c => titleCase(c));
  const userFirstName = user?.full_name?.split(' ')[0] || 'Student';

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

      {/* HERO with Ticker */}
      <div style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 50%, #1a3a8f 100%)', position: 'relative', overflow: 'hidden' }}>
        <LiveTickerBar items={tickerItems} />
        <HeroSection
          userName={userFirstName}
          user={user}
          profile={profile}
          statValues={statValues}
          onOpenChat={onOpenChat}
        />
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 20px 60px' }}>
        <InsightCard unmessagedAlumni={unmessagedAlumni} onOpenChat={onOpenChat} profile={profile} />

        {newOpportunities.length > 0 && (
          <div ref={alertsRef}>
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

        <PipelineBar counts={pipelineCounts} />

        {targetCompanies.length > 0 && (
          <TargetCompaniesSection
            companies={targetCompanies}
            companyIntel={companyIntel}
            alumniCounts={alumniCounts}
            onOpenChat={onOpenChat}
          />
        )}

        <QuickActionsGrid onOpenChat={onOpenChat} />

        {weeklyStats && (
          <WeeklyBriefCard stats={weeklyStats} onOpenChat={onOpenChat} />
        )}

        <div style={{ textAlign: 'center', padding: '40px 0 10px', fontSize: 12, color: '#94A3B8' }}>
          FASTIQ™ by College Fast Forward · Because applying isn't a strategy.
        </div>
      </div>
    </div>
  );
}