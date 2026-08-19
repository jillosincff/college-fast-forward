import { Loader2, Sparkles } from 'lucide-react';
import { FONT, GRAD_INDIGO, TEXT, INDIGO_DIM } from '@/components/onboarding-flow/onboardingShared';

export default function MagicMomentLoader({ phase }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: GRAD_INDIGO, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 30px rgba(109,40,217,0.35)' }}>
          <Sparkles size={30} color="#fff" />
        </div>
        <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>CLIFF is running your plan…</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT, fontSize: 14, color: INDIGO_DIM }}>
          <Loader2 size={15} className="animate-spin" /> {phase}
        </div>
      </div>
    </div>
  );
}