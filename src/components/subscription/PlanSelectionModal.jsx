import React, { useState } from 'react';
import { X, Check, Zap, Loader2, Shield } from 'lucide-react';

const PLANS = [
  {
    name: 'CFF + FASTIQ',
    price: '$249',
    period: '/year',
    tier: 'fastiq',
    savings: 'Save 28%',
    features: [
      'Everything in CFF Membership',
      'FASTIQ AI career center',
      'Company research & alumni finder',
      'Personalized outreach drafts',
      'Resume tailoring & interview prep',
      'Weekly opportunity scouting',
    ],
    missingFeatures: [],
  },
];

export default function PlanSelectionModal({ isOpen, onClose, user, familyId }) {
  const [loading, setLoading] = useState(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (planId) => {
    setLoading(planId);
    const baseUrl = window.location.origin;
    try {
      const { createCheckoutSession } = await import('@/functions/createCheckoutSession');
      const response = await createCheckoutSession({
        plan: planId,
        successUrl: `${baseUrl}/#Dashboard?payment=success`,
        cancelUrl: `${baseUrl}/#FastIQ?payment=cancelled`,
      });
      if (response?.data?.url) {
        window.location.href = response.data.url;
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
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 800,
          maxHeight: '90vh', overflow: 'auto', padding: '28px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Choose Your Plan</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>All plans include a 7-day free trial</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', minHeight: 'auto' }}>
            <X style={{ width: 18, height: 18, color: '#64748B' }} />
          </button>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                border: plan.popular ? '2px solid #FA4616' : '1.5px solid #E2E8F0',
                borderRadius: 16, padding: 20, position: 'relative',
                background: plan.popular ? 'linear-gradient(180deg, #FFF7ED 0%, #FFF 30%)' : '#fff',
              }}
            >
              {plan.popular && (
                <span style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: '#FA4616', color: '#fff', fontSize: 10, fontWeight: 800,
                  padding: '3px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Most Popular
                </span>
              )}
              {plan.savings && (
                <span style={{
                  position: 'absolute', top: -10, right: 12,
                  background: '#16A34A', color: '#fff', fontSize: 10, fontWeight: 800,
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  {plan.savings}
                </span>
              )}

              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#0F172A' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>{plan.period}</span>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <Check style={{ width: 14, height: 14, color: '#16A34A', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
                {plan.missingFeatures.map((f, i) => (
                  <li key={`m-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, opacity: 0.5 }}>
                    <X style={{ width: 14, height: 14, color: '#94A3B8', marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading === plan.id}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield style={{ width: 14, height: 14, color: '#64748B' }} />
            <span style={{ fontSize: 11, color: '#64748B' }}>Secure payment via Stripe • Cancel anytime</span>
          </div>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>One subscription covers your entire family on CFF</span>
        </div>
      </div>
    </div>
  );
}