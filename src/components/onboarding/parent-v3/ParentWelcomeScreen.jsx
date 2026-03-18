import React from 'react';
import WelcomeExpectationCard from './WelcomeExpectationCard';
// DirectoryConsentButton removed — visibility handled during onboarding
import { MockNotification, MockWeeklyUpdate } from './WelcomeMockPreviews';
import { FastIQNotActivated, FastIQActivated } from './WelcomeFastIQSection';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

export default function ParentWelcomeScreen({ user, studentName, isFastIQActive, onActivate, onSkip, onProfile }) {
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const studentFirst = studentName || 'your student';

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '48px 20px 60px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* HEADER */}
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: ORANGE, marginBottom: 14 }}>
          WELCOME TO COLLEGE FAST FORWARD
        </p>

        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(26px, 4vw, 34px)', color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
          You're in, {firstName}.
        </h1>
        <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 26px)', color: ORANGE, lineHeight: 1.3, marginBottom: 12 }}>
          Here's what happens next.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#888', lineHeight: 1.6, marginBottom: 36 }}>
          Your role is simple. We'll handle the rest.
        </p>

        {/* SECTION 1 — What To Expect */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 0 }}>

          <WelcomeExpectationCard
            icon="👥"
            title="You're in the directory."
            body="Your professional background is now visible to students and other parents in the network. Students targeting your industry may reach out directly for advice or introductions. You can update your visibility anytime from your profile settings."
          />

          <WelcomeExpectationCard
            icon="🔔"
            title="We'll ping you when it matters."
            body="When a student in the network is targeting a company where you have connections, we'll send you a simple notification. One click to help — or pass. No pressure, no commitment. Every introduction you make helps a student get in the room."
          >
            <MockNotification />
          </WelcomeExpectationCard>

          <WelcomeExpectationCard
            icon="📊"
            title="You'll hear from us every week."
            body="Every week we'll send you a short update on your student's progress — how many alumni they've found, how many messages they've sent, and how things are moving. No news is never the answer here."
          >
            <MockWeeklyUpdate studentName={studentFirst} />
          </WelcomeExpectationCard>

          <WelcomeExpectationCard
            icon="🔄"
            title="The network works both ways."
            body="Every time you help another student, you're contributing to a community of parents who are doing the same for yours. The more active the network, the better it works for every family inside it."
          >
            <p style={{ fontFamily: playfair, fontStyle: 'italic', fontWeight: 400, fontSize: 14, color: ORANGE, marginTop: 14 }}>
              Other parents are already here. Your student benefits from every one of them.
            </p>
          </WelcomeExpectationCard>

        </div>

        {/* SECTION 2 — FastIQ */}
        {isFastIQActive ? (
          <FastIQActivated studentName={studentFirst} />
        ) : (
          <FastIQNotActivated studentName={studentFirst} onActivate={onActivate} onSkip={onSkip} />
        )}

        {/* FOOTER CTA */}
        <div style={{ marginTop: 36 }}>
          <button onClick={onProfile} style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: ORANGE,
            background: 'transparent', border: `1.5px solid ${ORANGE}`,
            borderRadius: 100, padding: '14px 28px', cursor: 'pointer',
            width: '100%', minHeight: 'auto',
          }}>
            Go to My Profile →
          </button>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#555', textAlign: 'center', lineHeight: 1.6, marginTop: 12 }}>
            You can update your availability, industry, and contact preferences anytime from your profile.
          </p>
        </div>

      </div>

      <style>{`@media(max-width:540px){.fiq-compare{grid-template-columns:1fr !important}}`}</style>
    </div>
  );
}