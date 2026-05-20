import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

const OPPORTUNITIES_DATA = {
  finance: [
    {
      id: 'ib-1',
      title: 'Investment Banking Analyst',
      company: '[Elite Global Advisory Firm]',
      location: 'New York, NY (Hybrid)',
      posted: 'Updated 2 hours ago',
      alumCount: 2,
      insiderTitle: 'M&A Coverage Associate',
      insiderTimeline: 'Graduated 2 Years Ago',
      previewText: "Hey there, noticed you also went to the same school and joined the advisory class here. I'm preparing for the upcoming summer analyst recruitment sequence and wanted to connect with someone who made the jump...",
    },
    {
      id: 'ib-2',
      title: 'Private Equity Associate',
      company: '[Top-Tier Merchant Bank]',
      location: 'Miami, FL',
      posted: 'Updated 5 hours ago',
      alumCount: 1,
      insiderTitle: 'Senior Portfolio Analyst',
      insiderTimeline: 'Graduated 4 Years Ago',
      previewText: "Hi, saw you graduated from the same campus and moved into merchant banking. I'm deep-diving into your group's active consumer portfolio track and would love 10 minutes of your time...",
    },
    {
      id: 'ib-3',
      title: 'Global Markets Analyst',
      company: '[Bulge-Bracket Institutional Group]',
      location: 'New York, NY',
      posted: 'Updated 1 day ago',
      alumCount: 3,
      insiderTitle: 'VP of Fixed Income Trading',
      insiderTimeline: 'Graduated 6 Years Ago',
      previewText: "Hello, noticed your track record stepping out of our school ecosystem into the trading desk. I'm navigating current market operations slots and would value any insight you could share...",
    },
  ],
  marketing: [
    {
      id: 'mkt-1',
      title: 'Marketing Coordinator',
      company: '[Top-Tier Ad Agency]',
      location: 'Miami, FL',
      posted: 'Updated 4 hours ago',
      alumCount: 1,
      insiderTitle: 'Digital Brand Director',
      insiderTimeline: 'Graduated 3 Years Ago',
      previewText: "Hey, noticed you also went to the same school and made the jump into agency work. I'm looking into their digital marketing pipeline and wanted to connect with someone on the inside...",
    },
    {
      id: 'mkt-2',
      title: 'Brand Strategy Associate',
      company: '[Leading Consumer Brand Group]',
      location: 'New York, NY',
      posted: 'Updated 6 hours ago',
      alumCount: 2,
      insiderTitle: 'Head of Integrated Marketing',
      insiderTimeline: 'Graduated 3 Years Ago',
      previewText: "Hi, came across your profile and realized we share the same school. I'm exploring the brand team's associate pipeline and would love your perspective on the culture and hiring cycle...",
    },
    {
      id: 'mkt-3',
      title: 'Growth Marketing Analyst',
      company: '[Top Creative Digital Firm]',
      location: 'Remote / Austin, TX',
      posted: 'Updated 8 hours ago',
      alumCount: 1,
      insiderTitle: 'Director of Paid Acquisition',
      insiderTimeline: 'Graduated 5 Years Ago',
      previewText: "Hello, saw you moved from our school ecosystem into this growth role. I'm targeting similar positions and would really appreciate a few minutes to hear about your experience getting in...",
    },
  ],
};

function resolveTrack(selectedIndustries = [], targetRoles = []) {
  const financeKeywords = ['investment banking', 'finance', 'private equity', 'banking', 'financial services', 'consulting', 'accounting'];
  const allSelected = [...selectedIndustries, ...targetRoles].map(s => s.toLowerCase());
  if (allSelected.some(s => financeKeywords.some(k => s.includes(k)))) return 'finance';
  return 'marketing';
}

export default function OpportunityHub({ selectedIndustries = [], targetRoles = [], onUpgrade, firstName }) {
  const track = resolveTrack(selectedIndustries, targetRoles);
  const jobs = OPPORTUNITIES_DATA[track];
  const [expandedId, setExpandedId] = useState(jobs[0].id);
  const emoji = track === 'finance' ? '📊' : '🎯';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {jobs.map((job) => {
          const isOpen = expandedId === job.id;
          return (
            <div
              key={job.id}
              style={{
                background: '#fff',
                border: `1.5px solid ${isOpen ? '#6366f1' : '#e5e7eb'}`,
                borderRadius: 20,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: isOpen
                  ? '0 15px 40px -15px rgba(99,102,241,0.14)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
              }}
              onClick={() => setExpandedId(isOpen ? null : job.id)}
            >
              {/* ── Collapsed Row ── */}
              <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ width: 40, height: 40, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                  {emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <p style={{ fontFamily: sat, fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>{job.title}</p>
                    <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>{job.posted}</span>
                  </div>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#6b7280', margin: 0 }}>
                    {job.company} · <span style={{ fontWeight: 500, color: '#9ca3af' }}>{job.location}</span>
                  </p>
                </div>
                <span style={{ flexShrink: 0, fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '5px 12px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  ⚡ {job.alumCount} Campus Alum{job.alumCount > 1 ? 's' : ''} Found
                </span>
              </div>

              {/* ── Expanded Content ── */}
              {isOpen && (
                <div
                  style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9', padding: '16px 18px' }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Insider connection block */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, position: 'relative', flexShrink: 0 }}>
                        🔑
                        <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 9, background: '#f59e0b', borderRadius: '50%', padding: '1px 3px', border: '1.5px solid #fff', lineHeight: 1, fontWeight: 700 }}>🔒</span>
                      </div>
                      <div>
                        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>[Locked] Verified Campus Connection</p>
                        <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', fontWeight: 600, margin: 0 }}>{job.insiderTitle}</p>
                      </div>
                    </div>
                    <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                      {job.insiderTimeline}
                    </span>
                  </div>

                  {/* Blurred outreach script */}
                  <div style={{ position: 'relative' }}>
                    <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      📋 CLiFF's Campus Ecosystem Outreach Draft
                    </p>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '13px 15px', fontFamily: dm, fontSize: 12, color: 'rgba(100,116,139,0.7)', lineHeight: 1.65, fontStyle: 'italic', filter: 'blur(4.5px)', userSelect: 'none', pointerEvents: 'none' }}>
                      "{job.previewText}"
                    </div>
                    {/* Gate overlay */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
                      <button
                        onClick={onUpgrade}
                        style={{
                          fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff',
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          border: 'none', borderRadius: 12, padding: '12px 20px',
                          cursor: 'pointer', minHeight: 'auto',
                          boxShadow: '0 10px 24px -5px rgba(99,102,241,0.45)',
                          display: 'inline-flex', alignItems: 'center', gap: 7,
                          transition: 'all 0.2s',
                          letterSpacing: '-0.01em',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 14px 28px -5px rgba(99,102,241,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 24px -5px rgba(99,102,241,0.45)'; }}
                      >
                        🔒 Unlock Insider Profiles &amp; Have CLiFF Text Them
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more hint */}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button
          onClick={onUpgrade}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          Show 10 More Hidden Tracks →
        </button>
      </div>
    </div>
  );
}