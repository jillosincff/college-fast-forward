import React from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Hero, FeatureGrid, CTASection, CrossLinks } from '@/components/seo-landing/SeoSections';

export default function LinkedinReview() {
  return (
    <SeoLandingLayout
      title="LinkedIn Profile Review & Optimizer for Students | College Fast Forward"
      description="Get your LinkedIn profile scored and optimized with AI. Fix your headline, about section, and skills. Free for college students."
      slug="linkedin-review"
    >
      <Hero
        h1="LinkedIn Profile Review & Optimizer"
        sub="Your LinkedIn profile is the first thing recruiters see. Make it count."
        ctaLabel="Review My LinkedIn Free"
      />
      <FeatureGrid
        title="What we analyze"
        items={[
          { icon: '📰', title: 'Headline strength', desc: 'Does your headline say what you do and what you want?' },
          { icon: '📝', title: 'About section', desc: 'Is your summary clear, specific, and recruiter-ready?' },
          { icon: '🏷️', title: 'Skills section', desc: 'Are the right skills listed and ranked?' },
          { icon: '💼', title: 'Experience descriptions', desc: 'Do your roles show impact, not just duties?' },
          { icon: '✅', title: 'Profile completeness', desc: 'Find the gaps recruiters look for.' },
        ]}
      />
      <FeatureGrid
        title="Get optimized"
        items={[
          { icon: '✨', title: 'Headline suggestions', desc: 'AI-generated headlines tuned to your goals.' },
          { icon: '🔄', title: 'About section rewrites', desc: 'Clearer, sharper summaries you can use today.' },
          { icon: '🎯', title: 'Skills recommendations', desc: 'The skills to add for the roles you want.' },
          { icon: '📊', title: 'Completeness score', desc: 'A single score showing how recruiter-ready you are.' },
        ]}
      />
      <CTASection label="Get My LinkedIn Score — Free" />
      <CrossLinks links={[
        { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
        { label: 'Interview Prep', to: '#/interview-prep' },
      ]} />
    </SeoLandingLayout>
  );
}