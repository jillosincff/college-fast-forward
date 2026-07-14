import Reveal from '@/components/landing/Reveal';
import { X, Check } from 'lucide-react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const SEARCHING = [
  'Scroll through endless listings',
  'Guess which jobs are worth applying to',
  'Rewrite your resume again',
  'Search for people to contact',
  'Try to remember every follow-up',
  'Hope something works',
];
const CLIFFING = [
  'Tell CLIFF your goal',
  'Get your three best opportunities',
  'Review a prepared application',
  'Use a networking advantage only when it matters',
  'Follow one clear plan',
  'Know exactly what to do next',
];

export default function WhatIsCliffing({ go }) {
  return (
    <div id="what-is-cliffing" style={{ padding: 'clamp(48px, 10vw, 88px) clamp(20px, 5vw, 40px)', background: '#fff', borderTop: '1px solid #f1f5f9', scrollMarginTop: 80 }}>
      <Reveal>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(26px, 6.5vw, 46px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', margin: '0 0 12px', textAlign: 'center' }}>
            What is{' '}
            <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFFing?</span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14.5px, 4vw, 17px)', color: '#475569', margin: '0 auto clamp(28px, 7vw, 40px)', maxWidth: 580, lineHeight: 1.65, textAlign: 'center' }}>
            It's what happens when you stop managing every part of your job search yourself — and let CLIFF build the plan, prepare the work, and guide your next move.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 4vw, 24px)' }}>
            <div style={{ background: 'rgba(254,242,242,0.6)', border: '1px solid rgba(244,63,94,0.22)', borderRadius: 20, padding: 'clamp(20px, 5vw, 28px)' }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 20px)', fontWeight: 900, color: '#f43f5e', margin: '0 0 16px', letterSpacing: '-0.02em' }}>Job searching</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {SEARCHING.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <X size={14} color="#f43f5e" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#9f1239', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(245,243,255,0.8)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 20, padding: 'clamp(20px, 5vw, 28px)', boxShadow: '0 4px 16px rgba(109,40,217,0.12)' }}>
              <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 20px)', fontWeight: 900, color: '#6d28d9', margin: '0 0 16px', letterSpacing: '-0.02em' }}>CLIFFing</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {CLIFFING.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={14} color="#6d28d9" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <p style={{ fontFamily: SF, fontSize: 'clamp(13px, 3.5vw, 14px)', color: '#5b21b6', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Anti–spray and pray */}
          <div style={{ marginTop: 'clamp(24px, 6vw, 32px)', background: '#f8f9ff', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 20, padding: 'clamp(20px, 5vw, 28px)', textAlign: 'center' }}>
            <p style={{ fontFamily: SF, fontSize: 'clamp(17px, 4.5vw, 22px)', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              CLIFFing is not applying everywhere.
            </p>
            <p style={{ fontFamily: SF, fontSize: 'clamp(13.5px, 3.8vw, 15px)', color: '#475569', margin: '0 auto', maxWidth: 520, lineHeight: 1.6 }}>
              CLIFF helps you focus on the opportunities actually worth your time — and build stronger applications for those roles. The goal isn't more applications. It's more meaningful progress toward interviews and offers.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'clamp(24px, 6vw, 32px)' }}>
            <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>
              Less searching. Less guessing.{' '}
              <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>More progress.</span>
            </p>
            <button onClick={go} style={{ fontFamily: SF, fontSize: 16, fontWeight: 700, color: '#fff', background: GRAD, border: 'none', borderRadius: 999, padding: '16px 44px', cursor: 'pointer', minHeight: 52, boxShadow: '0 8px 28px rgba(109,40,217,0.30)' }}>
              Start CLIFFing
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}