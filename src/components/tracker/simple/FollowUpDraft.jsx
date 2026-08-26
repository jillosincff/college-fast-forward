import { useState } from 'react';
import { Copy, Check, Send } from 'lucide-react';
import { buildFollowUpDraft } from '@/lib/simpleTracker';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Subtle follow-up nudge with a ready-to-copy draft. Only shows after 3+ days
// with no reply and no follow-up sent. No alarm copy — just a helpful nudge.
export default function FollowUpDraft({ app, user, onSent }) {
  const [copied, setCopied] = useState(false);
  const draft = buildFollowUpDraft(app, user);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const linkedInUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${app.company} ${app.job_title || ''} recruiter`)}`;

  return (
    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', marginTop: 10 }}>
      <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#92400e', margin: '0 0 8px' }}>
        No reply yet? Send a short follow-up.
      </p>
      <p style={{ fontFamily: dm, fontSize: 12.5, color: '#78350f', margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
        {draft}
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleCopy}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#92400e', background: '#fff', border: '1px solid #fde68a', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
        <button onClick={onSent}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: '#d97706', border: 'none', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Send size={13} /> I sent it
        </button>
        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#92400e', textDecoration: 'none' }}>
          Find on LinkedIn →
        </a>
      </div>
    </div>
  );
}