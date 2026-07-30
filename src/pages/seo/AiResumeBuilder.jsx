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
        sub="Build a resume that actually gets past ATS — and gets you interviews."
        ctaLabel="Build My Resume Free"
      />
      <Steps
        title="How it works"
        steps={[
          { title: 'Upload or start fresh', desc: 'Upload your current resume or start from scratch — CLIFF handles the formatting.' },
          { title: 'Paste the job description', desc: "CLIFF tailors your resume to match the role's keywords and requirements." },
          { title: 'Get your ATS score', desc: 'See your ATS score and a keyword match report before you hit submit.' },
        ]}
      />
      <FeatureGrid
        title="Feature highlights"
        items={[
          { icon: '🤖', title: 'ATS-optimized formatting', desc: 'Clean layouts hiring bots can actually parse.' },
          { icon: '🔑', title: 'Keyword matching', desc: 'Match keywords straight from the job description.' },
          { icon: '🗂️', title: 'Multiple versions', desc: 'Keep separate resumes for different roles.' },
          { icon: '⚡', title: 'One-click tailoring', desc: 'Re-tailor for every application in seconds.' },
        ]}
      />
      <SocialProof />
      <CTASection label="Start Building Your Resume — Free" />
      <CrossLinks links={[
        { label: 'ATS Resume Checker', to: '#/ats-resume-checker' },
        { label: 'Interview Prep', to: '#/interview-prep' },
        { label: 'AI Career Tools Guide', to: '#/blog/ai-career-tools-college-students' },
      ]} />
    </SeoLandingLayout>
  );
}