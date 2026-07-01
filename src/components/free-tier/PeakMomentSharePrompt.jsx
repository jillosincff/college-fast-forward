import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { PartyPopper, Copy, Check } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

// Peak-moment referral prompt: fires once when a student gets a reply or
// lands an interview — the exact moment they're most likely to share.
export default function PeakMomentSharePrompt({ user }) {
  const storageKey = `cff_celebrated_${user?.email || 'anon'}`;
  const [moment, setMoment] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    let celebrated = [];
    try { celebrated = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}

    base44.entities.NetworkingPipeline.filter({ user_email: user.email }).then((entries) => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const recent = (entries || []).filter(e => !celebrated.includes(e.id));
      // Interview beats reply
      const interview = recent.find(e => e.interview_date && new Date(e.interview_date).getTime() > threeDaysAgo);
      const reply = recent.find(e => e.replied_date && new Date(e.replied_date).getTime() > threeDaysAgo);
      const hit = interview ? { type: 'interview', entry: interview } : reply ? { type: 'reply', entry: reply } : null;
      if (hit) {
        setMoment(hit);
        try { localStorage.setItem(storageKey, JSON.stringify([...celebrated, hit.entry.id])); } catch {}
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.4 }, zIndex: 40001 });
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [user?.email, storageKey]);

  if (!moment) return null;

  const { type, entry } = moment;
  const company = entry.company || 'a target company';
  const shareUrl = user?.referral_code
    ? `https://www.collegefastforward.com/#/StudentLandingPage?ref__=${user.referral_code}`
    : 'https://www.collegefastforward.com/#/StudentLandingPage';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40000, background: 'rgba(10,8,20,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20, padding: '28px 26px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <PartyPopper size={26} color="#fff" />
        </div>
        <h3 style={{ fontFamily: dm, fontSize: 19, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {type === 'interview' ? `You landed an interview at ${company}!` : `${company} replied to you!`}
        </h3>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#64748b', margin: '0 0 18px', lineHeight: 1.6 }}>
          {type === 'interview'
            ? 'Most students never get this far with cold applications. Your warm-network approach is working.'
            : 'Only ~2% of cold outreach gets a response. Warm paths change the math — and yours just did.'}
        </p>
        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#5b21b6', margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
            Know a friend still sending applications into the void? Share your link and give them the same edge.
          </p>
        </div>
        <button
          onClick={copyLink}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#fff', background: copied ? '#16a34a' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 12, padding: '13px 20px', cursor: 'pointer', minHeight: 'auto', marginBottom: 10, transition: 'background 0.2s' }}
        >
          {copied ? <><Check size={15} /> Link copied — send it to a friend</> : <><Copy size={15} /> Copy my invite link</>}
        </button>
        <button
          onClick={() => setMoment(null)}
          style={{ width: '100%', fontFamily: dm, fontSize: 12.5, fontWeight: 600, color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '8px 0' }}
        >
          Keep going
        </button>
      </div>
    </div>
  );
}