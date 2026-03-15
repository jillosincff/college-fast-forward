import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';
import HeroSection from './HeroSection';
import WhatsNewSection from './WhatsNewSection';
import NextStepsSection from './NextStepsSection';
import PipelineBar from './PipelineBar';
import PipelineNudge from './PipelineNudge';
import TargetCompaniesSection from './TargetCompaniesSection';
import QuickActionsGrid from './QuickActionsGrid';
// MyResumeSection removed — covered by Resume tool card
import AddTargetsModal from './AddTargetsModal';
import ProfileEditModal from './ProfileEditModal';
import PastResearchSection from './PastResearchSection';
import InterviewPrepTab from './InterviewPrepTab';
import AskFastIQChat from './AskFastIQChat';

function buildStatusLines(pipelineData, newOpportunities, weeklyStats) {
  if (weeklyStats?._noTargets) {
    return [
      '⚡ FASTIQ monitors hiring signals, finds alumni, and scouts jobs for you',
    ];
  }
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
  // Removed "X companies scanned this week" — often stale/grammatically awkward
  if (weeklyStats?.topSignal) lines.push(`🔥 ${weeklyStats.topSignal} is actively hiring right now`);
  if (lines.length === 0) lines.push('⚡ FASTIQ is scanning the market for you');
  return lines;
}

