import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

const FOUNDING_DEADLINE = new Date('2026-04-15T23:59:59');

export default function CareerConciergeUpgradeModal({ onClose, onAskParent, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const foundingOfferActive = user?.membership_tier === 'founding' && new Date() < FOUNDING_DEADLINE;
  const daysLeft = Math.ceil((FOUNDING_DEADLINE - new Date()) / (1000 * 60 * 60 * 24));

  const handleUpgrade = async (plan = 'fastiq_monthly') => {
    if (!user?.id || !user?.email) {
      setError('Please sign in to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await createCheckoutSession({
        plan,
        successUrl: `${window.location.origin}/#FastIQ?upgrade=success`,
        cancelUrl: window.location.href,
        user: { id: user?.id, email: user?.email, persona: user?.persona, roles: user?.roles, full_name: user?.full_name, stripe_customer_id: user?.stripe_customer_id, family_id: user?.family_id, founding_offer_started_at: user?.founding_offer_started_at, student_emails: user?.student_emails },
      });
      const result = response?.data || response;
      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError(result?.error || 'Checkout failed. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      console.error('Checkout error:', e);
      setError(e?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 20 }}>✨</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                Career Concierge
              </h2>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0 }}>
              Your personal AI career advisor.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', color: '#999', padding: 4 }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Body */}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', lineHeight: 1.65 }}>
            Career Concierge gives your student the tools to present themselves like a professional — polished resume, confident interview skills, and a LinkedIn profile that gets noticed.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { label: 'Résumés & Cover Letters', desc: 'AI-tailored for every role and ATS-optimized' },
              { label: 'Mock Interviews', desc: 'Practice with real company-specific questions' },
              { label: 'LinkedIn Profile Review', desc: 'Get recruiter-ready with personalized feedback' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#E85D20]/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#E85D20]" />
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{f.label}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider + bridge line */}
          <div style={{ height: 1, background: '#E0E0E0' }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Career Concierge is included in FastIQ — along with alumni discovery, personalized outreach, and your full career plan.
          </p>

          {/* Pricing */}
          {foundingOfferActive ? (
            <div style={{ background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 10, padding: '14px 18px' }}>
              <p style={{ fontSize: 11, color: '#E85D20', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 6px' }}>⚡ Founding Member Rate</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>$14.50/month or $124.50/year</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: '0 0 8px' }}>50% off forever — locked in as long as you stay subscribed.</p>
              <p style={{ fontSize: 11, color: '#E85D20', fontWeight: 500, margin: 0 }}>⏱ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''} — April 15th</p>
            </div>
          ) : (
            <div className="bg-[#FFF8F5] rounded-xl p-4">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px' }}>
                $29/month <span style={{ fontWeight: 400, color: '#888' }}>or</span> $249/year
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: 0 }}>
                Start free for 7 days — then $29/month. Cancel anytime.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EF4444', textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          )}

          {/* CTAs */}
          <div className="space-y-2">
            {foundingOfferActive ? (
              <>
                <button onClick={() => handleUpgrade('fastiq_founding_monthly')} disabled={loading} className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50" style={{ minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Start Free Trial — $14.50/month →'}
                </button>
                <button onClick={() => handleUpgrade('fastiq_founding_annual')} disabled={loading} className="w-full border border-[#E85D20] text-[#E85D20] py-3 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors" style={{ minHeight: 'auto' }}>
                  Annual — $124.50/year (save $50)
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleUpgrade('fastiq_monthly')} disabled={loading} className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50" style={{ minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Start Free Trial →'}
                </button>
                <button onClick={onAskParent} className="w-full border border-[#E85D20] text-[#E85D20] py-3 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors" style={{ minHeight: 'auto' }}>
                  Ask My Parent to Activate →
                </button>
              </>
            )}
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#aaa', textAlign: 'center', margin: 0 }}>
            Start free for 7 days — then $29/month. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}