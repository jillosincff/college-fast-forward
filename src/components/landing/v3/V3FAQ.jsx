import React, { useState } from 'react';
import { playfair, dmSans, DARK_BG_ALT, ORANGE } from './LandingConstants';
import { useFadeIn, fadeStyle } from './SectionFade';

const QUESTIONS = [
  {
    q: 'Is this only for UF students?',
    a: "Not at all. College Fast Forward works for students at any school. The demo defaults to a few schools to show examples but FastIQ is built to work with any university, any major, and any career path.",
  },
  {
    q: 'What does my student actually have to do?',
    a: "FastIQ does the heavy lifting — building the plan, finding alumni, writing outreach. Your student reviews, personalizes, and sends. The goal is to make action as easy as possible so they actually follow through.",
  },
  {
    q: 'How do parent introductions work?',
    a: "When a parent in the network is connected to someone at a student's target company, they get a simple notification asking if they'd like to make an introduction. It's one click — no awkward asks, no cold outreach. Parents choose who they help and when.",
  },
  {
    q: "What if my student doesn't know what they want to do yet?",
    a: "That's exactly who FastIQ is built for. The direction-setting process helps students identify target industries, roles, and companies — before they start applying anywhere.",
  },
  {
    q: 'Is the network really free to join?',
    a: 'Yes. Parents join the College Fast Forward network for free. FastIQ — the AI career engine — is the paid tier at $29/month or $249/year with a free 7-day trial.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ borderBottom: '1px solid #1F1F23' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 16, minHeight: 'auto',
        }}
      >
        <span style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <svg
          width="20" height="20" viewBox="0 0 20 20" fill="none"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <path d="M5 8l5 5 5-5" stroke={ORANGE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: 22 }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#A1A1AA', lineHeight: 1.7, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function V3FAQ() {
  const { ref, vis } = useFadeIn();

  return (
    <section ref={ref} style={{ background: DARK_BG_ALT, padding: '120px 24px 130px' }}>
      <div className="max-w-[680px] mx-auto">
        <p className="text-center" style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', color: ORANGE, marginBottom: 14, ...fadeStyle(vis, 0) }}>
          Common Questions
        </p>

        <h2 className="text-center" style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 3.8vw, 42px)', color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em', ...fadeStyle(vis, 0.04) }}>
          Everything parents want to know
        </h2>

        <div style={{ width: 40, height: 2, background: ORANGE, borderRadius: 1, margin: '0 auto 48px', ...fadeStyle(vis, 0.06) }} />

        <div style={{ borderTop: '1px solid #1F1F23', ...fadeStyle(vis, 0.10) }}>
          {QUESTIONS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}