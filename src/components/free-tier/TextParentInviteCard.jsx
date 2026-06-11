import { useState } from 'react';
import { createParentReferralLink } from '@/functions/createParentReferralLink';

const dm = "'DM Sans', system-ui, sans-serif";

export default function TextParentInviteCard({ user }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(`cff_parent_invite_dismissed_${user?.id}`) === '1'; } catch { return false; }
  });
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  // Hide once the reward was earned, or if dismissed
  if (!user || user.parent_referral_reward_granted || dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(`cff_parent_invite_dismissed_${user.id}`, '1'); } catch {}
    setDismissed(true);
  };

  const getInvite = async () => {
    if (invite) return invite;
    setLoading(true);
    try {
      const res = await createParentReferralLink({});
      if (res.data?.success) { setInvite(res.data); return res.data; }
    } catch {}
    finally { setLoading(false); }
    return null;
  };

  const handleText = async () => {
    const inv = await getInvite();
    if (!inv) return;
    // Prefer native share sheet (mobile), fall back to SMS deep link
    if (navigator.share) {
      try { await navigator.share({ text: inv.sms_body }); return; } catch {}
    }
    window.location.href = `sms:?&body=${encodeURIComponent(inv.sms_body)}`;
  };

  const handleCopy = async () => {
    const inv = await getInvite();
    if (!inv) return;
    try {
      await navigator.clipboard.writeText(inv.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0d00 100%)',
      border: '1px solid rgba(232,93,32,0.35)',
      borderRadius: 16,
      padding: '20px 24px',
      margin: '0 24px 20px',
      position: 'relative',
    }}>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 14, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4 }}
      >✕</button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🎁</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Get 3 Days of Premium Free
          </p>
          <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '0 0 4px', lineHeight: 1.55 }}>
            Text your parent a signup link. When they join the parent network, you unlock <strong style={{ color: '#fff' }}>3 free days of Premium</strong> — instantly.
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
            They fill in their own info — takes them 2 minutes. Their work network becomes warm intros for you.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, minWidth: 170 }}>
          <button
            onClick={handleText}
            disabled={loading}
            style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: dm, minHeight: 'auto', whiteSpace: 'nowrap', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'One sec...' : '📱 Text My Parent'}
          </button>
          <button
            onClick={handleCopy}
            disabled={loading}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '9px 20px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: dm, minHeight: 'auto', whiteSpace: 'nowrap' }}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}