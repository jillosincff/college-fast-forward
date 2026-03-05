import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Competitive element — shows activity benchmarks at low user counts,
 * switches to percentile ranking once 100+ active users exist.
 */
const AVG_FIRST_WEEK = { alumni: 5, messages: 2, companies: 2 };

export default function LeaderboardCard({ profile, onOpenChat }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!profile?.user_email) return;
    const load = async () => {
      const allProfiles = await base44.entities.FastTrackProProfile.filter({}, '-alumni_discovered', 200).catch(() => []);
      if (allProfiles.length < 2) return;

      const myAlumni = profile.alumni_discovered || 0;
      const myMessages = profile.messages_drafted || 0;
      const myCompanies = profile.companies_researched || 0;
      const myScore = myAlumni * 3 + myMessages * 5 + myCompanies * 2 + (profile.roadmaps_generated || 0);

      let betterCount = 0;
      allProfiles.forEach(p => {
        const score = (p.alumni_discovered || 0) * 3 + (p.messages_drafted || 0) * 5 +
                      (p.companies_researched || 0) * 2 + (p.roadmaps_generated || 0);
        if (score > myScore) betterCount++;
      });

      const percentile = Math.round(((allProfiles.length - betterCount) / allProfiles.length) * 100);

      setData({
        totalUsers: allProfiles.length,
        percentile: Math.min(99, Math.max(1, percentile)),
        myAlumni, myMessages, myCompanies,
      });
    };
    load();
  }, [profile?.user_email, profile?.alumni_discovered, profile?.messages_drafted]);

  if (!data) return null;

  const usePercentile = data.totalUsers >= 100;
  const isTop = data.percentile >= 70;
  const isMid = data.percentile >= 40;

  // Activity benchmark comparisons
  let benchmarkLine = '';
  let benchmarkEmoji = '📈';
  const alumniRatio = data.myAlumni / AVG_FIRST_WEEK.alumni;
  const msgRatio = data.myMessages / AVG_FIRST_WEEK.messages;
  const compRatio = data.myCompanies / AVG_FIRST_WEEK.companies;

  if (alumniRatio >= 2) {
    benchmarkLine = `You've identified ${data.myAlumni} alumni — that's ${Math.round(alumniRatio)}x the average first-week pace!`;
    benchmarkEmoji = '🚀';
  } else if (msgRatio >= 2) {
    benchmarkLine = `${data.myMessages} messages drafted — ${Math.round(msgRatio)}x the average. Keep it up!`;
    benchmarkEmoji = '🔥';
  } else if (compRatio >= 2) {
    benchmarkLine = `${data.myCompanies} companies researched — ${Math.round(compRatio)}x the average student!`;
    benchmarkEmoji = '🧠';
  } else if (data.myAlumni > 0) {
    benchmarkLine = `You've identified ${data.myAlumni} alumni so far. Students who reach 15 are 3× more likely to get a referral.`;
    benchmarkEmoji = '📈';
  } else {
    benchmarkLine = 'Start by finding alumni at your target companies — most students find 5+ in their first session.';
    benchmarkEmoji = '🎯';
  }

  // Tip + CTA
  let tip = '';
  let tipAction = '';
  let tipPrompt = '';
  if ((profile?.messages_drafted || 0) < 3) {
    tip = usePercentile ? '' : '';
    tipAction = 'Draft Outreach';
    tipPrompt = 'Draft an outreach message';
  } else if ((profile?.companies_researched || 0) < 3) {
    tipAction = 'Research Company';
    tipPrompt = 'Research my #1 target company';
  } else {
    tipAction = 'Next Action';
    tipPrompt = 'What should I do next in my job search?';
  }

  if (usePercentile) {
    // Percentile mode (100+ users)
    return (
      <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
        <div style={{
          background: isTop ? 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)' : isMid ? '#fff' : '#F8FAFC',
          borderRadius: 14,
          border: `1.5px solid ${isTop ? '#FDBA74' : '#E2E8F0'}`,
          padding: '18px 20px',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: isTop ? 'linear-gradient(135deg, #F97316, #FA4616)' : isMid ? 'linear-gradient(135deg, #0021A5, #3B82F6)' : '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{data.percentile}%</div>
              <div style={{ fontSize: 7, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>top</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
              {isTop ? '🏆' : '📈'} You're in the top {data.percentile}% of FASTIQ users
            </span>
            {tip && <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>{tip}</p>}
          </div>
          <button
            onClick={() => onOpenChat(tipPrompt)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: isTop ? '#F97316' : '#0021A5', color: '#fff',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
            }}
          >
            {tipAction} →
          </button>
        </div>
      </div>
    );
  }

  // Activity benchmark mode (< 100 users)
  return (
    <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
      <div style={{
        background: '#fff', borderRadius: 14,
        border: '1.5px solid #E2E8F0', padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: alumniRatio >= 2 || msgRatio >= 2 ? 'linear-gradient(135deg, #FFF7ED, #FFFBEB)' : '#F8FAFC',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, flexShrink: 0,
        }}>
          {benchmarkEmoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: 0 }}>
            {benchmarkLine}
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#64748B' }}>📊 {data.myAlumni} alumni</span>
            <span style={{ fontSize: 11, color: '#64748B' }}>✉️ {data.myMessages} messages</span>
            <span style={{ fontSize: 11, color: '#64748B' }}>🔍 {data.myCompanies} companies</span>
          </div>
        </div>
        <button
          onClick={() => onOpenChat(tipPrompt)}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 'none',
            background: '#0021A5', color: '#fff',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap',
          }}
        >
          {tipAction} →
        </button>
      </div>
    </div>
  );
}