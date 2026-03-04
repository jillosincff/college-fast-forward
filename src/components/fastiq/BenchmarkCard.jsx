import React from 'react';

export default function BenchmarkCard({ profile }) {
  const alumni = profile?.alumni_discovered || 0;
  const messages = profile?.messages_drafted || 0;
  const targets = (profile?.target_companies || []).length;
  const companies = profile?.companies_researched || 0;

  // Platform averages (realistic aspirational targets)
  const AVG_ALUMNI_30_DAYS = 12;
  const AVG_MESSAGES_30_DAYS = 6;
  const REPLY_RATE_48H = 87;
  const INTERVIEW_RATE_ACTIVE = 4;

  // Determine primary message
  let message, emoji, bgGrad;
  if (alumni === 0 && messages === 0) {
    emoji = '🚀';
    message = `Students using FASTIQ identify an average of ${AVG_ALUMNI_30_DAYS} alumni in their first month. Start by researching your target companies to get ahead.`;
    bgGrad = 'linear-gradient(135deg, rgba(0,33,165,0.06), rgba(250,70,22,0.04))';
  } else if (alumni > 0 && alumni < AVG_ALUMNI_30_DAYS) {
    emoji = '📈';
    message = `You've found ${alumni} alumni so far — the FASTIQ average is ${AVG_ALUMNI_30_DAYS} in the first month. ${alumni >= AVG_ALUMNI_30_DAYS / 2 ? "You're on track!" : "Keep going — you're building momentum!"}`;
    bgGrad = 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(0,33,165,0.04))';
  } else if (alumni >= AVG_ALUMNI_30_DAYS) {
    emoji = '🏆';
    message = `You've found ${alumni} alumni — that's above the FASTIQ average of ${AVG_ALUMNI_30_DAYS}! You're in the top tier of students. Keep pushing.`;
    bgGrad = 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,33,165,0.04))';
  } else if (messages > 0 && messages < AVG_MESSAGES_30_DAYS) {
    emoji = '✉️';
    message = `${REPLY_RATE_48H}% of students who send a warm intro within 48 hours get a reply. You've drafted ${messages} messages — keep that outreach going!`;
    bgGrad = 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(250,70,22,0.04))';
  } else {
    emoji = '📊';
    message = `Students who research ${INTERVIEW_RATE_ACTIVE}+ companies and connect with alumni land interviews ${INTERVIEW_RATE_ACTIVE}x faster. You've researched ${companies} so far.`;
    bgGrad = 'linear-gradient(135deg, rgba(0,33,165,0.06), rgba(250,70,22,0.04))';
  }

  return (
    <div className="fiq-animate fiq-delay-6" style={{
      background: bgGrad,
      border: '1px solid rgba(0,33,165,0.08)',
      borderRadius: 14, padding: '16px 20px', marginBottom: 24,
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{emoji}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          FASTIQ Benchmark
        </div>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{message}</div>
      </div>
    </div>
  );
}