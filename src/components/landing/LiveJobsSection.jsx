import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const PREVIEW_LENGTH = 180;

function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false);
  const desc = job.description || job.summary || '';
  const isLong = desc.length > PREVIEW_LENGTH;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      padding: '20px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(109,40,217,0.10)'; e.currentTarget.style.borderColor = 'rgba(109,40,217,0.25)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.3, wordBreak: 'break-word' }}>
            {job.role || job.title || 'Open Role'}
          </p>
          <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: INDIGO, margin: '3px 0 0' }}>
            {job.company}
          </p>
        </div>
        {job.signal && (
          <span style={{
            fontFamily: SF, fontSize: 10, fontWeight: 700, flexShrink: 0,
            background: job.signal === 'hot' ? '#fef2f2' : job.signal === 'warm' ? '#fff7ed' : '#f0fdf4',
            color: job.signal === 'hot' ? '#dc2626' : job.signal === 'warm' ? '#c2410c' : '#16a34a',
            border: `1px solid ${job.signal === 'hot' ? '#fecaca' : job.signal === 'warm' ? '#fed7aa' : '#bbf7d0'}`,
            borderRadius: 100, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {job.signal === 'hot' ? '🔥 Hot' : job.signal === 'warm' ? '⚡ Active' : '✅ Hiring'}
          </span>
        )}
      </div>

      {/* Meta tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {job.location && (
          <span style={{ fontFamily: SF, fontSize: 11, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px' }}>
            📍 {job.location}
          </span>
        )}
        {job.type && (
          <span style={{ fontFamily: SF, fontSize: 11, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 8px' }}>
            {job.type}
          </span>
        )}
        {job.salary_range && (
          <span style={{ fontFamily: SF, fontSize: 11, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 8px' }}>
            💰 {job.salary_range}
          </span>
        )}
      </div>

      {/* Description */}
      {desc && (
        <div>
          <p style={{ fontFamily: SF, fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.65 }}>
            {expanded || !isLong ? desc : desc.slice(0, PREVIEW_LENGTH).trimEnd() + '…'}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO,
                background: 'none', border: 'none', padding: '6px 0 0', cursor: 'pointer',
                minHeight: 'auto', minWidth: 'auto', display: 'block',
              }}
            >
              {expanded ? 'Show less ↑' : 'Read more →'}
            </button>
          )}
        </div>
      )}

      {/* Apply CTA */}
      {job.apply_url && (
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: SF, fontSize: 12, fontWeight: 700, color: INDIGO,
            background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(109,40,217,0.18)',
            borderRadius: 8, padding: '8px 16px', textDecoration: 'none',
            display: 'inline-block', alignSelf: 'flex-start', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = GRAD_INDIGO; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(109,40,217,0.07)'; e.currentTarget.style.color = INDIGO; }}
        >
          View & Apply →
        </a>
      )}
    </div>
  );
}

export default function LiveJobsSection({ go }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getLiveJobMatchesFn', {
      roles: ['Software Engineer Intern', 'Business Analyst', 'Marketing Intern', 'Finance Analyst', 'Product Manager Intern'],
      industries: ['Technology', 'Finance', 'Marketing'],
      company_sizes: ['large', 'mid'],
      locations: ['United States'],
      school: 'University of Florida',
    }).then(res => {
      const data = res?.data;
      const list = data?.matches || data?.jobs || data?.companies || [];
      // Flatten if companies array (each company may have open roles)
      const flat = [];
      list.forEach(item => {
        if (item.open_roles && Array.isArray(item.open_roles)) {
          item.open_roles.forEach(role => flat.push({
            company: item.company || item.name,
            role: typeof role === 'string' ? role : role.title || role.role,
            description: typeof role === 'string' ? null : (role.description || null),
            location: item.location || null,
            signal: item.signal || item.hiring_signal || null,
            salary_range: item.salary_range || null,
            apply_url: typeof role === 'object' ? (role.apply_url || role.url || null) : null,
          }));
        } else if (item.role || item.title) {
          flat.push({
            company: item.company || item.name,
            role: item.role || item.title,
            description: item.description || item.summary || null,
            location: item.location || null,
            signal: item.signal || item.hiring_signal || null,
            salary_range: item.salary_range || null,
            apply_url: item.apply_url || item.url || null,
          });
        }
      });
      setJobs(flat.slice(0, 9));
    }).catch(() => {
      setJobs([]);
    }).finally(() => setLoading(false));
  }, []);

  if (!loading && jobs.length === 0) return null;

  return (
    <div style={{ background: '#f8f9ff', padding: 'clamp(56px,12vw,96px) clamp(20px,5vw,40px)', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 6vw, 40px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(109,40,217,0.18)', borderRadius: 100, padding: '6px 16px', marginBottom: 14 }}>
            <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.08em', textTransform: 'uppercase' }}>🔴 Live Opportunities</span>
          </div>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 40px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 12px' }}>
            Real jobs, hiring right now
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px,3.5vw,16px)', color: '#64748b', margin: 0, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            CFF surfaces entry-level roles and internships that match students — then helps you get a warm intro inside.
          </p>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 22px', height: 160 }}>
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 18, width: '70%', marginBottom: 10 }} />
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 14, width: '50%', marginBottom: 16 }} />
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 12, width: '100%', marginBottom: 6 }} />
                <div style={{ background: '#f1f5f9', borderRadius: 8, height: 12, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {jobs.map((job, i) => <JobCard key={i} job={job} />)}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'clamp(28px, 6vw, 40px)' }}>
          <p style={{ fontFamily: SF, fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
            Sign up to unlock warm alumni intros, resume tailoring & more for every role →
          </p>
          <button onClick={go} style={{
            fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff',
            background: GRAD_INDIGO, border: 'none', borderRadius: 12,
            padding: '14px 36px', cursor: 'pointer', minHeight: 50,
            boxShadow: '0 8px 24px rgba(109,40,217,0.28)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Unlock All Opportunities →
          </button>
        </div>
      </div>
    </div>
  );
}