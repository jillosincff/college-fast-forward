import React, { useState } from 'react';
import { dmSans, CARD_BG, ORANGE, BORDER } from './constants';
import { base44 } from '@/api/base44Client';
import { X, Loader2 } from 'lucide-react';

export default function AskParentModal({ user, onClose }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const parentEmails = user?.parent_emails || user?.student_emails || [];
  const hasLinkedParent = parentEmails.length > 0;

  const handleSend = async () => {
    const targetEmail = hasLinkedParent ? parentEmails[0] : email.trim();
    if (!targetEmail || !/\S+@\S+\.\S+/.test(targetEmail)) return;

    setSending(true);
    try {
      const studentName = user?.full_name?.split(' ')[0] || 'Your student';
      await base44.integrations.Core.SendEmail({
        to: targetEmail,
        subject: `${studentName} is ready to start their job search`,
        body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <h2 style="font-size:22px;color:#1a1a1a;margin-bottom:16px;">${studentName} is ready to start their job search.</h2>
          <p style="font-size:16px;color:#555;line-height:1.6;margin-bottom:24px;">Activate FastIQ to give them the full plan, real alumni contacts, and personalized outreach.</p>
          <a href="https://www.collegefastforward.com/#GetStarted" style="display:inline-block;background:#E85D20;color:#fff;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:600;font-size:15px;">Activate FastIQ →</a>
          <p style="font-size:13px;color:#999;margin-top:24px;">— The College Fast Forward Team</p>
        </div>`,
      });
      setSent(true);
    } catch (error) {
      console.error('Failed to send parent email:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '32px 28px', maxWidth: 440, width: '100%' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto' }}>
          <X size={20} />
        </button>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✅</p>
            <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Sent!</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888' }}>We sent everything they need to activate FastIQ for you.</p>
          </div>
        ) : hasLinkedParent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Send to your linked parent?</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 20 }}>We'll email {parentEmails[0]} with everything they need to activate FastIQ.</p>
            <button onClick={handleSend} disabled={sending} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '12px 28px', cursor: 'pointer', minHeight: 'auto' }}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" style={{ display: 'inline' }} /> : 'Send →'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Enter your parent's email</p>
            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 20 }}>We'll send them everything they need to know.</p>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="parent@email.com"
              type="email"
              style={{ width: '100%', background: '#111', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px', fontFamily: dmSans, fontSize: 14, color: '#fff', marginBottom: 14, boxSizing: 'border-box' }}
            />
            <button onClick={handleSend} disabled={sending || !email.trim()} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '12px 28px', cursor: 'pointer', width: '100%', minHeight: 'auto', opacity: !email.trim() ? 0.5 : 1 }}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" style={{ display: 'inline' }} /> : 'Send →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}