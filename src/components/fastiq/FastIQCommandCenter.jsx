import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';
import HeroSection from './HeroSection';
import InsightCard from './InsightCard';
import OpportunitiesSection from './OpportunitiesSection';
import PipelineBar from './PipelineBar';
import TargetCompaniesSection from './TargetCompaniesSection';
import QuickActionsGrid from './QuickActionsGrid';
import WeeklyBriefCard from './WeeklyBriefCard';
import AddTargetsModal from './AddTargetsModal';
import BenchmarkCard from './BenchmarkCard';
import MasterResumeCard from './MasterResumeCard';

export default function FastIQCommandCenter({ user, profile, onOpenChat, onProfileUpdated, highlightAlerts }) {
  const [companyIntel, setCompanyIntel] = useState({});
  const [alumniCounts, setAlumniCounts] = useState({});
  const [pipelineCounts, setPipelineCounts] = useState({ identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0 });
  const [newOpportunities, setNewOpportunities] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [unmessagedAlumni, setUnmessagedAlumni] = useState(0);
  const [showAddTargets, setShowAddTargets] = useState(false);
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

      const isValidCompanyName = (n) => n && n.length > 2 && !/^[a-z_]+$/i.test(n) && !['week','undefined','null','company'].includes(n.toLowerCase());

      // Weekly stats — use full company_name for topSignal
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekOps = oppsRaw.filter(o => o.scouted_date && new Date(o.scouted_date) >= oneWeekAgo).length;
      const weekActivity = activityRaw.filter(a => a.timestamp && new Date(a.timestamp) >= oneWeekAgo);
      const companiesScanned = new Set(weekActivity.filter(a => a.action_type === 'company_search').map(a => a.target_name)).size;
      const alumniFound = weekActivity.filter(a => a.action_type === 'alumni_view').length;
      const hotCompany = intelRaw.find(i => i.hiring_signal === 'hot');
      const topSignalName = hotCompany ? titleCase(String(hotCompany.company_name || '').trim()) : null;
      setWeeklyStats({
        opportunities: weekOps || oppsRaw.length,
        alumniFound: alumniFound || alumniRaw.length,
        companiesScanned: companiesScanned || Object.keys(iMap).length,
        topSignal: isValidCompanyName(topSignalName) ? topSignalName : null,
      });
    };
    load();
  }, [user?.email, profile?.target_companies]);

  const targetCompanies = (profile?.target_companies || []).map(c => titleCase(c));
  const rawName = user?.full_name || '';
  // Handle "Last, First" format or "First Last" format
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
        />
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 20px 60px' }}>
        <MasterResumeCard profile={profile} onOpenChat={onOpenChat} />
        <InsightCard unmessagedAlumni={unmessagedAlumni} onOpenChat={onOpenChat} onAddTargets={() => setShowAddTargets(true)} profile={profile} />

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

        <PipelineBar counts={pipelineCounts} />

        <TargetCompaniesSection
          companies={targetCompanies}
          companyIntel={companyIntel}
          alumniCounts={alumniCounts}
          onOpenChat={onOpenChat}
          onAddTargets={() => setShowAddTargets(true)}
        />

        <BenchmarkCard profile={profile} />

        <QuickActionsGrid onOpenChat={onOpenChat} />

        {weeklyStats && (
          <WeeklyBriefCard stats={weeklyStats} onOpenChat={onOpenChat} />
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
          }}
        />
      )}
    </div>
  );
}