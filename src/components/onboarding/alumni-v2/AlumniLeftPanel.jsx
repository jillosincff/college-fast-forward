import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function BenefitCard({ emoji, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
      <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  );
}

function Callout({ bold, body }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', borderLeft: '3px solid #E85D20',
      borderRadius: 10, padding: '16px 18px',
    }}>
      {bold && <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{bold}</p>}
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>{body}</p>
    </div>
  );
}

export default function AlumniLeftPanel({ step, intent, isRecentGrad }) {
  const isHelper = intent === 'help_students';

  if (step === 1) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h2 style={{ fontFamily: dmSans, fontWeight: 500, fontSize: 18, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          College Fast Forward
        </h2>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
          Let's start with your time at UF 🎓
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <BenefitCard emoji="🔗" text="Students connect with alumni who share their major" />
          <BenefitCard emoji="✨" text="Your degree adds authority to your advice" />
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
          Tell us about yourself
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
          Where are you now? This helps students understand your background.
        </p>
        <Callout
          bold="Your experience can change someone's trajectory."
          body="Whether you're here to give back or get a career boost — students are already waiting for someone like you."
        />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
          What's your industry?
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
          We'll match you with students interested in your field.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <BenefitCard emoji="🎯" text="We match you with students in YOUR industry" />
          <BenefitCard emoji="🔄" text="Your network is their opportunity" />
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
          What brings you here?
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
          Whether you're here to give back or get a career boost — we've got you covered.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <BenefitCard emoji="🤝" text="Helpers answer questions & open doors for students" />
          <BenefitCard emoji="🔍" text="Seekers get matched with parents & alumni who can help" />
        </div>
      </div>
    );
  }

  if (step === 5) {
    if (isRecentGrad) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
            How can the network help you?
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            As a recent grad, you have unique expertise to share — and a community ready to support your next step.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <BenefitCard emoji="🤝" text="Get matched with parents & alumni in your field" />
            <BenefitCard emoji="💡" text="Share what you've learned with current students" />
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
          Help Students Succeed
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
          Your experience opens doors. Share what you know, make introductions, and help the next generation of students launch their careers.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <BenefitCard emoji="🚀" text="One intro from you = months of cold applying for them" />
          <BenefitCard emoji="⏱️" text="Most help takes just 5-10 minutes" />
        </div>
      </div>
    );
  }

  if (step === 7) {
    if (isRecentGrad) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
            You're all set! 🎉
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            As a recent grad, you'll have access to the full student toolkit — FASTIQ, networking, and a community ready to help.
          </p>
          <Callout
            bold="What happens next?"
            body="You'll land on the student dashboard with access to FASTIQ career tools, networking pipeline, and direct connections to parents and established alumni."
          />
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', lineHeight: 1.2, margin: 0 }}>
          You're all set! 🎉
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
          Students are already looking for someone like you.
        </p>
        <Callout
          bold="What happens next?"
          body="We'll match you with students who need your expertise. You'll get notified when someone wants to connect."
        />
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Join <span style={{ fontWeight: 700, color: '#fff' }}>200+ parents & alumni</span> already opening doors
        </p>
      </div>
    );
  }

  return null;
}