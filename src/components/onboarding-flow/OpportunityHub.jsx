import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";

const OPPORTUNITIES_DATA = {
  healthcare: [
    {
      id: 'hc-1',
      title: 'Clinical Research Coordinator',
      company: '[Top-Ranked Academic Medical Center]',
      location: 'Boston, MA (Hybrid)',
      posted: 'Updated 3 hours ago',
      alumCount: 2,
      insiderTitle: 'Lead Clinical Trials Associate',
      insiderTimeline: 'Graduated 2 Years Ago',
      previewText: "Hey, noticed you also went to the same school and moved into clinical research here. I'm exploring CRC roles in your department and would love to hear how you navigated the hiring process...",
    },
    {
      id: 'hc-2',
      title: 'Biotech Research Associate',
      company: '[Emerging Cell Therapy Company]',
      location: 'San Diego, CA',
      posted: 'Updated 6 hours ago',
      alumCount: 1,
      insiderTitle: 'Senior Lab Research Scientist',
      insiderTimeline: 'Graduated 3 Years Ago',
      previewText: "Hi, saw that you graduated from the same campus and joined the R&D team there. I'm targeting biotech research roles and would really value your perspective on the onboarding and lab culture...",
    },
    {
      id: 'hc-3',
      title: 'Health Policy Analyst',
      company: '[Federal Health Agency / Think Tank]',
      location: 'Washington, DC',
      posted: 'Updated 1 day ago',
      alumCount: 2,
      insiderTitle: 'Policy Program Associate',
      insiderTimeline: 'Graduated 4 Years Ago',
      previewText: "Hello, noticed you transitioned from our school ecosystem into health policy work in DC. I'm preparing my applications for analyst roles and would appreciate any insight on the hiring cycle there...",
    },
  ],
  tech: [
    {
      id: 'tech-1',
      title: 'Software Engineering Intern',
      company: '[Top-Tier Cloud Infrastructure Firm]',
      location: 'Seattle, WA (Hybrid)',
      posted: 'Updated 2 hours ago',
      alumCount: 3,
      insiderTitle: 'Senior Software Engineer',
      insiderTimeline: 'Graduated 3 Years Ago',
      previewText: "Hey, saw you went to the same school and are now on the engineering team there. I'm applying for intern and new grad SWE roles and would love any insight on the technical interview process...",
    },
    {
      id: 'tech-2',
      title: 'Product Manager — New Grad',
      company: '[High-Growth B2B SaaS Company]',
      location: 'San Francisco, CA',
      posted: 'Updated 5 hours ago',
      alumCount: 1,
      insiderTitle: 'Associate Product Manager',
      insiderTimeline: 'Graduated 2 Years Ago',
      previewText: "Hi, noticed you also went to the same school and landed a PM role there. I'm targeting APM programs for next cycle and would love 10 minutes to hear about your experience getting in...",
    },
    {
      id: 'tech-3',
      title: 'Data Science Analyst',
      company: '[Leading Fintech Platform]',
      location: 'New York, NY',
      posted: 'Updated 8 hours ago',
      alumCount: 2,
      insiderTitle: 'Data Science Lead',
      insiderTimeline: 'Graduated 4 Years Ago',
      previewText: "Hello, came across your profile and noticed the shared school connection. I'm targeting data analyst and data science roles and would value any perspective you have on what skills they prioritize...",
    },
  ],
  law_gov: [
    {
      id: 'lg-1',
      title: 'Legislative Affairs Intern',
      company: '[U.S. Senate / Congressional Office]',
      location: 'Washington, DC',
      posted: 'Updated 4 hours ago',
      alumCount: 2,
      insiderTitle: 'Policy Research Associate',
      insiderTimeline: 'Graduated 2 Years Ago',
      previewText: "Hey, noticed you also came from the same school and moved into legislative work on the Hill. I'm applying for policy and staff intern roles and would really appreciate any guidance you can share...",
    },
    {
      id: 'lg-2',
      title: 'Public Policy Analyst',
      company: '[Top Policy Research Institute]',
      location: 'Washington, DC (Hybrid)',
      posted: 'Updated 1 day ago',
      alumCount: 1,
      insiderTitle: 'Senior Policy Fellow',
      insiderTimeline: 'Graduated 5 Years Ago',
      previewText: "Hi, saw you graduated from the same campus and joined the policy research team there. I'm exploring analyst roles in the public policy space and would love your perspective on breaking in...",
    },
    {
      id: 'lg-3',
      title: 'Pre-Law Paralegal Associate',
      company: '[Am Law 100 Firm]',
      location: 'New York, NY',
      posted: 'Updated 7 hours ago',
      alumCount: 1,
      insiderTitle: 'Litigation Paralegal',
      insiderTimeline: 'Graduated 3 Years Ago',
      previewText: "Hello, noticed you went to the same school and took the paralegal route before law school. I'm on a similar pre-law path and would value any advice on making the most of the role...",
    },
  ],
  creative: [
    {
      id: 'cr-1',
      title: 'Entertainment Marketing Coordinator',
      company: '[Major Film & TV Studio]',
      location: 'Los Angeles, CA',
      posted: 'Updated 3 hours ago',
      alumCount: 2,
      insiderTitle: 'Creative Marketing Manager',
      insiderTimeline: 'Graduated 3 Years Ago',
      previewText: "Hey, noticed you also went to the same school and broke into the entertainment marketing space. I'm targeting coordinator roles at studios and would love your perspective on how you got your foot in the door...",
    },
    {
      id: 'cr-2',
      title: 'Junior Brand Designer',
      company: '[Global Fashion & Retail Group]',
      location: 'New York, NY',
      posted: 'Updated 6 hours ago',
      alumCount: 1,
      insiderTitle: 'Brand Creative Lead',
      insiderTimeline: 'Graduated 4 Years Ago',
      previewText: "Hi, saw you graduated from the same campus and moved into brand design at a major retail group. I'm building my portfolio and targeting similar roles — would love any insight on what the team looks for...",
    },
    {
      id: 'cr-3',
      title: 'Sports Business Analyst',
      company: '[Professional Sports Organization]',
      location: 'Miami, FL',
      posted: 'Updated 9 hours ago',
      alumCount: 1,
      insiderTitle: 'Strategy & Partnerships Associate',
      insiderTimeline: 'Graduated 2 Years Ago',
      previewText: "Hello, noticed you went to the same school and landed a business role in pro sports. I'm deeply interested in the sports business space and would really value any advice on breaking in...",
    },
  ],
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
  const allSelected = [...selectedIndustries, ...targetRoles].map(s => s.toLowerCase());

  const matches = (keywords) => allSelected.some(s => keywords.some(k => s.includes(k)));

  // Check bucket keys first (most reliable signal)
  if (selectedIndustries.includes('healthcare')) return 'healthcare';
  if (selectedIndustries.includes('tech')) return 'tech';
  if (selectedIndustries.includes('business')) return 'finance';
  if (selectedIndustries.includes('law_gov')) return 'law_gov';
  if (selectedIndustries.includes('creative')) return 'creative';
  if (selectedIndustries.includes('marketing')) return 'marketing';

  // Fallback: match on role keywords
  if (matches(['pre-med', 'biotech', 'clinical', 'health', 'pharma', 'nursing', 'public health'])) return 'healthcare';
  if (matches(['software', 'product', 'data science', 'ux', 'cybersecurity', 'ai', 'ml', 'engineering'])) return 'tech';
  if (matches(['investment banking', 'private equity', 'consulting', 'finance', 'accounting', 'strategy'])) return 'finance';
  if (matches(['pre-law', 'policy', 'government', 'nonprofit', 'politics', 'international'])) return 'law_gov';
  if (matches(['film', 'music', 'fashion', 'sports', 'gaming', 'architecture', 'entertainment'])) return 'creative';

  return 'marketing';
}

export default function OpportunityHub({ selectedIndustries = [], targetRoles = [], onUpgrade, firstName }) {
  const track = resolveTrack(selectedIndustries, targetRoles);
  const jobs = OPPORTUNITIES_DATA[track];
  const [expandedId, setExpandedId] = useState(jobs[0].id);
  const emojiMap = { finance: '📊', tech: '💻', healthcare: '🏥', law_gov: '⚖️', creative: '🎨', marketing: '🎯' };
  const emoji = emojiMap[track] || '🎯';

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