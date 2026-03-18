import React from 'react';
import { OnboardingShell, PrimaryButton, dmSans, playfair, ORANGE } from './ParentOnboardingShell';

export default function ParentStep3Confirmation({ invited, onDashboard }) {
  return (
    <OnboardingShell>
      {/* Header */}
      <h1 style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 32,
        color: '#f4f0e8', textAlign: 'center', lineHeight: 1.2, marginBottom: 8,
      }}>
        You're in.
      </h1>
      <p style={{
        fontFamily: playfair, fontWeight: 400, fontStyle: 'italic',
        fontSize: 20, color: ORANGE, textAlign: 'center', lineHeight: 1.4, marginBottom: 28,
      }}>
        Welcome to College Fast Forward.
      </p>

      {/* Body */}
      <p style={{
        fontFamily: dmSans, fontSize: 15, fontWeight: 300,
        color: 'rgba(244,240,232,0.6)', textAlign: 'center', lineHeight: 1.7,
        marginBottom: 36, maxWidth: 380, margin: '0 auto 36px',
      }}>
        {invited
          ? "Your invitation has been sent. Once your student creates their account you'll be linked automatically."
          : 'You can invite your student anytime from your dashboard.'}
      </p>

      {/* CTA */}
      <PrimaryButton onClick={onDashboard}>Go to My Dashboard →</PrimaryButton>
    </OnboardingShell>
  );
}