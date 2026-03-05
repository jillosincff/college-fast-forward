import React, { useState, useEffect } from 'react';

/**
 * Rotating status line in the Hero section showing real-time FASTIQ activity.
 * Fades in/out every 4 seconds. Pulls from actual data.
 */
export default function HeroStatusLine({ pipelineData, newOpportunities, weeklyStats, profile }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Build dynamic status lines from real data
  const lines = [];

  const staleCount = (pipelineData || []).filter(p => {
    if (p.status !== 'reached_out' || !p.reached_out_date) return false;
    return (Date.now() - new Date(p.reached_out_date).getTime()) > 3 * 24 * 60 * 60 * 1000;
  }).length;

  const identifiedCount = (pipelineData || []).filter(p => p.status === 'identified').length;
  const repliedCount = (pipelineData || []).filter(p => p.status === 'replied').length;
  const interviewCount = (pipelineData || []).filter(p => p.status === 'interview').length;

  if (staleCount > 0) {
    lines.push(`⏰ ${staleCount} contact${staleCount > 1 ? 's' : ''} waiting for follow-up`);
  }
  if ((newOpportunities || []).length > 0) {
    lines.push(`🔥 ${newOpportunities.length} new opportunit${newOpportunities.length > 1 ? 'ies' : 'y'} scouted this week`);
  }
  if (identifiedCount > 0) {
    lines.push(`🔍 ${identifiedCount} alumni identified across your targets`);
  }
  if (repliedCount > 0) {
    lines.push(`💬 ${repliedCount} alumni have replied to your outreach`);
  }
  if (interviewCount > 0) {
    lines.push(`📅 ${interviewCount} interview${interviewCount > 1 ? 's' : ''} in your pipeline`);
  }
  if (weeklyStats?.companiesScanned > 0) {
    lines.push(`📊 ${weeklyStats.companiesScanned} companies scanned this week`);
  }
  if (weeklyStats?.topSignal) {
    lines.push(`🔥 ${weeklyStats.topSignal} is actively hiring right now`);
  }

  // Fallbacks
  if (lines.length === 0) {
    lines.push('⚡ FASTIQ is scanning the market for you');
    lines.push('🎯 Set your target companies to get personalized intel');
  }

  useEffect(() => {
    if (lines.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % lines.length);
        setVisible(true);
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [lines.length]);

  return (
    <div style={{
      height: 22,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginTop: 8,
    }}>
      <span style={{
        fontSize: 12, color: 'rgba(255,255,255,0.7)',
        fontWeight: 500,
        transition: 'opacity 0.5s ease',
        opacity: visible ? 1 : 0,
      }}>
        {lines[currentIdx % lines.length]}
      </span>
    </div>
  );
}