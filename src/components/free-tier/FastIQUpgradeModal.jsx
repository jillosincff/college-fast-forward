import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

const FEATURES = [
  'Full alumni names and direct contacts',
  'Personalized outreach messages ready to send',
  'AI-built career plan and daily action steps',
  'Resume tailored for each role',
  'LinkedIn profile review',
  'Interview preparation',
  'Job search tracking and follow-up alerts',
];

const FOUNDING_DEADLINE = new Date('2026-04-15T23:59:59');

export default function FastIQUpgradeModal({ user, onClose }) {
  const [showParentInvite, setShowParentInvite] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const foundingOfferActive = user?.membership_tier === 'founding' && new Date() < FOUNDING_DEADLINE;
  const daysLeft = Math.ceil((FOUNDING_DEADLINE - new Date()) / (1000 * 60 * 60 * 24));

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const hasLinkedParent = user?.parent_emails?.length > 0;

  const handleUpgrade = async (plan = 'fastiq_monthly') => {
    setUpgrading(true);
    try {
      const response = await createCheckoutSession({
        plan,
        successUrl: `${window.location.origin}/#Dashboard?upgrade=success`,
        cancelUrl: window.location.href,
        user: { id: user?.id, email: user?.email, persona: user?.persona, roles: user?.roles, full_name: user?.full_name, stripe_customer_id: user?.stripe_customer_id, family_id: user?.family_id, founding_offer_started_at: user?.founding_offer_started_at, student_emails: user?.student_emails },
      });
      const result = response?.data || response;
      if (result?.url) {
        window.location.href = result.url;
      } else {
        console.error('Checkout failed:', result?.error);
        setUpgrading(false);
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setUpgrading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!parentEmail.trim()) return;
    setSending(true);
    try {
      await fetch('/functions/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: parentEmail.trim(),
          subject: `${firstName} needs your help to activate FastIQ`,
          body: `Hi,\n\n${user.full_name || firstName} is ready to activate FastIQ on College Fast Forward.\n\nFastIQ is their 24/7 personal career agent — it finds alumni contacts, drafts personalized outreach, and builds a daily action plan around their goals.\n\nActivate FastIQ for your family: ${window.location.origin}/#ParentHome\n\n— The College Fast Forward Team`,
        }),
      });
      setInviteSent(true);
    } catch (err) {
      console.error('Failed to send parent invite:', err);
    }
    setSending(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#1A1A1A] border border-[#E85D20] text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#888888] hover:text-white transition-colors"
          style={{ minHeight: 'auto', minWidth: 'auto' }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-6 px-2">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
            Hi {firstName}. I'm FastIQ.
          </h2>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: 'italic', color: '#E85D20', marginBottom: 16 }}>
            Let's figure out exactly what you should do next.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#CCCCCC', lineHeight: 1.6, marginBottom: 20 }}>
            While you sleep, FastIQ is working — scouting target companies, discovering alumni, and building your personalized outreach. No more generic applications disappearing into a black hole.
          </p>

          <div className="bg-[#E85D20]/10 border border-[#E85D20]/30 rounded-lg p-4 mb-6">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#E85D20', marginBottom: 8 }}>
              Warm introductions make students 10x more likely to land an interview.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#CCCCCC' }}>
              You now have access to both the AI and the network.
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-green-400 text-sm flex-shrink-0">✓</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#CCCCCC' }}>{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 mb-6">
           <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
             $29/month or $249/year
           </p>
           <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888' }}>
             Start free for 7 days — then $29/month. Cancel anytime.
           </p>
          </div>

          {foundingOfferActive ? (
            <div>
              <div style={{ background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#E85D20', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 6px' }}>⚡ Founding Member Rate</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>$14.50/month or $124.50/year</p>
                <p style={{ fontSize: 12, color: '#CCCCCC', margin: '0 0 8px' }}>50% off forever — locked in as long as you stay subscribed.</p>
                <p style={{ fontSize: 11, color: '#fa8a6a', fontWeight: 500, margin: 0 }}>⏱ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''} — April 15th</p>
              </div>
              <div className="space-y-2">
                <button onClick={() => handleUpgrade('fastiq_founding_monthly')} disabled={upgrading} className="w-full bg-[#E85D20] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50" style={{ minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {upgrading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Start Free Trial — $14.50/month →'}
                </button>
                <button onClick={() => handleUpgrade('fastiq_founding_annual')} disabled={upgrading} className="w-full border border-[#E85D20] text-[#E85D20] py-3 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors disabled:opacity-50" style={{ minHeight: 'auto' }}>
                  Annual — $124.50/year (save $50)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={() => handleUpgrade('fastiq_monthly')} disabled={upgrading} className="w-full bg-[#E85D20] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50" style={{ minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {upgrading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Start Free Trial →'}
              </button>
              <button onClick={() => handleUpgrade('fastiq_annual')} disabled={upgrading} className="w-full border border-[#E85D20] text-[#E85D20] py-3 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors disabled:opacity-50" style={{ minHeight: 'auto' }}>
                Annual — $249/year (save $99)
              </button>
            </div>
          )}

          <div className="space-y-2">
            {!hasLinkedParent && !inviteSent && !showParentInvite && (
              <button onClick={() => setShowParentInvite(true)} className="w-full text-[#888888] text-sm hover:text-white transition-colors underline" style={{ minHeight: 'auto' }}>
                Don't have a parent in the network yet? Invite My Parent →
              </button>
            )}
            {showParentInvite && !inviteSent && (
              <div className="space-y-2">
                <input type="email" placeholder="Parent's email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="w-full px-4 py-3 rounded-full border border-[#2A2A2A] bg-[#0A0A0A] text-white" />
                <button onClick={handleSendInvite} disabled={!parentEmail.trim() || sending} className="w-full bg-[#E85D20] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50" style={{ minHeight: 'auto' }}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Invitation →'}
                </button>
              </div>
            )}
            {inviteSent && (
              <div className="text-center text-green-400 text-sm">
                ✓ Invitation sent — we'll notify you when they activate FastIQ for you.
              </div>
            )}
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#666', marginTop: 16, textAlign: 'center' }}>
            Start free for 7 days — then $29/month. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}