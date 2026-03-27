import React, { useState } from 'react';
import { X, Check, Loader2, Shield } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

const FOUNDING_DEADLINE = new Date('2025-04-15T23:59:59');

const FEATURES = [
  'Everything in CFF Membership',
  'FASTIQ AI career center',
  'Company research & alumni finder',
  'Personalized outreach drafts',
  'Resume tailoring & interview prep',
  'Weekly opportunity scouting',
];

export default function PlanSelectionModal({ isOpen, onClose, user, familyId }) {
  const [loading, setLoading] = useState(null);

  if (!isOpen) return null;

  const foundingOfferActive = user?.membership_tier === 'founding' && new Date() < FOUNDING_DEADLINE;
  const daysLeft = Math.ceil((FOUNDING_DEADLINE - new Date()) / (1000 * 60 * 60 * 24));

  const handleSelectPlan = async (planId) => {
    setLoading(planId);
    const baseUrl = window.location.origin;
    try {
      const response = await createCheckoutSession({
        plan: planId,
        successUrl: `${baseUrl}/#Dashboard?payment=success`,
        cancelUrl: `${baseUrl}/#FastIQ?payment=cancelled`,
        user: { id: user?.id, email: user?.email, persona: user?.persona, roles: user?.roles, full_name: user?.full_name, stripe_customer_id: user?.stripe_customer_id, family_id: user?.family_id, founding_offer_started_at: user?.founding_offer_started_at, student_emails: user?.student_emails },
      });
      const result = response?.data || response;
      if (result?.url) {
        window.location.href = result.url;
      } else {
        console.error('Checkout failed:', result?.error);
        setLoading(null);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500,
          maxHeight: '90vh', overflow: 'auto', padding: '28px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {foundingOfferActive ? 'Your Founding Member Rate' : 'Unlock FastIQ'}
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
              {foundingOfferActive ? `${daysLeft} days left — expires April 15th` : 'Start free for 7 days — cancel anytime'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', minHeight: 'auto' }}>
            <X style={{ width: 18, height: 18, color: '#64748B' }} />
          </button>
        </div>

        {/* Features */}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0' }}>
          {FEATURES.map((f, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <Check style={{ width: 14, height: 14, color: '#16A34A', marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{f}</span>
            </li>
          ))}
        </ul>

        {/* Pricing — founding or standard */}
        {foundingOfferActive ? (
          <div style={{ background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#E85D20', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>⚡ Founding Member Rate</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 2px' }}>$14.50<span style={{ fontSize: 14, fontWeight: 500, color: '#64748B' }}>/month</span></p>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 4px' }}>or $124.50/year — save $50</p>
            <p style={{ fontSize: 11, color: '#E85D20', fontWeight: 500, margin: '0 0 16px' }}>⏱ {daysLeft} days left — expires April 15th</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => handleSelectPlan('fastiq_founding_monthly')}
                disabled={!!loading}
                style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', minHeight: 'auto', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {loading === 'fastiq_founding_monthly' ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Processing...</> : 'Monthly — $14.50/month →'}
              </button>
              <button
                onClick={() => handleSelectPlan('fastiq_founding_annual')}
                disabled={!!loading}
                style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 10, padding: '12px', fontSize: 13, color: '#E85D20', cursor: loading ? 'not-allowed' : 'pointer', minHeight: 'auto', opacity: loading ? 0.7 : 1 }}
              >
                {loading === 'fastiq_founding_annual' ? 'Processing...' : 'Annual — $124.50/year (best value)'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <div style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>Monthly</p>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Start free for 7 days</p>
                </div>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>$29<span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>/mo</span></p>
              </div>
              <button
                onClick={() => handleSelectPlan('fastiq_monthly')}
                disabled={!!loading}
                style={{ width: '100%', background: '#E85D20', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', minHeight: 'auto', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {loading === 'fastiq_monthly' ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Processing...</> : 'Start Free Trial →'}
              </button>
            </div>
            <div style={{ border: '1.5px solid #E2E8F0', borderRadius: 12, padding: 16, position: 'relative' }}>
              <span style={{ position: 'absolute', top: -10, right: 12, background: '#16A34A', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>Save $99</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>Annual</p>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>$20.75/month billed yearly</p>
                </div>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>$249<span style={{ fontSize: 13, fontWeight: 500, color: '#64748B' }}>/yr</span></p>
              </div>
              <button
                onClick={() => handleSelectPlan('fastiq_annual')}
                disabled={!!loading}
                style={{ width: '100%', background: 'none', border: '1.5px solid #E85D20', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, color: '#E85D20', cursor: loading ? 'not-allowed' : 'pointer', minHeight: 'auto', opacity: loading ? 0.7 : 1 }}
              >
                {loading === 'fastiq_annual' ? 'Processing...' : 'Annual — $249/year →'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield style={{ width: 14, height: 14, color: '#64748B' }} />
            <span style={{ fontSize: 11, color: '#64748B' }}>Secure payment via Stripe • Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}