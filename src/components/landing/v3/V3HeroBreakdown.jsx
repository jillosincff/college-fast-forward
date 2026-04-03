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

      {/* Social Proof Section */}
      <div style={{
        padding: '48px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 48,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 48,
          flexWrap: 'wrap', marginBottom: 48,
        }}>
          {[
            { stat: '1,000+', label: 'families joined' },
            { stat: '15', label: 'universities' },
            { stat: '455+', label: 'parents & professionals' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', lineHeight: 1 }}>{item.stat}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{item.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(460px, 100%), 1fr))', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 32px' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, color: '#E85D20', lineHeight: 1, margin: '0 0 8px', opacity: 0.4 }}>&ldquo;</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', lineHeight: 1.6, margin: '0 0 24px', fontStyle: 'italic' }}>This site is invaluable. My son connected with a parent in the CPG industry and gave him advice that literally changed the trajectory of his career.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>D</div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>Desiree M.</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>💙 CFF Parent · University of Florida</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(232,93,32,0.08)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 16, padding: '28px 32px' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 64, color: '#E85D20', lineHeight: 1, margin: '0 0 8px', opacity: 0.4 }}>&ldquo;</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#fff', lineHeight: 1.6, margin: '0 0 24px', fontStyle: 'italic' }}>I found an internship in legal marketing that was never posted. I got it through a parent in College Fast Forward.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(232,93,32,0.3)', border: '2px solid #E85D20', color: '#E85D20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>S</div>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>UF Student</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>🎓 CFF Member · University of Florida</p>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: '32px 0 0', fontStyle: 'italic' }}>Real stories from real CFF families. Unedited.</p>
      </div>

      {/* Two column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 20, marginBottom: 24 }}>

        {/* STUDENT CARD */}
        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: '36px 32px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 16px' }}>
            🎓 FOR STUDENTS
          </p>

          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#1A1A1A', margin: '0 0 20px', lineHeight: 1.3 }}>
            We get it. Job searching is overwhelming.
          </h3>

          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#555', lineHeight: 1.8, margin: '0 0 24px' }}>
            <p style={{ margin: '0 0 12px' }}>You're staring at LinkedIn not knowing where to start. You're sending applications into the void. You don't know who to talk to or what to say. And everyone around you seems to have it figured out.</p>
            <p style={{ margin: '0 0 12px' }}><strong style={{ color: '#1A1A1A' }}>They don't. You're not behind.</strong></p>
            <p style={{ margin: '0 0 12px' }}>And even if you don't know what you want to do yet — that's okay. <strong style={{ color: '#1A1A1A' }}>We'll help you figure it out.</strong></p>
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', margin: '0 0 16px' }}>HERE'S WHAT WE DO TOGETHER — STEP BY STEP:</p>

          {[
            { icon: '📍', title: 'First, we get you organized.', desc: "Set your career goals in 3 minutes. No more spinning. You'll know exactly what you're targeting — and if you don't know yet, we'll help you figure it out." },
            { icon: '📄', title: 'Then we look at your resume.', desc: 'Our AI scores it against your actual target roles and tells you exactly what to fix. Not generic advice. Your resume. Your goals.' },
            { icon: '🏢', title: 'We show you where to focus.', desc: "Forget applying everywhere. We surface the companies that match your goals and show you who's actually hiring." },
            { icon: '👥', title: 'We find you warm contacts.', desc: '455+ parents and professionals who volunteered to help students like you. Real people. Real conversations. Not cold emails into the void.' },
            { icon: '🔍', title: 'We find your alumni connection.', desc: "One free search to find someone from your school who's already where you want to be." },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < 4 ? 20 : 0 }}>
              <span style={{ fontSize: 22, flexShrink: 0, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{step.icon}</span>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>{step.title}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}

          <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 10, padding: '16px 20px', margin: '28px 0 24px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20', margin: '0 0 8px' }}>⚡ READY TO MOVE FASTER?</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: '0 0 10px', lineHeight: 1.6 }}>FastIQ takes everything above and puts it into overdrive — unlimited alumni searches, resume tailoring, mock interviews, LinkedIn optimization, and AI that drafts your outreach so you actually hit send.</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#E85D20', margin: 0 }}>One warm intro changes everything. FastIQ helps you get it.</p>
          </div>

          <button onClick={() => navigate('StudentOnboarding')} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', minHeight: 'auto' }}>
            Join Free — Let's Figure This Out Together →
          </button>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA', textAlign: 'center', margin: '12px 0 0' }}>Free to join · No credit card · No pressure</p>
        </div>

        {/* PARENT / ALUMNI CARD */}
        <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '36px 32px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 16px' }}>
            💙 FOR PARENTS &amp; ALUMNI
          </p>

          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: '#fff', margin: '0 0 20px', lineHeight: 1.3 }}>
            You’ve felt it. That helpless feeling.
          </h3>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 24px' }}>
            Watching your kid apply to hundreds of jobs and hear nothing back. They’re stressed. You’re secretly freaking out. You want to help — but how?
          </p>

          <div style={{ borderLeft: '3px solid #E85D20', paddingLeft: 20, marginBottom: 24 }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.4 }}>Here’s what you don’t realize —</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#E85D20', margin: 0, lineHeight: 1.4 }}>You already have exactly what they need.</p>
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 24px' }}>
            A lifetime of connections. People you know at companies your student is targeting. You just didn’t know how to put it to work. <strong style={{ color: '#fff' }}>Until now.</strong>
          </p>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 24px' }} />

          <div style={{ background: 'rgba(232,93,32,0.12)', border: '1px solid rgba(232,93,32,0.25)', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 14px' }}>
              When you tell us who you are and where you work, you become part of something bigger. Every parent in this network does the same thing.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 16px' }}>
              Together we collectively open our networks — and suddenly students have access to thousands of connections they never could have found alone.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#E85D20', margin: 0 }}>
              One intro carries more weight than 100 applications.
            </p>
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.8, margin: '0 0 6px' }}>
            And it’s not just introductions. It’s guidance. Real talk about your industry. The stuff they can’t Google.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.6, margin: '0 0 28px' }}>
            That’s just as valuable as any referral.
          </p>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', margin: '0 0 20px' }}>HERE’S HOW EASY IT IS:</p>

          {[
            { icon: '📋', title: 'Fill out your profile once.', desc: 'Tell us who you are, what you do, and how you can help. Takes 5 minutes.' },
            { icon: '👥', title: 'Students find you.', desc: 'They search our network and reach out when they need someone exactly like you.' },
            { icon: '🤝', title: 'You decide how to help.', desc: 'A quick reply. A referral. An intro email. Career advice over coffee. On your schedule. No pressure.' },
            { icon: '🌟', title: "You change someone's trajectory.", desc: "That's it. That's the whole thing." },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < 3 ? 20 : 0 }}>
              <span style={{ fontSize: 22, flexShrink: 0, fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif' }}>{step.icon}</span>
              <div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{step.title}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}

          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 10, padding: '14px 18px', margin: '28px 0 24px' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
              ⚡ <strong style={{ color: '#E85D20' }}>Unlock FastIQ</strong> to supercharge your student’s job search.
            </p>
          </div>

          <button onClick={() => navigate('ParentOnboarding')} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', minHeight: 'auto' }}>
            Join Free — Put Your Network to Work →
          </button>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '12px 0 0' }}>Free to join · No commitment · Help on your own terms</p>
        </div>

      </div>

      {/* Bottom trust line */}
      <p style={{ fontFamily: dmSans, fontSize: 13, color: '#AAAAAA', textAlign: 'center', margin: 0 }}>
        ✓ Free to join &nbsp;·&nbsp; ✓ No credit card needed &nbsp;·&nbsp; ✓ Students and helpers welcome
      </p>
    </div>
  );
}