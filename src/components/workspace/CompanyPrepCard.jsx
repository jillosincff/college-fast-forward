import { useState } from 'react';
import { getCompanyPrep } from '@/functions/getCompanyPrep';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 14 }}>
    <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{title}</p>
    {children}
  </div>
);

// CLIFF's company preparation brief: summary, values, JD language, strategy,
// likely interview questions, and reliable recent news when available.
export default function CompanyPrepCard({ job, onPrepared }) {
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const company = job.company || '';

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getCompanyPrep({ company, role: job.role || job.job_title, jobDescription: job.jobDescription || '' });
      const data = res?.data || res;
      if (data?.prep) {
        setPrep(data.prep);
        if (onPrepared) onPrepared();
      } else setError(true);
    } catch { setError(true); }
    setLoading(false);
  };

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Company Preparation</h3>
        {!prep && !loading && (
          <button
            onClick={load}
            style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', minHeight: 44 }}
          >
            📚 Prepare me for {company}
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7c3aed', fontFamily: dm, fontSize: 13, fontWeight: 600, marginTop: 12 }}>
          <span style={{ width: 14, height: 14, border: '2px solid #ddd6fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          CLIFF is researching {company}…
        </div>
      )}

      {error && !loading && (
        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '10px 0 0' }}>Couldn't load company prep right now — try again in a moment.</p>
      )}

      {prep && (
        <div style={{ marginTop: 14 }}>
          <Section title="What they do">
            <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{prep.company_summary}</p>
          </Section>

          {prep.company_values?.length > 0 && (
            <Section title="What they appear to value">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {prep.company_values.map((v, i) => (
                  <span key={i} style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#5b21b6', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 999, padding: '5px 12px' }}>{v}</span>
                ))}
              </div>
            </Section>
          )}

          {prep.key_language?.length > 0 && (
            <Section title="Language to mirror from the job description">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {prep.key_language.map((k, i) => (
                  <span key={i} style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 999, padding: '5px 12px' }}>"{k}"</span>
                ))}
              </div>
            </Section>
          )}

          <Section title="Suggested strategy">
            <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>{prep.strategy}</p>
          </Section>

          {prep.interview_questions?.length > 0 && (
            <Section title="Likely interview questions">
              {prep.interview_questions.map((q, i) => (
                <p key={i} style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 5px', lineHeight: 1.5 }}>{i + 1}. {q}</p>
              ))}
            </Section>
          )}

          {prep.recent_news && (
            <Section title="Recent company info">
              <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>📰 {prep.recent_news}</p>
            </Section>
          )}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}