export default function FastIQCommandCenter({ user, profile, onOpenChat, onProfileUpdated, highlightAlerts }) {
  const [companyIntel, setCompanyIntel] = useState({});
  const [alumniCounts, setAlumniCounts] = useState({});
  const [pipelineCounts, setPipelineCounts] = useState({ identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0, no_response: 0 });
  const [pipelineData, setPipelineData] = useState([]);
  const [newOpportunities, setNewOpportunities] = useState([]);
  const [newAlumni, setNewAlumni] = useState([]);
  const [allAlumniAtTargets, setAllAlumniAtTargets] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [unmessagedAlumni, setUnmessagedAlumni] = useState(0);
  const [showAddTargets, setShowAddTargets] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [noResponseContacts, setNoResponseContacts] = useState([]);
  const [pastResearch, setPastResearch] = useState([]);
  const alertsRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (highlightAlerts && alertsRef.current) {
      setTimeout(() => alertsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
  }, [highlightAlerts]);

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      const targetCompanyNames = (profile?.target_companies || []).map(c => titleCase(c));
      const [intelRaw, alumniRaw, pipelineRaw, oppsRaw, activityRaw] = await Promise.all([
        base44.entities.CompanyIntelCache.filter({}, '-created_date', 50).catch(() => []),
        base44.entities.DiscoveredAlumni.filter({}, '-created_date', 100).catch(() => []),
        base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 200).catch(() => []),
        base44.entities.ScoutedOpportunity.filter({ user_email: user.email, is_new: true }, '-scouted_date', 10).catch(() => []),
        base44.entities.ProActivityLog.filter({ user_email: user.email }, '-timestamp', 50).catch(() => []),
      ]);

      const targetNamesLowerSet = new Set(targetCompanyNames.map(n => n.toLowerCase()));

      // Intel
      const relevantIntel = intelRaw.filter(i => targetNamesLowerSet.has((i.company_name || '').toLowerCase()));
      const iMap = {};
      relevantIntel.forEach(i => { iMap[i.company_name?.toLowerCase()] = i; });
      setCompanyIntel(iMap);

      // Alumni counts + new alumni list + all alumni at targets
      const aMap = {};
      const recentAlumni = [];
      const allTargetAlumni = [];
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      alumniRaw.forEach(a => {
        const k = a.company?.toLowerCase();
        if (k && targetNamesLowerSet.has(k)) {
          aMap[k] = (aMap[k] || 0) + 1;
          allTargetAlumni.push(a);
          if (a.created_date && new Date(a.created_date) >= oneWeekAgo) {
            recentAlumni.push(a);
          }
        }
      });
      setAlumniCounts(aMap);
      setNewAlumni(recentAlumni.slice(0, 10));
      setAllAlumniAtTargets(allTargetAlumni);

      // Pipeline
      const ACTIVE_STATUSES = ['reached_out', 'replied', 'interview', 'offer'];
      const activePipeline = pipelineRaw.filter(p => {
        if (ACTIVE_STATUSES.includes(p.status)) return true;
        if (p.status === 'no_response') return true;
        if (p.status === 'identified' && targetNamesLowerSet.has((p.company || '').toLowerCase())) return true;
        if ((p.notes || '').includes('[archived: target removed]')) return false;
        return targetNamesLowerSet.has((p.company || '').toLowerCase());
      });
      const pc = { identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0, no_response: 0 };
      activePipeline.forEach(p => { if (pc[p.status] !== undefined) pc[p.status]++; });
      setPipelineCounts(pc);
      setPipelineData(activePipeline);
      setNoResponseContacts(activePipeline.filter(p => p.status === 'no_response'));
      setUnmessagedAlumni(activePipeline.filter(p => p.status === 'identified').length);

      // Opportunities
      const activeOpps = oppsRaw.filter(o => targetNamesLowerSet.has((o.company_name || '').toLowerCase()));
      setNewOpportunities(activeOpps);

      // Past research
      const pastCompanies = intelRaw.filter(i => !targetNamesLowerSet.has((i.company_name || '').toLowerCase()));
      const pastAlumniMap = {};
      alumniRaw.forEach(a => { const k = a.company?.toLowerCase(); if (k && !targetNamesLowerSet.has(k)) pastAlumniMap[k] = (pastAlumniMap[k] || 0) + 1; });
      const pastPipelineMap = {};
      pipelineRaw.forEach(p => { const k = (p.company || '').toLowerCase(); if (!targetNamesLowerSet.has(k)) { if (!pastPipelineMap[k]) pastPipelineMap[k] = { total: 0, reached: 0 }; pastPipelineMap[k].total++; if (p.status !== 'identified') pastPipelineMap[k].reached++; } });
      setPastResearch(pastCompanies.map(i => ({
        company_name: i.company_name, intel: i,
        alumni_count: pastAlumniMap[(i.company_name || '').toLowerCase()] || 0,
        pipeline: pastPipelineMap[(i.company_name || '').toLowerCase()] || { total: 0, reached: 0 },
      })));

      // Weekly stats
      const targetNamesLowerArr = targetCompanyNames.map(n => n.toLowerCase());
      const JUNK_WORDS = ['experience','identify','relevant','more','week','undefined','null','company','the','and','for','with','your','this','that','from','have','been','about','into','each','find','search','apply','submit','check','browse','explore','discover','learn','view'];
      const isValidCompanyName = (name) => {
        if (!name || typeof name !== 'string') return false;
        const trimmed = name.trim();
        if (trimmed.length < 2) return false;
        if (targetNamesLowerArr.includes(trimmed.toLowerCase())) return true;
        if (/^[a-z_]+$/i.test(trimmed)) return false;
        if (JUNK_WORDS.includes(trimmed.toLowerCase())) return false;
        const words = trimmed.toLowerCase().split(/\s+/);
        if (words.every(w => JUNK_WORDS.includes(w))) return false;
        return true;
      };

      const weekOps = activeOpps.filter(o => o.scouted_date && new Date(o.scouted_date) >= oneWeekAgo).length;
      const weekActivity = activityRaw.filter(a => a.timestamp && new Date(a.timestamp) >= oneWeekAgo);
      // Only count company_search actions for CURRENT targets (filter out stale data from removed targets)
      const companiesScanned = new Set(
        weekActivity
          .filter(a => a.action_type === 'company_search' && a.target_name && targetNamesLowerSet.has(a.target_name.toLowerCase()))
          .map(a => a.target_name)
      ).size;
      const alumniFound = weekActivity.filter(a => a.action_type === 'alumni_view').length;
      const hotTargetCompany = relevantIntel.find(i => i.hiring_signal === 'hot' && targetNamesLowerArr.includes((i.company_name || '').toLowerCase()));
      const topSignalName = hotTargetCompany ? titleCase(String(hotTargetCompany.company_name || '').trim()) : null;
      let entryLevelTotal = 0, internTotal = 0;
      Object.values(iMap).forEach(i => { entryLevelTotal += (i.entry_level_roles_count || 0); internTotal += (i.intern_roles_count || 0); });

      setWeeklyStats({
        opportunities: weekOps || activeOpps.length,
        alumniFound: alumniFound || Object.values(aMap).reduce((s, v) => s + v, 0),
        companiesScanned: companiesScanned || Object.keys(iMap).length,
        topSignal: isValidCompanyName(topSignalName) ? topSignalName : null,
        entryLevelRoles: entryLevelTotal,
        internRoles: internTotal,
        _noTargets: targetCompanyNames.length === 0,
      });
    };
    load();
  }, [user?.email, profile?.target_companies, refreshKey]);

  const targetCompanies = (profile?.target_companies || []).map(c => titleCase(c));
  const rawName = user?.full_name || '';
  const userFirstName = rawName.includes(',')
    ? rawName.split(',')[1]?.trim().split(' ')[0] || rawName.split(' ')[0] || 'Student'
    : rawName.split(' ')[0] || 'Student';

  // Live stat values
  const [liveInsiders, setLiveInsiders] = useState(0);
  const [liveMessages, setLiveMessages] = useState(0);
  const [liveWarmPaths, setLiveWarmPaths] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    const targetNames = (profile?.target_companies || []).map(c => c.toLowerCase());
    const hasTargets = targetNames.length > 0;

    base44.entities.DiscoveredAlumni.filter({}, '-created_date', 200).then(all => {
      if (!hasTargets) { setLiveInsiders(0); return; }
      setLiveInsiders(all.filter(a => a.company && targetNames.includes(a.company.toLowerCase())).length);
    }).catch(() => setLiveInsiders(0));

    base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 200).then(all => {
      if (!hasTargets) { setLiveMessages(0); setLiveWarmPaths(0); return; }
      const ACTIVE = ['reached_out', 'replied', 'interview', 'offer'];
      const WARM = ['replied', 'interview', 'offer'];
      const atTargets = all.filter(p => p.company && targetNames.includes(p.company.toLowerCase()));
      const archived = (p) => (p.notes || '').includes('[archived: target removed]');
      setLiveMessages(atTargets.filter(p => ACTIVE.includes(p.status) && !archived(p)).length);
      setLiveWarmPaths(atTargets.filter(p => WARM.includes(p.status) && !archived(p)).length);
    }).catch(() => { setLiveMessages(0); setLiveWarmPaths(0); });
  }, [user?.email, profile?.target_companies, refreshKey]);

  const statValues = {
    targets: profile?.target_companies?.length || 0,
    insiders: liveInsiders,
    messages: liveMessages,
    warmPaths: liveWarmPaths,
  };

  return (
    <div className="fiq-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Space+Mono:wght@400;700&display=swap');
        .fiq-root { font-family: 'DM Sans', sans-serif; background: #f4f2ee; min-height: 100vh; }
        .fiq-root * { box-sizing: border-box; }
        .fiq-mono { font-family: 'Space Mono', monospace; }
        @keyframes fiq-fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fiq-pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes fiq-heroGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        @keyframes fiq-ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fiq-ringPulse { 0%, 100% { filter: drop-shadow(0 0 2px transparent); } 50% { filter: drop-shadow(0 0 8px currentColor); } }
        @keyframes fiq-cta-glow { 0%, 100% { box-shadow: 0 4px 16px rgba(0,33,165,0.35); } 50% { box-shadow: 0 4px 24px rgba(0,33,165,0.55), 0 0 40px rgba(0,33,165,0.2); } }
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

      {/* HERO (kept as-is) */}
      <div style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 50%, #1a3a8f 100%)', position: 'relative', overflow: 'hidden' }}>
        <HeroSection
          userName={userFirstName}
          user={user}
          profile={profile}
          statValues={statValues}
          onOpenChat={onOpenChat}
          statusLines={buildStatusLines(pipelineData, newOpportunities, weeklyStats)}
          onEditProfile={() => setShowProfileEdit(true)}
        />
        {/* FIX 4: Gradient transition from dark header to light body */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, #f4f2ee)', pointerEvents: 'none' }} />
      </div>

      {/* CONTENT — structured top-to-bottom flow */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* FIX 3: ASK FASTIQ — elevated to first interactive element */}
        <AskFastIQChat onOpenChat={onOpenChat} />

        {/* SECTION 1 — WHAT'S NEW (only when there IS something new) */}
        <div ref={alertsRef}>
          <WhatsNewSection
            newAlumni={newAlumni}
            newOpportunities={newOpportunities}
            onOpenChat={onOpenChat}
            onDismissOpp={async (id) => {
              await base44.entities.ScoutedOpportunity.update(id, { is_new: false, status: 'dismissed' });
              setNewOpportunities(prev => prev.filter(o => o.id !== id));
            }}
          />
        </div>

        {/* SECTION 2 — YOUR NEXT STEPS (always visible) */}
        <NextStepsSection
          profile={profile}
          pipelineCounts={pipelineCounts}
          pipelineData={pipelineData}
          companyIntel={companyIntel}
          alumniData={allAlumniAtTargets}
          onOpenChat={onOpenChat}
          onAddTargets={() => setShowAddTargets(true)}
        />

        {/* SECTION 3 — TARGET COMPANIES */}
        <TargetCompaniesSection
          companies={targetCompanies}
          companyIntel={companyIntel}
          alumniCounts={alumniCounts}
          onOpenChat={onOpenChat}
          onAddTargets={() => setShowAddTargets(true)}
          positionType={profile?.position_type}
        />

        {/* SECTION 4 — CAREER CENTER TOOLS */}
        <QuickActionsGrid onOpenChat={onOpenChat} isNewUser={statValues.targets === 0 && statValues.insiders === 0 && statValues.messages === 0} />

        {/* SECTION 5 — YOUR PIPELINE (hidden when empty) */}
        <PipelineBar counts={pipelineCounts} noResponseContacts={noResponseContacts} onOpenChat={onOpenChat} />
        <PipelineNudge pipelineCounts={pipelineCounts} onOpenChat={onOpenChat} />

        {/* SECTION 7 — PAST RESEARCH (collapsible) */}
        <PastResearchSection
          pastResearch={pastResearch}
          onOpenChat={onOpenChat}
          onReAddCompany={async (companyName) => {
            if (!profile?.id) return;
            const current = profile.target_companies || [];
            if (current.length >= 5) return;
            if (current.map(c => c.toLowerCase()).includes(companyName.toLowerCase())) return;
            const updated = [...current, titleCase(companyName)];
            await base44.entities.FastTrackProProfile.update(profile.id, { target_companies: updated });
            if (onProfileUpdated) onProfileUpdated({ ...profile, target_companies: updated });
            setRefreshKey(prev => prev + 1);
          }}
        />

        {/* SECTION — INTERVIEW PREP */}
        <div style={{ marginTop: 32 }}>
          <InterviewPrepTab />
        </div>

        {/* FIX 9: FASTIQ-specific footer tagline */}
        <div style={{ textAlign: 'center', padding: '40px 0 10px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 300, color: '#aaa' }}>
          <span style={{ fontWeight: 500, color: '#E85D20' }}>FASTIQ™</span> by College Fast Forward. Because applying isn't a strategy.
        </div>
      </div>

      {showAddTargets && (
        <AddTargetsModal
          profile={profile}
          onClose={() => setShowAddTargets(false)}
          onSaved={(newCompanies) => {
            setShowAddTargets(false);
            if (onProfileUpdated) onProfileUpdated({ ...profile, target_companies: newCompanies });
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      {showProfileEdit && (
        <ProfileEditModal
          user={user}
          profile={profile}
          onClose={() => setShowProfileEdit(false)}
          onSaved={(updatedProfile) => {
            setShowProfileEdit(false);
            if (onProfileUpdated) onProfileUpdated(updatedProfile);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}