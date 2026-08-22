const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const LABEL_STYLES = {
  'Strong Match': { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  'Good Match': { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  'Stretch Opportunity': { bg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  'Low Priority': { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' },
};

// Keep the fit read short — one or two sentences, never an essay.
const shortSummary = (t = '') => {
  const parts = String(t).match(/[^.!?]+[.!?]?/g) || [];
  return parts.slice(0, 2).join('').trim();
};

// CLIFF's job-fit assessment: label, one-line read, short bring/address lists.
export default function JobFitCard({ fit, loading, error }) {
  const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

  if (loading) {
    return (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7c3aed', fontFamily: dm, fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 14, height: 14, border: '2px solid #ddd6fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          CLIFF is analyzing how this job fits you…
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (error || !fit) {
    return (
      <div style={card}>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: 0 }}>
          CLIFF couldn't analyze this job right now — you can still prepare your application below.
        </p>
      </div>
    );
  }

  const style = LABEL_STYLES[fit.fit_label] || LABEL_STYLES['Good Match'];

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Job Fit</h3>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, background: style.bg, color: style.color, border: `1px solid ${style.border}`, borderRadius: 999, padding: '5px 14px' }}>
          {fit.fit_label}
        </span>
      </div>

      <p style={{ fontFamily: dm, fontSize: 14, color: '#1f2937', lineHeight: 1.65, margin: '0 0 14px' }}>{shortSummary(fit.why_match)}</p>

      {fit.matching_qualifications?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#15803d', margin: '0 0 6px' }}>✓ WHAT YOU ALREADY BRING</p>
          {fit.matching_qualifications.slice(0, 3).map((q, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 4px', lineHeight: 1.5 }}>• {q}</p>
          ))}
        </div>
      )}

      {fit.gaps?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#b45309', margin: '0 0 6px' }}>⚠ THINGS TO ADDRESS</p>
          {fit.gaps.slice(0, 3).map((g, i) => (
            <p key={i} style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 4px', lineHeight: 1.5 }}>• {g}</p>
          ))}
        </div>
      )}

      {fit.deadline && (
        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#dc2626', margin: 0 }}>⏰ Application deadline: {fit.deadline}</p>
      )}
    </div>
  );
}