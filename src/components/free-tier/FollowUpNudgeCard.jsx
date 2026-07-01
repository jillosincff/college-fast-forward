import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Clock, Copy, Check, X } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

// Surfaces the highest-leverage stalled outreach: "You messaged X at Y n days
// ago" with a one-click AI follow-up draft. Shown for contacts messaged 3-14
// days ago with no reply and fewer than 2 follow-ups.
export default function FollowUpNudgeCard({ user }) {
  const dismissKey = `cff_fu_dismissed_${user?.email || 'anon'}`;
  const [target, setTarget] = useState(null);
  const [draft, setDraft] = useState(null);
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    let dismissed = [];
    try { dismissed = JSON.parse(localStorage.getItem(dismissKey) || '[]'); } catch {}

    base44.entities.NetworkingPipeline.filter({ user_email: user.email }).then((entries) => {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const stalled = (entries || []).filter(e => {
        if (dismissed.includes(e.id) || e.replied_date || !e.alumni_name) return false;
        if ((e.follow_up_count || 0) >= 2) return false;
        if (!['reached_out', 'messaged', 'no_response'].includes(e.status)) return false;
        const sent = new Date(e.reached_out_date || e.status_date || e.created_date).getTime();
        const age = (now - sent) / day;
        return age >= 3 && age <= 14;
      });
      // Oldest first — most urgent
      stalled.sort((a, b) => new Date(a.reached_out_date || a.status_date || a.created_date) - new Date(b.reached_out_date || b.status_date || b.created_date));
      if (stalled[0]) {
        const e = stalled[0];
        const days = Math.floor((now - new Date(e.reached_out_date || e.status_date || e.created_date).getTime()) / day);
        setTarget({ ...e, daysAgo: days });
      }
    }).catch(() => {});
  }, [user?.email, dismissKey]);

  if (!target || done) return null;

  const firstName = (target.alumni_name || '').split(' ')[0];

  const generateDraft = async () => {
    setDrafting(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, warm follow-up message (under 70 words) from a college student to ${target.alumni_name}${target.alumni_role ? `, ${target.alumni_role}` : ''} at ${target.company}. The student reached out ${target.daysAgo} days ago about ${target.job_title ? `the ${target.job_title} role` : 'career advice / opportunities'} and hasn't heard back. Tone: polite, zero guilt-tripping, gives an easy out, restates one specific ask. No subject line, no placeholder brackets except [Your name] at the end. Plain text only.`,
    }).catch(() => null);
    setDraft(result || `Hi ${firstName}, just floating my note back to the top of your inbox — I know things get busy! I'd still love 15 minutes to hear about your path to ${target.company}. Totally understand if now isn't a good time. Thanks either way!\n\n[Your name]`);
    setDrafting(false);
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const markSent = async () => {
    setDone(true);
    await base44.entities.NetworkingPipeline.update(target.id, {
      follow_up_count: (target.follow_up_count || 0) + 1,
      follow_up_date: new Date().toISOString(),
    }).catch(() => {});
    window.dispatchEvent(new CustomEvent('cff-pipeline-updated'));
  };

  const dismiss = () => {
    try {
      const dismissed = JSON.parse(localStorage.getItem(dismissKey) || '[]');
      localStorage.setItem(dismissKey, JSON.stringify([...dismissed, target.id]));
    } catch {}
    setTarget(null);
  };

  return (
    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '18px 20px', marginBottom: 16, position: 'relative' }}>
      <button onClick={dismiss} aria-label="Dismiss" style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#b45309', padding: 4, minHeight: 'auto', minWidth: 'auto' }}>
        <X size={15} />
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock size={18} color="#b45309" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#78350f', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            Time to follow up with {firstName}
          </p>
          <p style={{ fontFamily: dm, fontSize: 12.5, color: '#92400e', margin: '0 0 12px', lineHeight: 1.55 }}>
            You messaged {target.alumni_name} at {target.company} {target.daysAgo} days ago. One polite follow-up roughly doubles your reply rate.
          </p>

          {!draft ? (
            <button
              onClick={generateDraft}
              disabled={drafting}
              style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#fff', background: '#b45309', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: drafting ? 'wait' : 'pointer', minHeight: 'auto', opacity: drafting ? 0.7 : 1 }}
            >
              {drafting ? 'Writing your follow-up…' : 'Write my follow-up'}
            </button>
          ) : (
            <div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                style={{ width: '100%', fontFamily: dm, fontSize: 13, color: '#374151', background: '#fff', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px', resize: 'vertical', marginBottom: 10, lineHeight: 1.55 }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={copyDraft} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: copied ? '#16a34a' : '#b45309', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.2s' }}>
                  {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy message</>}
                </button>
                <button onClick={markSent} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#b45309', background: 'transparent', border: '1px solid #f59e0b', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', minHeight: 'auto' }}>
                  Mark as sent
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}