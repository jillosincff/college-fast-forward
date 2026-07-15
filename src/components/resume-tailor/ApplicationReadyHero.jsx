import React from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

// Hero: "Your application is ready" + CLIFF's confidence panel + primary/secondary CTAs.
export default function ApplicationReadyHero({ companyName, jobTitle, tailoredScore, onReview, onTrustApply, submitting }) {
  const strongMatch = tailoredScore >= 75;
  return (
    <div style={{ textAlign: 'center', padding: '8px 0 28px' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(24px, 5vw, 32px)', color: '#1a1a1a', margin: '0 0 10px', lineHeight: 1.2 }}>
        Your application is ready.
      </h1>
      {(companyName || jobTitle) && (
        <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>
          {companyName}{companyName && jobTitle ? ' · ' : ''}{jobTitle}
        </p>
      )}
      <p style={{ fontFamily: dm, fontSize: 13.5, color: '#6b7280', margin: '0 0 4px' }}>
        CLIFF prepared everything for this application.
      </p>
      <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '0 0 20px' }}>
        Estimated review time: <strong style={{ color: '#6b7280' }}>2 minutes</strong>
      </p>

      {/* CLIFF's confidence panel */}
      <div style={{ maxWidth: 520, margin: '0 auto 20px', textAlign: 'left', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '18px 22px' }}>
        <p style={{ fontFamily: dm, fontSize: 14.5, fontWeight: 800, color: '#5b21b6', margin: '0 0 10px' }}>
          🎯 I recommend applying. Here's why:
        </p>
        {[
          'Your experience aligns well with this role.',
          strongMatch ? 'Your resume is now a strong match.' : 'Your resume is now much better aligned with this role.',
          'This opportunity fits your stated goals.',
          "I'll watch for a networking advantage after you apply.",
        ].map((line, i) => (
          <p key={i} style={{ fontFamily: dm, fontSize: 13, color: '#6d28d9', margin: '0 0 6px', lineHeight: 1.5 }}>
            <span style={{ color: '#16a34a', fontWeight: 800, marginRight: 7 }}>✓</span>{line}
          </p>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button onClick={onReview}
          style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '15px 40px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(124,58,237,0.35)' }}>
          Review & Apply →
        </button>
        <button onClick={onTrustApply} disabled={submitting}
          style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6d28d9', background: 'none', border: 'none', cursor: submitting ? 'default' : 'pointer', minHeight: 'auto', padding: 6, textDecoration: 'underline', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'One moment…' : 'Trust CLIFF and Apply'}
        </button>
      </div>
    </div>
  );
}