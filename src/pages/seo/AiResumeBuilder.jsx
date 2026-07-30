import React from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Hero, Steps, FeatureGrid, SocialProof, CTASection, CrossLinks } from '@/components/seo-landing/SeoSections';

export default function AiResumeBuilder() {
  return (
    <SeoLandingLayout
      title="AI Resume Builder for College Students | Free ATS-Optimized | College Fast Forward"
      description="Build a tailored, ATS-optimized resume for every job application with AI. Free for college students. See your ATS score instantly."
      slug="ai-resume-builder"
    >
      <Hero
        h1="AI Resume Builder for College Students"
        sub="Build a tailored, ATS-optimized resume for every job application with AI. Free for college students."
        ctaLabel="Build My Resume Free"
      />
      <Steps
        title="How it works"
        steps={[
          { title: 'Upload your current resume or start from scratch' },
          { title: 'Paste a job description — CLIFF tailors your resume to match' },
          { title: 'Get an instant ATS score and keyword match report' },
        ]}
      />
      <FeatureGrid
        title="Features"
        items={[
          { icon: '🤖', title: 'ATS-optimized formatting that passes screening software' },
          { icon: '🔑', title: 'Keyword matching to any job description' },
          { icon: '🗂️', title: 'Multiple resume versions for different roles' },
          { icon: '⚡', title: 'One-click tailoring per application' },
        ]}
      />
      <SocialProof />
      <CTASection label="Start Building Your Resume — Free" />
      <CrossLinks links={[
        { label: 'ATS Resume Checker', to: '#/ats-resume-checker' },
        { label: 'Interview Prep', to: '#/interview-prep' },
      ]} />
    </SeoLandingLayout>
  );
}