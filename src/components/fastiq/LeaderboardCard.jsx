import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Competitive element — shows user's ranking among FASTIQ users.
 * "You're in the top X% of FASTIQ users"
 */
export default function LeaderboardCard({ profile, onOpenChat }) {
  const [ranking, setRanking] = useState(null);

  useEffect(() => {
    if (!profile?.user_email) return;
    // Calculate ranking from aggregate data
    const load = async () => {
      const allProfiles = await base44.entities.FastTrackProProfile.filter({}, '-alumni_discovered', 200).catch(() => []);
      if (allProfiles.length < 2) return;

      const myScore = (profile.alumni_discovered || 0) * 3 +
                      (profile.messages_drafted || 0) * 5 +
                      (profile.companies_researched || 0) * 2 +
                      (profile.roadmaps_generated || 0);

      let betterCount = 0;
      allProfiles.forEach(p => {
        const score = (p.alumni_discovered || 0) * 3 +
                      (p.messages_drafted || 0) * 5 +
                      (p.companies_researched || 0) * 2 +
                      (p.roadmaps_generated || 0);
        if (score > myScore) betterCount++;
      });

      const percentile = Math.round(((allProfiles.length - betterCount) / allProfiles.length) * 100);
      setRanking({
        percentile: Math.min(99, Math.max(1, percentile)),
        totalUsers: allProfiles.length,
      });
    };
    load();
  }, [profile?.user_email, profile?.alumni_discovered, profile?.messages_drafted]);

  if (!ranking) return null;

  const isTop = ranking.percentile >= 70;
  const isMid = ranking.percentile >= 40;

  // Dynamic tip
  let tip = '';
  let tipAction = '';
  let tipPrompt = '';
  if ((profile?.messages_drafted || 0) < 3) {
    tip = 'Reach out to 3 alumni this week to move up.';
    tipAction = 'Draft Outreach';
    tipPrompt = 'Draft an outreach message';
  } else if ((profile?.companies_researched || 0) < 3) {
    tip = 'Research 2 more companies to climb higher.';
    tipAction = 'Research Company';
    tipPrompt = 'Research my #1 target company';
  } else {
    tip = 'Keep the momentum — consistency wins.';
    tipAction = 'Next Action';
    tipPrompt = 'What should I do next in my job search?';
  }

  return (
    <div className="fiq-animate fiq-delay-5" style={{ marginBottom: 32 }}>
      <div style={{
        background: isTop ? 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)' : isMid ? '#fff' : '#F8FAFC',
        borderRadius: 14,
        border: `1.5px solid ${isTop ? '#FDBA74' : isMid ? '#E2E8F0' : '#E2E8F0'}`,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        {/* Rank circle */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: isTop ? 'linear-gradient(135deg, #F97316, #FA4616)' : isMid ? 'linear-gradient(135deg, #0021A5, #3B82F6)' : '#94A3B8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {ranking.percentile}%
            </div>
            <div style={{ fontSize: 7, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              top
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
              {isTop ? '🏆' : '📈'} You're in the top {ranking.percentile}% of FASTIQ users
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
            {tip}
          </p>
        </div>

        <button
          onClick={() => onOpenChat(tipPrompt)}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 'none',
            background: isTop ? '#F97316' : '#0021A5', color: '#fff',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {tipAction} →
        </button>
      </div>
    </div>
  );
}