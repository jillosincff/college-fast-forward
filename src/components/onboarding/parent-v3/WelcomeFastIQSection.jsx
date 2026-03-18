import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import useFoundingOffer from '@/components/founding-offer/useFoundingOffer';
import FoundingOfferWelcomeCard from '@/components/founding-offer/FoundingOfferWelcomeCard';
import useCheckout from '@/components/founding-offer/useCheckout';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

const WITHOUT = [
  'See company hiring intel',
  'Career center event reminders',
  'Know alumni exist at target companies — but not who they are',
];

const WITH = [
  'Full alumni names and direct contacts',
  'Personalized outreach messages ready to send',
  'AI-built career plan and daily action steps',
  'Resume tailored for each role',
  'LinkedIn profile review',
  'Interview preparation',
  'Job search tracking and follow-up alerts',
];

export function FastIQNotActivated({ studentName, onActivate, onSkip }) {
  const { user } = useAuth();
  const offer = useFoundingOffer(user);
  const { startCheckout, loading: checkoutLoading, error: checkoutError } = useCheckout();
  const name = studentName || 'your student';
  return (
    <div>
      {/* Divider */}
      <div style={{ height: 1, background: ORANGE, opacity: 0.3, margin: '40px 0 32px' }} />

      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: ORANGE, marginBottom: 14 }}>
        ONE MORE THING
      </p>

      <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>
        Your student needs FastIQ to get the full plan.
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 28 }}>
        Being in the network is powerful. But FastIQ is what turns that network into action — for your student specifically.
      </p>

      {/* Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <style>{`@media(max-width:540px){.fiq-compare{grid-template-columns:1fr !important}}`}</style>
        {/* Without */}
        <div className="fiq-compare" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px' }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Without FastIQ</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WITHOUT.map((item, i) => (
              <p key={i} style={{ fontFamily: dmSans, fontSize: 13, color: '#666', lineHeight: 1.5, margin: 0 }}>{item}</p>
            ))}
          </div>
        </div>
        {/* With */}
        <div className="fiq-compare" style={{ background: CARD_BG, border: `1px solid rgba(232,93,32,0.3)`, borderRadius: 12, padding: '20px' }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: ORANGE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>With FastIQ ⚡</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WITH.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Check size={14} style={{ color: ORANGE, marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontFamily: dmSans, fontSize: 13, color: '#fff', lineHeight: 1.5, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founding Offer or Standard Pricing */}
      {offer.active ? (
        <>
          <FoundingOfferWelcomeCard display={offer.display} studentName={name} onActivate={onActivate} />

          <button onClick={() => navigate('GatorWelcome', { plan: 'annual', founding: 'true' })} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff',
            background: ORANGE, border: 'none', borderRadius: 100,
            padding: '16px 32px', cursor: 'pointer', width: '100%',
            minHeight: 'auto',
          }}>
            Activate Annual Plan for {name} — $187 →
          </button>

          <button onClick={() => navigate('GatorWelcome', { plan: 'monthly' })} style={{
            display: 'block', width: '100%', marginTop: 14, textAlign: 'center',
            background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13,
            fontWeight: 400, color: '#666', cursor: 'pointer', minHeight: 'auto',
          }}>
            Continue with monthly at $29/mo →
          </button>
        </>
      ) : (
        <>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: ORANGE, textAlign: 'center', marginBottom: 24 }}>
            $29/month or $249/year — 7-day free trial included. Save 28% with annual.
          </p>

          <button onClick={onActivate} style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff',
            background: ORANGE, border: 'none', borderRadius: 100,
            padding: '16px 32px', cursor: 'pointer', width: '100%',
            minHeight: 'auto',
          }}>
            Activate FastIQ for {name} →
          </button>

          <button onClick={onSkip} style={{
            display: 'block', width: '100%', marginTop: 14, textAlign: 'center',
            background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13,
            fontWeight: 400, color: '#666', cursor: 'pointer', minHeight: 'auto',
          }}>
            I'll do this later
          </button>
        </>
      )}

      <p style={{ fontFamily: dmSans, fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 1.6, marginTop: 16 }}>
        Cancel anytime. No long-term commitment. Your student gets an email the moment you activate — letting them know their job search just got a serious upgrade.
      </p>
    </div>
  );
}

export function FastIQActivated({ studentName }) {
  const name = studentName || 'your student';
  return (
    <div>
      <div style={{ height: 1, background: ORANGE, opacity: 0.3, margin: '40px 0 32px' }} />

      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
          background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={24} style={{ color: ORANGE }} />
        </div>
        <h3 style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
          FastIQ is active for {name}. ✓
        </h3>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', lineHeight: 1.65, marginBottom: 16 }}>
          They'll receive an email shortly with everything they need to get started. Once they log in, you'll start receiving weekly progress updates.
        </p>
        <p style={{ fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 16, color: ORANGE }}>
          Your student's job search just got way easier.
        </p>
      </div>
    </div>
  );
}