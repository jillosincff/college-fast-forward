import { useState } from 'react';

const dm = "'DM Sans', system-ui, -apple-system, sans-serif";
const SHARE_URL = 'https://collegefastforward.com';
const SHARE_TEXT = "Join the free network where parents and alumni actually care about helping our kids succeed.";
const SHARE_TITLE = "College Fast Forward — Free parent & alumni network for your kid's school";

export default function ShareSection() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL });
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{
      position: 'relative', zIndex: 2,
      margin: '0 20px 64px',
      background: '#fff',
      border: '1.5px solid rgba(34,211,238,0.3)',
      borderRadius: 20,
      padding: '32px 24px',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(34,211,238,0.10), 0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🏫</div>
      <h3 style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#1f2937', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
        Help grow the network for all our kids
      </h3>
      <p style={{ fontFamily: dm, fontSize: 13.5, color: '#475569', margin: '0 0 22px', lineHeight: 1.65, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
        Share with other parents at your kid's school — every new member makes the network stronger for everyone.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {/* Primary share */}
        <button
          onClick={handleShare}
          style={{
            fontFamily: dm, fontSize: 14, fontWeight: 800,
            color: '#0f172a', background: '#22d3ee',
            border: 'none', borderRadius: 100,
            padding: '14px 24px', cursor: 'pointer',
            minHeight: 'auto', boxShadow: '0 4px 16px rgba(34,211,238,0.35)',
          }}
        >
          📤 Share with Parents
        </button>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: dm, fontSize: 14, fontWeight: 700,
            color: '#fff', background: '#1877f2',
            borderRadius: 100, padding: '14px 24px',
            textDecoration: 'none', display: 'inline-flex',
            alignItems: 'center', gap: 6,
            boxShadow: '0 4px 16px rgba(24,119,242,0.25)',
            minHeight: 'auto',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Share on Facebook
        </a>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          style={{
            fontFamily: dm, fontSize: 14, fontWeight: 700,
            color: '#fff', background: copied ? '#16a34a' : '#64748b',
            border: 'none', borderRadius: 100,
            padding: '14px 24px', cursor: 'pointer',
            minHeight: 'auto', transition: 'background 0.2s ease',
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Link'}
        </button>
      </div>

      <p style={{ fontFamily: dm, fontSize: 11.5, color: 'rgba(0,0,0,0.32)', margin: '16px 0 0', fontStyle: 'italic' }}>
        Perfect for parent Facebook groups, school apps, or texting other parents
      </p>
    </div>
  );
}