import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const DEFAULT_CATEGORIES = [
  { label: 'Job Search', key: 'job_search' },
  { label: 'Networking', key: 'networking' },
  { label: 'Career Path', key: 'career_path' },
  { label: 'First Job', key: 'first_job' },
  { label: 'Career Direction', key: 'career_direction' },
  { label: 'Industry Insights', key: 'industry_insights' },
];

export default function HelpCategoriesChart({ categories }) {
  const data = DEFAULT_CATEGORIES.map(cat => ({
    ...cat,
    count: categories?.[cat.key] || 0,
  }));

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.06)',
      padding: '24px',
    }}>
      <h3 style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a',
        letterSpacing: '-0.01em', marginBottom: 4,
      }}>
        Where Students Need Help Most
      </h3>
      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888',
        margin: '0 0 20px', lineHeight: 1.5,
      }}>
        The most common things students in the network are asking for right now.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map(cat => {
          const pct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
          const displayPct = cat.count > 0 ? Math.round((cat.count / data.reduce((s, d) => s + d.count, 0)) * 100) : 0;
          return (
            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#555',
                minWidth: 120, flexShrink: 0,
              }}>
                {cat.label}
              </span>
              <div style={{
                flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 100, height: 20,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  background: 'linear-gradient(90deg, #E85D20, #f08050)',
                  width: `${Math.max(pct > 0 ? 4 : 0, pct)}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888',
                minWidth: 36, textAlign: 'right',
              }}>
                {cat.count > 0 ? `${displayPct}%` : '--'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}