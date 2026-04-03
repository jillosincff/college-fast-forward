import React from 'react';
import { navigate } from '@/components/utils/navigation';

const playfair = "'Playfair Display', serif";
const dmSans = "'DM Sans', sans-serif";

const STUDENT_FEATURES = [
  { icon: '🎯', text: 'Student profile + career goals — set your targets in 3 minutes' },
  { icon: '📄', text: 'Resume upload + AI score against your specific target roles' },
  { icon: '🏢', text: 'Company Intel and hiring signals at your dream companies' },
  { icon: '👥', text: 'Browse 455+ parents and professionals ready to help' },
  { icon: '🔍', text: '1 free alumni search — find who you know at any company' },
  { icon: '💬', text: 'Direct messaging with your CFF network' },
];

const STUDENT_FASTIQ = [
  'Unlimited alumni searches at any company',
  'Resume tailoring to any job description',
  'Full STAR method mock interview practice',
  'LinkedIn profile scoring and optimization',
  'AI outreach drafts with follow-up nudges',
  'Career archetype assessment',
];

const PARENT_FEATURES = [
  { icon: '📋', text: 'Create your professional profile and network listing' },
  { icon: '🤝', text: 'Make warm introductions for students in your field' },
  { icon: '💬', text: "Students reach out to you — on your schedule, when you're available" },
  { icon: '🔍', text: 'Get matched with students who need exactly what you offer' },
  { icon: '🌟', text: "One intro can change a student's entire career trajectory" },
];

const PARENT_FASTIQ = [
  'See which students need your specific expertise',
  'Get AI-drafted intro messages — connecting takes 60 seconds',
  'Unlock FastIQ for your own college student at home',
  "Track students you've helped along the way",
];

export default function V3HeroBreakdown() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 0 64px' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#AAAAAA', margin: '0 0 8px' }}>
          WHAT YOU GET
        </p>
        <h2 style={{ fontFamily: playfair, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
          Built for students. Powered by parents.
        </h2>
      </div>

      {/* Two column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 20, marginBottom: 24 }}>

        {/* STUDENT CARD */}
        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: '28px 28px', textAlign: 'left' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 10px' }}>
            🎓 FOR STUDENTS
          </p>
          <h3 style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px', lineHeight: 1.3 }}>
            Get inside. Start exploring.
          </h3>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5 }}>
            Everything below is free. No credit card. No catch.
          </p>

          {STUDENT_FEATURES.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < STUDENT_FEATURES.length - 1 ? 14 : 0 }}>
              <span style={{ fontSize: 20, flexShrink: 0, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>{item.icon}</span>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: '#444', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}

          <div style={{ background: '#F0FFF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '12px 16px', margin: '20px 0 24px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#16A34A', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              ✓ All of the above is <strong>completely free</strong> — no credit card, no trial, no catch. Upgrade to FastIQ anytime for unlimited AI tools.
            </p>
          </div>

          <div style={{ background: '#F9F9F9', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', margin: '0 0 10px' }}>
              ⚡ UPGRADE TO FASTIQ FOR:
            </p>
            {STUDENT_FASTIQ.map((item, i) => (
              <p key={i} style={{ fontFamily: dmSans, fontSize: 13, color: '#555', margin: i < STUDENT_FASTIQ.length - 1 ? '0 0 6px' : 0, lineHeight: 1.4, paddingLeft: 8, borderLeft: '2px solid #E85D20' }}>
                {item}
              </p>
            ))}
          </div>

          <button
            onClick={() => navigate('StudentOnboarding')}
            style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto' }}
          >
            Join Free as a Student →
          </button>
        </div>

        {/* PARENT / ALUMNI CARD */}
        <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '28px 28px' }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 10px' }}>
            💙 FOR PARENTS &amp; ALUMNI
          </p>
          <h3 style={{ fontFamily: playfair, fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px', lineHeight: 1.3 }}>
            It's easier than you think.
          </h3>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '0 0 20px', lineHeight: 1.5 }}>
            Fill out your profile once. Students will find you and reach out when they need your help. That's it.
          </p>

          {PARENT_FEATURES.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < PARENT_FEATURES.length - 1 ? 14 : 0 }}>
              <span style={{ fontSize: 20, flexShrink: 0, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>{item.icon}</span>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}

          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', margin: '20px 0 24px' }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
              ✓ <strong style={{ color: '#fff' }}>Completely free</strong> to join and contribute. No credit card. No commitment. Help as much or as little as you'd like.
            </p>
          </div>

          <div style={{ background: 'rgba(232,93,32,0.1)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6 }}>
              ⚡ <strong style={{ color: '#E85D20' }}>Unlock FastIQ</strong> to supercharge your student's job search.
            </p>
          </div>

          <button
            onClick={() => navigate('ParentOnboarding')}
            style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: dmSans, width: '100%', minHeight: 'auto' }}
          >
            Join Free as a Parent or Alumni →
          </button>
        </div>

      </div>

      {/* Bottom trust line */}
      <p style={{ fontFamily: dmSans, fontSize: 13, color: '#AAAAAA', textAlign: 'center', margin: 0 }}>
        ✓ Free to join &nbsp;·&nbsp; ✓ No credit card needed &nbsp;·&nbsp; ✓ Students and helpers welcome
      </p>
    </div>
  );
}