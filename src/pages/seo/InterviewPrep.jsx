import React from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Hero, Steps, FeatureGrid, SocialProof, CTASection, CrossLinks } from '@/components/seo-landing/SeoSections';

export default function InterviewPrep() {
  return (
    <SeoLandingLayout
      title="AI Interview Prep for College Students | Mock Interview Practice | College Fast Forward"
      description="Practice mock interviews with AI. Get real-time feedback, scoring, and personalized improvement tips. Free for college students."
      slug="interview-prep"
    >
      <Hero
        h1="AI Interview Prep for College Students"
        sub="Walk into every interview knowing you're ready."
        ctaLabel="Practice My Interview Free"
      />
      <Steps
        title="How it works"
        steps={[
          { title: 'Role-specific questions', desc: "CLIFF generates realistic interview questions based on your target role and company." },
          { title: 'Practice your answers', desc: 'Answer out loud or in writing — repeat any question until it feels natural.' },
          { title: 'Instant AI feedback', desc: 'Get real-time feedback and scoring on every answer you give.' },
        ]}
      />
      <FeatureGrid
        title="Features"
        items={[
          { icon: '🎯', title: 'Role-specific question banks', desc: 'Questions tuned to the role and company you are targeting.' },
          { icon: '💬', title: 'Real-time feedback', desc: 'Instant notes on your answers as you practice.' },
          { icon: '📊', title: 'Confidence & clarity scoring', desc: 'See how you sound, not just what you say.' },
          { icon: '🕒', title: 'Practice anytime', desc: 'No scheduling, no waiting — practice on your schedule.' },
        ]}
      />
      <SocialProof />
      <CTASection label="Start Practicing — Free" />
      <CrossLinks links={[
        { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
        { label: 'Job Application Tracker', to: '#/job-application-tracker' },
      ]} />
    </SeoLandingLayout>
  );
}